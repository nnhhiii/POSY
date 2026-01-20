export class ProductKnownException extends Error {
  /**
   * Creates a new ProductKnownException instance.
   *
   * @param {string} code - A unique error code representing the type of product error.
   * @param {string} message - A human-readable error message describing the error.
   * @param {Record<string, any>} [meta] - Optional metadata providing additional context about the error.
   */
  constructor(
    public code: string,
    public message: string,
    public meta?: Record<string, any>,
  ) {
    super(message);
    this.name = 'ProductKnownException';
  }
}
