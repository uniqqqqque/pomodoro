const jwt = require("jsonwebtoken");

// verify the jwt from the httponly cookie and attach the decoded user to req
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // covers expired tokens and tampered signatures
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
