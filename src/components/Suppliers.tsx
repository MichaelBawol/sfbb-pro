import { useState } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import {
  TruckIcon,
  PlusIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  StarIcon,
  EditIcon,
  TrashIcon,
  XIcon,
  CheckIcon,
} from 'lucide-react'
import { Supplier } from '../types'

// Common product categories for food suppliers
const COMMON_PRODUCTS = [
  'Fresh Vegetables',
  'Fresh Fruits',
  'Salads & Herbs',
  'Beef',
  'Chicken',
  'Pork',
  'Lamb',
  'Fish',
  'Seafood',
  'Dairy',
  'Eggs',
  'Cheese',
  'Bread & Bakery',
  'Frozen Foods',
  'Dry Goods',
  'Rice & Pasta',
  'Beverages',
  'Condiments & Sauces',
  'Spices & Seasonings',
  'Canned Goods',
  'Oils & Fats',
  'Cleaning Supplies',
  'Packaging & Disposables',
]

export default function Suppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useAppContext()
  const [showForm, setShowForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [customProduct, setCustomProduct] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    rating: 5,
    notes: '',
  })

  const openEditForm = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      rating: supplier.rating || 5,
      notes: supplier.notes || '',
    })
    setSelectedProducts(supplier.products || [])
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
      rating: 5,
      notes: '',
    })
    setSelectedProducts([])
    setCustomProduct('')
    setEditingSupplier(null)
    setShowForm(false)
  }

  const toggleProduct = (product: string) => {
    setSelectedProducts(prev =>
      prev.includes(product)
        ? prev.filter(p => p !== product)
        : [...prev, product]
    )
  }

  const addCustomProduct = () => {
    const trimmed = customProduct.trim()
    if (trimmed && !selectedProducts.includes(trimmed)) {
      setSelectedProducts(prev => [...prev, trimmed])
      setCustomProduct('')
    }
  }

  const removeProduct = (product: string) => {
    setSelectedProducts(prev => prev.filter(p => p !== product))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const supplierData = {
      name: formData.name,
      contact: formData.contact,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      address: formData.address || undefined,
      products: selectedProducts,
      rating: formData.rating,
      notes: formData.notes || undefined,
    }

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, supplierData)
    } else {
      addSupplier(supplierData)
    }

    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      deleteSupplier(id)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
          <p className="text-slate-500 mt-1">Manage your approved suppliers</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      {/* Supplier Grid */}
      {suppliers.length === 0 ? (
        <div className="card p-8 text-center">
          <TruckIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No suppliers yet</h3>
          <p className="text-slate-500 mb-4">
            Add your approved food suppliers to keep track of them
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add First Supplier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{supplier.name}</h3>
                  <p className="text-sm text-slate-500">{supplier.contact}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditForm(supplier)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.id)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {supplier.rating !== undefined && (
                <div className="flex items-center gap-1 mb-3">
                  {renderStars(supplier.rating)}
                </div>
              )}

              <div className="space-y-2 text-sm">
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <PhoneIcon className="w-4 h-4 text-slate-400" />
                    <a href={`tel:${supplier.phone}`} className="hover:text-sfbb-600">
                      {supplier.phone}
                    </a>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MailIcon className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${supplier.email}`} className="hover:text-sfbb-600 truncate">
                      {supplier.email}
                    </a>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-start gap-2 text-slate-600">
                    <MapPinIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                    <span>{supplier.address}</span>
                  </div>
                )}
              </div>

              {supplier.products.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-2">Products</p>
                  <div className="flex flex-wrap gap-1">
                    {supplier.products.map((product, i) => (
                      <span key={i} className="badge badge-info">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Supplier Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
              </h2>
              <button
                onClick={resetForm}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-400"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="label">Supplier Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Company name"
                  required
                />
              </div>

              <div>
                <label className="label">Contact Person *</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={e => setFormData({ ...formData, contact: e.target.value })}
                  className="input"
                  placeholder="Contact name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <label className="label">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="input"
                  placeholder="Business address"
                />
              </div>

              <div>
                <label className="label">Products</label>

                {/* Selected Products */}
                {selectedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedProducts.map(product => (
                      <span
                        key={product}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-sfbb-100 text-sfbb-700 rounded-full text-sm font-medium"
                      >
                        {product}
                        <button
                          type="button"
                          onClick={() => removeProduct(product)}
                          className="p-0.5 hover:bg-sfbb-200 rounded-full"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Common Products Grid */}
                <div className="border border-slate-200 rounded-xl p-3 mb-3 max-h-48 overflow-y-auto">
                  <p className="text-xs text-slate-500 mb-2">Select from common products:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {COMMON_PRODUCTS.map(product => {
                      const isSelected = selectedProducts.includes(product)
                      return (
                        <button
                          key={product}
                          type="button"
                          onClick={() => toggleProduct(product)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                            isSelected
                              ? 'bg-sfbb-100 text-sfbb-700'
                              : 'bg-slate-50 text-slate-700 active:bg-slate-100'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'bg-sfbb-500 border-sfbb-500'
                              : 'border-slate-300'
                          }`}>
                            {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span className="truncate">{product}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Custom Product Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customProduct}
                    onChange={e => setCustomProduct(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomProduct()
                      }
                    }}
                    className="input flex-1"
                    placeholder="Add custom product..."
                  />
                  <button
                    type="button"
                    onClick={addCustomProduct}
                    disabled={!customProduct.trim()}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium active:bg-slate-200 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1"
                    >
                      <StarIcon
                        className={`w-6 h-6 ${
                          star <= formData.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="input"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingSupplier ? 'Update' : 'Add'} Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
