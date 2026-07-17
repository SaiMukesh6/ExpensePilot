const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const http = require('http');

// Load environment variables
dotenv.config();

const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('==================================================');
  console.log('    ExpensePilot: Password Reset Verification');
  console.log('==================================================\n');

  // 1. Database Connection
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/expensepilot_dev');
    console.log('✓ Connected to MongoDB');
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err.message);
    process.exit(1);
  }

  const User = require('../models/User');

  // Clean up any pre-existing test user
  const testEmail = 'reset_test@example.com';
  await User.deleteOne({ email: testEmail });
  console.log('✓ Cleaned up any existing test user in database');

  // 2. Start Test Server
  const app = require('../app');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`✓ Test server started on port ${PORT}`);

  try {
    // 3. Test Registration
    console.log('\n[Test 1] POST /api/auth/register (Create Test User)');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Reset Tester',
        email: testEmail,
        password: 'old_password_123'
      })
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(regData.message || 'Registration failed');
    console.log('  ✓ Test user registered successfully with password: "old_password_123"');

    // 4. Test Forgot Password Token Generation
    console.log('\n[Test 2] POST /api/auth/forgot-password (Request Token)');
    const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const forgotData = await forgotRes.json();
    if (!forgotRes.ok) throw new Error(forgotData.message || 'Forgot password request failed');
    console.log('  ✓ Received generic success message:', forgotData.message);

    // Verify token was successfully written and hashed inside DB
    const dbUser = await User.findOne({ email: testEmail });
    if (!dbUser.resetPasswordToken || !dbUser.resetPasswordExpire) {
      throw new Error('Hashed reset token and expiry were not set in the database.');
    }
    console.log('  ✓ Confirmed token and expiry details are stored in the database');

    // 5. Test Reset Password Endpoint Flow
    console.log('\n[Test 3] POST /api/auth/reset-password/:token (Update Password)');
    
    // Simulate a secure random token exchange by writing a mock token in database
    const rawResetToken = 'abcdef1234567890abcdef123456789012345678';
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(rawResetToken)
      .digest('hex');

    dbUser.resetPasswordToken = hashedResetToken;
    dbUser.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await dbUser.save();
    console.log('  ✓ Saved custom token in database to test controller matching');

    // Call Reset Endpoint
    const resetRes = await fetch(`${BASE_URL}/auth/reset-password/${rawResetToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'new_password_456',
        confirmPassword: 'new_password_456'
      })
    });
    const resetData = await resetRes.json();
    if (!resetRes.ok) throw new Error(resetData.message || 'Password reset request failed');
    console.log('  ✓ Password reset successful:', resetData.message);

    // Confirm DB fields are cleared
    const updatedUser = await User.findOne({ email: testEmail });
    if (updatedUser.resetPasswordToken || updatedUser.resetPasswordExpire) {
      throw new Error('Database reset fields were not cleared after a successful password update.');
    }
    console.log('  ✓ Verified token and expiry columns are cleared in user document');

    // 6. Verify Logins
    console.log('\n[Test 4] Verify Logins (Verify Old Credentials Fail, New Succeeds)');
    
    // Try logging in with the old password (expect 401)
    const oldLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'old_password_123'
      })
    });
    if (oldLoginRes.status === 401) {
      console.log('  ✓ Old password "old_password_123" was rejected with 401 as expected');
    } else {
      throw new Error('Old password should have been rejected but was accepted.');
    }

    // Try logging in with the new password (expect 200)
    const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'new_password_456'
      })
    });
    const newLoginData = await newLoginRes.json();
    if (newLoginRes.ok && newLoginData.success) {
      console.log('  ✓ New password "new_password_456" logged in successfully');
    } else {
      throw new Error(newLoginData.message || 'Login with new password failed');
    }

    console.log('\n==================================================');
    console.log('  🎉 PASSWORD RESET FLOW INTEGRATION TESTS PASSED!');
    console.log('==================================================');
  } catch (error) {
    console.error('\n✗ Test Failed:', error.message);
  } finally {
    // 7. Cleanup
    await User.deleteOne({ email: testEmail });
    console.log('\n✓ Cleaned up test data in database.');
    
    await new Promise((resolve) => server.close(resolve));
    console.log('✓ Test server stopped.');
    
    await mongoose.connection.close();
    console.log('✓ Database connection closed.');
  }
}

runTests();
