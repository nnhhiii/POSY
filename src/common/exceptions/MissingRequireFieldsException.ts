export class MissingRequireFieldsException extends Error {
  fields?: string[];
  constructor(fields?: string[]) {
    super('Required fields are missing');
    this.fields = fields;
    this.name = 'MissingRequireFieldsException';
  }
}
