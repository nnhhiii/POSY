import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { promotionConfig } from '../promotion.config';

const constraint = promotionConfig.title.constraint;

export function IsValidTitle(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidTitle',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          return !(
            value.length < constraint.minLength ||
            value.length > constraint.maxLength
          );
        },
        defaultMessage(args: ValidationArguments): string {
          const value = args.value as unknown;
          if (typeof value !== 'string') {
            return constraint.message.mustString;
          }
          if (value.length < constraint.minLength) {
            return constraint.message.minLength;
          }
          return constraint.message.maxLength;
        },
      },
    });
  };
}
