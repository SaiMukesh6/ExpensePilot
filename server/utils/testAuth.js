const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const PORT = 5001;
const API_URL = `http://localhost:${PORT}/api`;

const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

async function runTests() {
  console.log('==================================================');
  console.log('    ExpensePilot: Authentication API Verification');
  console.log('==================================================\n');
  
  // 1. Connect to MongoDB
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/expensepilot';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB for testing');
  } catch (err) {
    console.error('✗ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  // 2. Clean up database
  try {
    await User.deleteMany({ email: testUser.email });
    console.log('✓ Cleaned up any existing test user in database');
  } catch (err) {
    console.error('✗ Database cleanup error:', err.message);
    await mongoose.connection.close();
    process.exit(1);
  }

  // 3. Start server
  const server = app.listen(PORT, async () => {
    console.log(`✓ Test server started on port ${PORT}`);

    try {
      let token = '';

      // Test 1: Register User (Success)
      console.log('\n[Test 1] POST /api/auth/register (Create User)');
      const regRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
      const regData = await regRes.json();
      
      if (regRes.status === 201 && regData.success && regData.data.token) {
        console.log('  ✓ Registration successful!');
        console.log('  ✓ User ID:', regData.data._id);
        console.log('  ✓ Token issued:', regData.data.token.substring(0, 15) + '...');
      } else {
        throw new Error(`Registration failed (expected 201): status ${regRes.status}, data: ${JSON.stringify(regData)}`);
      }

      // Test 2: Duplicate Registration (Expect Failure)
      console.log('\n[Test 2] POST /api/auth/register (Duplicate Email)');
      const dupRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
      const dupData = await dupRes.json();
      if (dupRes.status === 400 && dupData.success === false) {
        console.log(`  ✓ Duplicate registration rejected as expected.`);
        console.log(`  ✓ Error message received: "${dupData.message}"`);
      } else {
        throw new Error(`Expected 400 rejection for duplicate registration, got status ${dupRes.status}`);
      }

      // Test 3: Login User (Success)
      console.log('\n[Test 3] POST /api/auth/login (Correct Credentials)');
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, password: testUser.password })
      });
      const loginData = await loginRes.json();
      if (loginRes.status === 200 && loginData.success && loginData.data.token) {
        console.log('  ✓ Login successful!');
        token = loginData.data.token;
      } else {
        throw new Error(`Login failed (expected 200): status ${loginRes.status}, data: ${JSON.stringify(loginData)}`);
      }

      // Test 4: Login User (Wrong Password)
      console.log('\n[Test 4] POST /api/auth/login (Wrong Password)');
      const badLoginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, password: 'wrongpassword' })
      });
      const badLoginData = await badLoginRes.json();
      if (badLoginRes.status === 401 && badLoginData.success === false) {
        console.log(`  ✓ Incorrect password rejected as expected.`);
        console.log(`  ✓ Error message received: "${badLoginData.message}"`);
      } else {
        throw new Error(`Expected 401 rejection for wrong password, got status ${badLoginRes.status}`);
      }

      // Test 5: Access Protected Profile (Valid Token)
      console.log('\n[Test 5] GET /api/auth/me (With JWT Token)');
      const meRes = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      const meData = await meRes.json();
      if (meRes.status === 200 && meData.success) {
        console.log('  ✓ Access granted!');
        console.log('  ✓ User name retrieved:', meData.data.name);
        console.log('  ✓ User email retrieved:', meData.data.email);
      } else {
        throw new Error(`Protected route access failed (expected 200): status ${meRes.status}, data: ${JSON.stringify(meData)}`);
      }

      // Test 6: Access Protected Profile (No Token)
      console.log('\n[Test 6] GET /api/auth/me (Without JWT Token)');
      const noTokenRes = await fetch(`${API_URL}/auth/me`, {
        method: 'GET'
      });
      const noTokenData = await noTokenRes.json();
      if (noTokenRes.status === 401 && noTokenData.success === false) {
        console.log(`  ✓ Access blocked as expected.`);
        console.log(`  ✓ Error message received: "${noTokenData.message}"`);
      } else {
        throw new Error(`Expected 401 rejection for missing token, got status ${noTokenRes.status}`);
      }

      console.log('\n==================================================');
      console.log('  🎉 ALL AUTHENTICATION TESTS PASSED SUCCESSFULLY!  ');
      console.log('==================================================');

    } catch (error) {
      console.error('\n✗ TEST RUN ENCOUNTERED AN ERROR:');
      console.error(error.message);
    } finally {
      // Cleanup & Exit
      server.close(() => {
        console.log('\n✓ Test server stopped.');
      });
      await mongoose.connection.close();
      console.log('✓ Database connection closed.');
      process.exit(0);
    }
  });
}

runTests();
