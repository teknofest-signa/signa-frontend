import apiClient from './client';

export const getAllTransactions = (page = 0, size = 10) => apiClient.get('/backoffice/transactions', { params: { page, size } });