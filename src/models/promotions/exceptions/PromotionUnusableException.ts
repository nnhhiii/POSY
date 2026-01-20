export class PromotionUnusableException extends Error {
  constructor(
    public id: string,
    public message = `Promotion with ID ${id} is unusable.`,
    public meta?: Record<string, any>,
  ) {
    super(message);
    this.name = 'PromotionUnusableException';
  }
}
