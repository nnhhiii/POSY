export class InvalidResetCodeException extends Error {
  constructor() {
    super('The provided reset code is invalid');
    this.name = 'InvalidResetCodeException';
  }
}
