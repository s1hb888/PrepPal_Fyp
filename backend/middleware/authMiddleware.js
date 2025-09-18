const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Extract token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    // If token is invalid, send a 401 response
    return res.status(401).json({ message: 'Invalid token. Unauthorized.' });
  }
};

module.exports = verifyToken;

