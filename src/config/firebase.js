// src/config/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./bean-remote-firebase-adminsdk-fbsvc-021c1a2439.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
