const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');

const app = express();
const port = 3001;

// Serve static files from current directory
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(session({
    secret: 'yourSecretKey', // Change this to something secure
    resave: false,
    saveUninitialized: true
}));

// SQLite setup
const db = new sqlite3.Database('./appointments.db', (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to appointments.db');
});

db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        firstName TEXT,
        lastName TEXT,
        phone TEXT,
        appointmentTime TEXT,
        dob TEXT,
        treatment TEXT,
        doctor TEXT
    )
`);

// Handle form POST request
app.post('/submit-appointment', (req, res) => {
    const d = req.body;

    const query = `
        INSERT INTO appointments (email, firstName, lastName, phone, appointmentTime, dob, treatment, doctor)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [d.email, d.firstName, d.lastName, d.phone, d.appointmentTime, d.dob, d.treatment, d.doctor];

    db.run(query, values, function (err) {
        if (err) {
            console.error(err.message);
            return res.json({ success: false, message: 'Failed to save appointment.' });
        }
        res.json({ success: true, message: 'Appointment saved successfully!' });
    });
});

// Simple login route (hardcoded credentials)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Demo credentials
    const validUser = username === 'admin' && password === 'password123';
    if (validUser) {
        req.session.username = username; // Set session
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Invalid username or password.' });
    }
});

// Check authentication status
app.get('/check-auth', (req, res) => {
    if (req.session.username) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

// Get all appointments
app.get('/appointments', (req, res) => {
  db.all('SELECT * FROM appointments', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
