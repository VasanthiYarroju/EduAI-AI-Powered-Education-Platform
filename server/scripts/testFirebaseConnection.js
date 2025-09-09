// scripts/testFirebaseConnection.js
import 'dotenv/config';
import initializeFirebase from '../config/firebaseConfig.js';
import admin from 'firebase-admin';

console.log('🧪 Testing Firebase Connection...\n');

try {
  // Initialize Firebase
  console.log('1. Initializing Firebase...');
  initializeFirebase();
  
  // Test Firestore connection
  console.log('2. Testing Firestore connection...');
  const db = admin.firestore();
  
  // Try to get a document (this will test the connection)
  console.log('3. Attempting to read from Firestore...');
  const testRef = db.collection('_test').doc('connection');
  
  // Write a test document
  await testRef.set({
    timestamp: admin.firestore.Timestamp.now(),
    test: 'Firebase connection test',
    environment: process.env.NODE_ENV || 'development'
  });
  
  console.log('4. Test write successful');
  
  // Read the test document
  const doc = await testRef.get();
  if (doc.exists) {
    console.log('5. Test read successful');
    console.log('   Data:', doc.data());
  } else {
    throw new Error('Test document not found after write');
  }
  
  // Clean up
  await testRef.delete();
  console.log('6. Test cleanup successful');
  
  console.log('\n✅ All Firebase tests passed!');
  console.log('🎉 Firebase is properly configured and connected.\n');
  
} catch (error) {
  console.error('\n❌ Firebase connection test failed:');
  console.error('Error:', error.message);
  console.error('Code:', error.code || 'N/A');
  
  if (error.stack) {
    console.error('\nStack trace:');
    console.error(error.stack);
  }
  
  console.log('\n🔍 Environment Debug Info:');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || 'not set');
  console.log('GCLOUD_PROJECT:', process.env.GCLOUD_PROJECT || 'not set');
  console.log('FIREBASE_SERVICE_ACCOUNT set:', !!process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log('GOOGLE_APPLICATION_CREDENTIALS set:', !!process.env.GOOGLE_APPLICATION_CREDENTIALS);
  
  process.exit(1);
}
