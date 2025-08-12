import React from 'react';
import './homepage.css'; 
import { Link } from 'react-router-dom';
import marcusImage from '../../assets/marcus_lapp.jpg';
import businessmanImage from '../../assets/businessman_speaking.jpg';

function Homepage() {
    return (
        <div className="homepage-container"> 
            <div className="hero-content">
                <div className="text-content">
                    <h1 className="hero-heading">Find Your Flow. Speak with Confidence.</h1>
                    <p className="hero-paragraph"> 
                        Approximately 1% of the world's population stutters, which translates to approximately 80 million people in the world. If you are part of the 
                        80 million people, Voice Unleashed is primarily for you. However, if you are not part of the 80 million people, this tool is still for you 
                        as anyone can improve their speaking skills, becoming a more effective communicator.
                    </p>

                    <p className="hero-paragraph"> 
                        Study the influential speaking tools taught by Marcus Lapp, a former stutterer and speech coach, get real-time AI feedback from video and audio recordings, 
                        and track your progress on your journey to clearer speech.
                    </p>
                    
                    {/* --- MARCUS IMAGE AND CAPTION --- */}
                    <div className="marcus-section">
                        <img src={marcusImage} alt="Marcus Lapp, Speech Coach" className="marcus-image" />
                        <p className="marcus-caption">
                            Voice Unleashed is inspired by the teachings of Marcus Lapp, a former stutterer and founder of the Speak Your Mind Method.
                        </p>
                    </div>
                </div>
            
                <div className="image-content">
                    <img src={businessmanImage} alt="Happy businessman speaking on phone" className="hero-image" />
                    <p className="hero-image-caption">
                        Increase your fluency and speak with confidence just like this happy businessman speaking on his phone!
                    </p>
                </div>

            </div>
            <Link to="/tools" className="cta-button">
                Get Started
            </Link>
        </div> 
    )
}

export default Homepage; 