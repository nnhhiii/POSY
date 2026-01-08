export class ResetTokenHasExpiredException extends Error {
  constructor() {
    super('The reset token has expired.');
    this.name = 'ResetTokenHasExpiredException';
  }
}
