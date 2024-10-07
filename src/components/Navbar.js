import { Link } from 'react-router-dom';
import '../styles/navbar.css';
import Logo from '../assets/logo-placeholder.png';
import React, { useState } from 'react';
import Modal from './Modal'; 

function Navbar() {
  // Separate state for the modal and dropdown
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility

  // Functions for modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Functions for dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
  <>
    <nav>
      <div className="logo-container">
        <Link to="/">
          <img src={Logo} alt="Logo" className="logo" />
        </Link>
      </div>
      <div className="menu-toggle" onClick={toggleDropdown}>
        &#9776; {/* This is the hamburger icon */}
      </div>
      <ul className={`nav-links ${isDropdownOpen ? 'active' : ''}`}>
        <li><Link to="/howthisworks" className='navbuttons'>How this works</Link></li>
      </ul>
      <li className="profile-container">
          <Link to="#" onClick={openModal} className="navbuttons">
            <i className="fas fa-user profile-icon"></i>
          </Link>
        </li>
    </nav>
    <Modal isOpen={isModalOpen} onClose={closeModal} />
  </> 
  );
}

export default Navbar;
