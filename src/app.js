const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const reportsRoutes = require('./routes/reports');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Bir hata oluştu!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 