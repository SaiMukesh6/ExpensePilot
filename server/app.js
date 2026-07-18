const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://expense-pilot-93cb7t70j-sai-mukesh.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const clientUrl = process.env.CLIENT_URL;
    const origins = [...allowedOrigins];
    if (clientUrl) {
      // Support comma-separated URLs in CLIENT_URL (e.g. preview and production links)
      const parsedUrls = clientUrl.split(',').map(url => url.trim());
      origins.push(...parsedUrls);
    }
    
    const isAllowed = origins.some(allowedOrigin => {
      const normOrigin = origin.replace(/\/$/, "");
      const normAllowed = allowedOrigin.replace(/\/$/, "");
      return normOrigin === normAllowed;
    }) || /^https:\/\/expense-pilot-[a-z0-9-]+-sai-mukesh\.vercel\.app$/.test(origin.replace(/\/$/, ""))
       || /^https:\/\/expense-pilot-sai-mukesh\.vercel\.app$/.test(origin.replace(/\/$/, ""));

    if (isAllowed) {
      return callback(null, true);
    } else {
      console.warn(`CORS Blocked: Origin '${origin}' not found in allowed list`);
      return callback(null, false);
    }
  },
  credentials: true
}));
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'ExpensePilot API server is running successfully.',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
