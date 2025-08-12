import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase'; // Make sure this path is correct
import './navbar.css';

function Navbar() {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    // Listen for changes in the user's login state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in
                setCurrentUser(user);
            } else {
                // User is signed out
                setCurrentUser(null);
            }
        });

        // Cleanup the listener when the component unmounts
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // After successful sign out, the onAuthStateChanged listener will
            // update the state, and we can redirect the user.
            navigate('/login-page');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="navbar-container">
            <div className="navbar-logo">
                <NavLink to="/" className="nav-link logo-link">Voice Unleashed</NavLink>
            </div>

            <div className="navbar-links">
                <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
                <NavLink to="/tools" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Tools</NavLink>
                <NavLink to="/audio-recording" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Audio Recording</NavLink>
                <NavLink to="/video-recording" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Video Recording</NavLink>
                <NavLink to="/chat-history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Chat History</NavLink>

                {currentUser ? (
                    // If user is logged in, show Account and Logout
                    <>
                        <NavLink to="/account-page" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Account</NavLink>
                        {/* Use a button for the logout action */}
                        <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
                    </>
                ) : (
                    // If user is logged out, show Login and Sign Up
                    <>
                        <NavLink to="/login-page" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Login</NavLink>
                        <NavLink to="/signup-page" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Sign Up</NavLink>
                    </>
                )}
            </div>
        </div>
    );
}

export default Navbar;