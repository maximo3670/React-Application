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

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if the password matches
    const passwordMatch = await bcrypt.compare(password, user.password);

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

// Search workouts based on the name
app.get('/searchWorkouts', async (req, res) => {
  const searchQuery = req.query.query; // Get the search query from the query parameters

  if (!searchQuery) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // Use a case-insensitive search (ILIKE for PostgreSQL)
    const query = `
      SELECT id AS workout_id, name AS workout_name, body_part 
      FROM workouts
      WHERE name ILIKE $1  -- Use ILIKE for case-insensitive matching
      ORDER BY name ASC;
    `;
    
    // Run the query with the search term surrounded by wildcards to match any part of the name
    const result = await pool.query(query, [`%${searchQuery}%`]);

    res.json(result.rows); // Send back the matching workouts
  } catch (error) {
    console.error('Error searching workouts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get workouts for a user
app.get('/getWorkouts', async (req, res) => {
  const userId = req.query.userId; // Pass the user ID as a query parameter

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Fetch workouts linked to sessions for the user, including workout_id
    const query = `
      SELECT s.id AS session_id, s.session_name, w.id AS workout_id, w.name AS workout_name, w.body_part 
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

app.delete('/deleteWorkout', async (req, res) => {
  const { workoutName } = req.body;

  if (!workoutName) {
    return res.status(400).json({ message: 'Workout name is required' });
  }

  try {
    // Delete the workout from the `workouts` table
    const deleteWorkoutQuery = `
      DELETE FROM workouts
      WHERE name = $1
      RETURNING id;
    `;

    const deleteWorkoutResult = await pool.query(deleteWorkoutQuery, [workoutName]);

    if (deleteWorkoutResult.rowCount === 0) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const workoutId = deleteWorkoutResult.rows[0].id;

    // Remove the workout from any session it was linked to
    const deleteSessionWorkoutQuery = `
      DELETE FROM session_workouts
      WHERE workout_id = $1;
    `;

    await pool.query(deleteSessionWorkoutQuery, [workoutId]);

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/deleteSession', async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID is required' });
  }

  try {
    // Remove all links between this session and its workouts
    const deleteSessionWorkoutsQuery = `
      DELETE FROM session_workouts
      WHERE session_id = $1;
    `;

    await pool.query(deleteSessionWorkoutsQuery, [sessionId]);

    // Delete the session itself
    const deleteSessionQuery = `
      DELETE FROM sessions
      WHERE id = $1;
    `;

    const deleteSessionResult = await pool.query(deleteSessionQuery, [sessionId]);

    if (deleteSessionResult.rowCount === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/removeWorkoutFromSession', async (req, res) => {
  const { sessionId, workoutId } = req.body;

  if (!sessionId || !workoutId) {
    return res.status(400).json({ message: 'Session ID and Workout ID are required' });
  }

  try {
    // Remove the workout from the session in the `session_workouts` table
    const query = `
      DELETE FROM session_workouts
      WHERE session_id = $1 AND workout_id = $2;
    `;

    const result = await pool.query(query, [sessionId, workoutId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Workout not found in the specified session' });
    }

    res.json({ message: 'Workout removed from session successfully' });
  } catch (error) {
    console.error('Error removing workout from session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/checkWorkout', async (req, res) => {
  const { name } = req.query;

  try {
    const result = await pool.query('SELECT id FROM workouts WHERE name = $1', [name]);

    if (result.rows.length > 0) {
      // Workout exists, send the ID
      res.json({ exists: true, workout_id: result.rows[0].id });
    } else {
      // Workout doesn't exist
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking workout:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/workoutStats', async (req, res) => {
  // Access userId from the query parameters
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const query = `
        SELECT
            w.name AS workout_name,
            MAX(uws.weight) AS personal_best,
            SUM(uws.reps * uws.set_number) AS total_reps,
            SUM(uws.set_number) AS total_sets,
            (SELECT uws2.weight
             FROM user_workout_sets uws2
             WHERE uws2.workout_id = w.id AND uws2.user_id = $1
             ORDER BY uws2.created_at DESC
             LIMIT 1) AS last_weight,
            (SELECT uws2.reps
             FROM user_workout_sets uws2
             WHERE uws2.workout_id = w.id AND uws2.user_id = $1
             ORDER BY uws2.created_at DESC
             LIMIT 1) AS last_reps
        FROM workouts w
        JOIN user_workout_sets uws ON uws.workout_id = w.id
        WHERE uws.user_id = $1
        GROUP BY w.id, w.name;
    `;

    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching workout statistics');
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
