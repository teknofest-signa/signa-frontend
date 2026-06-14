import { createContext, useContext, useState, useCallback } from 'react';
import { setAccessToken } from '../api/client';
import { login as loginApi, register as registerApi, getBackofficeInfo } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);

    const loadUser = useCallback(async () => {
        try {
            const { data } = await getBackofficeInfo();
            setUser(data);
            return data;
        } catch (err) {
            setToken(null);
            setAccessToken(null);
            setUser(null);
            throw err;
        }
    }, []);

    const login = async (email, password) => {
        const { data } = await loginApi(email, password);
        setAccessToken(data.token);
        setToken(data.token);
        await loadUser();
        return data;
    };

    const register = async (regToken, username, password) => {
        const { data } = await registerApi(regToken, username, password);
        setAccessToken(data.token);
        setToken(data.token);
        await loadUser();
        return data;
    };

    const logout = () => {
        setAccessToken(null);
        setToken(null);
        setUser(null);
    };

    const value = {
        token,
        user,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        loadUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};