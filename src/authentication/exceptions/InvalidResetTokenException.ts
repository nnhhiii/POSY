export class InvalidResetTokenException extends Error {
  constructor() {
    super('The provided reset token is invalid or has expired.');
    this.name = 'InvalidResetTokenException';
  }
}
