const express = require('express');
const app = express();

// 🔹 1. Serve frontend from 'public' folder
app.use(express.static('public'));

// 🔹 2. OAuth callback route
app.get('/oauth/callback', (req, res) => {
  res.send('✅ OAuth callback received!');
});

// 🔹 3. Start server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
