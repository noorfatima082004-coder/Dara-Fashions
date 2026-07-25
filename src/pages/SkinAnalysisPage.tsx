import { useRef, useState } from 'react'
import { Camera, Sparkles, RefreshCw, AlertCircle } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { PageHeader } from '../components/PageHeader'
import { AnimateIn } from '../components/AnimateIn'
import { compressImage } from '../lib/imageCompress'
import { analyzeUser, loadCachedProfile, SkinApiError, type SkinProfile } from '../lib/skinApi'

type Status = 'idle' | 'loading' | 'error'

const SEASON_LABEL: Record<SkinProfile['season'], string> = {
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
}

function ColorChip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dara-gray-dark px-3 py-1.5 text-xs text-dara-charcoal">
      {name}
    </span>
  )
}

export function SkinAnalysisPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<SkinProfile | null>(() => loadCachedProfile())
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const runAnalysis = async (file: File, forceRefresh: boolean) => {
    setStatus('loading')
    setError(null)
    try {
      const image = await compressImage(file)
      const result = await analyzeUser(image, { forceRefresh })
      setProfile(result)
      setStatus('idle')
    } catch (err) {
      setError(err instanceof SkinApiError ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) runAnalysis(file, Boolean(profile))
  }

  const openPicker = () => inputRef.current?.click()

  return (
    <AppLayout>
      <PageHeader title="Color Analysis" backTo="/home" />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="px-4 pb-10 pt-2">
        {status === 'loading' && (
          <AnimateIn animation="fade-in" className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 h-14 w-14 animate-spin rounded-full border-2 border-dara-gray-dark border-t-dara-tan" />
            <p className="text-sm text-gray-500">Analyzing your photo…</p>
          </AnimateIn>
        )}

        {status === 'error' && (
          <AnimateIn animation="fade-in" className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-dara-gray">
              <AlertCircle size={26} strokeWidth={1.2} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">{error}</p>
            <button
              onClick={openPicker}
              className="btn-shimmer press-scale mt-5 rounded-dara bg-dara-charcoal px-6 py-2.5 text-xs font-semibold tracking-wider text-white transition-colors hover:bg-black"
            >
              TRY AGAIN
            </button>
          </AnimateIn>
        )}

        {status === 'idle' && !profile && (
          <AnimateIn animation="fade-up" className="flex flex-col items-center px-2 py-12 text-center">
            <div className="animate-float mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-dara-gray">
              <Sparkles size={30} className="text-dara-tan" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif text-xl font-medium">Discover Your Colors</h2>
            <p className="mt-2 max-w-xs text-sm text-gray-500">
              Take or upload a clear, well-lit photo of your face and we&apos;ll work out your
              undertone, season, and the colors that suit you best.
            </p>
            <button
              onClick={openPicker}
              className="btn-shimmer press-scale mt-6 flex items-center gap-2 rounded-dara bg-dara-charcoal px-6 py-3 text-xs font-semibold tracking-wider text-white transition-colors hover:bg-black"
            >
              <Camera size={16} strokeWidth={1.5} />
              ANALYZE MY SKIN TONE
            </button>
          </AnimateIn>
        )}

        {status === 'idle' && profile && (
          <>
            <AnimateIn animation="scale-in" className="flex flex-col items-center pt-6 text-center">
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-dara-gray">
                <Sparkles size={30} className="text-dara-tan" strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-xl font-medium">{SEASON_LABEL[profile.season]}</h2>
              <p className="mt-1 text-sm capitalize text-gray-500">
                {profile.undertone} undertone · {profile.skinTone}
              </p>
              {profile.source === 'deterministic_fallback' && (
                <span className="mt-2 rounded-full bg-dara-gray px-3 py-1 text-[10px] font-medium tracking-wide text-gray-500">
                  ESTIMATED — AI analysis unavailable
                </span>
              )}
            </AnimateIn>

            <AnimateIn animation="fade-up" delay={100} className="mt-8">
              <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500">
                COLORS THAT SUIT YOU
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.bestColors.map((c) => (
                  <ColorChip key={c} name={c} />
                ))}
              </div>
            </AnimateIn>

            <AnimateIn animation="fade-up" delay={200} className="mt-6">
              <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500">
                COLORS TO AVOID
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.avoidColors.map((c) => (
                  <ColorChip key={c} name={c} />
                ))}
              </div>
            </AnimateIn>

            <AnimateIn animation="fade-up" delay={300} className="mt-8">
              <button
                onClick={openPicker}
                className="press-scale flex w-full items-center justify-center gap-2 rounded-dara border border-dara-charcoal py-3 text-xs font-semibold tracking-wider text-dara-charcoal transition-colors hover:bg-dara-gray"
              >
                <RefreshCw size={14} strokeWidth={1.5} />
                RETAKE PHOTO
              </button>
            </AnimateIn>
          </>
        )}
      </div>
    </AppLayout>
  )
}
