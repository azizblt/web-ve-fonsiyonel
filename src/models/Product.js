const { postgresPool } = require('../config/database');

class Product {
    static async create(productData, userId) {
        const { name, price, initial_stock } = productData;
        const client = await postgresPool.connect();

        try {
            await client.query('BEGIN');

            const productResult = await client.query(
                'INSERT INTO products (name, price, stock_quantity, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
                [name, price, initial_stock, userId]
            );

            await client.query(
                'INSERT INTO stock_movements (product_id, quantity, type, created_by) VALUES ($1, $2, $3, $4)',
                [productResult.rows[0].id, initial_stock, 'IN', userId]
            );

            await client.query('COMMIT');
            return productResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async updateStock(productId, quantity, type, userId) {
        const client = await postgresPool.connect();

        try {
            await client.query('BEGIN');

            const operator = type === 'IN' ? '+' : '-';
            await client.query(
                `UPDATE products SET stock_quantity = stock_quantity ${operator} $1 WHERE id = $2`,
                [quantity, productId]
            );

            await client.query(
                'INSERT INTO stock_movements (product_id, quantity, type, created_by) VALUES ($1, $2, $3, $4)',
                [productId, quantity, type, userId]
            );

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = Product; 