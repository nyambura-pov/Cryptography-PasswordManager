const apiUrl = "http://localhost:3000"; // Backend server URL
let isKeychainInitialized = false; // Track if the keychain is initialized

// Function to display status messages (success or error)
function displayStatus(message, isError = false) {
    const statusElement = document.getElementById("status-message");
    statusElement.textContent = message;
    statusElement.style.color = isError ? "red" : "green"; // Error messages in red, success messages in green
}

// Function to initialize the keychain (GET request to /init)
async function initializeKeychain() {
    try {
        const response = await fetch(`${apiUrl}/init`, {
            method: 'GET', // Ensure it's a GET request for initialization
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            isKeychainInitialized = true; // Mark keychain as initialized
            const data = await response.json();
            displayStatus(data.message || "Keychain initialized successfully.");
        } else {
            const error = await response.json();
            console.error("Initialization error:", error);
            displayStatus(error.message || "Failed to initialize keychain.", true);
        }
    } catch (error) {
        console.error("Initialization error:", error);
        displayStatus(`Error: ${error.message}`, true);
    }
}

// Function to check if the keychain is initialized
function checkKeychainInitialized() {
    if (!isKeychainInitialized) {
        displayStatus("You must initialize the keychain first.", true);
        return false;
    }
    return true;
}

// Function to set a password for a specific domain (POST request to /add-password)
async function setPassword() {
    if (!checkKeychainInitialized()) return;

    const domain = document.getElementById("set-domain").value.trim();
    const password = document.getElementById("set-password").value.trim();

    if (!domain || !password) {
        displayStatus("Domain and password are required.", true);
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/add-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain, password })
        });

        if (response.ok) {
            displayStatus("Password set successfully.");
        } else {
            const error = await response.json();
            console.error("Set password error:", error);
            displayStatus(error.message || "Failed to set password.", true);
        }
    } catch (error) {
        console.error("Set password error:", error);
        displayStatus(`Error: ${error.message}`, true);
    }
}

// Function to get a password for a specific domain (GET request to /get-password/:domain)
async function getPassword() {
    if (!checkKeychainInitialized()) return;

    const domain = document.getElementById("get-domain").value.trim();
    const resultElement = document.getElementById("get-password-result");

    if (!domain) {
        displayStatus("Domain is required.", true);
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/get-password/${encodeURIComponent(domain)}`);

        if (response.ok) {
            const data = await response.json();
            resultElement.textContent = `Password: ${data.password}`;
            displayStatus("Password retrieved successfully.");
        } else {
            const error = await response.json();
            console.error("Get password error:", error);
            resultElement.textContent = "Password not found.";
            displayStatus(error.message || "Failed to retrieve password.", true);
        }
    } catch (error) {
        console.error("Get password error:", error);
        displayStatus(`Error: ${error.message}`, true);
    }
}

// Function to remove a password for a specific domain (DELETE request to /remove-password/:domain)
async function removePassword() {
    if (!checkKeychainInitialized()) return;

    const domain = document.getElementById("remove-domain").value.trim();

    if (!domain) {
        displayStatus("Domain is required.", true);
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/remove-password/${encodeURIComponent(domain)}`, {
            method: "DELETE"
        });

        if (response.ok) {
            displayStatus("Password removed successfully.");
        } else {
            const error = await response.json();
            console.error("Remove password error:", error);
            displayStatus(error.message || "Failed to remove password.", true);
        }
    } catch (error) {
        console.error("Remove password error:", error);
        displayStatus(`Error: ${error.message}`, true);
    }
}

// Example button handlers (you can create buttons in your HTML to trigger these)
document.getElementById('initializeKeychainBtn').addEventListener('click', initializeKeychain);
document.getElementById('setPasswordBtn').addEventListener('click', setPassword);
document.getElementById('getPasswordBtn').addEventListener('click', getPassword);
document.getElementById('removePasswordBtn').addEventListener('click', removePassword);
