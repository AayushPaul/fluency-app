const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const { SpeechClient } = require('@google-cloud/speech');
const { VideoIntelligenceServiceClient } = require('@google-cloud/video-intelligence');
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const app = express();

// --- Firebase Admin & Google Cloud Initialization ---
// This method explicitly parses the credentials from your Vercel environment variables
const firebaseCreds = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS_JSON);
const googleCloudCreds = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
const googleCloudProjectId = googleCloudCreds.project_id;

if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseCreds)
    });
}
const db = admin.firestore();

// --- Configuration & Clients ---
const BUCKET_NAME = 'fluency-app-463902-audio-uploads';
const speechClient = new SpeechClient({ projectId: googleCloudProjectId, credentials: googleCloudCreds });
const videoIntelligenceClient = new VideoIntelligenceServiceClient({ projectId: googleCloudProjectId, credentials: googleCloudCreds });
const storage = new Storage({ projectId: googleCloudProjectId, credentials: googleCloudCreds });
const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
});

const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(401).send('Unauthorized');
    try {
        req.user = await admin.auth().verifyIdToken(idToken);
        next();
    } catch (error) {
        res.status(401).send('Unauthorized');
    }
};

// --- Routes ---
app.get('/', (req, res) => res.send('Fluency App server is running!'));

app.get('/api/chat-history', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const historyRef = db.collection('history');
        const snapshot = await historyRef.where('userId', '==', userId).orderBy('timestamp', 'desc').get();
        if (snapshot.empty) {
            return res.status(200).json([]);
        }
        const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(history);
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ error: 'Failed to fetch chat history.' });
    }
});

app.post('/api/send-welcome-email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    const msg = {
        to: email,
        from: 'aayushpaul01@gmail.com',
        subject: 'Welcome to Voice Unleashed! Find Your Flow.',
        html: `
            <div style="font-family: sans-serif; line-height: 1.6;">
                <h2>Welcome to Voice Unleashed!</h2>
                <p>Hi there,</p>
                <p>We're thrilled to have you join our community. You've taken an important step on your journey to clearer speech.</p>
                <p>Whether you're part of the 80 million people who stutter or you're looking to become a more effective communicator, our tools are designed to help you <strong>Find Your Flow and Speak with Confidence.</strong> 
                The tools, devised by Marcus Lapp (a former stutterer, speech coach, and founder of the Speak Your Mind method), can truly help you achieve your desired fluency. 
                </p>
                <h3>What's next?</h3>
                <ul>
                    <li><strong>Record yourself:</strong> Jump into the Audio and Video Recording pages to start.</li>
                    <li><strong>Get Real-Time AI Feedback:</strong> Our AI will analyze your speech and facial expressions to give you personalized guidance. 
                    The feedback includes recommendations on fluency tools to use and points out your weaknesses based on key observations from your recordings.
                    You can look at the "Tools" page to study the recommended tools, slowly making progress towards fluency. 
                    </li>
                    <li><strong>Track Your Progress:</strong> See your improvements over time and build the confidence you deserve.</li>
                </ul>
                <p>We can't wait to see your progress towards long-term fluency!</p>
                <p>Best,<br>The Voice Unleashed Team</p>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        res.status(200).json({ message: 'Welcome email sent successfully.' });
    } catch (error) {
        console.error('Error sending email with SendGrid:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        // We send a success response even if the email fails,
        // because the user account was still created successfully.
        res.status(200).json({ message: 'User created, but welcome email failed to send.' });
    }
});

//Deleting account route 
app.post('/api/delete-account', verifyToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const historyRef = db.collection('history');
        const snapshot = await historyRef.where('userId', '==', uid).get();
        if (!snapshot.empty) {
            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }
        await admin.auth().deleteUser(uid);
        res.status(200).json({ message: 'Account and all associated history deleted successfully.' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Failed to delete account.' });
    }
});

//Video Recording Route 
app.post('/api/analyze-video', [verifyToken, upload.single('videoFile')], async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded.' });
    }

    const fileName = `${uuidv4()}.webm`;
    const gcsUri = `gs://${BUCKET_NAME}/${fileName}`;
    const file = storage.bucket(BUCKET_NAME).file(fileName);

    try {
        await file.save(req.file.buffer);
        const speechRequest = { audio: { uri: gcsUri }, config: { encoding: 'WEBM_OPUS', sampleRateHertz: 48000, languageCode: 'en-US', enableAutomaticPunctuation: true } };
        const videoRequest = { inputUri: gcsUri, features: ['FACE_DETECTION'] };
        const [speechOperation] = await speechClient.longRunningRecognize(speechRequest);
        const [videoOperation] = await videoIntelligenceClient.annotateVideo(videoRequest);
        const [[speechResponse], [videoResponse]] = await Promise.all([speechOperation.promise(), videoOperation.promise()]);
        
        const transcription = speechResponse.results.map(r => r.alternatives[0].transcript).join('\n');
        let visualAnalysis = "No significant facial tension or unusual movements were detected.";
        if (videoResponse.annotationResults[0]?.faceDetectionAnnotations?.length > 0) {
            visualAnalysis = "Detected some facial movements during speech that could indicate tension. Focusing on keeping the face relaxed could be beneficial.";
        }
        if (!transcription) {
            return res.status(500).json({ error: 'Could not transcribe audio from video.' });
        }
        
        const availableTools = ["Word Stretching", "Over-Articulation", "Hammer Tool", "Hammer-Link Tool", "Hand Movements", "Short Phrasing", "Smiling", "Soft Landing"];
        const prompt = `
            You are a friendly, encouraging, and supportive speech coach. Your goal is to help the user build confidence.
            I have analyzed a user's practice video and have the following information:
            - AUDIO TRANSCRIPT: "${transcription}"
            - VISUAL ANALYSIS: "${visualAnalysis}"
            Based on this information, provide a single, unified piece of feedback. Follow these rules: 
            1. Address the user directly using "you" and "your".
            2. Start with a positive and encouraging observation. For example, "Great work on this practice!" or "Your pacing was really steady here."
            3. Gently point out one or two specific areas for improvement, combining insights from both their speech and their physical presence. Frame these as opportunities for growth, not harsh criticisms.
            4. Recommend a few helpful tools from this list: ${JSON.stringify(availableTools)}. Only recommend tools from the list.
            Format your entire response as a single, valid JSON object with NO surrounding text.
            The JSON object must have exactly two keys: "textFeedback" and "toolSuggestions".
        `;

        const msg = await anthropic.messages.create({ model: "claude-3-5-sonnet-20240620", max_tokens: 1024, messages: [{ role: "user", content: prompt }] });
        const finalResponse = JSON.parse(msg.content[0].text);
        
        const historyEntry = { userId: req.user.uid, type: 'Video Recording', feedback: finalResponse.textFeedback, toolSuggestions: finalResponse.toolSuggestions, timestamp: admin.firestore.FieldValue.serverTimestamp() };
        await db.collection('history').add(historyEntry);
        res.json(finalResponse);

    } catch (error) {
        console.error("Error during analysis:", error);
        res.status(500).json({ error: 'Failed to analyze video. Check server logs.' });
    } finally {
        try { await file.delete(); } catch (cleanupError) { console.error("Error cleaning up GCS file:", cleanupError); }
    }
});

