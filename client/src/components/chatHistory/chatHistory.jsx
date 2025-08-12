import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import './chatHistory.css'; // You'll need to create this CSS file

function ChatHistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                setLoading(false);
                return;
            }
            
            try {
                const idToken = await user.getIdToken(true);
                const apiUrl = '/api/chat-history';

                // CORRECTED: This is a GET request with an Authorization header
                const response = await fetch(apiUrl, {
                    method: 'GET', 
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch chat history.');
                }
                
                const data = await response.json();
                setHistory(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) {
        return <div className="loader"></div>;
    }
    
    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="history-container">
            <header className="history-header">
                <h1>Chat History</h1>
                <p>Review your past feedback and interactions.</p>
            </header>

            <div className="history-list">
                {history.length > 0 ? (
                    history.map(item => (
                        <div key={item.id} className="history-item">

                            <div className="history-item-header">
                                <span className="history-type">{item.type}</span>
                                <span className="history-date">
                                    {new Date(item.timestamp._seconds * 1000).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="history-feedback">{item.feedback}</p>
                            
                            {item.toolSuggestions && item.toolSuggestions.length > 0 && (
                                <div className="history-tools-section">
                                    <strong>Recommended Tools:</strong>
                                    <div className="history-tools-list">
                                        {item.toolSuggestions.map((tool, index) => (
                                            <span key={index} className="history-tool-tag">
                                                {tool}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    ))
                ) : (
                    <p>No history found. Complete an audio or video recording to see your feedback here!</p>
                )}
            </div>
        </div>
    );
}

export default ChatHistoryPage;