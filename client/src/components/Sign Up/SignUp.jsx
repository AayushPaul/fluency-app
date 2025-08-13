import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase'; // Import auth from your firebase.js
import './SignUp.css';

function SignUpPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // 1. Check if passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }
        
        try {
            // 2. Creates user with Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // // Sends welcome email after successful signup
            // if (user) {
            //     const apiUrl = 'http://localhost:5001/api/send-welcome-email';
            //     // This fetch call now has the proper headers and body
            //     fetch(apiUrl, {
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'application/json', 
            //         },
            //         body: JSON.stringify({ email: user.email }), // Send the user's email
            //     });
            // }

            // 3. On successful signup, redirects to the login page
            navigate('/login-page');
        } catch (err) {
            // Handle specific Firebase errors
            if (err.code === 'auth/email-already-in-use') {
                setError('This email address is already in use.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters long.');
            } else {
                setError('Failed to create an account. Please try again.');
            }
            console.error("Firebase signup error:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h1>CREATE ACCOUNT</h1>
                <form onSubmit={handleSignUp}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
                    </button>

                    <div className="login-redirect">
                        Already have an account? <Link to="/login-page">Log In</Link>
                    </div>
                </form>
            </div> 
        </div>
    );  
}

export default SignUpPage;