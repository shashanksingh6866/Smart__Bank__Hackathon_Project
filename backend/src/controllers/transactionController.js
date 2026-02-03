const { pool } = require('../config/db');

exports.transfer = async (req, res) => {
    const { from_account_number, to_account_number, amount } = req.body;
    const userId = req.user.id;

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    if (from_account_number === to_account_number) {
        return res.status(400).json({ error: 'Cannot transfer to the same account' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Verify from_account belongs to user and fetch IDs
        // Lock rows to prevent race conditions. Sort by ID to avoid deadlocks? 
        // Simpler: Fetch IDs first, then select for update in order.

        const fromAccountRes = await client.query(
            'SELECT id, balance, user_id FROM accounts WHERE account_number = $1',
            [from_account_number]
        );

        if (fromAccountRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Source account not found' });
        }

        const fromAccount = fromAccountRes.rows[0];

        if (fromAccount.user_id !== userId && req.user.role !== 'admin') {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'Unauthorized access to source account' });
        }

        if (parseFloat(fromAccount.balance) < transferAmount) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        const toAccountRes = await client.query(
            'SELECT id FROM accounts WHERE account_number = $1',
            [to_account_number]
        );

        if (toAccountRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Destination account not found' });
        }

        const toAccount = toAccountRes.rows[0];

        // Lock both accounts. To avoid deadlock, lock by ID order.
        // Actually, just performing the UPDATEs will lock the rows. 
        // We verified balance above, but it could change. 
        // We should perform the decrement and check row count or returning balance.

        // Strict approach:
        const firstId = fromAccount.id < toAccount.id ? fromAccount.id : toAccount.id;
        const secondId = fromAccount.id < toAccount.id ? toAccount.id : fromAccount.id;

        await client.query('SELECT id FROM accounts WHERE id = $1 FOR UPDATE', [firstId]);
        await client.query('SELECT id FROM accounts WHERE id = $1 FOR UPDATE', [secondId]);

        // Re-check balance after lock
        const freshFrom = await client.query('SELECT balance FROM accounts WHERE id = $1', [fromAccount.id]);
        if (parseFloat(freshFrom.rows[0].balance) < transferAmount) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Perform updates
        await client.query(
            'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
            [transferAmount, fromAccount.id]
        );

        await client.query(
            'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
            [transferAmount, toAccount.id]
        );

        // Record Transaction
        const txRes = await client.query(
            'INSERT INTO transactions (from_account_id, to_account_id, amount, type, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [fromAccount.id, toAccount.id, transferAmount, 'transfer', 'success']
        );

        await client.query('COMMIT');

        res.status(200).json({ message: 'Transfer successful', transaction: txRes.rows[0] });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Transfer failed' });
    } finally {
        client.release();
    }
};

exports.getTransactions = async (req, res) => {
    const userId = req.user.id;

    // Get all transactions for all accounts of user
    // Join transactions with accounts to filter by user_id
    const query = `
        SELECT t.*, 
               fa.account_number as from_account, 
               ta.account_number as to_account 
        FROM transactions t
        LEFT JOIN accounts fa ON t.from_account_id = fa.id
        LEFT JOIN accounts ta ON t.to_account_id = ta.id
        WHERE fa.user_id = $1 OR ta.user_id = $1
        ORDER BY t.timestamp DESC
        LIMIT 50
    `;

    try {
        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching transactions' });
    }
};
