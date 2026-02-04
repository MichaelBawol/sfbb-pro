import { ReactNode } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import { SubscriptionFeature, TIER_LABELS } from '../types'
import { LockIcon, SparklesIcon } from 'lucide-react'

interface FeatureGateProps {
  feature: SubscriptionFeature
  children: ReactNode
  fallback?: ReactNode
  showUpgradePrompt?: boolean
}

export default function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
}: FeatureGateProps) {
  const { hasFeature, subscription, setActiveTab } = useAppContext()

  if (hasFeature(feature)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showUpgradePrompt) {
    return null
  }

  const currentTier = subscription?.tier || 'free'

  return (
    <div className="relative">
      {/* Blurred/disabled content preview */}
      <div className="opacity-50 pointer-events-none select-none blur-sm">
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
        <div className="text-center p-6 max-w-sm">
          <div className="w-12 h-12 bg-sfbb-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockIcon className="w-6 h-6 text-sfbb-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Premium Feature
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            This feature requires the Professional plan.
            {currentTier === 'free' && ' Start your free trial to unlock all features.'}
          </p>
          <button
            onClick={() => setActiveTab('settings')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <SparklesIcon className="w-4 h-4" />
            {currentTier === 'free' ? 'Start Free Trial' : 'Upgrade to Professional'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface FeatureButtonProps {
  feature: SubscriptionFeature
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function FeatureButton({
  feature,
  children,
  onClick,
  className = '',
  disabled = false,
}: FeatureButtonProps) {
  const { hasFeature, setActiveTab } = useAppContext()

  const handleClick = () => {
    if (hasFeature(feature)) {
      onClick?.()
    } else {
      setActiveTab('settings')
    }
  }

  const isLocked = !hasFeature(feature)

  return (
    <button
      onClick={handleClick}
      className={`${className} ${isLocked ? 'relative' : ''}`}
      disabled={disabled}
    >
      {children}
      {isLocked && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-sfbb-500 rounded-full flex items-center justify-center">
          <LockIcon className="w-3 h-3 text-white" />
        </span>
      )}
    </button>
  )
}

interface UpgradeBadgeProps {
  tier?: 'starter' | 'professional'
  className?: string
}

export function UpgradeBadge({ tier = 'professional', className = '' }: UpgradeBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-sfbb-500 to-sfbb-600 text-white ${className}`}>
      <SparklesIcon className="w-3 h-3" />
      {TIER_LABELS[tier]}
    </span>
  )
}
