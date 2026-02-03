import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [kycType, setKycType] = useState('passport');
    const [kycUrl, setKycUrl] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(email, password, kycType, kycUrl);
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-green-600">Join SmartBank</h2>
                {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            className="w-full border p-2 rounded focus:outline-none focus:border-green-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full border p-2 rounded focus:outline-none focus:border-green-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">KYC Document Type</label>
                        <select
                            className="w-full border p-2 rounded focus:outline-none focus:border-green-500"
                            value={kycType}
                            onChange={(e) => setKycType(e.target.value)}
                        >
                            <option value="passport">Passport</option>
                            <option value="driver_license">Driver's License</option>
                            <option value="national_id">National ID</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Document URL (Simulated)</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded focus:outline-none focus:border-green-500"
                            placeholder="http://example.com/doc.jpg"
                            value={kycUrl}
                            onChange={(e) => setKycUrl(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
