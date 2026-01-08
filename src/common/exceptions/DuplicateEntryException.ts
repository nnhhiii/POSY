export class DuplicateEntryException extends Error {
  details: object;

  constructor(message: string, details: object = {}) {
    super(message);
    this.details = details;
    this.name = 'DuplicateEntryException';
  }
}
