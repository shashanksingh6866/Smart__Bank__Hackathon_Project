import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const Dashboard = () => {
    const { token, logout } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBalance, setShowBalance] = useState(false);

    // Modals
    const [activeModal, setActiveModal] = useState(null); // 'transfer', 'createAccount', 'setMpin', 'kycUpload'

    // Form States
    const [transferData, setTransferData] = useState({ to: '', amount: '' });
    const [newAccountType, setNewAccountType] = useState('savings');
    const [mpinInput, setMpinInput] = useState('');
    const [kycData, setKycData] = useState({ type: 'passport', url: '' });

    const fetchData = async () => {
        try {
            const result = await api.get('/dashboard', token);
            setData(result);
        } catch (err) {
            console.error(err);
            if (err.message === 'Unauthorized') logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleTransfer = async (e) => {
        e.preventDefault();
        try {
            // Simple validation could go here
            await api.post('/transactions/transfer', {
                from_account_number: data.accounts[0]?.account_number, // Defaulting to first for now
                to_account_number: transferData.to,
                amount: transferData.amount
            }, token);
            alert('Transfer Successful!');
            setActiveModal(null);
            fetchData();
        } catch (err) {
            alert('Transfer Failed: ' + err.message);
        }
    };

    const handleCreateAccount = async () => {
        try {
            await api.post('/accounts', { account_type: newAccountType, initial_deposit: 0 }, token);
            alert('Account Created!');
            setActiveModal(null);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSetMpin = async () => {
        try {
            await api.post('/auth/set-mpin', { mpin: mpinInput }, token);
            alert('MPIN Set Successfully!');
            setActiveModal(null);
            fetchData(); // Refresh to update user state if we tracked it
        } catch (err) {
            alert(err.message);
        }
    };

    const handleKycUpload = async (e) => {
        e.preventDefault();
        try {
            await api.post('/kyc/upload', {
                document_type: kycData.type,
                document_url: kycData.url
            }, token);
            alert('KYC Document Uploaded! Status is now Pending.');
            setActiveModal(null);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;

    const primaryAccount = data?.accounts?.[0]; // Default to first account

    return (
        <div className="min-h-screen bg-gray-100 pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-3 shadow-sm flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h1 className="text-xl font-bold text-blue-900">Good Morning</h1>
                    <p className="text-gray-500 text-sm">{data?.user?.email}</p>
                </div>
                <div className="flex gap-3">
                    <button className="p-2 text-gray-500 hover:text-blue-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </button>
                    <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-6">

                {/* Balance Card */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                    <div className="relative z-10">
                        <p className="text-purple-100 text-sm mb-1">Savings Account</p>
                        <h2 className="text-xl font-mono tracking-wider mb-4">
                            {primaryAccount ? primaryAccount.account_number : 'No Account'}
                        </h2>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-purple-100 text-xs mb-1">Available Balance</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-bold">
                                        {showBalance
                                            ? `$${parseFloat(primaryAccount?.balance || 0).toFixed(2)}`
                                            : '$ XXXX.XX'}
                                    </span>
                                    <button onClick={() => setShowBalance(!showBalance)} className="text-purple-200 hover:text-white">
                                        {showBalance ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KYC Alert */}
                {data?.user?.kyc_status !== 'approved' && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold text-yellow-800">KYC Pending</p>
                            <p className="text-xs text-yellow-700">Please upload documents to unlock all features.</p>
                        </div>
                        <button onClick={() => setActiveModal('kycUpload')} className="bg-yellow-600 text-white text-xs px-3 py-1.5 rounded">Upload</button>
                    </div>
                )}

                {/* Feature Grid */}
                <h3 className="font-bold text-gray-700">Quick Actions</h3>
                <div className="grid grid-cols-3 gap-4">
                    <GridItem
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                        label="Transfer"
                        onClick={() => setActiveModal('transfer')}
                        color="bg-blue-100 text-blue-600"
                    />
                    <GridItem
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                        label="New Account"
                        onClick={() => setActiveModal('createAccount')}
                        color="bg-green-100 text-green-600"
                    />
                    <GridItem
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        label="KYC Status"
                        onClick={() => {
                            if (data?.user?.kyc_status !== 'approved') setActiveModal('kycUpload');
                            else alert('KYC is already Approved!');
                        }}
                        color="bg-purple-100 text-purple-600"
                    />
                    <GridItem
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                        label="Set MPIN"
                        onClick={() => setActiveModal('setMpin')}
                        color="bg-orange-100 text-orange-600"
                    />
                </div>

                {/* Recent Transactions */}
                <h3 className="font-bold text-gray-700 mt-6">Recent Transactions</h3>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {data?.recent_transactions?.map((tx, i) => (
                        <div key={tx.id} className={`p-4 border-b last:border-0 flex justify-between items-center ${tx.is_suspicious ? 'bg-red-50' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${tx.type === 'transfer' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100'}`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm capitalize">{tx.type}</p>
                                    <p className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold font-mono ${tx.is_suspicious ? 'text-red-600' : 'text-gray-800'}`}>
                                    -${parseFloat(tx.amount).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-400 capitalize">{tx.status}</p>
                            </div>
                        </div>
                    ))}
                    {(!data?.recent_transactions || data.recent_transactions.length === 0) && (
                        <div className="p-4 text-center text-gray-500 text-sm">No recent transactions</div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={activeModal === 'transfer'} onClose={() => setActiveModal(null)} title="Fund Transfer">
                <form onSubmit={handleTransfer} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">To Account</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded focus:border-blue-500 outline-none"
                            value={transferData.to}
                            onChange={e => setTransferData({ ...transferData, to: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Amount</label>
                        <input
                            type="number"
                            className="w-full border p-2 rounded focus:border-blue-500 outline-none"
                            value={transferData.amount}
                            onChange={e => setTransferData({ ...transferData, amount: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Send Money</button>
                </form>
            </Modal>

            <Modal isOpen={activeModal === 'createAccount'} onClose={() => setActiveModal(null)} title="Open New Account">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Account Type</label>
                        <select
                            className="w-full border p-2 rounded"
                            value={newAccountType}
                            onChange={e => setNewAccountType(e.target.value)}
                        >
                            <option value="savings">Savings Account</option>
                            <option value="current">Current Account</option>
                            <option value="fd">Fixed Deposit</option>
                        </select>
                    </div>
                    <button onClick={handleCreateAccount} className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">Create Account</button>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'setMpin'} onClose={() => setActiveModal(null)} title="Set MPIN">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Enter a 6-digit MPIN for quick login.</p>
                    <input
                        type="text"
                        maxLength="6"
                        pattern="\d*"
                        className="w-full border p-2 rounded font-mono text-center text-xl tracking-widest"
                        value={mpinInput}
                        onChange={e => setMpinInput(e.target.value.replace(/\D/g, ''))}
                    />
                    <button onClick={handleSetMpin} className="w-full bg-orange-600 text-white py-2 rounded font-bold hover:bg-orange-700">Save MPIN</button>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'kycUpload'} onClose={() => setActiveModal(null)} title="Upload KYC Document">
                <form onSubmit={handleKycUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Document Type</label>
                        <select
                            className="w-full border p-2 rounded"
                            value={kycData.type}
                            onChange={e => setKycData({ ...kycData, type: e.target.value })}
                        >
                            <option value="passport">Passport</option>
                            <option value="driver_license">Driver's License</option>
                            <option value="national_id">National ID</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Document URL</label>
                        <input
                            type="text"
                            placeholder="http://example.com/doc.jpg"
                            className="w-full border p-2 rounded"
                            value={kycData.url}
                            onChange={e => setKycData({ ...kycData, url: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700">Upload Document</button>
                </form>
            </Modal>
        </div>
    );
};

const GridItem = ({ icon, label, onClick, color }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow active:scale-95 transition-transform">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${color}`}>
            {icon}
        </div>
        <span className="text-xs font-semibold text-gray-700 text-center">{label}</span>
    </button>
);

export default Dashboard;
