const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// Create an Express app
const app = express();

// Middleware to handle JSON requests
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',  // XAMPP default
    user: 'root',       // XAMPP default user
    password: '',       // Replace with your MySQL root password
    database: 'password_manager' // Replace with your database name
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database');
});

// GET /init route for initialization
app.get('/init', (req, res) => {
    res.status(200).json({ message: 'Initialization successful' });
});

// POST /add-password to set a new password
app.post('/add-password', (req, res) => {
    const { domain, password } = req.body;

    if (!domain || !password) {
        return res.status(400).json({ error: 'Domain and password are required' });
    }

    const query = 'INSERT INTO passwords (domain, password) VALUES (?, ?)';
    db.query(query, [domain, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: 'Password added successfully', id: result.insertId });
    });
});

// GET /get-password/:domain to retrieve a password
app.get('/get-password/:domain', (req, res) => {
    const { domain } = req.params;

    const query = 'SELECT password FROM passwords WHERE domain = ?';
    db.query(query, [domain], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            // Return the plain password stored in the database
            res.status(200).json({ password: results[0].password });
        } else {
            res.status(404).json({ error: 'Password not found for this domain' });
        }
    });
});

// DELETE /remove-password/:domain to remove a password
app.delete('/remove-password/:domain', (req, res) => {
    const { domain } = req.params;

    const query = 'DELETE FROM passwords WHERE domain = ?';
    db.query(query, [domain], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'Password removed successfully' });
        } else {
            res.status(404).json({ success: false, error: 'Domain not found' });
        }
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
