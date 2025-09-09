// config/firebaseConfig.js
import admin from "firebase-admin";

let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) {
    console.log('Firebase already initialized');
    return admin;
  }

  try {
    console.log('Initializing Firebase Admin SDK...');
    
    // Method 1: Try using service account from environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log('Using FIREBASE_SERVICE_ACCOUNT from environment');
      
      let serviceAccountData;
      try {
        serviceAccountData = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      } catch (parseError) {
        throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT JSON: ${parseError.message}`);
      }

      // Validate required fields
      if (!serviceAccountData.private_key || !serviceAccountData.client_email) {
        throw new Error('Invalid service account: missing private_key or client_email');
      }

      // Fix private key formatting issues
      let privateKey = serviceAccountData.private_key;
      
      // Handle different escape sequences
      privateKey = privateKey
        .replace(/\\n/g, '\n')  // Replace literal \n with newlines
        .replace(/\\r/g, '\r')  // Replace literal \r with carriage returns
        .replace(/\\\\/g, '\\'); // Replace double backslashes
      
      // Ensure proper PEM format
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        throw new Error('Private key missing PEM header');
      }
      
      if (!privateKey.includes('-----END PRIVATE KEY-----')) {
        throw new Error('Private key missing PEM footer');
      }
      
      // Make sure it ends with a newline
      if (!privateKey.endsWith('\n')) {
        privateKey += '\n';
      }

      serviceAccountData.private_key = privateKey;

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountData),
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
      });

    } 
    // Method 2: Try using Google Application Credentials file
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('Using GOOGLE_APPLICATION_CREDENTIALS file');
      
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
      });
    }
    // Method 3: Try using individual environment variables
    else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      console.log('Using individual Firebase environment variables');
      
      let privateKey = process.env.FIREBASE_PRIVATE_KEY
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r');
      
      if (!privateKey.endsWith('\n')) {
        privateKey += '\n';
      }

      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        universe_domain: 'googleapis.com'
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
      });
    }
    else {
      throw new Error('No Firebase credentials found. Please set FIREBASE_SERVICE_ACCOUNT, GOOGLE_APPLICATION_CREDENTIALS, or individual Firebase environment variables');
    }

    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
    return admin;

  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    
    // Additional debugging
    if (error.message.includes('private key') || error.message.includes('PEM')) {
      console.error('🔍 Debugging private key format...');
      
      try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
          console.error('Private key length:', parsed.private_key?.length);
          console.error('Private key starts with:', parsed.private_key?.substring(0, 50));
          console.error('Private key ends with:', parsed.private_key?.slice(-50));
        }
      } catch (debugError) {
        console.error('Could not debug credentials:', debugError.message);
      }
    }
    
    throw error;
  }
};

export default initializeFirebase;
