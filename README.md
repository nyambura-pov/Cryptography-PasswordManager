# Secure Password Manager

A secure and efficient password manager built in **JavaScript**, leveraging cryptographic techniques to safely store and manage passwords. This project provides robust encryption, integrity checks, and secure handling of domain-password pairs, ensuring user data is well-protected.

---

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [API Methods](#api-methods)
- [Security](#security)
- [Testing](#testing)
- [Contributing](#contributing)

---

## Features
- **Password Encryption:** Uses **AES-GCM** to encrypt and securely store passwords.
- **Domain Name Obfuscation:** Implements **HMAC** to obscure domain names while enabling efficient lookups.
- **Password Integrity Checks:** A **SHA-256 checksum** ensures protection against tampering and rollback attacks.
- **PBKDF2 Key Derivation:** Strengthened master password handling with salted and iterated key derivation.

---

## Technologies Used
- **JavaScript**
- **Node.js** (Crypto library for encryption and hashing)
- **MochaJS** (Testing framework)
- **Expect.js** (Assertion library for tests)

---

## Getting Started

### Prerequisites
- Install [Node.js](https://nodejs.org/) (v14 or higher recommended).

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/nyambura-pov/Cryptography-PasswordManager.git
   cd PasswordManager
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```

### Running the Application
To start the password manager:
```bash
node app.js
```

---

## Usage
1. Run the application and input your **master password** to access stored credentials.
2. Use commands to:
   - Add new domain-password pairs.
   - Retrieve existing passwords.
   - Update or delete stored credentials.

---

## API Methods
The core library provides:
- **encryptPassword(password):** Encrypts a given password using AES-GCM.
- **verifyIntegrity(data):** Checks for tampering using SHA-256 checksum.
- **generateKey(masterPassword):** Derives a strong encryption key using PBKDF2.
- **storeCredential(domain, password):** Securely stores a domain-password pair.
- **retrieveCredential(domain):** Retrieves the password for a given domain.

---

## Security
- Implements strong cryptographic standards (**AES-GCM**, **HMAC**, **PBKDF2**).
- Prevents rollback attacks and tampering with integrity checks.
- Obfuscates domain names for additional privacy.

---

## Testing
Run the test suite to validate functionality:
```bash
npm test
```
Tests include:
- Encryption and decryption validation.
- Integrity checks for tamper detection.
- Key derivation consistency.

---

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new feature branch:
3. Commit your changes and submit a pull request.

---

### License
This repository is licensed under the MIT License.

--- 
