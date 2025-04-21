import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_REDIRECT_URI,
} from '@env';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID, // Using the client ID from .env file
  iosClientId: GOOGLE_IOS_CLIENT_ID, // iOS specific client ID
  offlineAccess: true,
});

// Define the response type for OAuth login
interface OAuthResponse {
  access_token: string;
  refresh_token: string;
}

export const googleAuthService = {
  async signInWithGoogle() {
    try {
      // Check if play services are available
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      const { data } = userInfo;

      if (data?.user) {
        const { email, name } = data?.user;

        if (email) {
          const res = await axios.post(
            GOOGLE_REDIRECT_URI,
            {
              email,
              name,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );

          if (res.status !== 200) {
            throw new Error('Error in Google authentication');
          }
          if (res.data) {
            return res.data;
          }
        }
      }

      throw new Error('User data not found');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('User cancelled the sign-in flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google sign-in operation already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available');
      }

      throw error;
    }
  },

  async signOutFromGoogle() {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
      throw error;
    }
  },

  async isSignedIn() {
    try {
      // Use type assertion to handle the missing type
      return await (GoogleSignin as any).isSignedIn();
    } catch (error) {
      console.error('Google isSignedIn Error:', error);
      return false;
    }
  },
};
