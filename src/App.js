import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Howthisworks from './pages/HowThisWorks';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CreateWorkouts from './pages/CreateWorkouts';
import MyWorkouts from './pages/MyWorkouts';
import WorkoutStats from './pages/WorkoutStats';
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/howthisworks" element={<Howthisworks />} />
        <Route path="/register" element={<Register />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/MyWorkouts' element={<MyWorkouts />} />
        <Route path='/CreateWorkouts' element={<CreateWorkouts />} />
        <Route path='/Stats' element={<WorkoutStats />} />
      </Routes>
    </Router>
  );
}

export default App;
