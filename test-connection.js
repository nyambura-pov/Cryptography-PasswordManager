const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // Leave empty if you are using the default root password in XAMPP
    database: 'password_manager'
});

db.connect((err) => {
    if (err) {
        console.error('Failed to connect to database:', err.message);
    } else {
        console.log('Successfully connected to database');
    }
});
