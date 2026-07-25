import { getDeviceId } from './deviceId'
import type { CompressedImage } from './imageCompress'

export type Undertone = 'warm' | 'cool' | 'neutral'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type ProfileSource = 'gemini' | 'cache' | 'deterministic_fallback'

export interface SkinProfile {
  skinTone: string
  undertone: Undertone
  season: Season
  bestColors: string[]
  avoidColors: string[]
  confidence: number
  source: ProfileSource
  analyzedAt: string
  warnings?: string[]
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const PROFILE_CACHE_KEY = 'dara_skin_profile'

export function loadCachedProfile(): SkinProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY)
    return raw ? (JSON.parse(raw) as SkinProfile) : null
  } catch {
    return null
  }
}

function saveCachedProfile(profile: SkinProfile) {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile))
  } catch {
    // ignore write failures (e.g. private browsing)
  }
}

export class SkinApiError extends Error {}

/**
 * Sends the (already client-compressed) photo to the backend for analysis.
 * Mirrors a successful result into localStorage so the page can render
 * instantly on return visits without a network round trip.
 */
export async function analyzeUser(
  image: CompressedImage,
  opts: { forceRefresh?: boolean } = {}
): Promise<SkinProfile> {
  const url = new URL('/api/analyze-user', API_BASE_URL)
  if (opts.forceRefresh) url.searchParams.set('refresh', 'true')

  let res: Response
  try {
    res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: getDeviceId(), image }),
    })
  } catch {
    throw new SkinApiError('Could not reach the analysis service. Check your connection and try again.')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new SkinApiError(body?.error || 'Analysis failed. Please try again.')
  }

  const profile = (await res.json()) as SkinProfile
  saveCachedProfile(profile)
  return profile
}
