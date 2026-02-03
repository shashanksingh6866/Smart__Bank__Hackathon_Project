import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState('mpin'); // 'mpin' or 'password'
    const [mpin, setMpin] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleKeypadClick = (num) => {
        if (mpin.length < 6) {
            setMpin(prev => prev + num);
        }
    };

    const handleBackspace = () => {
        setMpin(prev => prev.slice(0, -1));
    };

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, mode === 'password' ? password : null, mode === 'mpin' ? mpin : null);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed');
            setMpin(''); // Clear MPIN on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 p-6 text-center">
                    <h1 className="text-3xl font-bold text-white tracking-wider">SmartBank</h1>
                    <p className="text-blue-100 text-sm mt-1">YONO Style Experience</p>
                </div>

                <div className="p-8">
                    {/* User ID Input (Always visible) */}
                    <div className="mb-6">
                        <label className="block text-gray-600 text-sm font-semibold mb-2">User Email / ID</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none transition-colors bg-gray-50"
                            placeholder="Enter your email"
                        />
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-gray-200 rounded-full p-1 flex">
                            <button
                                onClick={() => { setMode('mpin'); setError(''); }}
                                className={`px-6 py-1 rounded-full text-sm font-medium transition-all ${mode === 'mpin' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                            >
                                MPIN
                            </button>
                            <button
                                onClick={() => { setMode('password'); setError(''); }}
                                className={`px-6 py-1 rounded-full text-sm font-medium transition-all ${mode === 'password' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                            >
                                Password
                            </button>
                        </div>
                    </div>

                    {error && <div className="bg-red-100 text-red-600 text-sm p-3 rounded mb-4 text-center">{error}</div>}

                    {/* MPIN Interface */}
                    {mode === 'mpin' && (
                        <div className="flex flex-col items-center">
                            <div className="flex gap-4 mb-8">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-4 h-4 rounded-full border-2 ${i < mpin.length ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}
                                    />
                                ))}
                            </div>

                            {/* Keypad */}
                            <div className="grid grid-cols-3 gap-6 w-full max-w-xs mb-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => handleKeypadClick(num)}
                                        className="w-16 h-16 rounded-full bg-gray-50 text-xl font-bold text-gray-700 shadow-sm hover:bg-gray-100 active:bg-blue-50 transition-colors mx-auto"
                                    >
                                        {num}
                                    </button>
                                ))}
                                <div className="w-16 h-16"></div>
                                <button
                                    onClick={() => handleKeypadClick(0)}
                                    className="w-16 h-16 rounded-full bg-gray-50 text-xl font-bold text-gray-700 shadow-sm hover:bg-gray-100 active:bg-blue-50 transition-colors mx-auto"
                                >
                                    0
                                </button>
                                <button
                                    onClick={handleBackspace}
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors mx-auto"
                                >
                                    Login
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-9.757a2 2 0 00-1.414.586L3 12z" />
                                    </svg>
                                </button>
                            </div>

                            <button
                                onClick={() => handleLogin()}
                                disabled={mpin.length !== 6 || loading}
                                className={`w-full py-3 rounded-lg text-white font-bold transition-all ${mpin.length === 6 ? 'bg-blue-600 hover:bg-blue-700 shadow-md' : 'bg-gray-300 cursor-not-allowed'}`}
                            >
                                {loading ? 'Logging in...' : 'Login with MPIN'}
                            </button>
                        </div>
                    )}

                    {/* Password Interface */}
                    {mode === 'password' && (
                        <form onSubmit={handleLogin}>
                            <div className="mb-6">
                                <label className="block text-gray-600 text-sm font-semibold mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none transition-colors bg-gray-50"
                                    placeholder="Enter password"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !password}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md disabled:bg-gray-300"
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="bg-gray-50 p-4 text-center text-sm text-gray-500 border-t">
                    New user? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register here</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
