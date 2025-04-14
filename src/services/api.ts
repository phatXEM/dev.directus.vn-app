import axios from 'axios';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance with base URL from .env
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to automatically add auth token to requests
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('@auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Types based on Directus API responses
export interface LoginResponse {
  data: {
    access_token: string;
    expires: number;
    refresh_token: string;
  };
}

export interface UserResponse {
  data: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    role?: string;
  };
}

// API functions for authentication
export const authService = {
  // Login with email and password
  login: async (email: string, password: string) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      // Store tokens
      await AsyncStorage.setItem(
        '@auth_token',
        response.data.data.access_token,
      );
      await AsyncStorage.setItem(
        '@refresh_token',
        response.data.data.refresh_token,
      );

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get<UserResponse>('/users/me');
      console.log('---- User data:', response);
      return response.data.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('@refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      }

      // Clear tokens from storage
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@refresh_token');
      await AsyncStorage.removeItem('@user_data');

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, clear tokens
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@refresh_token');
      await AsyncStorage.removeItem('@user_data');
      return true;
    }
  },

  // Refresh access token
  refreshToken: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('@refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post<LoginResponse>('/auth/refresh', {
        refresh_token: refreshToken,
      });

      await AsyncStorage.setItem(
        '@auth_token',
        response.data.data.access_token,
      );
      await AsyncStorage.setItem(
        '@refresh_token',
        response.data.data.refresh_token,
      );

      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },
};

export default api;
