const jwt = require("jsonwebtoken");


function encryptToken(token) {
  return jwt.sign(
    {
      accessToken: token,
      type: "platform-access"
    },
    process.env.TOKEN_SECRET,
    {
      algorithm: "HS256",
      audience: "n8n",
      issuer: "your-backend"
      
    }
  );
}

module.exports = encryptToken;
