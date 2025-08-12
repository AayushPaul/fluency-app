import React from 'react';
import './tools.css';

function Tools() {
    // Array of techniques to easily manage and render them
    const techniques = [
        
        { 
            name: "Word Stretching", 
            description: "This technique involves prolonging the first sound of a word to ease into it smoothly, reducing the physical tension that can cause a block.", 
            videoUrl: "https://storage.googleapis.com/fluency-app-463902-audio-uploads/fbda33-fc6-c1d-1655-c277eae16566_word_stretching%20(1).mp4" 
        },
        { 
            name: "Over-Articulation", 
            description: "Exaggerating the movements of your mouth, jaw, and tongue helps to build muscle memory and break out of habitual speech patterns.", 
            videoUrl: "https://storage.googleapis.com/fluency-app-463902-audio-uploads/5d0450-262a-36b3-526-7fafb24ee3e_over_articulation%20(1).mp4" 
        },
        { 
            name: "Hammer Tool", 
            description: "The Hammer Tool is a technique focused on stopping and restarting on the words or phrases you block or stutter on to say the sentence fluently with any of the other tools on your second attempt.", 
            videoUrl: "https://storage.googleapis.com/fluency-app-463902-audio-uploads/1075c-76c3-c03-af0d-c44b33ffa87_hammer_tool%20(1).mp4" 
        },
        { 
            name: "Hammer-Link Tool", 
            description: "This builds on the Hammer Tool by linking the word you stutter or block on with the previous word on your second attempt in a rhythmic, controlled manner instead of saying the whole sentence or phrase again.", 
            videoUrl: "https://storage.googleapis.com/fluency-app-463902-audio-uploads/ca0ccfc-de43-ff6-2a0f-ee687f500e_hammer_link_tool%20(1).mp4" 
        },
        { 
            name: "Hand Movements", 
            description: "Using natural, flowing hand gestures that are synchronized with your speech can help channel physical energy and reduce tension.", 
            videoUrl: "https://storage.googleapis.com/fluency-app-463902-audio-uploads/f1f065-ef32-1ce-21f-1bab2e7e125_hand_movements%20(1).mp4" 
        },
        { 
            name: "Short Phrasing", 
            description: "Breaking down long sentences into shorter, more manageable phrases helps with breath control and reduces the pressure of speaking.", 
            videoUrl: "https://storage.googleapis.com/fluency-app-463902-audio-uploads/d1c7038-b38d-1734-e080-83b2bd187eb8_short_phrasing%20(1).mp4" 
        },
        { 
            name: "Smiling", 
            description: "A gentle smile can relax the facial muscles, making speech production physically easier and projecting an air of confidence.", 
            videoUrl: "https://storage.googleapis.com/fluency-app-463902-audio-uploads/e0c473c-64d7-75-8ef7-f18ec68cff78_smiling%20(1).mp4" 
        },
        { 
            name: "Soft Landing", 
            description: "This technique involves ending words softly and gently, which can prevent the abrupt stops or choppy speech while saying a sentence.", 
            videoUrl: "https://storage.googleapis.com/fluency-app-463902-audio-uploads/1b5ed58-c3-e27f-c22e-cd0742727c58_the_soft_landing%20(1).mp4" 
        }
    ];

    return (
        <div className="tools-container">
            <header className="tools-header">
                <h1>8 Important Techniques for Long-Term Improvement</h1>
                <p>
                    Below are fundamental techniques that can help you build smoother, more confident speech patterns.
                    When you receive feedback from your recordings, you may be guided to this page to review a specific tool. Explore each one and find what works best for you.
                </p>
            </header>

            <div className="techniques-grid">
                {techniques.map((tech, index) => (
                    <div key = {index} className="technique-card">
                        <h2>{tech.name}</h2>
                        <p>{tech.description}</p>
                        <a href={tech.videoUrl} target="_blank" rel="noopener noreferrer" className="video-link-button"> Watch Video </a> 
                    </div> 
                ))}
            </div>

            <section className="program-shoutout">
                <h2> Go Deeper with Speak Your Mind Method </h2>
                <p> 
                    The tools listed here are based on the teachings of Marcus Lapp, a former stutterer, speech coach, and founder of the Speak Your Mind Method.
                    For a comprehensive program with daily routines, vocal exercises, guided meditations, and other resources, consider exploring his website.
                </p>

                <a href="https://www.speakyourmindmethod.com/" target="_blank" rel="noopener noreferrer" className="video-link-button">
                    Visit Marcus Lapp's Website
                </a>
            </section>
        </div> 
    ); 

}

export default Tools; 