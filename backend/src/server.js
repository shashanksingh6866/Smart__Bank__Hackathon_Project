const app = require('./app');
const { pool } = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Check DB connection
        await pool.query('SELECT NOW()');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect to database', err);
        process.exit(1);
    }
};

startServer();
