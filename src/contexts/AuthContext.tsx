// FILE: src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children : ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = Cookies.get('access_token');
        if (storedToken) {
            setToken(storedToken);
        }
        setIsLoading(false);
    }, []);

    const isAuthenticated = !!token; // Single source of truth

    const login = (newToken: string) => {
        Cookies.set('access_token', newToken, { expires: 1, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
        setToken(newToken);
        router.push('/crm-dashboard');
    };

    const logout = () => {
        Cookies.remove('access_token');
        setToken(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading, token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};