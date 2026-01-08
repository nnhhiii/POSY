export class InvalidRefreshTokenException extends Error {
  constructor() {
    super('The provided refresh token is invalid or has expired.');
    this.name = 'InvalidRefreshTokenException';
  }
}
