import { useState } from 'react'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'
import { useAppContext } from '../hooks/useAppContext'
import {
  AlertTriangleIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  XIcon,
  InfoIcon,
  QrCodeIcon,
  ShareIcon,
  CopyIcon,
  CheckIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
} from 'lucide-react'
import { Dish, ALLERGENS } from '../types'

export default function Allergens() {
  const {
    dishes,
    addDish,
    updateDish,
    deleteDish,
    locations,
    activeLocationId,
    toggleAllergenSharing,
    regenerateAllergenShareCode,
  } = useAppContext()
  const [showForm, setShowForm] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAllergen, setFilterAllergen] = useState<string>('all')
  const [showQRModal, setShowQRModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isTogglingShare, setIsTogglingShare] = useState(false)

  // Get active location
  const activeLocation = locations.find(l => l.id === activeLocationId)
  const shareUrl = activeLocation?.allergenShareCode
    ? `${window.location.origin}/menu/${activeLocation.allergenShareCode}`
    : null

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    allergens: [] as string[],
    crossContaminationRisks: '',
    cookingInstructions: '',
    storageInstructions: '',
  })

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAllergen = filterAllergen === 'all' || dish.allergens.includes(filterAllergen)
    return matchesSearch && matchesAllergen
  })

  const openEditForm = (dish: Dish) => {
    setEditingDish(dish)
    setFormData({
      name: dish.name,
      description: dish.description || '',
      category: dish.category || '',
      allergens: dish.allergens,
      crossContaminationRisks: dish.crossContaminationRisks.join(', '),
      cookingInstructions: dish.cookingInstructions || '',
      storageInstructions: dish.storageInstructions || '',
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      allergens: [],
      crossContaminationRisks: '',
      cookingInstructions: '',
      storageInstructions: '',
    })
    setEditingDish(null)
    setShowForm(false)
  }

  const toggleAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const dishData = {
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category || undefined,
      allergens: formData.allergens,
      crossContaminationRisks: formData.crossContaminationRisks
        .split(',')
        .map(r => r.trim())
        .filter(Boolean),
      cookingInstructions: formData.cookingInstructions || undefined,
      storageInstructions: formData.storageInstructions || undefined,
    }

    if (editingDish) {
      updateDish(editingDish.id, dishData)
    } else {
      addDish(dishData)
    }

    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this dish?')) {
      deleteDish(id)
    }
  }

  const handleToggleSharing = async () => {
    if (!activeLocationId) return
    setIsTogglingShare(true)
    const newEnabled = !activeLocation?.allergenShareEnabled
    await toggleAllergenSharing(activeLocationId, newEnabled)
    setIsTogglingShare(false)
  }

  const handleRegenerateCode = async () => {
    if (!activeLocationId) return
    if (confirm('Generate a new share code? The old link will stop working.')) {
      await regenerateAllergenShareCode(activeLocationId)
    }
  }

  const handleCopyLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Get allergen counts
  const allergenCounts = ALLERGENS.reduce((acc, allergen) => {
    acc[allergen] = dishes.filter(d => d.allergens.includes(allergen)).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Allergen Management</h1>
          <p className="text-slate-500 mt-1">Track allergens in your menu items</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Dish
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <InfoIcon className="w-5 h-5 text-amber-600 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800 font-medium">UK FSA 14 Major Allergens</p>
          <p className="text-sm text-amber-700 mt-1">
            All food businesses must provide allergen information for the 14 major allergens.
            Keep this information up to date and train all staff on allergen awareness.
          </p>
        </div>
      </div>

      {/* QR Code Sharing */}
      {activeLocation && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sfbb-100 rounded-full flex items-center justify-center">
                <QrCodeIcon className="w-5 h-5 text-sfbb-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Share Allergen Menu</h3>
                <p className="text-sm text-slate-500">Let customers scan a QR code to view allergens</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={activeLocation.allergenShareEnabled || false}
                onChange={handleToggleSharing}
                disabled={isTogglingShare}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sfbb-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sfbb-600"></div>
            </label>
          </div>

          {activeLocation.allergenShareEnabled && shareUrl && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* QR Code Preview */}
                <button
                  onClick={() => setShowQRModal(true)}
                  className="flex-shrink-0 p-3 bg-white border-2 border-slate-200 rounded-xl hover:border-sfbb-300 transition-colors"
                >
                  <QRCodeSVG value={shareUrl} size={80} />
                </button>

                {/* Share Options */}
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Share Link</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="input text-sm flex-1 bg-slate-50"
                      />
                      <button
                        onClick={handleCopyLink}
                        className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-1.5 transition-colors ${
                          copied
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {copied ? (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <CopyIcon className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowQRModal(true)}
                      className="px-3 py-1.5 bg-sfbb-100 text-sfbb-700 rounded-lg font-medium text-sm flex items-center gap-1.5 hover:bg-sfbb-200 transition-colors"
                    >
                      <QrCodeIcon className="w-4 h-4" />
                      View QR Code
                    </button>
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
                    >
                      <ExternalLinkIcon className="w-4 h-4" />
                      Preview
                    </a>
                    <button
                      onClick={handleRegenerateCode}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
                    >
                      <RefreshCwIcon className="w-4 h-4" />
                      New Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search dishes..."
            className="input pl-10"
          />
        </div>
        <select
          value={filterAllergen}
          onChange={e => setFilterAllergen(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All Allergens</option>
          {ALLERGENS.map(allergen => (
            <option key={allergen} value={allergen}>
              {allergen} ({allergenCounts[allergen]})
            </option>
          ))}
        </select>
      </div>

      {/* Dishes Grid */}
      {filteredDishes.length === 0 ? (
        <div className="card p-8 text-center">
          <AlertTriangleIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {dishes.length === 0 ? 'No dishes added yet' : 'No dishes match your search'}
          </h3>
          <p className="text-slate-500 mb-4">
            {dishes.length === 0
              ? 'Add your menu items to track allergens'
              : 'Try adjusting your search or filter'}
          </p>
          {dishes.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add First Dish
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDishes.map(dish => (
            <div key={dish.id} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{dish.name}</h3>
                  {dish.category && (
                    <span className="text-sm text-slate-500">{dish.category}</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditForm(dish)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dish.id)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {dish.description && (
                <p className="text-sm text-slate-600 mb-3">{dish.description}</p>
              )}

              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-2 font-medium">Contains Allergens:</p>
                {dish.allergens.length === 0 ? (
                  <span className="text-sm text-slate-400">None specified</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {dish.allergens.map(allergen => (
                      <span key={allergen} className="badge badge-warning">
                        {allergen}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {dish.crossContaminationRisks.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Cross-contamination risks:</p>
                  <p className="text-sm text-slate-600">
                    {dish.crossContaminationRisks.join(', ')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dish Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingDish ? 'Edit Dish' : 'Add Dish'}
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
                  <label className="label">Dish Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="e.g., Grilled Chicken"
                    required
                  />
                </div>
                <div>
                  <label className="label">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    placeholder="e.g., Main Course"
                  />
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={2}
                  placeholder="Brief description of the dish"
                />
              </div>

              <div>
                <label className="label">Allergens</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-lg">
                  {ALLERGENS.map(allergen => (
                    <label
                      key={allergen}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        formData.allergens.includes(allergen)
                          ? 'bg-amber-100 text-amber-800'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.allergens.includes(allergen)}
                        onChange={() => toggleAllergen(allergen)}
                        className="rounded border-slate-300 text-sfbb-600 focus:ring-sfbb-500"
                      />
                      <span className="text-sm">{allergen}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Cross-contamination Risks (comma separated)</label>
                <input
                  type="text"
                  value={formData.crossContaminationRisks}
                  onChange={e => setFormData({ ...formData, crossContaminationRisks: e.target.value })}
                  className="input"
                  placeholder="e.g., Raw chicken, Nuts"
                />
              </div>

              <div>
                <label className="label">Cooking Instructions</label>
                <textarea
                  value={formData.cookingInstructions}
                  onChange={e => setFormData({ ...formData, cookingInstructions: e.target.value })}
                  className="input"
                  rows={2}
                  placeholder="Safe cooking instructions"
                />
              </div>

              <div>
                <label className="label">Storage Instructions</label>
                <textarea
                  value={formData.storageInstructions}
                  onChange={e => setFormData({ ...formData, storageInstructions: e.target.value })}
                  className="input"
                  rows={2}
                  placeholder="Safe storage instructions"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingDish ? 'Update' : 'Add'} Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && shareUrl && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Allergen Menu QR Code</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-400"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl border-2 border-slate-200 mb-4">
                <QRCodeSVG value={shareUrl} size={200} />
              </div>
              <p className="text-center text-sm text-slate-600 mb-4">
                Customers can scan this QR code to view your allergen information on their phone.
              </p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleCopyLink}
                  className={`flex-1 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1.5 transition-colors ${
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    const canvas = document.querySelector('#qr-download canvas') as HTMLCanvasElement
                    if (canvas) {
                      const link = document.createElement('a')
                      link.download = 'allergen-menu-qr.png'
                      link.href = canvas.toDataURL()
                      link.click()
                    }
                  }}
                  className="flex-1 py-2 bg-sfbb-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-1.5 hover:bg-sfbb-700 transition-colors"
                >
                  <ShareIcon className="w-4 h-4" />
                  Download
                </button>
              </div>
              {/* Hidden canvas for download */}
              <div id="qr-download" style={{ position: 'absolute', left: '-9999px' }}>
                <QRCodeCanvas value={shareUrl} size={400} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
