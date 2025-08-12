import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, signOut } from 'firebase/auth';
import './AccountPage.css';

function AccountPage() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [password, setPassword] = useState('');

    const auth = getAuth();
    const user = auth.currentUser;

    const handleDelete = async () => {
        if (!user) {
            setError("You must be logged in to delete an account.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Get credentials by prompting for password
            const credential = EmailAuthProvider.credential(user.email, password);
            
            // 2. Re-authenticate the user to confirm their identity
            await reauthenticateWithCredential(user, credential);

            // 3. Get the user's ID token to send to the backend
            const idToken = await user.getIdToken(true);

            // 4. Call the backend endpoint to perform secure deletion
            const apiUrl = '/api/delete-account';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json', // Specify the body is JSON
                'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ idToken: idToken }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to delete account on server.');
            }
            
            // 5. Sign out and redirect on success
            await signOut(auth);
            navigate('/');
            alert('Your account has been permanently deleted.');

        } catch (err) {
            if (err.code === 'auth/wrong-password') {
                setError('Incorrect password. Deletion failed.');
            } else {
                setError('An error occurred. Please try again.');
            }

            console.error("Account deletion error:", err);

        } finally {
            setLoading(false); 
        }
    };

    if (!user) {
        return (
            <div className="account-container">
                <p>Please log in to manage your account.</p>
            </div>
        );
    }

    return (
        <div className="account-container">
            <div className="account-box">
                <h2>Account Settings</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <hr />

                <div className="delete-section">
                    <h3>Delete Account</h3>
                    <p>
                        This action is permanent and cannot be undone. All your data
                        associated with this account will be permanently erased.
                    </p>

                    {!showConfirm ? (
                        <button className="delete-btn" onClick={() => setShowConfirm(true)}>
                            Delete My Account
                        </button>
                    ) : (
                        <div className="confirmation-dialog">
                            <h4>Confirm Your Identity to Proceed</h4>
                            <p>For your security, please enter your password to continue.</p>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <button className="delete-btn confirm" onClick={handleDelete} disabled={loading || !password}>
                                {loading ? 'DELETING...' : 'Permanently Delete Account'}
                            </button>
                            <button className="cancel-btn" onClick={() => setShowConfirm(false)} disabled={loading}>
                                Cancel
                            </button>
                            {error && <p className="error-message">{error}</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AccountPage;