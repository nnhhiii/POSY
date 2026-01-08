export class InvalidCredentialsException extends Error {
  constructor() {
    super(
      'Invalid email or password. Please check your credentials and try again.',
    );
    this.name = 'InvalidCredentialsException';
  }
}
