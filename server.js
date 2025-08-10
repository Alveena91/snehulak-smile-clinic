const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

// Connect to Supabase PostgreSQL using DATABASE_URL from env
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }  // Required for Supabase SSL connection
});

// Create appointments table if it doesn't exist
pool.query(`
    CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        email TEXT,
        firstname TEXT,
        lastname TEXT,
        phone TEXT,
        appointmenttime TEXT,
        dob TEXT,
        treatment TEXT,
        doctor TEXT
    )
`).catch(console.error);

// Appointment submission route
app.post('/submit-appointment', async (req, res) => {
    const d = req.body;

    try {
        await pool.query(`
            INSERT INTO appointments (email, firstname, lastname, phone, appointmenttime, dob, treatment, doctor)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [d.email, d.firstname, d.lastname, d.phone, d.appointmenttime, d.dob, d.treatment, d.doctor]);

        res.json({ success: true, message: 'Appointment saved successfully!' });
    } catch (err) {
        console.error('Error inserting appointment:', err);
        res.status(500).json({ success: false, message: 'Failed to save appointment.' });
    }
});

// Login route (hardcoded)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const validUser = username === 'admin' && password === 'password123'; // Your credentials
    if (validUser) {
        req.session.username = username;
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Invalid username or password.' });
    }
});

// Check auth route
app.get('/check-auth', (req, res) => {
    if (req.session.username) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

// Fetch all appointments
app.get('/appointments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM appointments');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
