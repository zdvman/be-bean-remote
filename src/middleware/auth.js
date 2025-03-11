// src/middleware/auth.js
const admin = require('../config/firebase');
const db = require('../db/connection');

// Middleware to authenticate user
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    // console.log('❌ No token provided');
    return res.status(401).json({ msg: 'No token provided' });
  }

  admin
    .auth()
    .verifyIdToken(token)
    .then((decoded) => {
      // console.log('✅ Token verified:', decoded);
      req.user = decoded; // Attach Firebase user data to request

      return db.query('SELECT * FROM users WHERE firebase_uid = $1', [
        decoded.uid,
      ]);
    })
    .then((result) => {
      if (!result?.rows) {
        console.error('❌ Database error');
        return res.status(500).json({ msg: 'Database error' });
      }

      // If user does not exist, allow only POST /users to proceed
      if (result.rows.length === 0) {
        // console.log('User not found, allowing POST request to create user');
        req.body = { ...req.user }; // Pass decoded user to request body

        // If the request is a POST to create a new user, proceed
        // console.log(req.method, req.originalUrl);
        if (req.method === 'POST' && req.originalUrl === '/api/users') {
          return next();
        }

        // Otherwise, block access
        return res
          .status(404)
          .json({ msg: 'User not found, please register first' });
      }

      req.user.dbUser = result.rows[0]; // Attach user from DB
      // console.log(
      //   `🔹 Authenticated as: id=${req.user.dbUser.id}, role=${req.user.dbUser.role}`
      // );
      next();
    })
    .catch((error) => {
      // console.error('❌ Authentication error:', error.message);
      if (!res.headersSent) {
        return res.status(401).json({ msg: 'Invalid token' });
      }
    });
};

// Middleware to allow access to user (owner of the profile) or admin
const allowToUserOrAdmin = (req, res, next) => {
  if (!req?.user || !req.user?.dbUser) {
    return res.status(401).json({ msg: 'User not authenticated' });
  }

  const requestedUserId = parseInt(req?.params?.user_id, 10);
  const authenticatedUserId = req?.user?.dbUser?.id;
  const isAdmin = req?.user?.dbUser?.role === 'admin';

  // First, check if the user exists in the database
  db.query('SELECT id FROM users WHERE id = $1', [requestedUserId])
    .then((result) => {
      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ msg: `User with ID "${requestedUserId}" is not found` });
      }

      // Allow access if:
      // - The authenticated user is an admin
      // - The authenticated user is requesting their own reviews
      if (isAdmin || requestedUserId === authenticatedUserId) {
        return next();
      }
      return res.status(403).json({ msg: 'Forbidden' });
    })
    .catch(next);
};

// Middleware to allow access to Firebase user or admin
const allowToFirebaseUserOrAdmin = (req, res, next) => {
  if (!req?.user || !req.user?.dbUser) {
    return res.status(401).json({ msg: 'User not authenticated' });
  }

  const requestedFirebaseUid = req?.query?.firebase_uid;
  const authenticatedFirebaseUid = req?.user?.uid;
  const isAdmin = req?.user?.dbUser?.role === 'admin';

  if (!requestedFirebaseUid) {
    return res.status(400).json({ msg: 'Firebase UID is missing' });
  }

  // Allow access if:
  // - The authenticated user is an admin
  // - The authenticated user is requesting their own data
  if (isAdmin || requestedFirebaseUid === authenticatedFirebaseUid) {
    return next();
  }
  return res.status(403).json({ msg: 'Forbidden' });
};

// Middleware to restrict access by one role or multiple roles
const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !req.user.dbUser) {
      return res.status(401).json({ msg: 'User not authenticated' });
    }
    if (!roles.includes(req.user.dbUser.role)) {
      return res.status(403).json({ msg: 'Forbidden' });
    }
    next();
  };

// Middleware to allow access to review owner or admin
const allowToReviewOwnerOrAdmin = (req, res, next) => {
  const reviewId = parseInt(req.params.review_id, 10);
  const userId = req.user.dbUser.id;
  const isAdmin = req.user.dbUser.role === 'admin';
  db.query('SELECT user_id FROM reviews WHERE id = $1', [reviewId])
    .then((result) => {
      if (result.rows.length === 0)
        return res
          .status(404)
          .json({ msg: `Review with ID "${reviewId}" not found` });
      const reviewOwnerId = result.rows[0].user_id;
      if (isAdmin || reviewOwnerId === userId) return next();
      return res.status(403).json({ msg: 'Forbidden' });
    })
    .catch(next);
};

module.exports = {
  authMiddleware,
  restrictTo,
  allowToUserOrAdmin,
  allowToReviewOwnerOrAdmin,
  allowToFirebaseUserOrAdmin,
};
