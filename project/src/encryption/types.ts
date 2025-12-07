type Vector = number[];

type PublicKeyElement = {
  vector: Vector;
  scalar: number;
};

type PublicKey = { elements: PublicKeyElement[]; n: number; q: number };

type Ciphertext = PublicKeyElement;

type SecretKey = { vector: Vector; n: number; q: number };

export type { Ciphertext, PublicKey, PublicKeyElement, SecretKey, Vector };
