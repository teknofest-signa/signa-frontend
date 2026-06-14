import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { setAccessToken, getAccessToken } from '../api/client';
import { login as loginApi, register as registerApi, getBackofficeInfo } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(getAccessToken());
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const existing = getAccessToken();
        if (existing) {
            loadUser().finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [loadUser])

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
        loading,
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