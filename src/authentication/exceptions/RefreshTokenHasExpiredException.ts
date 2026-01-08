export class RefreshTokenHasExpiredException extends Error {
  constructor() {
    super('The refresh token has expired.');
    this.name = 'RefreshTokenHasExpiredException';
  }
}
