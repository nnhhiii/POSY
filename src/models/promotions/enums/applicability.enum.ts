export enum PromotionApplicability {
  ALL_ITEMS = 'ALL_ITEMS', // Order-level: "10% off total bill"
  SPECIFIC_CATEGORIES = 'SPECIFIC_CATEGORIES', // Category-level: "10% off beverages"
  SPECIFIC_ITEMS = 'SPECIFIC_ITEMS', // Item-level: "20% off pizza"
  QUANTITY_BASED = 'QUANTITY_BASED', // Quantity-based: "Buy 2 get 10% off"
}
