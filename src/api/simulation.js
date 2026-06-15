import apiClient from './client';

export const simulateTransaction = (payload) => apiClient.post('/simulation/transactions', payload);

export const getAllSimulationTransactions = (page, size) => apiClient.get('/simulation/transactions', { params: { page, size } });