import { LoginResponse, UserResponse } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { User } from '@/types/user';

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

  updateCurrentUser: async (userData: Partial<User>) => {
    try {
      const response = await api.patch<UserResponse>('/users/me', userData);
      console.log('---- Updated user data:', response);
      return response.data.data;
    } catch (error) {
      console.error('Update user error:', error);
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
