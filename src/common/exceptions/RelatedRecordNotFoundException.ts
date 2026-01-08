export class RelatedRecordNotFoundException extends Error {
  fields: any[];

  constructor(fields: any[]) {
    super('Relevant related record not found for the provided fields.');
    this.fields = fields;
    this.name = 'RelatedRecordNotFoundException';
  }
}
