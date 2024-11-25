import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CreateWorkouts() {
  const [workoutName, setWorkoutName] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [newSessionName, setNewSessionName] = useState('');

  const userId = 5;

  // Fetch existing sessions
  useEffect(() => {
    const fetchSessions = async () => {
        try {
          // Change to POST request with body
          const response = await axios.post('http://localhost:5000/getSessions', {
            user_id: userId, // Send user_id in the request body
          });
          setSessions(response.data); // Set the response data (sessions)
        } catch (error) {
          console.error('Error fetching sessions:', error);
        }
      };
    
      if (userId) { // Make sure userId is defined
        fetchSessions();
      }
    }, [userId]);

  // Handle creating a new workout and optionally linking to a session
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Create a new workout
      const workoutResponse = await axios.post('http://localhost:5000/setWorkouts', {
        name: workoutName,
        body_part: bodyPart,
      });

      const newWorkout = workoutResponse.data;

      // Step 2: Link to an existing or new session
      if (selectedSession) {
        // Link to an existing session
        await axios.post('http://localhost:5000/session_workouts', {
          session_id: selectedSession,
          workout_id: newWorkout.id,
        });
      } else if (newSessionName) {
        // Create a new session and link the workout
        const sessionResponse = await axios.post('http://localhost:5000/setSessions', {
          session_name: newSessionName,
          user_id: userId,
        });

        const newSession = sessionResponse.data;

        await axios.post('http://localhost:5000/session_workouts', {
          session_id: newSession.id,
          workout_id: newWorkout.id,
        });
      }

      alert('Workout successfully added!');
      setWorkoutName('');
      setBodyPart('');
      setSelectedSession('');
      setNewSessionName('');
    } catch (error) {
      console.error('Error creating workout:', error);
      alert('Failed to add workout. Please try again.');
    }
  };

  return (
    <div>
      <h1>Create a New Workout</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Workout Name:</label>
          <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Body Part:</label>
          <input
            type="text"
            value={bodyPart}
            onChange={(e) => setBodyPart(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Existing Session:</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <option value="">Select a session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.session_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Or Create New Session:</label>
          <input
            type="text"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
          />
        </div>
        <button type="submit">Add Workout</button>
      </form>
    </div>
  );
}

export default CreateWorkouts;
