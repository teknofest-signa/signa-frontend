import apiClient from './client';

export const createAdmin = (email) => apiClient.post('/super-admins/admins', { email });

export const getAdmins = () => apiClient.get('/super-admins/admins');

export const getAdmin = (id) => apiClient.get(`/super-admins/admins/${id}`);

export const updateAdmin = (id, data) => apiClient.put(`/super-admins/admins/${id}`, data);

export const deleteAdmin = (id) => apiClient.delete(`/super-admins/admins/${id}`);