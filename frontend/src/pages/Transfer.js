import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Transfer = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [fromAccount, setFromAccount] = useState('');
    const [toAccount, setToAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const data = await api.get('/accounts', token);
                setAccounts(data);
                if (data.length > 0) setFromAccount(data[0].account_number);
            } catch (err) {
                console.error('Failed to fetch accounts');
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            await api.post('/transactions/transfer', {
                from_account_number: fromAccount,
                to_account_number: toAccount,
                amount
            }, token);

            setMessage('Transfer successful!');
            setAmount('');
            setToAccount('');
            // Optionally redirect
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
                <h2 className="text-2xl font-bold mb-6 text-blue-600">Transfer Money</h2>

                {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">From Account</label>
                        <select
                            className="w-full border p-2 rounded"
                            value={fromAccount}
                            onChange={(e) => setFromAccount(e.target.value)}
                            required
                        >
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.account_number}>
                                    {acc.account_type.toUpperCase()} - {acc.account_number} (${acc.balance})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">To Account Number</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded"
                            value={toAccount}
                            onChange={(e) => setToAccount(e.target.value)}
                            placeholder="Enter destination account"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Amount</label>
                        <input
                            type="number"
                            className="w-full border p-2 rounded"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            min="0.01"
                            step="0.01"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                    >
                        Transfer Funds
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Transfer;
