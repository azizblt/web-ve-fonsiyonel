const express = require('express');
const router = express.Router();
const aiAnalysis = require('../services/aiAnalysis');
const { authMiddleware, checkRole, ROLES } = require('../middleware/auth');

// Z Raporu analizi (Sadece patron görebilir)
router.post('/analyze', 
    authMiddleware, 
    checkRole([ROLES.OWNER]), 
    async (req, res, next) => {
        try {
            const zReportData = req.body;
            const analysis = await aiAnalysis.analyzeZReport(zReportData);
            
            res.json({
                success: true,
                data: analysis
            });
        } catch (error) {
            next(error);
        }
    }
);

// Stok tahminleri (Sadece patron görebilir)
router.get('/predictions', 
    authMiddleware, 
    checkRole([ROLES.OWNER]), 
    async (req, res, next) => {
        try {
            const { startDate, endDate } = req.query;
            const stockData = await getStockData(startDate, endDate);
            const predictions = await aiAnalysis.predictWithVertexAI(stockData);
            
            res.json({
                success: true,
                data: predictions
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router; 