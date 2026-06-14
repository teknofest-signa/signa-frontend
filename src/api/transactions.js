import apiClient from './client';

export const getAllTransactions = () => apiClient.get('/backoffice/transactions');