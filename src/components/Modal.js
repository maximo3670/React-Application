// src/components/Modal.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/modal.css'; // Import your CSS for modal styling

const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Don't render the modal if it's not open

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Login</h2>
        <form>
          <div>
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" className="modalbuttons">Login</button> {/* Added class for consistent styling */}
        </form>
        <button className="modalbuttons" onClick={onClose}>Close</button> {/* Added class for consistent styling */}
        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Modal;
