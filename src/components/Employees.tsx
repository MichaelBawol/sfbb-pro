import { useState } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import {
  UsersIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  XIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  AwardIcon,
} from 'lucide-react'
import { Employee, Certificate } from '../types'

export default function Employees() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useAppContext()
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCertForm, setShowCertForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    role: 'staff' as 'admin' | 'manager' | 'staff',
    email: '',
    phone: '',
    startDate: '',
    certificates: [] as Certificate[],
  })
  const [certFormData, setCertFormData] = useState({
    name: '',
    issueDate: '',
    expiryDate: '',
  })

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openEditForm = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      role: employee.role,
      email: employee.email || '',
      phone: employee.phone || '',
      startDate: employee.startDate,
      certificates: employee.certificates,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'staff',
      email: '',
      phone: '',
      startDate: '',
      certificates: [],
    })
    setEditingEmployee(null)
    setShowForm(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const employeeData = {
      name: formData.name,
      role: formData.role,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      startDate: formData.startDate,
      certificates: formData.certificates,
      trainingRecords: editingEmployee?.trainingRecords || [],
    }

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeData)
    } else {
      addEmployee(employeeData)
    }

    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id)
    }
  }

  const addCertificate = () => {
    const newCert: Certificate = {
      id: crypto.randomUUID(),
      name: certFormData.name,
      issueDate: certFormData.issueDate,
      expiryDate: certFormData.expiryDate || null,
    }
    setFormData(prev => ({
      ...prev,
      certificates: [...prev.certificates, newCert],
    }))
    setCertFormData({ name: '', issueDate: '', expiryDate: '' })
    setShowCertForm(false)
  }

  const removeCertificate = (certId: string) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter(c => c.id !== certId),
    }))
  }

  const isCertExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isCertExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-500 mt-1">Manage staff and training records</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search employees..."
          className="input pl-10"
        />
      </div>

      {/* Employee List */}
      {filteredEmployees.length === 0 ? (
        <div className="card p-8 text-center">
          <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {employees.length === 0 ? 'No employees yet' : 'No employees match your search'}
          </h3>
          <p className="text-slate-500 mb-4">
            {employees.length === 0 && 'Add your staff members to track their training and certificates'}
          </p>
          {employees.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add First Employee
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredEmployees.map(employee => (
            <div key={employee.id} className="card p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-sfbb-100 rounded-full flex items-center justify-center">
                    <span className="text-sfbb-700 font-semibold text-lg">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                    <p className="text-sm text-slate-500 capitalize">{employee.role}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditForm(employee)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                {employee.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MailIcon className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${employee.email}`} className="hover:text-sfbb-600">
                      {employee.email}
                    </a>
                  </div>
                )}
                {employee.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <PhoneIcon className="w-4 h-4 text-slate-400" />
                    <a href={`tel:${employee.phone}`} className="hover:text-sfbb-600">
                      {employee.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                  <span>Started {new Date(employee.startDate).toLocaleDateString('en-GB')}</span>
                </div>
              </div>

              {/* Certificates */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <AwardIcon className="w-4 h-4 text-sfbb-500" />
                  <span className="text-sm font-medium text-slate-700">Certificates</span>
                </div>
                {employee.certificates.length === 0 ? (
                  <p className="text-sm text-slate-400">No certificates recorded</p>
                ) : (
                  <div className="space-y-2">
                    {employee.certificates.map(cert => (
                      <div
                        key={cert.id}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          isCertExpired(cert.expiryDate)
                            ? 'bg-red-50'
                            : isCertExpiringSoon(cert.expiryDate)
                            ? 'bg-amber-50'
                            : 'bg-slate-50'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">{cert.name}</p>
                          <p className="text-xs text-slate-500">
                            Issued: {new Date(cert.issueDate).toLocaleDateString('en-GB')}
                            {cert.expiryDate && (
                              <> | Expires: {new Date(cert.expiryDate).toLocaleDateString('en-GB')}</>
                            )}
                          </p>
                        </div>
                        {isCertExpired(cert.expiryDate) ? (
                          <span className="badge badge-danger">Expired</span>
                        ) : isCertExpiringSoon(cert.expiryDate) ? (
                          <span className="badge badge-warning">Expiring Soon</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Employee Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <button
                onClick={resetForm}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-400"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div>
                  <label className="label">Role *</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'manager' | 'staff' })}
                    className="input"
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    placeholder="07700 900123"
                  />
                </div>
              </div>

              <div>
                <label className="label">Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="input"
                  required
                />
              </div>

              {/* Certificates Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Certificates</label>
                  <button
                    type="button"
                    onClick={() => setShowCertForm(true)}
                    className="text-sm text-sfbb-600 hover:text-sfbb-700 font-medium"
                  >
                    + Add Certificate
                  </button>
                </div>

                {formData.certificates.length === 0 ? (
                  <p className="text-sm text-slate-400 py-2">No certificates added</p>
                ) : (
                  <div className="space-y-2">
                    {formData.certificates.map(cert => (
                      <div
                        key={cert.id}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">{cert.name}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(cert.issueDate).toLocaleDateString('en-GB')}
                            {cert.expiryDate && (
                              <> - {new Date(cert.expiryDate).toLocaleDateString('en-GB')}</>
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCertificate(cert.id)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Certificate Inline Form */}
                {showCertForm && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg space-y-3">
                    <input
                      type="text"
                      value={certFormData.name}
                      onChange={e => setCertFormData({ ...certFormData, name: e.target.value })}
                      className="input"
                      placeholder="Certificate name"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={certFormData.issueDate}
                        onChange={e => setCertFormData({ ...certFormData, issueDate: e.target.value })}
                        className="input"
                        placeholder="Issue date"
                      />
                      <input
                        type="date"
                        value={certFormData.expiryDate}
                        onChange={e => setCertFormData({ ...certFormData, expiryDate: e.target.value })}
                        className="input"
                        placeholder="Expiry date (optional)"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCertForm(false)}
                        className="btn-secondary text-sm py-1.5 px-3"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addCertificate}
                        disabled={!certFormData.name || !certFormData.issueDate}
                        className="btn-primary text-sm py-1.5 px-3"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingEmployee ? 'Update' : 'Add'} Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
