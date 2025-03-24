const { firebaseAdmin } = require('../config/firebase');
const Log = require('../models/Log');

class AuthController {
    // Yeni kullanıcı oluşturma (Sadece patron yapabilir)
    async createUser(req, res) {
        try {
            const { email, password, displayName, role } = req.body;

            // Role kontrolü
            if (role !== 'employee' && role !== 'owner') {
                return res.status(400).json({ error: 'Geçersiz rol' });
            }

            // Firebase'de kullanıcı oluştur
            const userRecord = await firebaseAdmin.auth().createUser({
                email,
                password,
                displayName
            });

            // Kullanıcıya rol ata
            await firebaseAdmin.auth().setCustomUserClaims(userRecord.uid, { role });

            // Log oluştur
            await Log.create({
                userId: req.user.uid,
                action: 'USER_CREATE',
                details: {
                    createdUserId: userRecord.uid,
                    role
                }
            });

            res.status(201).json({
                message: 'Kullanıcı oluşturuldu',
                user: {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    displayName: userRecord.displayName,
                    role
                }
            });
        } catch (error) {
            console.error('Create user error:', error);
            res.status(400).json({ error: error.message });
        }
    }

    // Kullanıcı listesi (Sadece patron görebilir)
    async listUsers(req, res) {
        try {
            const listUsersResult = await firebaseAdmin.auth().listUsers();
            const users = listUsersResult.users.map(user => ({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: user.customClaims?.role || 'employee'
            }));

            res.json(users);
        } catch (error) {
            console.error('List users error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Kullanıcı silme (Sadece patron yapabilir)
    async deleteUser(req, res) {
        try {
            const { uid } = req.params;

            // Kendini silmeye çalışıyor mu kontrolü
            if (uid === req.user.uid) {
                return res.status(400).json({ error: 'Kendi hesabınızı silemezsiniz' });
            }

            await firebaseAdmin.auth().deleteUser(uid);

            // Log oluştur
            await Log.create({
                userId: req.user.uid,
                action: 'USER_DELETE',
                details: { deletedUserId: uid }
            });

            res.json({ message: 'Kullanıcı silindi' });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Kullanıcı rolünü güncelleme (Sadece patron yapabilir)
    async updateUserRole(req, res) {
        try {
            const { uid } = req.params;
            const { role } = req.body;

            if (role !== 'employee' && role !== 'owner') {
                return res.status(400).json({ error: 'Geçersiz rol' });
            }

            // Kendini güncellemeye çalışıyor mu kontrolü
            if (uid === req.user.uid) {
                return res.status(400).json({ error: 'Kendi rolünüzü değiştiremezsiniz' });
            }

            await firebaseAdmin.auth().setCustomUserClaims(uid, { role });

            // Log oluştur
            await Log.create({
                userId: req.user.uid,
                action: 'USER_ROLE_UPDATE',
                details: { updatedUserId: uid, newRole: role }
            });

            res.json({ message: 'Kullanıcı rolü güncellendi' });
        } catch (error) {
            console.error('Update user role error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Kullanıcı profili görüntüleme
    async getUserProfile(req, res) {
        try {
            const userRecord = await firebaseAdmin.auth().getUser(req.user.uid);
            
            res.json({
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                role: req.user.role,
                lastSignInTime: userRecord.metadata.lastSignInTime
            });
        } catch (error) {
            console.error('Get user profile error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AuthController(); 