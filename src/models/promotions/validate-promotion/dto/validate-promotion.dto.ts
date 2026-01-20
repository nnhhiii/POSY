export class ValidatePromotionDto {
  promotionId: string;
  productId: string; // The specific product being validated
  productPrice: number; // Price of the specific product
  quantity: number; // Quantity of the specific product
  categoryId?: string; // Category of the product (optional, for SPECIFIC_CATEGORIES)
}

export class ValidatePromotionResultDto {
  isValid: boolean;
  reason?: string;
  metadata?: Record<string, any>;
}
