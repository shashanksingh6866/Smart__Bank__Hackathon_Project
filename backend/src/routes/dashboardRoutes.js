const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { pool } = require('../config/db');

router.get('/', verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
        // Fetch accounts
        const accountsRes = await pool.query('SELECT * FROM accounts WHERE user_id = $1', [userId]);

        // Fetch recent transactions
        const transactionsRes = await pool.query(`
            SELECT t.*, fa.account_number as from_account, ta.account_number as to_account 
            FROM transactions t
            LEFT JOIN accounts fa ON t.from_account_id = fa.id
            LEFT JOIN accounts ta ON t.to_account_id = ta.id
            WHERE fa.user_id = $1 OR ta.user_id = $1
            ORDER BY t.timestamp DESC
            LIMIT 5
        `, [userId]);

        // Fetch KYC status
        const kycRes = await pool.query('SELECT status FROM kyc_documents WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
        const kycStatus = kycRes.rows.length > 0 ? kycRes.rows[0].status : 'pending_upload';

        // Process transactions for fraud detection
        const recentTransactions = transactionsRes.rows.map(tx => ({
            ...tx,
            is_suspicious: parseFloat(tx.amount) > 5000
        }));

        res.json({
            user: { ...req.user, kyc_status: kycStatus },
            accounts: accountsRes.rows,
            recent_transactions: recentTransactions
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error loading dashboard' });
    }
});

module.exports = router;
