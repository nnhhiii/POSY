export class PromotionCategoryNotFoundException extends Error {
  constructor(
    public readonly id?: string,
    public readonly message = `PromotionCategory with ID: ${id} not found.`,
    public readonly meta?: Record<string, any>,
  ) {
    super(message);
    this.name = 'PromotionCategoryNotFoundException';
  }
}
