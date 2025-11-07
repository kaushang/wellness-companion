import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const authAPI = {
  signup: (data) => axios.post(`${API_URL}/auth/signup`, data),
  login: (data) => axios.post(`${API_URL}/auth/login`, data),
};

export const nutritionAPI = {
  logMeal: (data) => axios.post(`${API_URL}/nutrition/log`, data),
  getTodayMeals: () => axios.get(`${API_URL}/nutrition/today`),
  getAllMeals: () => axios.get(`${API_URL}/nutrition/all`),
  updateMeal: (id, data) => axios.put(`${API_URL}/nutrition/${id}`, data),
  deleteMeal: (id) => axios.delete(`${API_URL}/nutrition/${id}`),
};

export const fitnessAPI = {
  logWorkout: (data) => axios.post(`${API_URL}/fitness/log`, data),
  getWeekWorkouts: () => axios.get(`${API_URL}/fitness/week`),
  getAllWorkouts: () => axios.get(`${API_URL}/fitness/all`),
  updateWorkout: (id, data) => axios.put(`${API_URL}/fitness/${id}`, data),
  deleteWorkout: (id) => axios.delete(`${API_URL}/fitness/${id}`),
};

export const profileAPI = {
  getProfile: () => axios.get(`${API_URL}/profile`),
  updateProfile: (data) => axios.put(`${API_URL}/profile`, data),
};

export const chatAPI = {
  sendMessage: (data) => axios.post(`${API_URL}/chat/message`, data),
};

