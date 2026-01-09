export class AccountLockedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountLockedException';
  }
}
