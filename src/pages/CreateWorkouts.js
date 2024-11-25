import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CreateWorkouts.css'

function CreateWorkouts() {
  const [workoutName, setWorkoutName] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [newSessionName, setNewSessionName] = useState('');
  const [workoutSuggestions, setWorkoutSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const userId = 5;

  // Fetch existing sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.post('http://localhost:5000/getSessions', {
          user_id: userId, // Send user_id in the request body
        });
        setSessions(response.data); // Set the response data (sessions)
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    if (userId) {
      fetchSessions();
    }
  }, [userId]);

  // Handle workout name search and suggestions
  const handleWorkoutNameChange = async (e) => {
    const searchQuery = e.target.value;
    setWorkoutName(searchQuery);

    if (searchQuery.trim() === '') {
      setWorkoutSuggestions([]);
      return;
    }

    // Debounce implementation - Wait for a short delay before sending the request
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/searchWorkouts', {
        params: { query: searchQuery },
      });
      setWorkoutSuggestions(response.data); // Set workout suggestions
    } catch (error) {
      console.error('Error searching workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      let workoutId;
      // Step 1: Check if workout already exists
      const existingWorkoutResponse = await axios.get('http://localhost:5000/checkWorkout', {
        params: { name: workoutName },
      });
  
      if (existingWorkoutResponse.data.exists) {
        // If the workout already exists, use the existing workout ID
        workoutId = existingWorkoutResponse.data.workout_id;
      } else {
        // Step 2: Create a new workout if it doesn't exist
        const workoutResponse = await axios.post('http://localhost:5000/setWorkouts', {
          name: workoutName,
          body_part: bodyPart,
        });
  
        workoutId = workoutResponse.data.id;
      }
  
      // Step 3: Link to an existing or new session
      if (selectedSession && selectedSession !== 'new') {
        // Link to an existing session
        await axios.post('http://localhost:5000/session_workouts', {
          session_id: selectedSession,
          workout_id: workoutId,
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
          workout_id: workoutId,
        });
      }
  
      alert('Workout successfully added!');
      setWorkoutName('');
      setBodyPart('');
      setSelectedSession('');
      setNewSessionName('');
      setWorkoutSuggestions([]);
    } catch (error) {
      console.error('Error creating workout:', error);
      alert('Failed to add workout. Please try again.');
    }
  };
  

  return (
    <div>
      <div id="title-container">
        <h1>Create a New Workout</h1>
      </div>

      <div id="create-workout-form-container">
        <form onSubmit={handleSubmit}>
          <div>
            <input
              className="workout-input"
              type="text"
              value={workoutName}
              onChange={handleWorkoutNameChange}
              required
              placeholder="Workout Name"
            />
            {isLoading && <p>Loading suggestions...</p>}
            {workoutSuggestions.length > 0 && (
              <ul className="suggestions-list">
                {workoutSuggestions.map((workout) => {
                  return (
                    <li
                      key={workout.workout_id}
                      onClick={() => {
                        setWorkoutName(workout.workout_name); // Set workout name
                        setBodyPart(workout.body_part); // Set body part
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {workout.workout_name}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div>
            <input
              className="workout-input"
              type="text"
              value={bodyPart}
              onChange={(e) => setBodyPart(e.target.value)}
              required
              placeholder='Target Body Part'
            />
          </div>
          <div id="sessions-dropdown-container">
          <select
            id="sessions-dropdown"
            required
            value={selectedSession}
            onChange={(e) => {
              setSelectedSession(e.target.value);
              if (e.target.value !== 'new') {
                setNewSessionName(''); // Clear new session name input if an existing session is selected
              }
            }}
          >
            <option value="">Select a session</option>
            {/* New Session option at the top */}
            <option value="new">New Session</option>
            {/* Map through sessions and display */}
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.session_name}
              </option>
            ))}
          </select>
        </div>
          {selectedSession === 'new' && (
            <div>
              <input
                className="workout-input"
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Enter New Session Name"
              />
            </div>
          )}
          <button type="submit" id='add-workout-button'>Add Workout</button>
        </form>
      </div>
    </div>
  );
}

export default CreateWorkouts;
