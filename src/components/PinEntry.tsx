import { useState, useRef, useEffect } from 'react'
import { LockIcon, XIcon } from 'lucide-react'

interface PinEntryProps {
  title: string
  description?: string
  onSubmit: (pin: string) => boolean
  onCancel: () => void
}

export default function PinEntry({ title, description, onSubmit, onCancel }: PinEntryProps) {
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    inputRefs[0].current?.focus()
  }, [])

  const handleInput = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    setError('')

    // Move to next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus()
    }

    // Auto-submit when complete
    if (value && index === 3) {
      const fullPin = newPin.join('')
      if (fullPin.length === 4) {
        const success = onSubmit(fullPin)
        if (!success) {
          setError('Incorrect PIN')
          setShake(true)
          setTimeout(() => {
            setShake(false)
            setPin(['', '', '', ''])
            inputRefs[0].current?.focus()
          }, 500)
        }
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pasted.length === 4) {
      const newPin = pasted.split('')
      setPin(newPin)
      const success = onSubmit(pasted)
      if (!success) {
        setError('Incorrect PIN')
        setShake(true)
        setTimeout(() => {
          setShake(false)
          setPin(['', '', '', ''])
          inputRefs[0].current?.focus()
        }, 500)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <LockIcon className="w-5 h-5 text-sfbb-500" />
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-400"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {description && (
            <p className="text-base text-slate-600 text-center mb-6">{description}</p>
          )}

          <div
            className={`flex justify-center gap-4 ${shake ? 'animate-shake' : ''}`}
            onPaste={handlePaste}
          >
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleInput(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                className="w-16 h-16 text-center text-3xl font-bold border-2 border-slate-300 rounded-xl focus:border-sfbb-500 focus:outline-none focus:ring-2 focus:ring-sfbb-200 transition-colors"
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-red-600 text-base mt-4 font-medium">{error}</p>
          )}

          <p className="text-center text-slate-400 text-sm mt-6">
            Enter your 4-digit PIN
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}
