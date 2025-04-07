const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { roleCheck, ROLES } = require('../middleware/roleCheck');
const admin = require('../config/firebase');

// Kullanıcı oluşturma (Sadece patron)
router.post('/users', 
    authMiddleware, 
    roleCheck([ROLES.OWNER]), 
    authController.createUser
);

// Kullanıcı listesi (Sadece patron)
router.get('/users', 
    authMiddleware, 
    roleCheck([ROLES.OWNER]), 
    authController.listUsers
);

// Kullanıcı silme (Sadece patron)
router.delete('/users/:uid', 
    authMiddleware, 
    roleCheck([ROLES.OWNER]), 
    authController.deleteUser
);

// Kullanıcı rolü güncelleme (Sadece patron)
router.patch('/users/:uid/role', 
    authMiddleware, 
    roleCheck([ROLES.OWNER]), 
    authController.updateUserRole
);

// Kullanıcı profili görüntüleme (Tüm kullanıcılar)
router.get('/profile', 
    authMiddleware, 
    authController.getUserProfile
);

// Kullanıcı girişi kontrolü
router.post('/verify-token', async (req, res) => {
    try {
        const { token } = req.body;
        const decodedToken = await admin.auth().verifyIdToken(token);
        res.json({
            uid: decodedToken.uid,
            email: decodedToken.email,
            message: 'Token doğrulama başarılı'
        });
    } catch (error) {
        res.status(401).json({ error: 'Geçersiz token' });
    }
});

// Kullanıcı bilgilerini getir
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await admin.auth().getUser(req.user.uid);
        res.json({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 