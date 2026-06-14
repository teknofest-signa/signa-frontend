import apiClient from './client';

export const getBanks = () => apiClient.get('/banks');

export const createBank = (name) => apiClient.post('/banks', { name });

export const deleteBank = (id) => apiClient.delete(`/banks/${id}`);

export const uploadBankLogo = (id, file) => {
    const formData = new FormData();
    if (file) {
        formData.append('file', file);
    }
    return apiClient.post(`/banks/${id}/upload-photo`, formData, {headers: { 'Content-Type': 'multipart/form-data' },});
};