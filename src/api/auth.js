import apiClient from './client';

export const login = (email, password) => apiClient.post('/auth/login', { email, password });

export const register = (token, username, password) => apiClient.post('/auth/admin-register', { username, password }, { params: { token } });

export const getBackofficeInfo = () => apiClient.get('/backoffice');

export const uploadProfilePhoto = (file) => {
    const formData = new FormData();
    if (file) {
        formData.append('file', file);
    }
    return apiClient.post('/backoffice/upload-photo', formData, {headers: { 'Content-Type': 'multipart/form-data' },});
};