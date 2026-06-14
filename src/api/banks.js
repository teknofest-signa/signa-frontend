import apiClient from './client';

export const getBanks = () => apiClient.get('/banks');

export const createBank = (name) => apiClient.post('/banks', { name });

export const deleteBank = (id) => apiClient.delete(`/banks/${id}`);