export class ForeignKeyViolationException extends Error {
  details: object;

  constructor(details: object = {}) {
    super('Foreign key violation occurred.');
    this.details = details;
    this.name = 'ForeignKeyViolationException';
  }
}
