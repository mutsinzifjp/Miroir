const express = require('express');
const app = express();

// 🔹 1. Serve frontend from 'public' folder
app.use(express.static('public'));

// 🔹 2. OSF OAuth credentials
const clientID = 'YOUR_OSF_CLIENT_ID';  // ← Replace this with your actual OSF client ID
const redirectURI = 'https://our-mirror.glitch.me/oauth/callback';

// 🔹 3. Login route – starts the OAuth flow
app.get('/login', (req, res) => {
  const authURL = `https://api.osf.io/oauth/authorize/?client_id=${clientID}&response_type=code&redirect_uri=${encodeURIComponent(redirectURI)}`;
  res.redirect(authURL);
});

// 🔹 4. OAuth callback route
app.get('/oauth/callback', (req, res) => {
  res.send('✅ OAuth callback received!');
});

// 🔹 5. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
