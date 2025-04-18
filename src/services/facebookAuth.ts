import { Platform } from 'react-native';
import {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  Profile,
  Settings,
} from 'react-native-fbsdk-next';
import axios from 'axios';
import { FACEBOOK_APP_ID, FACEBOOK_REDIRECT_URI } from '@env';

/**
 * Service to handle Facebook authentication
 */
export const facebookAuthService = {
  /**
   * Initialize Facebook SDK
   */
  initializeSDK: () => {
    try {
      if (Platform.OS === 'ios') {
        // On iOS, we'll use our hardcoded app ID from Info.plist
        console.log('Facebook SDK will use App ID from Info.plist on iOS');
      } else {
        // For Android, we can set it directly
        Settings.setAppID(FACEBOOK_APP_ID);
        console.log('Facebook SDK initialized with App ID from env vars');
      }
    } catch (error) {
      console.error('Error initializing Facebook SDK:', error);
    }
  },

  /**
   * Get Facebook App ID from env
   */
  getFacebookAppId: () => {
    return FACEBOOK_APP_ID;
  },

  /**
   * Sign in with Facebook
   */
  signInWithFacebook: async () => {
    try {
      // Initialize SDK if needed
      facebookAuthService.initializeSDK();

      // Attempt login with permissions
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        console.log('User cancelled Facebook login');
        return {
          success: false,
          error: 'User cancelled the login process',
        };
      }

      console.log('Facebook permissions granted, getting access token...');
      // Get access token
      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        console.error('Failed to get Facebook access token');
        return {
          success: false,
          error: 'Failed to get access token',
        };
      }

      console.log('Access token received, getting user profile...');
      // Get user profile from Facebook Graph API
      const profile = await Profile.getCurrentProfile();
      console.log('Profile data received:', profile ? 'yes' : 'no');

      // Get additional user information like email
      console.log('Requesting additional user data from Facebook Graph API...');
      const currentProfile = await new Promise((resolve, reject) => {
        const infoRequest = new GraphRequest(
          '/me',
          {
            accessToken: data.accessToken,
            parameters: {
              fields: {
                string: 'email,name,first_name,last_name,picture',
              },
            },
          },
          (error, res) => {
            if (error) {
              console.error('Facebook Graph API error:', error);
              reject(error);
            } else {
              console.log('Facebook Graph API response received');
              resolve(res);
            }
          },
        );

        new GraphRequestManager().addRequest(infoRequest).start();
      });

      const res = await axios.post(
        FACEBOOK_REDIRECT_URI,
        {
          access_token: data.accessToken,
          email: (currentProfile as any)?.email || '',
          name: (currentProfile as any)?.name || '',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
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
