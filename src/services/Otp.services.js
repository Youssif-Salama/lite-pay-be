/**
 * Generates a random 4-digit OTP (One-Time Password).
 *
 * @returns {number} A 4-digit integer OTP.
 */
export const generateOtp=()=>{
  return Math.floor(1000 + Math.random() * 9000);
}