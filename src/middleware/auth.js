// src/middleware/auth.js
const admin = require('../config/firebase');
const db = require('../db/connection');

// Middleware to authenticate user
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  admin
    .auth()
    .verifyIdToken(token)
    .then((decoded) => {
      req.user = decoded; // Attach Firebase user data to request

      return db.query('SELECT * FROM users WHERE firebase_uid = $1', [
        decoded.uid,
      ]);
    })
    .then((result) => {
      if (!result || !result.rows) {
        console.error('Database error');
        return res.status(500).json({ msg: 'Database error' });
      }

      // If user not found, pass decoded data to request body
      if (result.rows.length === 0) {
        console.log('🔍 User not found, passing decoded data to request body');
        req.body = { ...req.user }; // Pass decoded user to body
        return next(); // Let the route handler create the user
      }

      req.user.dbUser = result.rows[0]; // Attach user from DB
      next();
    })
    .catch((error) => {
      console.error('🔥 Authentication error:', error.message);
      if (!res.headersSent) {
        return res.status(401).json({ msg: 'Invalid token' });
      }
    });
};

// Middleware to allow access to user or admin
const allowToUserOrAdmin = (req, res, next) => {
  if (!req.user || !req.user.dbUser) {
    return res.status(401).json({ msg: 'User not authenticated' });
  }

  const requestedUserId = parseInt(req.params.id, 10); // Convert to number
  const authenticatedUserId = req.user.dbUser.id;
  const isAdmin = req.user.dbUser.role === 'admin';

  if (!isAdmin && requestedUserId !== authenticatedUserId) {
    console.log('🚫 Not admin and not the profile owner');
    return res.status(403).json({ msg: 'Forbidden' });
  }

  next();
};

// Middleware to restrict access by role
const restrictTo = (role) => (req, res, next) => {
  if (!req.user || !req.user.dbUser) {
    return res.status(401).json({ msg: 'User not authenticated' });
  }
  if (req.user.dbUser.role !== role) {
    return res.status(403).json({ msg: 'Forbidden' });
  }
  next();
};

module.exports = { authMiddleware, restrictTo, allowToUserOrAdmin };
