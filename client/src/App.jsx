import React from 'react'; 
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/navbar/navbar';
import HomePage from './components/homepage/homepage';
import ToolsPage from './components/tools/tools';
import AudioRecordingPage from './components/Audio Recording/AudioRecording';
import VideoRecordingPage from './components/Video Recording/VideoRecording';
import LoginPage from './components/Login/Login';
import SignUpPage from './components/Sign Up/SignUp';
import AccountPage from './components/Account Page/AccountPage';
import ChatHistoryPage from './components/chatHistory/chatHistory';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router> 
      <Navbar /> 
      
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          {/*All other pages ARE wrapped in PageLayout to give them the container styling*/}
          
          <Route path="/audio-recording" element={<AudioRecordingPage />} />
          <Route path="/video-recording" element={<VideoRecordingPage />} />
          <Route path="/chat-history" element={<ChatHistoryPage /> } />
          <Route path="/login-page" element={<LoginPage />} />
          <Route path="/signup-page" element={<SignUpPage />} />
          <Route path="/account-page" element={<AccountPage />} />

          <Route path="*" element={
            <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
              <h2>404 - Page Not Found</h2>
              <p>Sorry, the page you are looking for does not exist.</p>
              <Link to="/">Go to Homepage</Link>
            </div>
          } />
        </Routes>
    </Router> 
  )
}

export default App; 