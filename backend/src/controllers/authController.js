const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

exports.register = async (req, res) => {
    const { email, password, role, kyc_document_type, kyc_document_url } = req.body;

    if (!email || !password || !kyc_document_type || !kyc_document_url) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if user exists
        const userCheck = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const userRes = await client.query(
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
            [email, hashedPassword, role || 'customer']
        );
        const userId = userRes.rows[0].id;

        // Insert KYC
        await client.query(
            'INSERT INTO kyc_documents (user_id, document_type, document_url, status) VALUES ($1, $2, $3, $4)',
            [userId, kyc_document_type, kyc_document_url, 'pending']
        );

        await client.query('COMMIT');

        res.status(201).json({ message: 'User registered successfully. KYC pending approval.', userId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error during registration' });
    } finally {
        client.release();
    }
};

exports.login = async (req, res) => {
    const { email, password, mpin } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        let isMatch = false;

        if (mpin) {
            if (!user.mpin) {
                return res.status(400).json({ error: 'MPIN not set for this user' });
            }
            isMatch = await bcrypt.compare(mpin, user.mpin);
        } else if (password) {
            isMatch = await bcrypt.compare(password, user.password_hash);
        } else {
            return res.status(400).json({ error: 'Password or MPIN required' });
        }

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, email: user.email, role: user.role, mpinSet: !!user.mpin } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.setMpin = async (req, res) => {
    const { mpin } = req.body;
    const userId = req.user.id;

    if (!mpin || mpin.length !== 6) {
        return res.status(400).json({ error: 'MPIN must be 6 digits' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedMpin = await bcrypt.hash(mpin, salt);

        await pool.query('UPDATE users SET mpin = $1 WHERE id = $2', [hashedMpin, userId]);
        res.json({ message: 'MPIN set successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error setting MPIN' });
    }
};
