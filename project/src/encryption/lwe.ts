import { Ciphertext, PublicKey, PublicKeyElement, SecretKey } from "./types";
import {
  chooseRandomSubset,
  dotProduct,
  isPrime,
  mod,
  modVector,
  sampleNormal,
  sampleUniformVector,
  sumVectors,
} from "./utils";

const keygen = (
  n: number,
  q: number
): { secret: SecretKey; publicKey: PublicKey } => {
  if (n <= 1) {
    throw new Error("n must be greater than 1");
  }

  if (q < n * n) {
    throw new Error("q must be greater than n^2");
  }

  if (!isPrime(q)) {
    throw new Error("q must be a prime number");
  }

  const m = Math.floor(n * Math.log(q));

  const denom = Math.sqrt(n) * Math.pow(Math.log(n), 2);

  const alpha = 1 / denom;

  const secret: SecretKey = { vector: sampleUniformVector(q, n), n, q };

  const elements: PublicKeyElement[] = [];

  for (let i = 0; i < m; i++) {
    const vector = sampleUniformVector(q, n);
    const error = sampleNormal(Math.floor(alpha * q));
    const scalar = dotProduct(vector, secret.vector) + error;
    elements.push({ vector, scalar: mod(scalar, q) });
  }

  return { secret, publicKey: { elements, n, q } };
};

const encrypt = (publicKey: PublicKey, message: number): Ciphertext => {
  if (message !== 0 && message !== 1) {
    throw new Error("Message must be 0 or 1");
  }

  // Chose a random subset of the public key
  const subset = chooseRandomSubset(publicKey.elements);

  const res: Ciphertext = {
    vector: [...subset[0].vector],
    scalar: subset[0].scalar,
  };

  for (let i = 1; i < subset.length; i++) {
    res.vector = sumVectors(res.vector, subset[i].vector);
    res.scalar = mod(res.scalar + subset[i].scalar, publicKey.q);
  }

  if (message === 1) {
    res.scalar += Math.floor(publicKey.q / 2);
  }

  res.vector = modVector(res.vector, publicKey.q);
  res.scalar = mod(res.scalar, publicKey.q);

  return res;
};

const decrypt = (secret: SecretKey, ciphertext: Ciphertext): number => {
  let res = ciphertext.scalar - dotProduct(ciphertext.vector, secret.vector);

  res = mod(res, secret.q);

  const half = Math.floor(secret.q / 2);
  const q = secret.q;

  const distToZero = Math.min(res, q - res);
  const distToHalf = Math.min(mod(res - half, q), mod(half - res, q));

  return distToZero < distToHalf ? 0 : 1;
};

export { decrypt, encrypt, keygen };
