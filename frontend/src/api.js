import axios from 'axios';

// Get API URL from environment variable or use localhost as fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('🔗 API Base URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
    // Explicitly accept both 200 and 201 as success
    validateStatus: (status) => status >= 200 && status < 300,
});

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => {
        // Log successful responses for debugging
        console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('❌ Request timeout - backend may be down');
        } else if (error.response) {
            console.error(`❌ API Error: ${error.response.status}`, error.response.data);
        } else if (error.request) {
            console.error('❌ Network Error - backend unreachable');
        } else {
            console.error('❌ Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export const addFriend = (code) => api.post(`/friends/add/${code}`);
export const getLeaderboard = () => api.get('/leaderboard');

export const getHabits = () => api.get('/habits');
export const createHabit = (data) => api.post('/habits', data);
export const updateHabit = (id, data) => api.patch(`/habits/${id}`, data);
export const getLogs = (monthIso) => api.get(`/logs/${monthIso}`);
export const toggleHabit = (habitId, date) => api.post('/toggle', { habit_id: habitId, date });
export const getDashboardData = (year, month) => api.get(`/dashboard/${year}/${month}`);

export default api;
