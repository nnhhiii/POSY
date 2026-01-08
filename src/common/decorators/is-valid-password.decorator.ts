import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidPassword',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): Promise<boolean> | boolean {
          if (typeof value !== 'string') return false;
          if (value.length < 8) return false;
          if (!/[A-Z]/.test(value)) return false;
          if (!/[a-z]/.test(value)) return false;
          if (!/\d/.test(value)) return false;
          if (!/[\W_]/.test(value)) return false;
          return true;
        },
        defaultMessage(): string {
          return 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character.';
        },
      },
    });
  };
}
