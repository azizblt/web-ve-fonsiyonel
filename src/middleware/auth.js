const admin = require('../config/firebase');
const Log = require('../models/Log');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token bulunamadı' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;

        // Log user activity
        await Log.create({
            userId: decodedToken.uid,
            action: 'LOGIN',
            details: {
                email: decodedToken.email
            },
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Kimlik doğrulama başarısız' });
    }
};

const isOwner = async (req, res, next) => {
    if (req.user.role !== 'owner') {
        await Log.create({
            userId: req.user.uid,
            action: 'UNAUTHORIZED_ACCESS',
            details: {
                attemptedPath: req.path,
                method: req.method
            },
            ip: req.ip
        });
        return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }
    next();
};

module.exports = { authMiddleware, isOwner }; 