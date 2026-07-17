const app = require('./app');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas (if URI is provided)
if (process.env.MONGO_URI) {
  connectDB();
} else {
  console.warn('---------------------------------------------------------------------------------');
  console.warn('WARNING: MONGO_URI is not defined in the environment variables (.env file).');
  console.warn('MongoDB database connection skipped. Server will still listen for requests.');
  console.warn('Please create a .env file based on .env.example to configure the database.');
  console.warn('---------------------------------------------------------------------------------');
}

// Start Server
app.listen(PORT, () => {
  console.log(`ExpensePilot Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
