import { User } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { PageHeader } from '../components/PageHeader'
import { AnimateIn } from '../components/AnimateIn'

export function AccountPage() {
  return (
    <AppLayout>
      <PageHeader title="Account" backTo="/home" />
      <div className="flex flex-col items-center px-4 py-12">
        <AnimateIn animation="scale-in">
          <div className="animate-float mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-dara-gray">
            <User size={32} className="text-gray-400" strokeWidth={1.5} />
          </div>
        </AnimateIn>
        <AnimateIn animation="fade-up" delay={150}>
          <h2 className="text-center font-serif text-xl font-medium">Welcome to Dara</h2>
        </AnimateIn>
        <AnimateIn animation="fade-up" delay={250}>
          <p className="mt-2 text-center text-sm text-gray-500">
            Sign in to track orders, save favorites, and more.
          </p>
        </AnimateIn>
        <AnimateIn animation="fade-up" delay={350} className="mt-6 w-full">
          <button className="btn-shimmer press-scale w-full rounded-dara bg-dara-charcoal py-3 text-xs font-semibold tracking-wider text-white transition-colors hover:bg-black">
            SIGN IN
          </button>
        </AnimateIn>
        <AnimateIn animation="fade-up" delay={450} className="mt-3 w-full">
          <button className="press-scale w-full rounded-dara border border-dara-charcoal py-3 text-xs font-semibold tracking-wider text-dara-charcoal transition-colors hover:bg-dara-gray">
            CREATE ACCOUNT
          </button>
        </AnimateIn>
      </div>
    </AppLayout>
  )
}
