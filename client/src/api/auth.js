import axios from 'axios';

const API_URL = '/api/auth';

// Register user
const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Login user
const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get user profile
const getProfile = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(`${API_URL}/profile`, config);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const authService = {
  register,
  login,
  logout,
  getProfile,
};

export default authService;