const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

// === Middleware ===
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

// === PostgreSQL connection using environment variable ===
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

// === Create the table if it doesn't exist ===
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
    );
`).then(() => console.log("✅ Table ensured"))
  .catch(err => console.error("❌ Error creating table:", err));

// === Submit appointment ===
app.post('/submit-appointment', async (req, res) => {
    const d = req.body;

    const email = d.email;
    const firstname = d.firstName || d.firstname;
    const lastname = d.lastName || d.lastname;
    const phone = d.phone;
    const appointmenttime = d.appointmentTime || d.appointmenttime;
    const dob = d.dob;
    const treatment = d.treatment;
    const doctor = d.doctor;

    try {
        await pool.query(`
            INSERT INTO appointments (email, firstname, lastname, phone, appointmenttime, dob, treatment, doctor)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [email, firstname, lastname, phone, appointmenttime, dob, treatment, doctor]);

        console.log("✅ Appointment saved:", { firstname, lastname, appointmenttime });
        res.json({ success: true, message: 'Appointment saved successfully!' });
    } catch (err) {
        console.error("❌ Error inserting appointment:", err);
        res.status(500).json({ success: false, message: 'Failed to save appointment.' });
    }
});

// === Admin login ===
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const validUser = username === 'admin' && password === 'password123';

    if (validUser) {
        req.session.username = username;
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Invalid username or password.' });
    }
});

// === Auth check ===
app.get('/check-auth', (req, res) => {
    if (req.session.username) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

// === Fetch all appointments ===
app.get('/appointments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM appointments');
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error fetching appointments:", err);
        res.status(500).json({ error: err.message });
    }
});

// === Start server ===
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
