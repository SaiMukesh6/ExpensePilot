const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // 1. Basic validation
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please enter name, email and password');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }

    // Email format validation check
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Please enter a valid email address');
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email address');
    }

    // 3. Create user
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data provided');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1. Basic validation
    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter email and password');
    }

    // 2. Check if user exists
    const user = await User.findOne({ email });

    // 3. Match password
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getUserProfile = async (req, res, next) => {
  try {
    // req.user is set by protect middleware
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};



module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
