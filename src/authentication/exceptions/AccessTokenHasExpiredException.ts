export class AccessTokenHasExpiredException extends Error {
  constructor() {
    super('The provided access token has expired.');
    this.name = 'InvalidAccessTokenException';
  }
}
