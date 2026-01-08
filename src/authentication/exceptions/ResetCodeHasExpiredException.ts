export class ResetCodeHasExpiredException extends Error {
  constructor() {
    super('The reset code has expired.');
    this.name = 'ResetCodeHasExpiredException';
  }
}
