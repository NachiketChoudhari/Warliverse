/** Mulberry32 seeded PRNG; every valid integer seed produces a repeatable stream. */
export function createSeededRandom(seed: number): () => number {
  if (!Number.isSafeInteger(seed)) throw new TypeError('Seed must be a safe integer.')

  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function randomInteger(random: () => number, min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min
}

export function deriveVariationSeeds(seed: number, count = 4): number[] {
  if (!Number.isSafeInteger(seed) || !Number.isSafeInteger(count) || count < 1) {
    throw new TypeError('Seed and variation count must be safe integers, and count must be positive.')
  }
  return Array.from({ length: count }, (_, index) => (seed + index + 1) >>> 0)
}
