export const promotionConfig = {
  title: {
    constraint: {
      minLength: 5,
      maxLength: 150,
      message: {
        mustString: 'Promotion title must be a string.',
        minLength: 'Promotion title must be at least 5 characters long.',
        maxLength: 'Promotion title must not exceed 150 characters.',
      },
    },
  },
  description: {
    constraint: {
      maxLength: 500,
      message: {
        mustString: 'Promotion description must be a string.',
        maxLength: 'Promotion description must not exceed 500 characters.',
      },
    },
  },
  discountValue: {
    constraint: {
      FIXED_AMOUNT: {
        min: 0,
      },
      PERCENTAGE: {
        min: 0,
        max: 100,
      },
      message: {
        mustNumber: 'Discount value must be a number.',
        FIXED_AMOUNT:
          'For FIXED_AMOUNT, discount value must be greater than 0.',
        PERCENTAGE: 'For PERCENTAGE, discount value must be between 0 and 100.',
      },
    },
  },
  minQuantity: {
    constraint: {
      min: 0,
      message: {
        min: 'Minimum quantity must be at least 0.',
      },
    },
  },
};