// This new route is for the audio recording page
app.post('/api/analyze-audio', [verifyToken, upload.single('audioFile')], async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    const fileName = `${uuidv4()}.webm`;
    const gcsUri = `gs://${BUCKET_NAME}/${fileName}`;
    const file = storage.bucket(BUCKET_NAME).file(fileName);

    try {
        await file.save(req.file.buffer);
        const audio = { uri: gcsUri };
        const config = { encoding: 'WEBM_OPUS', sampleRateHertz: 48000, languageCode: 'en-US', enableAutomaticPunctuation: true };
        const request = { audio, config };
        const [operation] = await speechClient.longRunningRecognize(request);
        const [speechResponse] = await operation.promise();
        const transcription = speechResponse.results.map(result => result.alternatives[0].transcript).join('\n');

        if (!transcription) {
            return res.status(500).json({ error: 'Could not transcribe audio.' });
        }

        // 2. Analyze with Claude (using a slightly different prompt, no visual analysis)
        const availableTools = ["Word Stretching", "Over-Articulation", "Hammer Tool", "Hammer-Link Tool", "Hand Movements", "Short Phrasing", "Smiling", "Soft Landing"];
        const prompt = `
            You are a friendly, encouraging, and supportive speech coach. Your goal is to help the user build confidence.
            Please analyze the following transcript of the user's speech.
            TRANSCRIPT: "${transcription}"

            Please provide feedback based on this transcript. Follow these rules:
            1. Address the user directly using "you" and "your".
            2. Start with something positive you noticed about their speech.
            3. Gently point out one or two specific areas for improvement, like filler words or repetitions. Frame these constructively.
            4. Recommend a few helpful tools from this list: ${JSON.stringify(availableTools)}.

            Format your entire response as a single, valid JSON object with NO surrounding text.
            The JSON object must have exactly two keys: "textFeedback" and "toolSuggestions".
        `;

        const msg = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });

        const finalResponse = JSON.parse(msg.content[0].text);

        const historyEntry = {
            userId: req.user.uid,
            type: 'Audio Recording',
            feedback: finalResponse.textFeedback,
            toolSuggestions: finalResponse.toolSuggestions,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('history').add(historyEntry);

        res.json(finalResponse);

    } catch (error) {
        console.error("Error during audio analysis:", error);
        res.status(500).json({ error: 'Failed to analyze audio. Check server logs.' });
    }
});

module.exports = app;