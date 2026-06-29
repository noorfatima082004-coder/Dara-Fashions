import { useEffect, useRef, useState } from 'react'

export function useAnimatedCounter(target: number, duration = 400) {
  const [display, setDisplay] = useState(target)
  const valueRef = useRef(target)
  const frameRef = useRef<number>()

  useEffect(() => {
    const start = valueRef.current
    if (start === target) return

    const diff = target - start
    const startTime = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = Math.round(start + diff * eased)
      setDisplay(next)
      valueRef.current = next
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration])

  return display
}
