import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useEffect, useState } from 'react';

type User = {
    id: number;
    full_name: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_photo?: string;
    created_at: string;
    quizzes_taken?: number | string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    fetchUser: () => Promise<void>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    setUser: () => { },
    fetchUser: async () => { },
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(async () => {
        try {
            await api.post('/logout');
        } catch {
            console.log('Logout API error (safe to ignore)');
        }

        await AsyncStorage.removeItem('token');

        delete api.defaults.headers.common['Authorization'];

        setUser(null);
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                setUser(null);
                return;
            }

            const res = await api.get('/me');
            setUser(res.data.results);
        } catch (error: any) {
            console.log('fetchUser error:', error?.response?.data || error.message);

            if (error?.response?.status === 401) {
                await logout();
            }
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, fetchUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}