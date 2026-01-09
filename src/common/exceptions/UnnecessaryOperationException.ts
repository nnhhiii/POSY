export class UnnecessaryOperationException extends Error {
  public meta?: object;

  constructor(message: string, meta?: object) {
    super(message);
    this.meta = meta;
    this.name = 'UnnecessaryOperationException';
  }
}
