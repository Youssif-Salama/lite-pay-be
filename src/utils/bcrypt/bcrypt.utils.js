import bcrypt from "bcrypt";
import env from "dotenv";
env.config();

/**
 * Hash a given password using bcrypt.
 * @param {string} password - the password to hash
 * @returns {string} - the hashed password
 */
export const hashPassword=(password)=>{
  const hashedPassword=bcrypt.hashSync(password,+process.env.SALT_ROUNDS);
  return hashedPassword;
}


/**
 * Compare a plain password with a hashed password to check if they match.
 * @param {string} password - The plain password to compare.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {boolean} - Returns true if the password matches the hashed password, otherwise false.
 */
export const comparePassword=(password,hashedPassword)=>{
  const isValidPassword=bcrypt.compareSync(password,hashedPassword);
  return isValidPassword;
}