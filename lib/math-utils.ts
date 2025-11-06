// Created-By: GitHub Copilot
/**
 * Mathematical utility functions
 */

/**
 * Add two numbers together
 * @param a - First number
 * @param b - Second number
 * @returns Sum of a and b
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Add multiple numbers together
 * @param numbers - Array of numbers to add
 * @returns Sum of all numbers
 */
export function addMultiple(numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0);
}

/**
 * Add multiple numbers using rest parameters
 * @param numbers - Variable number of number arguments
 * @returns Sum of all numbers
 */
export function addVariadic(...numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0);
}

// Example usage (for testing)
if (typeof window === 'undefined') {
  // Node.js environment
  console.log(`5 + 3 = ${add(5, 3)}`);
  console.log(`[1, 2, 3, 4, 5] = ${addMultiple([1, 2, 3, 4, 5])}`);
  console.log(`1 + 2 + 3 + 4 + 5 = ${addVariadic(1, 2, 3, 4, 5)}`);
}