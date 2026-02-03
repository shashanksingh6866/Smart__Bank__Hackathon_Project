import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Validate token or just load user data if endpoint exists
            // For now simplified
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password, mpin = null) => {
        try {
            const data = await api.post('/auth/login', { email, password, mpin });
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);
            return data;
        } catch (err) {
            throw err;
        }
    };

    const register = async (email, password, kycType, kycUrl) => {
        try {
            const data = await api.post('/auth/register', {
                email,
                password,
                role: 'customer',
                kyc_document_type: kycType,
                kyc_document_url: kycUrl
            });
            // Auto login after register? Or just return
            return data;
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
