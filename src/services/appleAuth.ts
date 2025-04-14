import appleAuth from '@invertase/react-native-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import axios from 'axios';
import { APPLE_REDIRECT_URI } from '@env';

/**
 * Service to handle Apple authentication
 */
export const appleAuthService = {
  /**
   * Check if Apple authentication is available on the device
   */
  isAppleAuthAvailable: () => {
    return Platform.OS === 'ios' && appleAuth.isSupported;
  },

  /**
   * Sign in with Apple
   */
  signInWithApple: async () => {
    try {
      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      const res = await axios.post(
        APPLE_REDIRECT_URI,
        {
          code: appleAuthRequestResponse?.authorizationCode,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (res.status !== 200) {
        throw new Error('Error in Apple authentication');
      }

      return res.data;
    } catch (error) {
      console.error('Apple authentication error:', error);
      throw error;
    }
  },
};
