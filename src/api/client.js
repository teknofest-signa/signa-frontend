import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

let accessToken = localStorage.getItem('signa_token');

export const setAccessToken = (token) => {
    accessToken = token;
    if (token) {
        localStorage.setItem('signa_token', token);
    } else {
        localStorage.removeItem('signa_token');
    }
};

export const getAccessToken = () => accessToken;

apiClient.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

export default apiClient;