const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();  // For environment variables

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
  
// API to handle user registration
app.post('/register', async (req, res) => {
    const username = req.body.username.trim();
    const email = req.body.username.trim();
    const password = req.body.password.trim();


  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all fields.' });
  }

  try {
    // Check if the username or email already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'User with that email or username already exists.' });
    }

    // Hash the password before saving it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the user into the database with the hashed password
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting user', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/login', async (req, res) => {
    const username = req.body.username.trim();
    const password = req.body.password.trim();

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide all fields.' });
  }

  try {
    // Check if the user exists in the database
    const userQuery = 'SELECT * FROM users WHERE username = $1';
    const userResult = await pool.query(userQuery, [username]);
    const user = userResult.rows[0];

    console.log(username, password);
    console.log(user);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if the password matches
    const passwordMatch = await bcrypt.compare(password, user.password);

    console.log(passwordMatch)

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token (store secret in env variable for security)
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });  
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get workouts for a user
app.get('/geWorkouts', async (req, res) => {
  const userId = req.query.userId; // Pass the user ID as a query parameter

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Fetch workouts linked to sessions for the user
    const query = `
      SELECT s.id AS session_id, s.session_name, w.name AS workout_name, w.body_part 
      FROM sessions s
      JOIN session_workouts sw ON s.id = sw.session_id
      JOIN workouts w ON sw.workout_id = w.id
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC;
    `;
    const result = await pool.query(query, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/setWorkouts', async (req, res) => {
  const { name, body_part } = req.body;

  if (!name || !body_part) {
    return res.status(400).json({ message: 'Workout name and body part are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO workouts (name, body_part) VALUES ($1, $2) RETURNING *',
      [name, body_part]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/setSessions', async (req, res) => {
  const { session_name, user_id } = req.body;

  if (!session_name || !user_id) {
    return res.status(400).json({ message: 'Session name and user ID are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO sessions (session_name, user_id) VALUES ($1, $2) RETURNING *',
      [session_name, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/getSessions', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    // Assuming you have a 'sessions' table with 'user_id' and 'session_name'
    const result = await pool.query(
      'SELECT * FROM sessions WHERE user_id = $1',
      [user_id]
    );

    // Respond with the session data
    res.status(200).json(result.rows); // Return the sessions array
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/session_workouts', async (req, res) => {
  const { session_id, workout_id } = req.body;

  if (!session_id || !workout_id) {
    return res.status(400).json({ message: 'Session ID and Workout ID are required.' });
  }

  try {
    await pool.query(
      'INSERT INTO session_workouts (session_id, workout_id) VALUES ($1, $2)',
      [session_id, workout_id]
    );
    res.status(201).json({ message: 'Workout added to session.' });
  } catch (error) {
    console.error('Error linking workout to session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
