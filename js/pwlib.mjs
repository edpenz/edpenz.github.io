// import { webcrypto } from "crypto";
const webcrypto = window.crypto;

export class DRBG {
  static #ALGO = "AES-CTR";
  static #BLOCK_BITS = 128;
  static #BLOCK_BYTES = this.#BLOCK_BITS / 8;

  #key;
  #counter;
  #params;

  constructor() {
    this.#key = null;
    this.#counter = new Uint8Array(DRBG.#BLOCK_BYTES);
    this.#params = null;
  }

  static async from(seed) {
    let rng = new DRBG();
    await rng.reseed(seed);
    return rng;
  }

  async reseed(seed) {
    this.#key = await webcrypto.subtle.importKey("raw", seed, DRBG.#ALGO, false, ["encrypt"]);
    this.#params = {
      name: DRBG.#ALGO,
      counter: this.#counter,
      length: DRBG.#BLOCK_BITS,
    };
  }

  #incrementCounter(n) {
    // webcrypto CTR counter is big-endian
    let carry = n;
    for (let i = this.#counter.length - 1; i >= 0; i--) {
      if ((this.#counter[i] += carry) >= 256) {
        carry = 1;
      } else {
        break;
      }
    }
  }

  async randomBytes(n) {
    const plaintext = new Uint8Array(n);
    const ciphertext = await webcrypto.subtle.encrypt(this.#params, this.#key, plaintext);
    // TODO: Increment appropriate amount based on `n` or use a dual-counter system.
    this.#incrementCounter(Math.ceil(n / DRBG.#BLOCK_BYTES));
    return ciphertext;
  }

  async randomUint32() {
    const rawBuffer = await this.randomBytes(32 / 8);
    const typedBuffer = new Uint32Array(rawBuffer);
    return typedBuffer[0];
  }

  async randomFloat32() {
    const uint32 = await this.randomUint32();
    return uint32 / 2 ** 32;
  }
}

export async function unweightedChoice(rng, candidates) {
  // Shannon and Rényi entropy are equivalent for uniform distributions
  const minEntropy = Math.log2(candidates.length);

  // FIXME: Use integral RNG for less quantisation error
  const index = Math.floor((await rng.randomFloat32()) * candidates.length);

  return [candidates[index], minEntropy];
}

export async function weightedChoice(rng, candidates) {
  // Preprocess candidates for easier choice and entropy calculation
  let summedWeights = 0;
  let maximumWeight = 0;

  // Pass 1: calculate weight aggregates
  for (const [_candidate, weight] of candidates.entries()) {
    summedWeights += weight;
    maximumWeight = Math.max(maximumWeight, weight);
  }

  // Use min-entropy as measure of choice "difficulty"
  const minEntropy = Math.log2(summedWeights / maximumWeight);

  // FIXME: Use integral RNG for less quantisation error
  const weightIndex = Math.floor((await rng.randomFloat32()) * summedWeights);

  // Pass 2: search for and return chosen candidate
  let runningWeight = 0;
  for (const [candidate, weight] of candidates.entries()) {
    runningWeight += weight;
    if (weightIndex < runningWeight) {
      return [candidate, minEntropy];
    }
  }

  throw RangeError(`${weightIndex} not less than ${summedWeights}`);
}

export function loadNgrams(words, n) {
  // First pass makes list of n-grams for easy conversion to a map
  let ngramList = [];
  for (const word of words) {
    const wordSuffix = word.slice(n - 1);
    Array.from(wordSuffix).forEach((_, i) => {
      ngramList.push(word.slice(i, i + n));
    });
  }
  ngramList.sort();

  // Second pass converts to map of prefix to suffix frequency
  let ngrams = new Map();
  for (const ngram of ngramList) {
    const prefix = ngram.slice(0, -1);
    const suffix = ngram.slice(-1);
    const suffixMap = ngrams.get(prefix) || new Map();
    suffixMap.set(suffix, (suffixMap.get(suffix) || 0) + 1);
    ngrams.set(prefix, suffixMap);
  }

  return ngrams;
}

function percentile(iterable, p) {
  let list = Array.from(iterable);
  list.sort((a, b) => a - b);
  const index = Math.min(Math.floor(p * list.length), list.length - 1);
  return list[index];
}

export function reweightNgrams(ngrams, percentileMax) {
  let newNgrams = new Map();
  for (const [head, tails] of ngrams.entries()) {
    const maxFrequency = percentile(tails.values(), percentileMax);
    const newTails = new Map();
    for (const [suffix, frequency] of tails.entries()) {
      newTails.set(suffix, Math.min(frequency, maxFrequency));
    }
    newNgrams.set(head, newTails);
  }
  return newNgrams;
}

// function addWeights(iterable) {
//   return new Map(Array.from(iterable).map((i) => [i, 1]));
// }

export function charRange(from, to) {
  let string = "";
  for (let i = from.codePointAt(0); i <= to.codePointAt(0); i++) {
    string += String.fromCodePoint(i);
  }
  return string;
}

export async function generatePassword(rng, targetEntropy, charset) {
  let password = "";
  let runningEntropy = 0;
  while (runningEntropy < targetEntropy) {
    const [char, charEntropy] = await unweightedChoice(rng, charset);
    password += char;
    runningEntropy += charEntropy;
  }
  return password;
}

export async function generatePassphrase(rng, targetEntropy, wordlist) {
  let passphrase = [];
  let runningEntropy = 0;
  while (runningEntropy < targetEntropy) {
    const [word, wordEntropy] = await unweightedChoice(rng, wordlist);
    passphrase.push(word);
    runningEntropy += wordEntropy;
  }
  return passphrase.join(" ");
}

export async function generatePassgram(rng, targetEntropy, ngrams) {
  const prefixLength = ngrams.keys().next().value.length;

  let password = "";
  let runningEntropy = 0;

  // To begin with select a random trigram
  let candidates = new Map();
  for (const [prefix, suffixes] of ngrams.entries()) {
    for (const [suffix, frequency] of suffixes.entries()) {
      candidates.set(prefix + suffix, frequency);
    }
  }

  while (runningEntropy < targetEntropy) {
    const [candidate, candidateEntropy] = await weightedChoice(rng, candidates);
    password += candidate;
    runningEntropy += candidateEntropy;

    // Repopulate candidates with matching ngrams
    candidates = new Map();
    const suffix = password.slice(password.length - prefixLength);
    candidates = ngrams.get(suffix);

    // Flush generator state if it backs itself into a corner
    if (!candidates) {
      return password + (await generatePassgram(rng, targetEntropy - runningEntropy, ngrams));
    }
  }

  return password;
}
