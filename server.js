const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to Our Mirror ✨");
});

app.get("/oauth/callback", (req, res) => {
  res.send("✅ OAuth callback received!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
