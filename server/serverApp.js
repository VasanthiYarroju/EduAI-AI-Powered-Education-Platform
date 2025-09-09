// File: server.js (Updated)

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// ❌ The unused import has been removed from here.

// Import your route files
import quizRoutes from './routes/quizRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import forumRoutes from './routes/forumRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://eduai-portal.vercel.app',
    process.env.FRONTEND_ORIGIN
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// API Routes setup
// Express will now pass requests to these files.
// These files are responsible for importing 'db' and 'model' themselves.
app.use('/api', recommendationRoutes);
app.use('/api/ai', aiRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use('/api/forum', forumRoutes);

// Firebase test endpoint for deployment debugging
app.get('/api/test-firebase', async (req, res) => {
  try {
    // Import here to avoid issues if Firebase isn't initialized
    const admin = (await import('firebase-admin')).default;
    const db = admin.firestore();
    
    // Test write and read
    const testRef = db.collection('_test').doc('deployment-test');
    await testRef.set({
      timestamp: admin.firestore.Timestamp.now(),
      test: 'Deployment Firebase test',
      environment: process.env.NODE_ENV || 'production'
    });
    
    const doc = await testRef.get();
    await testRef.delete(); // Clean up
    
    res.json({ 
      status: 'success', 
      firebase: 'connected',
      data: doc.data(),
      environment: process.env.NODE_ENV || 'production',
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
    });
  } catch (error) {
    console.error('Firebase test error:', error);
    res.status(500).json({ 
      status: 'error', 
      error: error.message,
      code: error.code || 'unknown',
      environment: process.env.NODE_ENV || 'production'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});