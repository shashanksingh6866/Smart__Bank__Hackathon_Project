const { pool } = require('./src/config/db');

async function migrate() {
    try {
        console.log('Adding mpin column to users table...');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS mpin VARCHAR(255);');
        console.log('Migration successful');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
