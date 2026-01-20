import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { promotionConfig } from '../promotion.config';

const constraint = promotionConfig.description.constraint;

export function IsValidDescription(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidDescription',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): Promise<boolean> | boolean {
          if (typeof value !== 'string') return false;
          return value.length <= constraint.maxLength;
        },
        defaultMessage(args: ValidationArguments): string {
          const value = args.value as unknown;
          if (typeof value !== 'string') {
            return constraint.message.mustString;
          }
          return constraint.message.maxLength;
        },
      },
    });
  };
}
