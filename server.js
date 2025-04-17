const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/UserRoute');
const blogRoutes = require('./routes/UserRoute');
const ContactRoutes = require('./routes/contactRoute');


dotenv.config(); // Load variables from .env

const app = express();
const port = process.env.PORT || 3000;

connectDB()
// Middleware (optional)
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', ContactRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Hello from Node.js server!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
