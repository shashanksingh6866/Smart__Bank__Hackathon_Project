const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Routes
app.use('/auth', authRoutes);
app.use('/accounts', accountRoutes);
app.use('/transactions', transactionRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/kyc', require('./routes/kycRoutes'));
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to SmartBank API' });
});

// Create tables if not exists (optional, mostly handled by init.sql but good for sanity check connectivity)
// In production, we assume DB is migrated.

module.exports = app;
