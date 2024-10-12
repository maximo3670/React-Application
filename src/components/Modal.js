// src/components/Modal.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // You will use axios to send requests to the backend
import '../styles/modal.css'; // Import your CSS for modal styling

const Modal = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null; // Don't render the modal if it's not open

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });
      
      // Assuming you get a JWT token from the server on successful login
      const { token } = response.data;

      // Store the token in localStorage
      localStorage.setItem('authToken', token);

      // Redirect or close modal after successful login
      alert("Login successful!");
      onClose();
      navigate('/profile'); 

    } catch (error) {
        console.log(error);
      // Handle error (e.g., incorrect credentials)
      setErrorMessage('Invalid username or password');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="username">Username:</label>
            <input 
              type="text" 
              id="modalUsername" 
              name="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="modalPassword" 
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="modalbuttons">Login</button>
        </form>
        <button className="modalbuttons" onClick={onClose}>Close</button>
        <p className="register-link">
          Don't have an account? <Link to="/register" onClick={onClose}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Modal;