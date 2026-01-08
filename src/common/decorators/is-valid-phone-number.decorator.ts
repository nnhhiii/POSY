import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidPhoneNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'Phone number is not valid.',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          return /(?:\+84|0084|0)[235789][0-9]{1,2}[0-9]{7}(?:\D+|$)/g.test(
            value,
          );
        },
      },
    });
  };
}
