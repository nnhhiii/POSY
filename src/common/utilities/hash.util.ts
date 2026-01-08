import * as argon2 from 'argon2';

/**
 * Hashes a plain text using the Argon2id algorithm.
 * @param {string} text - The plain text to hash.
 * @returns {Promise<string>} A promise that resolves to the hashed text .
 * @throws {Error} If hashing fails due to invalid input or internal errors.
 */
export async function hash(text: string): Promise<string> {
  return argon2.hash(text, {
    type: argon2.argon2id,
    memoryCost: 64 * 1024, // 64MB
    timeCost: 3, // 3 iterations
    parallelism: 2, // 2 threads
  });
}

/**
 * Verifies a plain text against a previously hashed text.
 *
 * This function checks whether the provided plain text, when hashed,
 * matches the given hash. It uses Argon2's verify method to ensure
 * the plain text is correct without exposing the original plain text.
 *
 * @param {string} hash - The hashed text to compare against.
 * @param {string} text - The plain text to verify.
 * @returns {Promise<boolean>} A promise that resolves to true if the text matches the hash, false otherwise.
 * @throws {Error} If verification fails due to invalid input or internal errors.
 */
export async function verifyHash(hash: string, text: string): Promise<boolean> {
  return argon2.verify(hash, text);
}
