import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsValidSlug(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidSlug',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): Promise<boolean> | boolean {
          if (typeof value !== 'string') return false;
          return true;
        },
        defaultMessage(args: ValidationArguments): string {
          const value: unknown = args.value;
          if (typeof value !== 'string') {
            return 'Slug must be a string.';
          }
          return 'Invalid slug.';
        },
      },
    });
  };
}
