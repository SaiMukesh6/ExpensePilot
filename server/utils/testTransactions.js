const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const dotenv = require('dotenv');

dotenv.config();

const PORT = 5002;
const API_URL = `http://localhost:${PORT}/api`;

const userA = { name: 'User A', email: 'usera@example.com', password: 'password123' };
const userB = { name: 'User B', email: 'userb@example.com', password: 'password123' };

async function runTests() {
  console.log('==================================================');
  console.log('    ExpensePilot: Transaction API Verification');
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

  // 2. Cleanup existing test data
  try {
    const users = await User.find({ email: { $in: [userA.email, userB.email] } });
    const userIds = users.map(u => u._id);
    await Transaction.deleteMany({ user: { $in: userIds } });
    await User.deleteMany({ _id: { $in: userIds } });
    console.log('✓ Cleaned up any existing test user and transaction records');
  } catch (err) {
    console.error('✗ Database cleanup error:', err.message);
    await mongoose.connection.close();
    process.exit(1);
  }

  // 3. Start server
  const server = app.listen(PORT, async () => {
    console.log(`✓ Test server started on port ${PORT}`);

    try {
      let tokenA = '';
      let tokenB = '';
      let idA = '';
      let idB = '';

      // Create User A
      const regARes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userA)
      });
      const regAData = await regARes.json();
      tokenA = regAData.data.token;
      idA = regAData.data._id;

      // Create User B
      const regBRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userB)
      });
      const regBData = await regBRes.json();
      tokenB = regBData.data.token;
      idB = regBData.data._id;

      console.log('✓ Test users A & B registered and authenticated.');

      // --- Test 1: Create Transactions (User A) ---
      console.log('\n[Test 1] Create Transactions (User A)');
      const t1 = { title: 'Monthly Salary', amount: 5000, type: 'Income', category: 'Salary', notes: 'Primary job payout' };
      const t2 = { title: 'Apartment Rent', amount: 1500, type: 'Expense', category: 'Housing', notes: 'Monthly rent payment' };
      const t3 = { title: 'Weekly Groceries', amount: 200, type: 'Expense', category: 'Food', notes: 'Supermarket purchase' };

      const createdT1 = await (await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify(t1)
      })).json();
      
      const createdT2 = await (await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify(t2)
      })).json();

      const createdT3 = await (await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify(t3)
      })).json();

      if (createdT1.success && createdT2.success && createdT3.success) {
        console.log('  ✓ 3 transactions created successfully for User A');
      } else {
        throw new Error('Failed to create transactions for User A');
      }

      // --- Test 2: Input Validation ---
      console.log('\n[Test 2] Create Transaction with Negative Amount (Expect Failure)');
      const badT = { title: 'Negative Test', amount: -50, type: 'Expense', category: 'Misc' };
      const badRes = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify(badT)
      });
      const badData = await badRes.json();
      if (badRes.status === 400 && !badData.success) {
        console.log(`  ✓ Rejected negative amount as expected. Message: "${badData.message}"`);
      } else {
        throw new Error(`Expected rejection for negative amount, got status ${badRes.status}`);
      }

      // --- Test 3: Get Transactions & Filtering (User A) ---
      console.log('\n[Test 3] Fetch Transactions with Filters');
      
      // Get all
      const getRes = await fetch(`${API_URL}/transactions`, {
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      const getData = await getRes.json();
      console.log(`  ✓ Total transactions: ${getData.count} (Expected: 3)`);
      if (getData.count !== 3) throw new Error('Fetch count mismatch');

      // Filter by type=Expense
      const getExpenseRes = await fetch(`${API_URL}/transactions?type=Expense`, {
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      const getExpenseData = await getExpenseRes.json();
      console.log(`  ✓ Expense transactions: ${getExpenseData.count} (Expected: 2)`);
      if (getExpenseData.count !== 2) throw new Error('Expense filter mismatch');

      // Filter by category=Food
      const getFoodRes = await fetch(`${API_URL}/transactions?category=Food`, {
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      const getFoodData = await getFoodRes.json();
      console.log(`  ✓ Food category transactions: ${getFoodData.count} (Expected: 1)`);
      if (getFoodData.count !== 1) throw new Error('Category filter mismatch');

      // Search by text="Salary"
      const searchRes = await fetch(`${API_URL}/transactions?search=salary`, {
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      const searchData = await searchRes.json();
      console.log(`  ✓ Text search "salary" transactions: ${searchData.count} (Expected: 1)`);
      if (searchData.count !== 1) throw new Error('Search query mismatch');

      // --- Test 4: Update Transaction ---
      console.log('\n[Test 4] Update Transaction');
      const updatePayload = { amount: 250, notes: 'Updated grocery notes' };
      const updateRes = await fetch(`${API_URL}/transactions/${createdT3.data._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify(updatePayload)
      });
      const updateData = await updateRes.json();
      if (updateRes.status === 200 && updateData.data.amount === 250 && updateData.data.notes === 'Updated grocery notes') {
        console.log('  ✓ Transaction updated successfully');
      } else {
        throw new Error(`Update failed: ${JSON.stringify(updateData)}`);
      }

      // --- Test 5: Cross-User Authorization (User B trying to modify User A's transaction) ---
      console.log('\n[Test 5] Update User A\'s Transaction as User B (Expect 403 Forbidden)');
      const badUpdateRes = await fetch(`${API_URL}/transactions/${createdT3.data._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
        body: JSON.stringify({ amount: 9999 })
      });
      const badUpdateData = await badUpdateRes.json();
      if (badUpdateRes.status === 403 && !badUpdateData.success) {
        console.log(`  ✓ Blocked unauthorized update as expected.`);
        console.log(`  ✓ Error message received: "${badUpdateData.message}"`);
      } else {
        throw new Error(`Expected 403 authorization block, got status ${badUpdateRes.status}`);
      }

      console.log('\n[Test 6] Delete User A\'s Transaction as User B (Expect 403 Forbidden)');
      const badDelRes = await fetch(`${API_URL}/transactions/${createdT3.data._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${tokenB}` }
      });
      const badDelData = await badDelRes.json();
      if (badDelRes.status === 403 && !badDelData.success) {
        console.log(`  ✓ Blocked unauthorized deletion as expected.`);
        console.log(`  ✓ Error message received: "${badDelData.message}"`);
      } else {
        throw new Error(`Expected 403 authorization block, got status ${badDelRes.status}`);
      }

      // --- Test 6: Delete Transaction (User A) ---
      console.log('\n[Test 7] Delete Transaction (User A)');
      const delRes = await fetch(`${API_URL}/transactions/${createdT3.data._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      const delData = await delRes.json();
      if (delRes.status === 200 && delData.success) {
        console.log('  ✓ Transaction deleted successfully');
      } else {
        throw new Error(`Deletion failed: ${JSON.stringify(delData)}`);
      }

      // Verify deletion
      const checkRes = await fetch(`${API_URL}/transactions`, {
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      const checkData = await checkRes.json();
      console.log(`  ✓ Remaining transactions after delete: ${checkData.count} (Expected: 2)`);
      if (checkData.count !== 2) throw new Error('Transaction cleanup verification failed');

      console.log('\n==================================================');
      console.log('  🎉 ALL TRANSACTION CRUD TESTS PASSED SUCCESSFULLY! ');
      console.log('==================================================');

    } catch (error) {
      console.error('\n✗ TEST RUN ENCOUNTERED AN ERROR:');
      console.error(error.message);
    } finally {
      // Cleanup users and transactions
      try {
        const users = await User.find({ email: { $in: [userA.email, userB.email] } });
        const userIds = users.map(u => u._id);
        await Transaction.deleteMany({ user: { $in: userIds } });
        await User.deleteMany({ _id: { $in: userIds } });
        console.log('\n✓ Cleaned up test data in database.');
      } catch (err) {
        console.error('✗ Final database cleanup error:', err.message);
      }

      // Close server and DB
      server.close(() => {
        console.log('✓ Test server stopped.');
      });
      await mongoose.connection.close();
      console.log('✓ Database connection closed.');
      process.exit(0);
    }
  });
}

runTests();
