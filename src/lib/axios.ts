import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        // Add API Key or Secret if needed
        // 'X-API-Key': import.meta.env.VITE_API_KEY,
    },
});

export default api;
