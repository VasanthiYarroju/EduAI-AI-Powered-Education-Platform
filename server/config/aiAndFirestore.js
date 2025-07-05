// server/config/aiAndFirestore.js
import admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_MOCK_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export { db, model };
