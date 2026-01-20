import { NotFoundException } from '@nestjs/common';

/**
 * Exception thrown when a user with a specified ID is not found. This exception
 * can be used in user-related services and repositories to indicate that a
 * requested user does not exist in the database.
 */
export class UserNotFoundException extends NotFoundException {
  constructor(details?: { email?: string; id?: string }) {
    const placeholder = details && (details.id || details.email) ? 'with ' : '';
    let message = `User ${placeholder}`;
    if (details?.email) message += `Email: ${details.email}`;
    if (details?.id) message += `ID: ${details.id}`;
    message += ' not found.';
    super(message);
  }
}
