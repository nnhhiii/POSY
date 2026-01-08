export class CategoryNotFoundException extends Error {
  constructor(id: string) {
    super(`Category with ID ${id} not found.`);
    this.name = 'CategoryNotFoundException';
  }
}
