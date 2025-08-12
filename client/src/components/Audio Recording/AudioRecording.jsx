import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAuth } from "firebase/auth"; 
import './AudioRecording.css';

function AudioRecordingPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState('');

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const handleStartRecording = async () => {
        // ... (this function does not need to change)
        setError('');
        setFeedback(null);
        setAudioBlob(null);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError("Your browser does not support audio recording.");
            return;
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                // The original code called sendAudioForAnalysis here automatically.
                // It's better to let the user click a button after playback.
                // For now, we'll keep the auto-send, but update the function below.
                sendAudioForAnalysis(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Could not access microphone. Please check your browser permissions.");
        }
    }; 

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };

    // MODIFIED: This function now sends the auth token
    const sendAudioForAnalysis = async (blob) => {
        setIsLoading(true);
        setError('');
        setFeedback(null);

        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            setError("You must be logged in to get an analysis.");
            setIsLoading(false);
            return;
        }

        const idToken = await user.getIdToken(true);
        const formData = new FormData();
        formData.append('audioFile', blob, 'user_recording.webm');

        try {
            const apiUrl = '/api/analyze-audio';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`
                },
                body: formData,
            });

            if (!response.ok) {
                // Check if the response is JSON before trying to parse it
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Network response was not ok');
                } else {
                    const textError = await response.text();
                    throw new Error(textError || 'Network response was not ok');
                }
            }

            const data = await response.json();
            console.log('Analysis from backend:', data);
            setFeedback(data);

        } catch (error) {
            setError(`Failed to get analysis from server: ${error.message}`);
            console.error("Error sending audio for analysis:", error);
        } finally {
            setIsLoading(false);
        }
    }; 

    return (
        <div className="audio-recorder-container">
            <header className="page-header">
                <h2>Audio Recording</h2>
                <p>Record your audio exercises.</p>
            </header>

            <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`record-button ${isRecording ? 'recording' : ''}`}
                disabled={isLoading}
            >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>

            {error && <div className="error-message">{error}</div>}

            {isLoading && <div className="loader"></div>}

            {audioBlob && !isLoading && (
                    <div className="audio-playback">
                        <h4>Your Recording:</h4>
                        <audio controls src={URL.createObjectURL(audioBlob)} />
                    </div>
            )}

            {feedback && !isLoading && (
                <div className="feedback-section">
                    <h3>AI Feedback</h3>
                    <p className="feedback-text">{feedback.textFeedback}</p> 

                    {feedback.toolSuggestions?.length > 0 && (
                        <div className="tools-recommendation">
                            <h4>Recommended Tools to Practice:</h4>
                            <div className="tools-list">
                                {feedback.toolSuggestions.map(tool => (
                                    <Link key={tool} to="/tools" className="tool-tag">
                                        {tool}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div> 
            )}
        </div>
    );
}

export default AudioRecordingPage;