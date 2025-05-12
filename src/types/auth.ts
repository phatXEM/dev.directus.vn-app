export interface LoginResponse {
  data: {
    access_token: string;
    expires: number;
    refresh_token: string;
  };
}

export interface UserResponse {
  data: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    role?: string;
  };
}
