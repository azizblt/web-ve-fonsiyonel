const admin = require('firebase-admin');
const serviceAccount = require('./firebase-credentials.json');

// Firebase Admin başlatma
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

console.log('Firebase Admin SDK initialized successfully');

module.exports = admin;