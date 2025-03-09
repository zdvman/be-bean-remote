// src/config/firebase.js
const admin = require('firebase-admin');
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
  throw new Error('Missing FIREBASE_SERVICE_ACCOUNT env var');
}

const serviceAccount = JSON.parse(serviceAccountJson);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
