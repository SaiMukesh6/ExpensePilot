const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token signed with the user ID
 * @param {string} id - The MongoDB user ID
 * @returns {string} - The signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

module.exports = generateToken;
