export class PromotionNotFoundException extends Error {
  constructor(details?: { id?: string; code?: string }) {
    const placeholder = details && (details.id || details.code) ? 'with ' : '';
    let message = `Promotion ${placeholder}`;
    if (details?.id) message += `ID: ${details.id} `;
    if (details?.code) message += `Code: ${details.code} `;
    message += 'not found.';
    super(message);
    this.name = 'PromotionNotFoundException';
  }
}
