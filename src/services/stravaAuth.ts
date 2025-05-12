import axios from 'axios';
import {
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET,
  STRAVA_REDIRECT_URI,
} from '@env';

export const getStravaAuthUrl = async () => {
  const scope = 'read,activity:read_all,activity:write';

  const url = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${STRAVA_REDIRECT_URI}&response_type=code&scope=${scope}`;

  return url;
};

export const exchangeStravaCode = async (code: string): Promise<string> => {
  try {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching Strava access token:', error);
    throw new Error('Failed to fetch Strava access token');
  }
};

export const refreshStravaAccessToken = async (
  refreshToken: string,
): Promise<string> => {
  try {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error refreshing Strava access token:', error);
    throw new Error('Failed to refresh Strava access token');
  }
};
