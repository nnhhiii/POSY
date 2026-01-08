export interface AuthTokensSchema {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}
