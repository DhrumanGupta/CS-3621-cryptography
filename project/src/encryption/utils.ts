import { Vector } from "./types";

/**
 * Generates a sample from a normal distribution N(0, s) rounded to the nearest integer.
 * Uses the Marsaglia polar method, which is more numerically stable than Box-Muller.
 * @param s - The standard deviation (must be a positive number)
 * @returns A random integer sampled from N(0, s)
 */
export function sampleNormal(s: number): number {
  if (s <= 0) {
    throw new Error("Standard deviation must be positive");
  }

  // Marsaglia polar method for generating standard normal random variable
  // This method avoids trigonometric functions and handles edge cases better
  let u: number, v: number, s_val: number;

  do {
    // Generate two uniform random numbers in [-1, 1]
    u = 2 * Math.random() - 1;
    v = 2 * Math.random() - 1;
    s_val = u * u + v * v;
  } while (s_val >= 1 || s_val === 0); // Reject if outside unit circle or at origin

  // Apply the transformation
  const z0 = u * Math.sqrt((-2 * Math.log(s_val)) / s_val);

  // Scale by standard deviation and round to nearest integer
  return Math.round(z0 * s);
}

/**
 * Samples uniformly from the set {0, 1, ..., q-1}.
 * @param q - The modulus (must be a positive integer)
 * @returns A random integer uniformly sampled from {0, 1, ..., q-1}
 */
export function sampleUniform(q: number): number {
  if (q <= 0 || !Number.isInteger(q)) {
    throw new Error("q must be a positive integer");
  }

  return Math.floor(Math.random() * q);
}

/**
 * Generates a list of n uniform samples from {0, 1, ..., q-1}.
 * @param q - The modulus (must be a positive integer)
 * @param n - The number of samples to generate (must be a positive integer)
 * @returns An array of n random integers, each uniformly sampled from {0, 1, ..., q-1}
 */
export function sampleUniformVector(q: number, n: number): number[] {
  if (n <= 0 || !Number.isInteger(n)) {
    throw new Error("n must be a positive integer");
  }

  const result: number[] = [];
  for (let i = 0; i < n; i++) {
    result.push(sampleUniform(q));
  }
  return result;
}

/**
 * Computes the dot product of two vectors of the same length.
 * @param a - First vector
 * @param b - Second vector (must be same length as a)
 * @returns The dot product (sum of a[i] * b[i] for all i)
 */
export function dotProduct(a: Vector, b: Vector): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

/**
 * Checks if a number is prime.
 * @param n - The number to check (must be >= 2)
 * @returns true if n is prime, false otherwise
 */
export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;

  const sqrtN = Math.sqrt(n);
  for (let i = 3; i <= sqrtN; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

/**
 * Finds a prime number in the range [a, b].
 * Returns the smallest prime >= a, or null if no prime exists in the range.
 * @param a - The lower bound (inclusive)
 * @param b - The upper bound (inclusive)
 * @returns A prime number in [a, b], or null if none exists
 */
export function findPrimeInRange(a: number, b: number): number | null {
  if (a > b) {
    throw new Error("a must be less than or equal to b");
  }
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error("a and b must be integers");
  }

  for (let i = Math.max(a, 2); i <= b; i++) {
    if (isPrime(i)) {
      return i;
    }
  }
  return null;
}

// This is one way of doing it
// There are many more.
export function chooseRandomSubset<T>(set: T[]): T[] {
  const res: T[] = [];
  for (let i = 0; i < set.length; i++) {
    if (Math.random() < 0.5) {
      res.push(set[i]);
    }
  }

  // Ensure non-empty
  if (res.length === 0) {
    const idx = Math.floor(Math.random() * set.length);
    res.push(set[idx]);
  }
  return res;
}

export function sumVectors(a: Vector, b: Vector): Vector {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  const res: Vector = [];
  for (let i = 0; i < a.length; i++) {
    res.push(a[i] + b[i]);
  }
  return res;
}

export function modVector(a: Vector, q: number): Vector {
  const res: Vector = [];
  for (let i = 0; i < a.length; i++) {
    res.push(mod(a[i], q));
  }
  return res;
}

export function mod(a: number, q: number): number {
  return ((a % q) + q) % q;
}
