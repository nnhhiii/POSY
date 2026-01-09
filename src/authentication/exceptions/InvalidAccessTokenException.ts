export class InvalidAccessTokenException extends Error {
  constructor() {
    super('The provided access token is invalid.');
    this.name = 'InvalidAccessTokenException';
  }
}
