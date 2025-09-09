// scripts/validateFirebaseCredentials.js
import 'dotenv/config';

console.log('🔍 Validating Firebase Credentials...\n');

// Check if FIREBASE_SERVICE_ACCOUNT exists
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT environment variable not found');
  process.exit(1);
}

try {
  // Parse the JSON
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  
  // Check required fields
  const requiredFields = [
    'type',
    'project_id',
    'private_key_id',
    'private_key',
    'client_email',
    'client_id',
    'auth_uri',
    'token_uri'
  ];
  
  console.log('✅ JSON parsing successful');
  
  const missingFields = requiredFields.filter(field => !serviceAccount[field]);
  if (missingFields.length > 0) {
    console.error('❌ Missing required fields:', missingFields);
    process.exit(1);
  }
  
  console.log('✅ All required fields present');
  
  // Validate private key format
  const privateKey = serviceAccount.private_key;
  
  console.log('\n🔍 Private Key Analysis:');
  console.log('Length:', privateKey.length);
  console.log('Contains \\\\n (escaped):', privateKey.includes('\\n'));
  console.log('Contains actual newlines:', privateKey.includes('\n'));
  console.log('Starts with PEM header:', privateKey.includes('-----BEGIN PRIVATE KEY-----'));
  console.log('Ends with PEM footer:', privateKey.includes('-----END PRIVATE KEY-----'));
  
  // Show first and last 50 characters
  console.log('\nFirst 50 chars:', privateKey.substring(0, 50));
  console.log('Last 50 chars:', privateKey.slice(-50));
  
  // Test the fix
  let fixedKey = privateKey.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
  if (!fixedKey.endsWith('\n')) {
    fixedKey += '\n';
  }
  
  console.log('\n🔧 After applying fixes:');
  console.log('Contains actual newlines:', fixedKey.includes('\n'));
  console.log('Ends with newline:', fixedKey.endsWith('\n'));
  console.log('Line count:', fixedKey.split('\n').length);
  
  // Validate PEM structure
  const lines = fixedKey.split('\n');
  const hasHeader = lines[0] === '-----BEGIN PRIVATE KEY-----';
  const hasFooter = lines[lines.length - 2] === '-----END PRIVATE KEY-----'; // -2 because last line is empty
  
  console.log('\n🏗️ PEM Structure:');
  console.log('Proper header:', hasHeader);
  console.log('Proper footer:', hasFooter);
  console.log('Total lines:', lines.length);
  
  if (hasHeader && hasFooter) {
    console.log('\n✅ Private key appears to be in valid PEM format');
  } else {
    console.log('\n❌ Private key PEM format issues detected');
    if (!hasHeader) console.log('  - Missing or incorrect header');
    if (!hasFooter) console.log('  - Missing or incorrect footer');
  }
  
  console.log('\n📋 Other Details:');
  console.log('Project ID:', serviceAccount.project_id);
  console.log('Client Email:', serviceAccount.client_email);
  console.log('Client ID:', serviceAccount.client_id);
  
} catch (error) {
  console.error('❌ Error parsing Firebase credentials:', error.message);
  console.error('\nRaw FIREBASE_SERVICE_ACCOUNT (first 100 chars):');
  console.error(process.env.FIREBASE_SERVICE_ACCOUNT.substring(0, 100));
  process.exit(1);
}

console.log('\n🎉 Validation complete!');
