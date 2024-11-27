// app.js
const express = require('express');
const bodyParser = require('body-parser');
const PasswordManager = require('./password-manager'); // Your password manager module
const cors = require('cors'); // Include CORS to handle frontend requests

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Welcome to the Password Manager API');
});

// Initialize keychain with a master password
app.post('/init', async (req, res) => {
    const { password } = req.body;
    try {
        await PasswordManager.init(password);
        res.status(200).send('Keychain initialized successfully.');
    } catch (error) {
        res.status(500).send('Failed to initialize keychain.');
    }
});

// Add a new password entry
app.post('/add-password', async (req, res) => {
    const { domain, password } = req.body;
    await PasswordManager.set(domain, password);
    res.status(200).send('Password added.');
});

// Get a password entry by domain
app.get('/get-password/:domain', async (req, res) => {
    const domain = req.params.domain;
    const password = await PasswordManager.get(domain);
    res.status(200).json({ password });
});

// Remove a password entry by domain
app.delete('/remove-password/:domain', async (req, res) => {
    const domain = req.params.domain;
    const success = await PasswordManager.remove(domain);
    res.status(200).json({ success });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
