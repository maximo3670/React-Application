import { Link } from 'react-router-dom';
import '../styles/navbar.css';
import Logo from '../assets/logo-placeholder.png';
import React, { useState } from 'react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
  <nav>
    <div className="logo-container">
      <Link to="/">
        <img src={Logo} alt="Logo" className="logo" />
      </Link>
    </div>
    <div className="menu-toggle" onClick={toggleDropdown}>
      &#9776; {/* This is the hamburger icon */}
    </div>
    <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
      <li><Link to="/" className='buttons'>Home</Link></li>
      <li><Link to="/about" className='buttons'>About</Link></li>
      <li><Link to="/whatwedo" className='buttons'>What We Do</Link></li>
      <li><Link to="/contact" className='buttons'>Contact</Link></li>
    </ul>
  </nav>
  );
}

export default Navbar;
