import axios from 'axios';

const api = axios.create({
    // baseURL is removed to use relative paths (proxy)
});


export const addFriend = (code) => api.post(`/api/friends/add/${code}`);
export const getLeaderboard = () => api.get('/api/leaderboard');

export const getHabits = () => api.get('/api/habits');
export const createHabit = (data) => api.post('/api/habits', data);
export const updateHabit = (id, data) => api.patch(`/api/habits/${id}`, data);
export const getLogs = (monthIso) => api.get(`/api/logs/${monthIso}`);
export const toggleHabit = (habitId, date) => api.post('/api/toggle', { habit_id: habitId, date });
export const getDashboardData = (year, month) => api.get(`/api/dashboard/${year}/${month}`);

export default api;
