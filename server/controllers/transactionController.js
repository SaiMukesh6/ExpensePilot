const Transaction = require('../models/Transaction');

/**
 * @desc    Create a new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const createTransaction = async (req, res, next) => {
  const { title, amount, type, category, date, notes } = req.body;

  try {
    // 1. Basic validation
    if (!title || !amount || !type || !category) {
      res.status(400);
      throw new Error('Please fill in all required fields (title, amount, type, category)');
    }

    if (amount <= 0) {
      res.status(400);
      throw new Error('Amount must be a positive number greater than 0');
    }

    if (type !== 'Income' && type !== 'Expense') {
      res.status(400);
      throw new Error('Type must be either Income or Expense');
    }

    // 2. Create and save transaction linked to user
    const transaction = await Transaction.create({
      title,
      amount,
      type,
      category,
      date: date || new Date(),
      notes,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all transactions for the logged-in user (with filters)
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = async (req, res, next) => {
  try {
    // Build query object scoped to authenticated user
    const query = { user: req.user.id };

    // Search filter (partial title match)
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    // Category filter (case-insensitive exact match)
    if (req.query.category) {
      query.category = { $regex: `^${req.query.category}$`, $options: 'i' };
    }

    // Type filter (Income or Expense)
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.date.$lte = new Date(req.query.endDate);
      }
    }

    // Fetch and sort transactions by date descending
    const transactions = await Transaction.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = async (req, res, next) => {
  const { title, amount, type, category, date, notes } = req.body;

  try {
    // 1. Find transaction by ID
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // 2. Authorize owner
    if (transaction.user.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to access or modify this transaction');
    }

    // 3. Validation for updates if provided
    if (amount !== undefined && amount <= 0) {
      res.status(400);
      throw new Error('Amount must be a positive number greater than 0');
    }

    if (type !== undefined && type !== 'Income' && type !== 'Expense') {
      res.status(400);
      throw new Error('Type must be either Income or Expense');
    }

    // 4. Perform update using document save to trigger validation schemas
    if (title !== undefined) transaction.title = title;
    if (amount !== undefined) transaction.amount = amount;
    if (type !== undefined) transaction.type = type;
    if (category !== undefined) transaction.category = category;
    if (date !== undefined) transaction.date = date;
    if (notes !== undefined) transaction.notes = notes;

    const updatedTransaction = await transaction.save();

    res.status(200).json({
      success: true,
      data: updatedTransaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = async (req, res, next) => {
  try {
    // 1. Find transaction by ID
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // 2. Authorize owner
    if (transaction.user.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to access or delete this transaction');
    }

    // 3. Delete
    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction successfully deleted'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get transaction by ID
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Authorize owner
    if (transaction.user.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to access this transaction');
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
};

