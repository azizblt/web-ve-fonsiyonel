const Log = require('../models/Log');

const roleCheck = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userRole = req.user.role;

            if (!allowedRoles.includes(userRole)) {
                // Log unauthorized access attempt
                await Log.create({
                    userId: req.user.uid,
                    action: 'UNAUTHORIZED_ACCESS',
                    details: {
                        requiredRoles: allowedRoles,
                        userRole: userRole,
                        path: req.path,
                        method: req.method
                    }
                });

                return res.status(403).json({
                    error: 'Bu işlem için yetkiniz yok'
                });
            }

            next();
        } catch (error) {
            console.error('Role check error:', error);
            res.status(500).json({ error: error.message });
        }
    };
};

module.exports = {
    roleCheck,
    ROLES: {
        OWNER: 'owner',
        EMPLOYEE: 'employee'
    }
}; 