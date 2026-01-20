import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { PromotionDiscountType } from '../enums';
import { promotionConfig } from '../promotion.config';

const constraint = promotionConfig.discountValue.constraint;

export function IsValidDiscountValue(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidDiscountValue',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(
          value: any,
          args: ValidationArguments,
        ): Promise<boolean> | boolean {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const obj = args.object as any;

          if (typeof value !== 'number') return false;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (obj.discountType === PromotionDiscountType.FIXED_AMOUNT) {
            return value > constraint.FIXED_AMOUNT.min;
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (obj.discountType === PromotionDiscountType.PERCENTAGE) {
            return (
              value > constraint.PERCENTAGE.min &&
              value <= constraint.PERCENTAGE.max
            );
          }
          return true;
        },
        defaultMessage(arg: ValidationArguments): string {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const obj = arg.object as any;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          const value = obj.discountValue;
          if (typeof value !== 'number') {
            return constraint.message.mustNumber;
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (obj.discountType === PromotionDiscountType.FIXED_AMOUNT) {
            return constraint.message.FIXED_AMOUNT;
          }
          return constraint.message.PERCENTAGE;
        },
      },
    });
  };
}
