import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import axios from 'axios';
import { FACEBOOK_REDIRECT_URI } from '@env';

/**
 * Service to handle Facebook authentication
 */
export const facebookAuthService = {
  /**
   * Sign in with Facebook
   */
  signInWithFacebook: async () => {
    try {
      LoginManager.setLoginBehavior('native_with_fallback');
      // Attempt login with permissions
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        return {
          success: false,
          error: 'User cancelled the login process',
        };
      }

      const data = await AccessToken.getCurrentAccessToken();
      const token = data?.accessToken;

      const res = await axios.post(
        FACEBOOK_REDIRECT_URI,
        {
          code: token,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          validateStatus: () => true,
        },
      );

      if (res.status !== 200) {
        throw new Error('Error in Facebook authentication');
      }

      if (res.data) {
        return res.data;
      }

      return { success: false, error: 'Could not process login' };
    } catch (error) {
      console.error('Facebook authentication error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  /**
   * Sign out from Facebook
   */
  logoutFromFacebook: async () => {
    try {
      LoginManager.logOut();
      return true;
    } catch (error) {
      console.error('Facebook logout error:', error);
      return false;
    }
  },
};
