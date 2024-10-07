import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal'; 
import '../styles/register.css'

function Register(){
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
      };
    
      const closeModal = () => {
        setIsModalOpen(false);
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
                <form>
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
                    required />
                </div>
                <div>
                    <input 
                    type="password" 
                    id="password" 
                    className='registerInput'
                    name="password" 
                    placeholder='Confirm Password'
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