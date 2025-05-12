import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/services/auth';
import { appleAuthService } from '@services/appleAuth';
import { facebookAuthService } from '@services/facebookAuth';
import { googleAuthService } from '@services/googleAuth';
import { User } from '@/types/user';

type AuthResult = {
  success: boolean;
  error?: string;
  user?: User | null;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithApple: () => Promise<AuthResult>;
  loginWithFacebook: () => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
  logout: () => Promise<void>;
  user: User | null;
  updateUser?: (user: Partial<User>) => Promise<void>;
  isAppleAuthAvailable: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
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

  const loginWithApple = async (): Promise<AuthResult> => {
    try {
      setIsLoading(true);

      // Login with Apple
      const result = await appleAuthService.signInWithApple();

      console.log('Apple login result:', result);

      if (result.access_token && result.refresh_token) {
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
        return { success: true, user: userData };
      }

      return { success: false };
    } catch (error) {
      console.error('Apple login error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithFacebook = async (): Promise<AuthResult> => {
    try {
      setIsLoading(true);

      const result = await facebookAuthService.signInWithFacebook();

      if (result.access_token && result.refresh_token) {
        // Store tokens
        await AsyncStorage.setItem('@auth_token', result.access_token);
        await AsyncStorage.setItem('@refresh_token', result.refresh_token);

        // After successful login, get user data
        const userData = await authService.getCurrentUser();
        console.log('User data from Facebook login:', userData);
        await AsyncStorage.setItem('@user_data', JSON.stringify(userData));

        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, user: userData };
      }

      return { success: false };
    } catch (error) {
      console.error('Facebook login error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<AuthResult> => {
    try {
      setIsLoading(true);

      const result = await googleAuthService.signInWithGoogle();

      if (result.access_token && result.refresh_token) {
        // Store tokens
        await AsyncStorage.setItem('@auth_token', result.access_token);
        await AsyncStorage.setItem('@refresh_token', result.refresh_token);

        // After successful login, get user data
        const userData = await authService.getCurrentUser();
        console.log('User data from Google login:', userData);
        await AsyncStorage.setItem('@user_data', JSON.stringify(userData));

        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, user: userData };
      }

      return { success: false };
    } catch (error) {
      console.error('Google login error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Call logout service based on provider
      if (user?.provider === 'facebook') {
        await facebookAuthService.logoutFromFacebook();
      } else if (user?.provider === 'google') {
        await googleAuthService.signOutFromGoogle();
      }

      // Always call main logout to clear tokens
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

  const updateUser = async (_user: Partial<User>) => {
    try {
      setIsLoading(true);
      const updatedUser = await authService.updateCurrentUser(_user);
      setUser(updatedUser);
      await AsyncStorage.setItem('@user_data', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating user:', error);
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
        loginWithFacebook,
        loginWithGoogle,
        logout,
        user,
        updateUser,
        isAppleAuthAvailable,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
