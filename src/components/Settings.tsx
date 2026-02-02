import { useState, useEffect } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import {
  BuildingIcon,
  ThermometerIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  XIcon,
  SaveIcon,
  RefreshCwIcon,
  UsersIcon,
  LockIcon,
  ShieldIcon,
  CheckIcon,
  ClipboardListIcon,
  LogOutIcon,
} from 'lucide-react'
import { Appliance, Employee, EmployeePrivilege, ROLE_PRIVILEGES, PRIVILEGE_LABELS } from '../types'
import PinEntry from './PinEntry'
import ChecklistManager from './ChecklistManager'

export default function Settings() {
  const {
    business,
    updateBusiness,
    appliances,
    addAppliance,
    updateAppliance,
    deleteAppliance,
    employees,
    updateEmployee,
    settingsUnlocked,
    unlockSettings,
    lockSettings,
    updatePin,
    setPin,
    hasPin,
    user,
    logout,
  } = useAppContext()

  const [activeSection, setActiveSection] = useState<'business' | 'appliances' | 'employees' | 'checklists' | 'security'>('business')
  const [showApplianceForm, setShowApplianceForm] = useState(false)
  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [showChangePinForm, setShowChangePinForm] = useState(false)
  const [pinForm, setPinForm] = useState({ oldPin: '', newPin: '', confirmPin: '' })
  const [createPinForm, setCreatePinForm] = useState({ pin: '', confirmPin: '' })
  const [pinError, setPinError] = useState('')
  const [pinSuccess, setPinSuccess] = useState('')
  const [createPinError, setCreatePinError] = useState('')

  // Computed states - no useEffect needed
  const userHasPin = hasPin()
  const needsCreatePin = !settingsUnlocked && !userHasPin
  const needsPinEntry = !settingsUnlocked && userHasPin

  const [businessForm, setBusinessForm] = useState({
    name: business?.name || '',
    address: business?.address || '',
    phone: business?.phone || '',
    email: business?.email || '',
    managerName: business?.managerName || '',
    foodHygieneRating: business?.foodHygieneRating || 5,
    lastInspectionDate: business?.lastInspectionDate || '',
  })

  const [applianceForm, setApplianceForm] = useState({
    name: '',
    type: 'fridge' as Appliance['type'],
    location: '',
    minTemp: '',
    maxTemp: '',
  })

  // Lock settings when leaving the page (unmount only)
  useEffect(() => {
    return () => {
      lockSettings()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update form when business data loads
  useEffect(() => {
    if (business) {
      setBusinessForm({
        name: business.name || '',
        address: business.address || '',
        phone: business.phone || '',
        email: business.email || '',
        managerName: business.managerName || '',
        foodHygieneRating: business.foodHygieneRating ?? 5,
        lastInspectionDate: business.lastInspectionDate || '',
      })
    }
  }, [business])

  const handlePinSubmit = (pin: string): boolean => {
    if (user?.pin === pin) {
      unlockSettings(pin)
      return true
    }
    return false
  }

  const handleCreatePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCreatePinError('')

    if (createPinForm.pin.length !== 4 || !/^\d+$/.test(createPinForm.pin)) {
      setCreatePinError('PIN must be exactly 4 digits')
      return
    }

    if (createPinForm.pin !== createPinForm.confirmPin) {
      setCreatePinError('PINs do not match')
      return
    }

    setPin(createPinForm.pin)
  }

  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateBusiness({
      ...businessForm,
      foodHygieneRating: Number(businessForm.foodHygieneRating),
    })
    alert('Business details updated!')
  }

  const openApplianceEdit = (appliance: Appliance) => {
    setEditingAppliance(appliance)
    setApplianceForm({
      name: appliance.name,
      type: appliance.type,
      location: appliance.location || '',
      minTemp: appliance.minTemp?.toString() || '',
      maxTemp: appliance.maxTemp?.toString() || '',
    })
    setShowApplianceForm(true)
  }

  const resetApplianceForm = () => {
    setApplianceForm({
      name: '',
      type: 'fridge',
      location: '',
      minTemp: '',
      maxTemp: '',
    })
    setEditingAppliance(null)
    setShowApplianceForm(false)
  }

  const handleApplianceSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      name: applianceForm.name,
      type: applianceForm.type,
      location: applianceForm.location || undefined,
      minTemp: applianceForm.minTemp ? Number(applianceForm.minTemp) : undefined,
      maxTemp: applianceForm.maxTemp ? Number(applianceForm.maxTemp) : undefined,
    }

    if (editingAppliance) {
      updateAppliance(editingAppliance.id, data)
    } else {
      addAppliance(data)
    }

    resetApplianceForm()
  }

  const handleDeleteAppliance = (id: string) => {
    if (confirm('Are you sure you want to delete this appliance?')) {
      deleteAppliance(id)
    }
  }

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
      localStorage.removeItem('sfbb_pro_data')
      window.location.reload()
    }
  }

  const handleEmployeeRoleChange = (employeeId: string, newRole: 'admin' | 'manager' | 'staff') => {
    updateEmployee(employeeId, { role: newRole, customPrivileges: undefined })
  }

  const handlePrivilegeToggle = (employeeId: string, privilege: EmployeePrivilege) => {
    const employee = employees.find(e => e.id === employeeId)
    if (!employee) return

    const currentPrivileges = employee.customPrivileges || ROLE_PRIVILEGES[employee.role]
    const newPrivileges = currentPrivileges.includes(privilege)
      ? currentPrivileges.filter(p => p !== privilege)
      : [...currentPrivileges, privilege]

    updateEmployee(employeeId, { customPrivileges: newPrivileges })
  }

  const getEmployeePrivileges = (employee: Employee): EmployeePrivilege[] => {
    return employee.customPrivileges || ROLE_PRIVILEGES[employee.role]
  }

  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPinError('')
    setPinSuccess('')

    if (pinForm.newPin.length !== 4 || !/^\d+$/.test(pinForm.newPin)) {
      setPinError('New PIN must be exactly 4 digits')
      return
    }

    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinError('New PINs do not match')
      return
    }

    const success = await updatePin(pinForm.oldPin, pinForm.newPin)
    if (success) {
      setPinSuccess('PIN changed successfully!')
      setPinForm({ oldPin: '', newPin: '', confirmPin: '' })
      setTimeout(() => {
        setShowChangePinForm(false)
        setPinSuccess('')
      }, 2000)
    } else {
      setPinError('Current PIN is incorrect')
    }
  }

  const applianceTypes = [
    { value: 'fridge', label: 'Fridge' },
    { value: 'freezer', label: 'Freezer' },
    { value: 'hot_hold', label: 'Hot Hold' },
    { value: 'dishwasher', label: 'Dishwasher' },
    { value: 'probe', label: 'Probe Thermometer' },
  ]

  // Show Create PIN if user doesn't have one
  if (needsCreatePin) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <LockIcon className="w-5 h-5 text-sfbb-500" />
              <h2 className="text-lg font-semibold text-slate-900">Create Settings PIN</h2>
            </div>
          </div>
          <form onSubmit={handleCreatePinSubmit} className="p-6 space-y-4">
            <p className="text-sm text-slate-600 text-center">
              Create a 4-digit PIN to protect your settings. You'll need this PIN to access settings in the future.
            </p>

            {createPinError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {createPinError}
              </div>
            )}

            <div>
              <label className="label">Create PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={createPinForm.pin}
                onChange={e => setCreatePinForm({ ...createPinForm, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                className="input text-center text-xl tracking-widest"
                placeholder="••••"
                autoFocus
              />
            </div>

            <div>
              <label className="label">Confirm PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={createPinForm.confirmPin}
                onChange={e => setCreatePinForm({ ...createPinForm, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                className="input text-center text-xl tracking-widest"
                placeholder="••••"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Create PIN
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Show PIN entry if not unlocked
  if (needsPinEntry) {
    return (
      <PinEntry
        title="Enter PIN"
        description="Enter your 4-digit PIN to access settings"
        onSubmit={handlePinSubmit}
        onCancel={() => window.history.back()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your business and app settings</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <ShieldIcon className="w-4 h-4" />
          <span>PIN Protected</span>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSection('business')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'business'
              ? 'bg-sfbb-100 text-sfbb-700'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BuildingIcon className="w-4 h-4" />
          Business
        </button>
        <button
          onClick={() => setActiveSection('appliances')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'appliances'
              ? 'bg-sfbb-100 text-sfbb-700'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ThermometerIcon className="w-4 h-4" />
          Appliances
        </button>
        <button
          onClick={() => setActiveSection('employees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'employees'
              ? 'bg-sfbb-100 text-sfbb-700'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UsersIcon className="w-4 h-4" />
          Employee Privileges
        </button>
        <button
          onClick={() => setActiveSection('checklists')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'checklists'
              ? 'bg-sfbb-100 text-sfbb-700'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ClipboardListIcon className="w-4 h-4" />
          Checklists
        </button>
        <button
          onClick={() => setActiveSection('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'security'
              ? 'bg-sfbb-100 text-sfbb-700'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LockIcon className="w-4 h-4" />
          Security
        </button>
      </div>

      {/* Business Details Section */}
      {activeSection === 'business' && (
        <div className="card p-6">
          <form onSubmit={handleBusinessSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Business Name</label>
                <input
                  type="text"
                  value={businessForm.name}
                  onChange={e => setBusinessForm({ ...businessForm, name: e.target.value })}
                  className="input"
                  placeholder="Your Business Name"
                />
              </div>
              <div>
                <label className="label">Manager Name</label>
                <input
                  type="text"
                  value={businessForm.managerName}
                  onChange={e => setBusinessForm({ ...businessForm, managerName: e.target.value })}
                  className="input"
                  placeholder="John Smith"
                />
              </div>
            </div>

            <div>
              <label className="label">Address</label>
              <input
                type="text"
                value={businessForm.address}
                onChange={e => setBusinessForm({ ...businessForm, address: e.target.value })}
                className="input"
                placeholder="123 High Street, London, EC1A 1BB"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  value={businessForm.phone}
                  onChange={e => setBusinessForm({ ...businessForm, phone: e.target.value })}
                  className="input"
                  placeholder="020 1234 5678"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={businessForm.email}
                  onChange={e => setBusinessForm({ ...businessForm, email: e.target.value })}
                  className="input"
                  placeholder="info@business.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Food Hygiene Rating</label>
                <select
                  value={businessForm.foodHygieneRating}
                  onChange={e => setBusinessForm({ ...businessForm, foodHygieneRating: Number(e.target.value) })}
                  className="input"
                >
                  {[0, 1, 2, 3, 4, 5].map(rating => (
                    <option key={rating} value={rating}>
                      {rating} - {rating === 5 ? 'Very Good' : rating === 4 ? 'Good' : rating === 3 ? 'Generally Satisfactory' : rating === 2 ? 'Improvement Necessary' : rating === 1 ? 'Major Improvement Necessary' : 'Urgent Improvement Necessary'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Last Inspection Date</label>
                <input
                  type="date"
                  value={businessForm.lastInspectionDate}
                  onChange={e => setBusinessForm({ ...businessForm, lastInspectionDate: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <SaveIcon className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appliances Section */}
      {activeSection === 'appliances' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-slate-600">
              Manage the appliances you monitor for temperature compliance
            </p>
            <button
              onClick={() => setShowApplianceForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Appliance
            </button>
          </div>

          {appliances.length === 0 ? (
            <div className="card p-8 text-center">
              <ThermometerIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No appliances configured</h3>
              <p className="text-slate-500 mb-4">
                Add your fridges, freezers, and other equipment to track temperatures
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appliances.map(appliance => (
                <div key={appliance.id} className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{appliance.name}</h3>
                      <span className="badge badge-info capitalize">{appliance.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openApplianceEdit(appliance)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAppliance(appliance.id)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {appliance.location && (
                    <p className="text-sm text-slate-500 mb-2">{appliance.location}</p>
                  )}
                  {(appliance.minTemp !== undefined || appliance.maxTemp !== undefined) && (
                    <p className="text-sm text-slate-600">
                      Target: {appliance.minTemp}°C - {appliance.maxTemp}°C
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Employee Privileges Section */}
      {activeSection === 'employees' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-1">Role-Based Access Control</h3>
            <p className="text-sm text-blue-700">
              Assign roles to employees to control what features they can access. You can also customize individual privileges.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="card p-4">
              <h4 className="font-semibold text-slate-900 mb-2">Admin</h4>
              <p className="text-sm text-slate-500">Full access to all features including settings</p>
            </div>
            <div className="card p-4">
              <h4 className="font-semibold text-slate-900 mb-2">Manager</h4>
              <p className="text-sm text-slate-500">Can manage employees, suppliers, and view all records</p>
            </div>
            <div className="card p-4">
              <h4 className="font-semibold text-slate-900 mb-2">Staff</h4>
              <p className="text-sm text-slate-500">Can complete daily tasks and view own records</p>
            </div>
          </div>

          {employees.length === 0 ? (
            <div className="card p-8 text-center">
              <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No employees</h3>
              <p className="text-slate-500">
                Add employees in the Employees section to manage their privileges
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map(employee => (
                <div key={employee.id} className="card">
                  <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sfbb-100 rounded-full flex items-center justify-center">
                          <span className="text-sfbb-700 font-semibold">
                            {employee.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                          <p className="text-sm text-slate-500">{employee.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600">Role:</label>
                        <select
                          value={employee.role}
                          onChange={e => handleEmployeeRoleChange(employee.id, e.target.value as 'admin' | 'manager' | 'staff')}
                          className="input w-auto py-1.5"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="staff">Staff</option>
                        </select>
                        <button
                          onClick={() => setEditingEmployee(editingEmployee?.id === employee.id ? null : employee)}
                          className="btn-secondary text-sm py-1.5 px-3"
                        >
                          {editingEmployee?.id === employee.id ? 'Close' : 'Customize'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {editingEmployee?.id === employee.id && (
                    <div className="p-4 bg-slate-50">
                      <h4 className="text-sm font-medium text-slate-700 mb-3">Custom Privileges</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {(Object.keys(PRIVILEGE_LABELS) as EmployeePrivilege[]).map(privilege => {
                          const hasPrivilege = getEmployeePrivileges(employee).includes(privilege)
                          return (
                            <label
                              key={privilege}
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                hasPrivilege ? 'bg-emerald-100' : 'bg-white border border-slate-200'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={hasPrivilege}
                                onChange={() => handlePrivilegeToggle(employee.id, privilege)}
                                className="rounded border-slate-300 text-sfbb-600 focus:ring-sfbb-500"
                              />
                              <span className="text-sm text-slate-700">{PRIVILEGE_LABELS[privilege]}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Checklists Section */}
      {activeSection === 'checklists' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-1">Customize Checklists</h3>
            <p className="text-sm text-blue-700">
              Add, edit, or remove items from your opening/closing checks and cleaning schedules.
            </p>
          </div>
          <ChecklistManager />
        </div>
      )}

      {/* Security Section */}
      {activeSection === 'security' && (
        <div className="space-y-6">
          {/* Change PIN */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-sfbb-100 rounded-lg">
                <LockIcon className="w-5 h-5 text-sfbb-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Settings PIN</h3>
                <p className="text-sm text-slate-500">
                  Change your 4-digit PIN used to access settings
                </p>
              </div>
            </div>

            {showChangePinForm ? (
              <form onSubmit={handleChangePinSubmit} className="space-y-4 max-w-sm">
                {pinError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {pinError}
                  </div>
                )}
                {pinSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
                    <CheckIcon className="w-4 h-4" />
                    {pinSuccess}
                  </div>
                )}

                <div>
                  <label className="label">Current PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pinForm.oldPin}
                    onChange={e => setPinForm({ ...pinForm, oldPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="input text-center text-lg tracking-widest"
                    placeholder="••••"
                  />
                </div>

                <div>
                  <label className="label">New PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pinForm.newPin}
                    onChange={e => setPinForm({ ...pinForm, newPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="input text-center text-lg tracking-widest"
                    placeholder="••••"
                  />
                </div>

                <div>
                  <label className="label">Confirm New PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pinForm.confirmPin}
                    onChange={e => setPinForm({ ...pinForm, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="input text-center text-lg tracking-widest"
                    placeholder="••••"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePinForm(false)
                      setPinForm({ oldPin: '', newPin: '', confirmPin: '' })
                      setPinError('')
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Update PIN
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowChangePinForm(true)}
                className="btn-secondary"
              >
                Change PIN
              </button>
            )}
          </div>

          {/* Current User Info */}
          {user && (
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Account Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name</span>
                  <span className="text-slate-900">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="text-slate-900">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Role</span>
                  <span className="badge badge-info capitalize">{user.role}</span>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <LogOutIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Sign Out</h3>
                <p className="text-sm text-slate-500">
                  Sign out of your account to switch users or secure this device
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to sign out?')) {
                  logout()
                }
              }}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <LogOutIcon className="w-5 h-5" />
              Sign Out
            </button>
          </div>

          {/* Danger Zone */}
          <div className="card p-6 border-red-200">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Danger Zone</h3>
            <p className="text-slate-600 mb-4">
              Clear all stored data. This will remove all records, settings, and return to defaults.
            </p>
            <button
              onClick={clearAllData}
              className="btn-danger flex items-center gap-2"
            >
              <RefreshCwIcon className="w-4 h-4" />
              Reset All Data
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Appliance Modal */}
      {showApplianceForm && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingAppliance ? 'Edit Appliance' : 'Add Appliance'}
              </h2>
              <button
                onClick={resetApplianceForm}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-400"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleApplianceSubmit} className="p-4 space-y-4">
              <div>
                <label className="label">Appliance Name *</label>
                <input
                  type="text"
                  value={applianceForm.name}
                  onChange={e => setApplianceForm({ ...applianceForm, name: e.target.value })}
                  className="input"
                  placeholder="Main Fridge"
                  required
                />
              </div>

              <div>
                <label className="label">Type *</label>
                <select
                  value={applianceForm.type}
                  onChange={e => setApplianceForm({ ...applianceForm, type: e.target.value as Appliance['type'] })}
                  className="input"
                >
                  {applianceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Location</label>
                <input
                  type="text"
                  value={applianceForm.location}
                  onChange={e => setApplianceForm({ ...applianceForm, location: e.target.value })}
                  className="input"
                  placeholder="Kitchen, Back Store, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Min Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={applianceForm.minTemp}
                    onChange={e => setApplianceForm({ ...applianceForm, minTemp: e.target.value })}
                    className="input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="label">Max Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={applianceForm.maxTemp}
                    onChange={e => setApplianceForm({ ...applianceForm, maxTemp: e.target.value })}
                    className="input"
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetApplianceForm} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingAppliance ? 'Update' : 'Add'} Appliance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
