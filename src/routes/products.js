const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authMiddleware, isOwner } = require('../middleware/auth');
const Log = require('../models/Log');

// Get all products
router.get('/', authMiddleware, async (req, res) => {
    try {
        const products = await Product.getAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create product (only owner)
router.post('/', authMiddleware, isOwner, async (req, res) => {
    try {
        const product = await Product.create(req.body);
        await Log.create({
            userId: req.user.uid,
            action: 'PRODUCT_ADD',
            details: product
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update product (only owner)
router.put('/:id', authMiddleware, isOwner, async (req, res) => {
    try {
        const product = await Product.update(req.params.id, req.body);
        if (!product) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }
        await Log.create({
            userId: req.user.uid,
            action: 'PRODUCT_UPDATE',
            details: product
        });
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 