import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal'; 
import '../styles/register.css'
import axios from 'axios';

function Register(){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

    const openModal = () => {
        setIsModalOpen(true);
      };
    
      const closeModal = () => {
        setIsModalOpen(false);
      };

      const handleChange = (e) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value,
        });
      };
  
      const handleSubmit = async (e) => {
        e.preventDefault();
  
        // Check if password and confirmPassword match
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match");
          return;
        }
  
        try {
          const response = await axios.post('http://localhost:5000/register', {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          });
          console.log('Form Data Submitted:', formData);
          console.log(response.data); // User saved in the database
            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: ''
            });
            alert("User registered successfully!");
        } catch (error) {
          console.error('Error during registration:', error);
          alert("Registration failed.");
        }
      };

    return(
    <>
        <div>
            <div id='title-container'>
                <h1>Registering An Account</h1>
            </div>
            <div id='registration-form-container'>
                <div>
                    <p>
                        Create a free account today to add friends, upload clips and compete with friends!
                    </p>
                    <p className="login-link">
                    Already have an account? <Link to="#" onClick={openModal}>Login here</Link>
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                <div>
                <label htmlFor="username">Choose a unique username. This will be used to login.</label>
                </div>
                <div>
                    <input 
                    type="text" 
                    id="username"
                    className='registerInput'
                    name="username" 
                    placeholder='Username'
                    value={formData.username}
                    onChange={handleChange}
                    required />
                </div>
                <div>
                    <label>Please provide a valid email address</label>
                </div>
                <div>
                    <input 
                    type="text" 
                    id="email"
                    className='registerInput'
                    name="email" 
                    placeholder='Email Address'
                    value={formData.email}
                    onChange={handleChange}
                    required />
                </div>
                <div>
                    <label htmlFor="password">Choose a strong password</label>
                </div>
                <div>
                    <input 
                    type="password" 
                    id="password" 
                    className='registerInput'
                    name="password" 
                    placeholder='Password'
                    value={formData.password}
                    onChange={handleChange}
                    required />
                </div>
                <div>
                    <input 
                    type="password" 
                    id="confirmPassword" 
                    className='registerInput'
                    name="confirmPassword" 
                    placeholder='Confirm Password'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required />
                </div>
                <div>
                    <button type="submit" className="modalbuttons">Sign Up</button>
                </div>
                </form>
            </div>
        </div>
        <Modal isOpen={isModalOpen} onClose={closeModal} />
      </>
    )
}

export default Register;