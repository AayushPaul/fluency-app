import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth } from "firebase/auth"; // Add this import
import './VideoRecording.css';

function VideoRecording() {
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [videoStream, setVideoStream] = useState(null);
    const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState('');

    const mediaRecorderRef = useRef(null);
    const videoRef = useRef(null);
    const recordedChunksRef = useRef([]);

    const handleStartRecording = async () => {
        // This function does not need to change
        setError('');
        setFeedback(null);
        setRecordedVideoUrl(null);
        setRecordedBlob(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            setVideoStream(stream);
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
            recordedChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) recordedChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                setRecordedVideoUrl(url);
                setRecordedBlob(blob);
                stream.getTracks().forEach(track => track.stop()); // Turn off camera
                setVideoStream(null);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing camera/microphone:", err);
            setError("Could not access camera. Please check browser permissions.");
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }

        setIsRecording(false);
    };

    const handleSendForAnalysis = async () => {
        if (!recordedBlob) return;
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
        formData.append('videoFile', recordedBlob, 'user_video.webm');

        try {
            const apiUrl = '/api/analyze-video';
            const response = await fetch(apiUrl, { 
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`
                },
                body: formData,
            });

            if (!response.ok) {
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
            setFeedback(data);
        } catch (error) {
            setError(`Failed to get analysis from server: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // This function does not need to change
        if (videoStream && videoRef.current) {
            videoRef.current.srcObject = videoStream;
        }
    }, [videoStream]);

    return (
        // The JSX part does not need to change
        <div className="video-recorder-container">
            <header className="page-header">
                <h2>Video Recording</h2>
                <p>Record your video exercises.</p>
            </header>

            <div className="video-main-area">
                {videoStream && <video ref={videoRef} className="live-video" autoPlay muted playsInline></video>}
                {recordedVideoUrl && <video src={recordedVideoUrl} className="recorded-video" controls playsInline></video>}
                {!videoStream && !recordedVideoUrl && <div className="video-placeholder">Your camera feed will appear here</div>}
            </div>

            {!isRecording && !recordedVideoUrl && (
                <button onClick={handleStartRecording} className="record-button" disabled={isLoading}>Start Recording</button>
            )}

            {isRecording && (
                <button onClick={handleStopRecording} className="record-button recording" disabled={isLoading}>Stop Recording</button>
            )}

            {recordedVideoUrl && !isLoading && !feedback && (
                <button onClick={handleSendForAnalysis} className="record-button analysis-button">Send for Analysis</button>
            )}

            {error && <div className="error-message">{error}</div>}
            {isLoading && <div className="loader"></div>}

            {feedback && !isLoading && (
                <div className="feedback-section">
                    <h3>AI Feedback</h3>
                    <p className="feedback-text">{feedback.textFeedback}</p>
                    {feedback.toolSuggestions?.length > 0 && (
                        <div className="tools-recommendation">
                            <h4>Recommended Tools to Practice:</h4>
                            <div className="tools-list">
                                {feedback.toolSuggestions.map(tool => (
                                    <Link key={tool} to="/tools" className="tool-tag">{tool}</Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default VideoRecording;