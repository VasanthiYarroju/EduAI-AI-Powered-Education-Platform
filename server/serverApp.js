// server.js (or index.js in your root)

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import admin from 'firebase-admin'; // Keep this import
import { GoogleGenerativeAI } from '@google/generative-ai'; // ADD THIS IMPORT IF NOT THERE
import { db,  } from '../server/config/aiAndFirestore.js';


// Import your route files  
import quizRoutes from './routes/quizRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import aiRoutes from './routes/aiRoutes.js'; // Your AI routes will use the 'model'
import forumRoutes from './routes/forumRoutes.js';


dotenv.config(); // Load environment variables from .env
console.log('Path to credentials from .env:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

// --- 1. Firebase Admin SDK Initialization ---
if (admin.apps.length === 0) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (!serviceAccountKey) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.");
    }

    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
      projectId: projectId
    });
    console.log("✅ Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error);
    process.exit(1);
  }
}

// ✨ EXPORT THESE INITIATED INSTANCES ✨
 // Export db for use in other files
export { db };
// --- 2. Google Generative AI Initialization ---
const geminiApiKey = process.env.GEMINI_MOCK_KEY;
if (!geminiApiKey) {
  console.error("❌ GEMINI_MOCK_KEY not found in .env.");
  process.exit(1);
}
export const genAI = new GoogleGenerativeAI(geminiApiKey);
export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Export model for use in other files
console.log("✅ Gemini API initialized successfully.");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(bodyParser.json());

app.use('/api', recommendationRoutes);
app.use('/api/ai', aiRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use('/api/forum', forumRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});