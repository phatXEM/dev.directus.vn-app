export type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  role?: string;
  provider?: string;
  strava_access_token?: string;
  strava_refresh_token?: string;
  strava_expires_at?: number;
  strava_athlete_id?: string;
};
