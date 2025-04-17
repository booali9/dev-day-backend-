const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/UserRoute');
const blogRoutes = require('./routes/UserRoute');

dotenv.config(); // Load variables from .env

const app = express();
const port = process.env.PORT || 3000;

connectDB()
// Middleware (optional)
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Hello from Node.js server!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
