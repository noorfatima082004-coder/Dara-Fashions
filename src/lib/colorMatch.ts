import type { SkinProfile } from './skinApi'

export interface ColorMatch {
  score: number
  reason: string
}

/**
 * Deterministic, zero-cost dress-to-profile match: string-matches a
 * product's color names against the user's best/avoid palette. Runs
 * entirely client-side (no server round trip, no Gemini call) — the
 * per-dress vision call from the original design would scale cost with
 * users × catalog size, so it's replaced with this free lookup instead.
 */
export function matchProductColors(
  productColors: { name: string; hex: string }[],
  profile: SkinProfile
): ColorMatch {
  const bestLower = profile.bestColors.map((c) => c.toLowerCase())
  const avoidLower = profile.avoidColors.map((c) => c.toLowerCase())

  for (const { name } of productColors) {
    const nameLower = name.toLowerCase()
    const isMatch = bestLower.some((c) => c.includes(nameLower) || nameLower.includes(c))
    if (isMatch) {
      return {
        score: 85,
        reason: `${name} is one of your recommended colors for your ${profile.season} palette.`,
      }
    }
  }

  for (const { name } of productColors) {
    const nameLower = name.toLowerCase()
    const isAvoid = avoidLower.some((c) => c.includes(nameLower) || nameLower.includes(c))
    if (isAvoid) {
      return {
        score: 30,
        reason: `${name} tends to clash with your ${profile.undertone} undertone.`,
      }
    }
  }

  return {
    score: 55,
    reason: 'A neutral fit — not a standout pick for your palette, but not a clash either.',
  }
}
