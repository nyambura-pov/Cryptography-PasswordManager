"use strict";

/********* External Imports ********/

const { stringToBuffer, bufferToString, encodeBuffer, decodeBuffer, getRandomBytes } = require("./lib");
const { subtle } = require('crypto').webcrypto;

/********* Constants ********/

const PBKDF2_ITERATIONS = 100000;
const MAX_PASSWORD_LENGTH = 64;
const AES_ALGORITHM = "AES-GCM";
const HMAC_ALGORITHM = "HMAC";
const HASH_ALGORITHM = "SHA-256";
const AES_KEY_LENGTH = 256;  // in bits
const SALT_LENGTH = 16;      // in bytes (128 bits)
const IV_LENGTH = 12;        // in bytes

/********* Implementation ********/
class Keychain {
  constructor(kvs = {}, salt = null, hmacKey = null, aesKey = null) {
    this.kvs = kvs;          // Public
    this.salt = salt;        // Public
    this.hmacKey = hmacKey;  // Private
    this.aesKey = aesKey;    // Private
  }

  // Helper function to derive HMAC and AES keys from a password and salt
  static async deriveKeys(password, salt) {
    const keyMaterial = await subtle.importKey("raw", stringToBuffer(password), "PBKDF2", false, ["deriveBits"]);

    // Derive a base key using PBKDF2
    const derivedBits = await subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: HASH_ALGORITHM },
      keyMaterial,
      512
    );

    // Split derived bits into two parts: one for HMAC and one for AES
    const hmacKeyMaterial = derivedBits.slice(0, 32);
    const aesKeyMaterial = derivedBits.slice(32);

    // Import the derived bits as keys for HMAC and AES
    const hmacKey = await subtle.importKey(
      "raw",
      hmacKeyMaterial,
      { name: HMAC_ALGORITHM, hash: HASH_ALGORITHM },
      true,
      ["sign", "verify"]
    );

    const aesKey = await subtle.importKey(
      "raw",
      aesKeyMaterial,
      AES_ALGORITHM,
      true,
      ["encrypt", "decrypt"]
    );

    return { hmacKey, aesKey };
  }

  // Initializes a new keychain with a password
  static async init(password) {
    const salt = getRandomBytes(SALT_LENGTH);
    const { hmacKey, aesKey } = await Keychain.deriveKeys(password, salt);
    return new Keychain({}, salt, hmacKey, aesKey);
  }

  // Loads a keychain from a serialized representation and validates with checksum if provided
  static async load(password, repr, trustedDataCheck) {
    const { kvs, salt } = JSON.parse(repr);
    const { hmacKey, aesKey } = await Keychain.deriveKeys(password, decodeBuffer(salt));

    // Create a temporary keychain to test the integrity
    const tempKeychain = new Keychain(kvs, salt, hmacKey, aesKey);

    // Check checksum if provided, throw error if it fails
    if (trustedDataCheck) {
      const checkHash = await tempKeychain.computeSHA256(repr);
      if (checkHash !== trustedDataCheck) {
        throw new Error("Data integrity check failed!");  // Throw an error on checksum mismatch
      }
    }

    // Test password by attempting to access a key-value (if available)
    const firstKey = Object.keys(kvs)[0];
    if (firstKey) {
      try {
        const iv = decodeBuffer(kvs[firstKey].iv);
        const encryptedData = decodeBuffer(kvs[firstKey].data);
        await subtle.decrypt({ name: AES_ALGORITHM, iv }, aesKey, encryptedData);
      } catch {
        // Throw an error if decryption fails, indicating an incorrect password
        throw new Error("Incorrect password or corrupted data");
      }
    }

    return new Keychain(kvs, salt, hmacKey, aesKey);  // Successfully loaded keychain
  }

  // Dumps the keychain data with a checksum for integrity
  async dump() {
    const repr = JSON.stringify({ kvs: this.kvs, salt: encodeBuffer(this.salt) });
    const checksum = await this.computeSHA256(repr);
    return [repr, checksum];
  }

  // Retrieves a password for a given domain, or null if it doesn't exist
  async get(name) {
    const hmac = await subtle.sign(HMAC_ALGORITHM, this.hmacKey, stringToBuffer(name));
    const encodedKey = encodeBuffer(hmac);
    if (!this.kvs[encodedKey]) return null;

    const iv = decodeBuffer(this.kvs[encodedKey].iv);
    const encryptedData = decodeBuffer(this.kvs[encodedKey].data);
    const decryptedData = await subtle.decrypt({ name: AES_ALGORITHM, iv }, this.aesKey, encryptedData);
    return bufferToString(decryptedData);
  }

  // Sets or updates a password for a given domain
  async set(name, value) {
    const hmac = await subtle.sign(HMAC_ALGORITHM, this.hmacKey, stringToBuffer(name));
    const encodedKey = encodeBuffer(hmac);

    const iv = getRandomBytes(IV_LENGTH);
    const encryptedData = await subtle.encrypt(
      { name: AES_ALGORITHM, iv },
      this.aesKey,
      stringToBuffer(value)
    );

    this.kvs[encodedKey] = { iv: encodeBuffer(iv), data: encodeBuffer(encryptedData) };
  }

  // Removes a password entry for a given domain, returns true if successful, false if not found
  async remove(name) {
    const hmac = await subtle.sign(HMAC_ALGORITHM, this.hmacKey, stringToBuffer(name));
    const encodedKey = encodeBuffer(hmac);

    if (this.kvs[encodedKey]) {
      delete this.kvs[encodedKey];
      return true;
    }
    return false;
  }

  // Computes a SHA-256 hash of a given data string
  async computeSHA256(data) {
    const hashBuffer = await subtle.digest(HASH_ALGORITHM, stringToBuffer(data));
    return encodeBuffer(hashBuffer);
  }
}

module.exports = { Keychain };
