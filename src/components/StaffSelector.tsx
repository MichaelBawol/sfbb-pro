import { useState, useEffect } from 'react'
import { useAppContext } from '../hooks/useAppContext'

const LAST_STAFF_KEY = 'sfbb-last-staff'

interface StaffSelectorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  placeholder?: string
}

export default function StaffSelector({
  value,
  onChange,
  label = 'Performed By',
  required = false,
  placeholder = 'Select or enter name',
}: StaffSelectorProps) {
  const { employees, user } = useAppContext()
  const [isCustom, setIsCustom] = useState(false)

  // Get all staff names (employees + current user)
  const staffNames = [
    ...(user?.name ? [user.name] : []),
    ...employees.map(e => e.name),
  ].filter((name, index, arr) => arr.indexOf(name) === index) // Remove duplicates

  // On mount, set default to last used or current user
  useEffect(() => {
    if (!value) {
      const lastUsed = localStorage.getItem(LAST_STAFF_KEY)
      if (lastUsed && (staffNames.includes(lastUsed) || lastUsed)) {
        onChange(lastUsed)
        setIsCustom(!staffNames.includes(lastUsed))
      } else if (user?.name) {
        onChange(user.name)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Save to localStorage when value changes
  useEffect(() => {
    if (value) {
      localStorage.setItem(LAST_STAFF_KEY, value)
    }
  }, [value])

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === '__custom__') {
      setIsCustom(true)
      onChange('')
    } else {
      setIsCustom(false)
      onChange(selectedValue)
    }
  }

  return (
    <div>
      {label && (
        <label className="label">
          {label} {required && '*'}
        </label>
      )}

      {staffNames.length > 0 && !isCustom ? (
        <select
          value={value || ''}
          onChange={e => handleSelectChange(e.target.value)}
          className="input"
          required={required}
        >
          <option value="">{placeholder}</option>
          {staffNames.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
          <option value="__custom__">Other (enter name)</option>
        </select>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="input"
            placeholder="Enter name"
            required={required}
          />
          {staffNames.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setIsCustom(false)
                onChange('')
              }}
              className="text-sm text-sfbb-600 hover:text-sfbb-700"
            >
              ← Select from list
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Hook version for simpler usage
export function useLastStaff() {
  const { user } = useAppContext()

  const getLastStaff = (): string => {
    const lastUsed = localStorage.getItem(LAST_STAFF_KEY)
    return lastUsed || user?.name || ''
  }

  const setLastStaff = (name: string) => {
    if (name) {
      localStorage.setItem(LAST_STAFF_KEY, name)
    }
  }

  return { getLastStaff, setLastStaff }
}
