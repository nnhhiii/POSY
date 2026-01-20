export class PromotionProductNotFoundException extends Error {
  constructor(
    public id: string,
    public message: string = `PromotionProduct with ID: ${id} not found.`,
    public meta?: Record<string, any>,
  ) {
    super(message);
    this.name = 'PromotionProductNotFoundException';
  }
}
