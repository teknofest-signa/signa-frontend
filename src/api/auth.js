import apiClient from './client';

export const login = (email, password) =>
    apiClient.post('/auth/login', { email, password });

export const register = (token, username, password) =>
    apiClient.post('/auth/admin-register', { username, password }, { params: { token } });

export const getBackofficeInfo = () => apiClient.get('/backoffice');