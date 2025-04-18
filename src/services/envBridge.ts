import { NativeModules, Platform } from 'react-native';
import { FACEBOOK_APP_ID, FACEBOOK_CLIENT_TOKEN } from '@env';

// This module helps expose environment variables for native code
const EnvBridge = {
  getFacebookAppID: () => {
    return FACEBOOK_APP_ID;
  },
  getFacebookClientToken: () => {
    return FACEBOOK_CLIENT_TOKEN;
  },
  setupEnvVars: () => {
    // Expose values to native code if needed
    if (Platform.OS === 'ios') {
      // iOS environment variables setup
      NativeModules.RNConfig?.setEnvVars({
        facebookAppID: FACEBOOK_APP_ID,
        facebookClientToken: FACEBOOK_CLIENT_TOKEN,
      });
    }
    // For Android, environment variables are handled at build time
    // through the build.gradle file reading from .env

    console.log(
      `Facebook App ID initialized: ${FACEBOOK_APP_ID ? 'Yes' : 'No'}`,
    );
  },
};

export default EnvBridge;
