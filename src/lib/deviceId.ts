const DEVICE_ID_KEY = 'dara_device_id'

/**
 * Anonymous per-device id used to key the skin-tone profile cache on the
 * backend. There's no auth/DB yet, so this is a placeholder identity —
 * swap for a real authenticated user id once accounts exist. Clearing
 * localStorage or switching devices starts a fresh profile.
 */
export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
    return id
  } catch {
    // Private browsing / storage disabled — fall back to a session-only id.
    return crypto.randomUUID()
  }
}
