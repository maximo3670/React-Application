import React, { useState } from 'react';
import axios from 'axios';
import '../styles/InputWorkout.css';

function InputWorkout() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');

  const user_id = 5;

  // Handle the search input change
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length > 2) {
      try {
        const response = await axios.get('http://localhost:5000/searchWorkouts', {
          params: { query },
        });
        setSearchResults(response.data); // Update search results
      } catch (error) {
        console.error('Error searching workouts:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]); // Clear results if the input is too short
    }
  };

  // Handle selecting a workout
  const handleWorkoutSelect = (workout) => {
    setSelectedWorkout(workout);
    setSearchTerm(workout.workout_name); // Update input with selected workout name
    setSearchResults([]); // Clear results
  };

  // Submit workout data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorkout) {
      alert('Please select a workout');
      return;
    }

    try {
      await axios.post('http://localhost:5000/inputWorkout', {
        user_id: user_id,
        workoutId: selectedWorkout.workout_id,
        weight: parseFloat(weight),
        reps: parseInt(reps),
        sets: parseInt(sets),
      });
      alert('Workout logged successfully!');
      // Clear form
      setSelectedWorkout(null);
      setSearchTerm('');
      setWeight('');
      setReps('');
      setSets('');
    } catch (error) {
      console.error('Error submitting workout:', error);
      alert('Error logging workout. Please try again.');
    }
  };

  return (
    <div>
      <div id="title-container">
        <h1>Input a Workout</h1>
      </div>
      
      <div id='registration-form-container'>
      <form onSubmit={handleSubmit}>
        {/* Search for a workout */}
        <label htmlFor="workout-search">Search Workout:</label>
        <input
          type="text"
          id="workout-search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search for a workout"
        />
        {searchResults.length > 0 && (
          <ul className="search-results">
            {searchResults.map((workout) => (
              <li key={workout.workout_id} onClick={() => handleWorkoutSelect(workout)}>
                {workout.workout_name} ({workout.body_part})
              </li>
            ))}
          </ul>
        )}

        {/* Input workout details */}
        {selectedWorkout && (
          <div>
            <p>Selected Workout: {selectedWorkout.workout_name}</p>
            <label htmlFor="weight">Weight (kg):</label>
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />

            <label htmlFor="reps">Reps per set:</label>
            <input
              type="number"
              id="reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              required
            />

            <label htmlFor="sets">Number of sets:</label>
            <input
              type="number"
              id="sets"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              required
            />
          </div>
          
        )}

        <button type="submit">Log Workout</button>
      </form>
    </div>
    </div>
  );
}

export default InputWorkout;
