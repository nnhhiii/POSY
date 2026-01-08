/**
 * Interface representing the structure of a JWT payload.
 * @property sub - Subject identifier, typically the user ID.
 * @property email - User email address.
 * @property role - User role (e.g., admin, user).
 * @property username - Username of the user.
 * @property iat - Optional issued at timestamp (seconds since epoch).
 * @property exp - Optional expiration timestamp (seconds since epoch).
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  username: string;
  iat?: number;
  exp?: number;
}
