export class ProductNotFoundException extends Error {
  constructor(id: string) {
    super(`Product with ID ${id} not found.`);
    this.name = 'ProductNotFoundException';
  }
}
