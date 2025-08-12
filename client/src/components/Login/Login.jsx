import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase';
import './Login.css';

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent form from refreshing the page
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // On successful login, Firebase automatically handles the user session.
            // The application now redirects the user to the homepage. 
            navigate('/'); // Redirect to homepage
        } catch (err) {
            // Handle specific Firebase errors
            switch (err.code) {
                case 'auth/user-not-found':
                    setError('No account found with this email.');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password. Please try again.');
                    break;
                case 'auth/invalid-credential':
                    setError('Incorrect email or password.');
                    break;
                default:
                    setError('Failed to log in. Please try again.');
                    break;
            }
            console.error("Firebase login error:", err);
        } finally {
            setLoading(false); 
        }
    }; 

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>LOGIN</h1>
                <form onSubmit={handleLogin}>
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

                    {error && <p className="error-message">{error}</p>}
                    
                    <div className="options-group">
                        <div className="remember-me">
                            <input type="checkbox" id="remember" />
                            <label htmlFor="remember">Remember Me</label>
                        </div>
                        <a href="/forgot-password">Forgot Password</a>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'LOGGING IN...' : 'SUBMIT'}
                    </button>
                </form>
            </div> 
        </div>
    )
}

export default LoginPage;