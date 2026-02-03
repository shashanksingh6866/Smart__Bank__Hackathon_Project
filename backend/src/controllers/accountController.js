const { pool } = require('../config/db');

// Helper to generate account number (simple random for now)
const generateAccountNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

exports.createAccount = async (req, res) => {
    const { account_type, initial_deposit } = req.body;
    const userId = req.user.id;

    if (!['savings', 'current', 'fd'].includes(account_type)) {
        return res.status(400).json({ error: 'Invalid account type' });
    }

    const deposit = parseFloat(initial_deposit);
    if (isNaN(deposit) || deposit < 0) {
        return res.status(400).json({ error: 'Invalid initial deposit' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const accountNumber = generateAccountNumber();

        // Create Account
        const accountRes = await client.query(
            'INSERT INTO accounts (user_id, account_number, account_type, balance) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, accountNumber, account_type, deposit]
        );
        const account = accountRes.rows[0];

        // If initial deposit > 0, record transaction
        if (deposit > 0) {
            await client.query(
                'INSERT INTO transactions (to_account_id, amount, type, status) VALUES ($1, $2, $3, $4)',
                [account.id, deposit, 'deposit', 'success']
            );
        }

        await client.query('COMMIT');

        res.status(201).json({ message: 'Account created successfully', account });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error creating account' });
    } finally {
        client.release();
    }
};

exports.getAccounts = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query('SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching accounts' });
    }
};
