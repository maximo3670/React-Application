import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MyWorkouts.css';

function MyWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSession, setExpandedSession] = useState(null);
  const [editingSession, setEditingSession] = useState(null);

  const userId = 5; // Replace with the logged-in user's ID

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/getWorkouts', {
          params: { userId },
        });

        if (response.data && response.data.length > 0) {
          // Group workouts by session_id
          const groupedWorkouts = response.data.reduce((acc, workout) => {
            const { session_id, session_name, workout_name, workout_id, body_part } = workout;

            if (!acc[session_id]) {
              acc[session_id] = {
                session_id,
                session_name,
                workouts: [],
              };
            }

            acc[session_id].workouts.push({ workout_name, workout_id, body_part });
            return acc;
          }, {});

          setWorkouts(Object.values(groupedWorkouts));
        } else {
          setWorkouts([]); // Explicitly set to an empty array
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching workouts:', err);
        setError('Failed to fetch workouts.');
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [userId]);

  const toggleSession = (sessionId) => {
    setExpandedSession((prev) => {
      if (prev === sessionId) {
        // If the session is already expanded, collapse it and stop editing
        setEditingSession(null);
        return null;
      } else {
        // Expand the session and start editing
        return sessionId;
      }
    });
  };
  

  const startEditing = (sessionId) => {
    if (editingSession === sessionId) {
      // Stop editing if the same session is clicked again or if it's not expanded
      setEditingSession(null);
    } else {
      // Start editing the clicked session
      setEditingSession(sessionId);
    }
  };
  

  const deleteWorkout = async (sessionId, workoutId) => {
    try {
      // Find the session and workout to delete
      const sessionToModify = workouts.find((session) => session.session_id === sessionId);
      if (!sessionToModify) {
        console.error('Session not found');
        return;
      }
  
      const workoutToDelete = sessionToModify.workouts.find(workout => workout.workout_id === workoutId);
      if (!workoutToDelete) {
        console.error('Workout not found or missing workout_id');
        return;
      }
  
      // Send the request to remove the workout from the session
      await axios.delete('http://localhost:5000/removeWorkoutFromSession', {
        data: { sessionId, workoutId },
      });
  
      // Update the workouts state by removing the workout from the specific session
      setWorkouts((prevWorkouts) =>
        prevWorkouts.map((session) =>
          session.session_id === sessionId
            ? { ...session, workouts: session.workouts.filter(workout => workout.workout_id !== workoutId) }
            : session
        )
      );
  
      alert('Workout removed from session successfully!');
    } catch (error) {
      console.error('Error removing workout from session:', error);
      alert('Failed to remove workout. Please try again.');
    }
  };  

  
  const deleteSession = async (sessionId) => {
    try {
      await axios.delete(`http://localhost:5000/deleteSession`, {
        data: { sessionId },
      });

      setWorkouts((prevWorkouts) => prevWorkouts.filter((session) => session.session_id !== sessionId));
      alert('Session deleted successfully!');
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session. Please try again.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
    <div id="title-container">
    <h1>My Workouts</h1>
  </div>
  <div id='registration-form-container'>
    <div className="workouts-container">
      {workouts.length === 0 ? (
        <p>No workouts found.</p>
      ) : (
        <div className="workouts-grid">
          {workouts.map((session) => (
            <div
              key={session.session_id}
              className={`workout-box ${expandedSession === session.session_id ? 'expanded' : ''}`}
              onClick={() => toggleSession(session.session_id)}
            >
              <h2>{session.session_name}</h2>
              {expandedSession === session.session_id && (
                <div className="workout-details">
                  {session.workouts.map((workout, idx) => (
                    <div key={idx} className="workout-item">
                      <p>
                        {workout.workout_name} - {workout.body_part}
                      </p>
                      {editingSession === session.session_id && (
                        <button
                          className="delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWorkout(session.session_id, workout.workout_id);
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}


                  {editingSession === session.session_id && (
                    <button
                      className="delete-session-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.session_id);
                      }}
                    >
                      Delete Session
                    </button>
                  )}
                  <p></p>
                    <button
                    className="edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(session.session_id); // Toggle the edit mode
                    }}
                  >
                    {editingSession === session.session_id ? 'Stop Editing' : 'Edit'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
    </div>
  );
}

export default MyWorkouts;
