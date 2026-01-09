import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Cripta la password
 * @param {string} plainPassword
 * @returns {Promise<string>} password criptata
 */
export async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Confronta una password in chiaro con una criptata
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
export async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
