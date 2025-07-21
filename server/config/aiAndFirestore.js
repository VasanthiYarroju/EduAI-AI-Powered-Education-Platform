import admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Load service account from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// ✅ Load Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_MOCK_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export { db, model };
