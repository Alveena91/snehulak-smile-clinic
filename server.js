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

// 🔌 Connect to Supabase PostgreSQL (replace with your actual connection string)
const pool = new Pool({
    connectionString: 'postgresql://postgres:mypassword123@db.lwobdoiayyikpzfzpoqq.supabase.co:5432/postgres'
});

// 🔧 Create appointments table (if it doesn't exist)
pool.query(`
    CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        email TEXT,
        firstName TEXT,
        lastName TEXT,
        phone TEXT,
        appointmentTime TEXT,
        dob TEXT,
        treatment TEXT,
        doctor TEXT
    )
`).catch(console.error);

// 📥 Handle appointment submission
app.post('/submit-appointment', async (req, res) => {
    const d = req.body;

    try {
        await pool.query(`
            INSERT INTO appointments (email, firstName, lastName, phone, appointmentTime, dob, treatment, doctor)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [d.email, d.firstName, d.lastName, d.phone, d.appointmentTime, d.dob, d.treatment, d.doctor]);

        res.json({ success: true, message: 'Appointment saved successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to save appointment.' });
    }
});

// 🔐 Login route (hardcoded for demo)
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

// 🔎 Check if user is authenticated
app.get('/check-auth', (req, res) => {
    if (req.session.username) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

// 📄 Fetch all appointments
app.get('/appointments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM appointments');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🚀 Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
