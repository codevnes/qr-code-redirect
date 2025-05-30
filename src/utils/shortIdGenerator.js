/**
 * Generate a random short ID
 * @param {number} length - The length of the short ID to generate
 * @returns {string} - Returns a random short ID
 */
const generateShortId = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

module.exports = { generateShortId }; 