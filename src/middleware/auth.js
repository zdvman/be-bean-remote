// src/middleware/auth.js
const admin = require('../config/firebase'); // Import Firebase Admin
const db = require('./../db/connection'); // Assuming you’re using PostgreSQL

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  admin
    .auth()
    .verifyIdToken(token)
    .then((decoded) => {
      req.user = decoded; // Attach Firebase user data to request

      // Fetch user from PostgreSQL using firebase_uid
      return db.query(
        'SELECT id, firebase_uid, email, full_name, avatar, role, points, badges, fcm_token, notification_preferences FROM users WHERE firebase_uid = $1',
        [decoded.uid]
      );
    })
    .then(({ rows }) => {
      req.user.dbUser = rows[0] || null; // Set to null if not found

      if (!req.user.dbUser) {
        // Optionally create the user in PostgreSQL or return an error
        const newUserQuery = `
          INSERT INTO users (firebase_uid, email, full_name, avatar, role, points, badges, fcm_token, notification_preferences)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id, firebase_uid, email, full_name, avatar, role, points, badges, fcm_token, notification_preferences
        `;
        const newUserValues = [
          req.user.uid,
          req.user.email || 'default@email.com', // Use Firebase email or a default
          req.user.name || 'Unnamed User', // Use Firebase name or a default
          'some default URL for avatar', // Use your default avatar URL
          'user', // Default role
          0, // Default points
          '{}', // Default badges (empty array)
          null, // Default FCM token (can be updated later)
          '{}', // Default notification preferences (empty JSONB)
        ];

        return db.query(newUserQuery, newUserValues);
      }

      next();
    })
    .then(({ rows }) => {
      if (req.user.dbUser === null) {
        req.user.dbUser = rows[0]; // Update with newly created user
      }
      next();
    })
    .catch((error) => {
      console.error('Authentication error:', error);
      res.status(401).json({ message: 'Invalid token' });
    });
};

// Middleware to restrict access by role
const restrictTo = (role) => (req, res, next) => {
  if (!req.user || !req.user.dbUser) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  if (req.user.dbUser.role !== role) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

module.exports = { authMiddleware, restrictTo };
