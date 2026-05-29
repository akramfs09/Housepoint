import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Ambil data user jika token ada
    const refreshUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }
        try {
            const response = await api.get('/user');
            setUser(response.data.data);
        } catch (error) {
            // Token tidak valid atau expired → hapus
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { user, token } = response.data.data;
        localStorage.setItem('token', token);
        setUser(user);
        return user;
    };

    const register = async (data) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    };

    const verifyOtp = async (email, otp) => {
        const response = await api.post('/auth/verify-otp', { email, otp });
        const { user, token } = response.data.data;
        localStorage.setItem('token', token);
        setUser(user);
        return user;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        isLoading,
        login,
        register,
        verifyOtp,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};