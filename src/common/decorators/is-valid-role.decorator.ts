import { registerDecorator, ValidationOptions } from 'class-validator';
import { Role } from '../enums';

export function IsValidRole(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidRole',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): Promise<boolean> | boolean {
          if (typeof value !== 'string') return false;
          return (Object.values(Role) as string[]).includes(value);
        },
        defaultMessage(): string {
          return (
            'Role is supposed to be one of the following values: ' +
            Object.values(Role).join(', ')
          );
        },
      },
    });
  };
}
