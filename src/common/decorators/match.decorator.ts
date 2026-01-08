import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(
          value: any,
          validationArguments: ValidationArguments,
        ): Promise<boolean> | boolean {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const [relatedPropertyName] = validationArguments.constraints;
          return (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            value === (validationArguments.object as any)[relatedPropertyName]
          );
        },
        defaultMessage(validationArguments: ValidationArguments): string {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const [relatedPropertyName] = validationArguments.constraints;
          return `${propertyName} must match ${relatedPropertyName}`;
        },
      },
    });
  };
}
