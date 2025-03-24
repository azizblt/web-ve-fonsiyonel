const { postgresPool } = require('../config/database');
const Log = require('../models/Log');

class ReportService {
    static async generateZReport(date) {
        const client = await postgresPool.connect();

        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            // Get stock movements
            const stockMovements = await client.query(
                `SELECT 
                    sm.type,
                    sm.quantity,
                    p.name as product_name,
                    p.price,
                    u.email as user_email
                FROM stock_movements sm
                JOIN products p ON sm.product_id = p.id
                JOIN users u ON sm.created_by = u.id
                WHERE sm.created_at BETWEEN $1 AND $2`,
                [startOfDay, endOfDay]
            );

            // Get logs from MongoDB
            const logs = await Log.find({
                timestamp: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            });

            return {
                date: date,
                stockMovements: stockMovements.rows,
                totalIn: stockMovements.rows
                    .filter(sm => sm.type === 'IN')
                    .reduce((sum, sm) => sum + sm.quantity, 0),
                totalOut: stockMovements.rows
                    .filter(sm => sm.type === 'OUT')
                    .reduce((sum, sm) => sum + sm.quantity, 0),
                userActivities: logs
            };
        } finally {
            client.release();
        }
    }
}

module.exports = ReportService; 