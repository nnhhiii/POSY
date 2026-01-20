import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfter',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(
          value: any,
          args: ValidationArguments,
        ): Promise<boolean> | boolean {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const [relatedPropertyName] = args.constraints;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (!(value instanceof Date) || !(relatedValue instanceof Date)) {
            return false;
          }
          return value > relatedValue;
        },
        defaultMessage(args: ValidationArguments): string {
          const value = args.value as unknown;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const [relatedPropertyName] = args.constraints;
          const relatedValue =
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (args.object as any)[relatedPropertyName] as unknown;

          if (relatedValue instanceof Date && value instanceof Date) {
            return `${args.property} must be after ${relatedPropertyName} (${relatedValue.toISOString()})`;
          }
          return `${args.property} must be after ${relatedPropertyName}`;
        },
      },
    });
  };
}
