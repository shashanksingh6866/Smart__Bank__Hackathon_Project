const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

router.post('/upload', verifyToken, async (req, res) => {
    const { document_type, document_url } = req.body;
    const userId = req.user.id;

    if (!document_type || !document_url) {
        return res.status(400).json({ error: 'Document type and URL are required' });
    }

    try {
        // Upsert logic: Update if exists, else Insert? 
        // For simplicity, let's just insert a new one which becomes the latest "pending" one
        // because our dashboard query pulls the latest one regardless of id.

        await pool.query(
            'INSERT INTO kyc_documents (user_id, document_type, document_url, status) VALUES ($1, $2, $3, $4)',
            [userId, document_type, document_url, 'pending']
        );

        res.json({ message: 'KYC Document uploaded successfully. Status: Pending.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error uploading KYC document' });
    }
});

module.exports = router;
