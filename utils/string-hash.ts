/**
 * Converts a string to a unique 32-bit integer hash.
 *
 * The function iterates over each character of the string,
 * computes the character's ASCII value, and combines these
 * values using bitwise operations to create a hash. The hash
 * is designed to be as unique as possible for different strings,
 * but it's not collision-proof.
 *
 * @param {string} str - The string to be hashed.
 * @return {number} - A 32-bit integer hash of the string.
 */
export function getUniqueHashFromString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

export function getRandomIndexFromHash(
  hash: number,
  arrayLength: number,
): number {
  // Seed a simple pseudo-random number generator with the hash
  const seed = hash
  const a = 1664525
  const c = 1013904223
  const m = 2 ** 32
  // Generate a pseudo-random number and scale it to the array length
  return Math.abs((a * seed + c) % m) % arrayLength
}
