import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { categoryConfig } from '../category.config';

const nameConstraints = categoryConfig.name.constraint;

export function IsValidCategoryName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidCategoryName',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): Promise<boolean> | boolean {
          if (typeof value !== 'string') return false;
          return (
            value.length < nameConstraints.minLength ||
            value.length > nameConstraints.maxLength
          );
        },
        defaultMessage(args: ValidationArguments): string {
          const value: unknown = args.value;
          if (typeof value !== 'string') {
            return nameConstraints.message.mustString;
          }
          if (value.length < nameConstraints.minLength) {
            return nameConstraints.message.minLength;
          }
          if (value.length > nameConstraints.maxLength) {
            return nameConstraints.message.maxLength;
          }
          return nameConstraints.message.invalid;
        },
      },
    });
  };
}
