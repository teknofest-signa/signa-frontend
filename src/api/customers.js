import apiClient from './client';

export const getAllCustomers = (page = 0, size = 10) => apiClient.get('/customers', { params: { page, size } });

export const createCustomer = ({ name, fin, bankId }) => apiClient.post('/customers', { name, fin, bankId });

export const blockCustomer = (id) => apiClient.put(`/customers/${id}`);