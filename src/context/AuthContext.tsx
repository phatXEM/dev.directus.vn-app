import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@services/api';
import { appleAuthService } from '@services/appleAuth';

type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  role?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  logout: () => Promise<void>;
  user: User | null;
  isAppleAuthAvailable: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const isAppleAuthAvailable = appleAuthService.isAppleAuthAvailable();

  useEffect(() => {
    // Check if the user is already logged in
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('@auth_token');

        if (token) {
          // Get current user data
          const userData = await authService.getCurrentUser();
          await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // If there's an error (like expired token), clear auth state
        await authService.logout();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      await authService.login(email, password);

      // After successful login, get user data
      const userData = await authService.getCurrentUser();
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));

      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithApple = async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Login with Apple
      const result = await appleAuthService.signInWithApple();

      console.log('Apple login result:', result);

      if(result.access_token && result.refresh_token) {
        // Store tokens
        await AsyncStorage.setItem('@auth_token', result.access_token);
        await AsyncStorage.setItem('@refresh_token', result.refresh_token);

        // After successful login, get user data
        const userData = await authService.getCurrentUser();
        console.log('User data from Apple login:', userData);
        await AsyncStorage.setItem('@user_data', JSON.stringify(userData));

        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Apple login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Call logout service
      await authService.logout();

      // Update state
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        loginWithApple,
        logout,
        user,
        isAppleAuthAvailable,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
