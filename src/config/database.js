const { Pool } = require('pg');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-credentials.json');

// PostgreSQL Connection
const postgresPool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
});

// MongoDB Connection
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Firebase Admin Initialization
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = {
    postgresPool,
    connectMongoDB,
    firebaseAdmin: admin
}; 