import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MyWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = 5; // Replace with the logged-in user's ID

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/geWorkouts', {
          params: { userId },
        });

        if (response.data && response.data.length > 0) {
          // Group workouts by session_id
          const groupedWorkouts = response.data.reduce((acc, workout) => {
            const { session_id, session_name, workout_name, body_part } = workout;

            if (!acc[session_id]) {
              acc[session_id] = {
                session_name,
                workouts: [],
              };
            }

            acc[session_id].workouts.push({ workout_name, body_part });
            return acc;
          }, {});

          setWorkouts(Object.values(groupedWorkouts));
        } else {
          // No workouts found for this user
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>My Workouts</h1>
      {workouts.length === 0 ? (
        <p>No workouts found.</p>
      ) : (
        <div>
          {workouts.map((session, index) => (
            <div key={index}>
              <h2>{session.session_name}</h2>
              {session.workouts.map((workout, idx) => (
                <div key={idx}>
                  <p>{workout.workout_name}, {workout.body_part}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyWorkouts;
