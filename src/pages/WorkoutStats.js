import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/WorkoutStats.css';

function WorkoutStats() {
  const [stats, setStats] = useState([]);
  const userId = 5; // Replace with dynamic user ID if available

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.post('http://localhost:5000/workoutStats', {
           userId,
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching workout stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <div id="title-container">
        <h1>Workout Statistics</h1>
      </div>

      <div id="registration-form-container">
        {stats.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Workout</th>
                <th>Personal Best</th>
                <th>Last Workout</th>
                <th>Total Sets</th>
                <th>Total Reps</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <tr key={stat.workout_name}>
                  <td>{stat.workout_name}</td>
                  <td>{stat.personal_best} kg</td>
                  <td>
                    {stat.last_weight} kg x {stat.last_reps} reps
                  </td>
                  <td>{stat.total_sets}</td>
                  <td>{stat.total_reps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No workout data available.</p>
        )}
      </div>
    </div>
  );
}

export default WorkoutStats;
