const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware (optional)
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello from Node.js server!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
