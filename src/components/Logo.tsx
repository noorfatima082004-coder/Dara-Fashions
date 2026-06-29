export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img src="/logo.png" alt="Dara" className="mb-2 h-14 w-14 object-contain" />
      <span className="font-serif text-2xl font-medium tracking-[0.12em] text-dara-charcoal">
        Dara
      </span>
    </div>
  )
}

export function LogoSmall() {
  return (
    <div className="flex items-center gap-2">
      <img src="/logo.png" alt="Dara" className="h-7 w-7 object-contain" />
      <span className="font-serif text-lg font-medium tracking-[0.08em]">Dara</span>
    </div>
  )
}
