import apiClient from './client';

export const simulateTransaction = (payload) => apiClient.post('/simulation/transactions', payload);