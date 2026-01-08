export const categoryConfig = {
  name: {
    constraint: {
      minLength: 3,
      maxLength: 100,
      message: {
        invalid: 'Category name is invalid.',
        mustString: 'Category name must be a string.',
        minLength: 'Category name must be at least 3 characters long.',
        maxLength: 'Category name must not exceed 100 characters.',
      },
    },
  },
  description: {
    constraint: {
      maxLength: 255,
      message: {
        invalid: 'Category description is invalid.',
        mustString: 'Category description must be a string.',
        maxLength: 'Category description must not exceed 255 characters.',
      },
    },
  },
};
