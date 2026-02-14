import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  AlertTriangleIcon,
  UtensilsIcon,
  InfoIcon,
  LeafIcon,
} from 'lucide-react'
import { ALLERGENS } from '../types'

interface PublicDish {
  dish_id: string
  dish_name: string
  dish_description: string | null
  dish_category: string | null
  allergens: string[]
  cross_contamination_risks: string[]
}

interface MenuData {
  business_name: string
  location_name: string
  dishes: PublicDish[]
}

export default function PublicAllergenMenu() {
  const { shareCode } = useParams<{ shareCode: string }>()
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAllergen, setSelectedAllergen] = useState<string | null>(null)

  useEffect(() => {
    const fetchMenu = async () => {
      if (!shareCode) {
        setError('Invalid link')
        setLoading(false)
        return
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('public_allergen_menu')
          .select('*')
          .eq('allergen_share_code', shareCode)

        if (fetchError) {
          console.error('Error fetching menu:', fetchError)
          setError('Unable to load menu. Please try again later.')
          setLoading(false)
          return
        }

        if (!data || data.length === 0) {
          setError('Menu not found or sharing has been disabled.')
          setLoading(false)
          return
        }

        // Group the data
        const firstRow = data[0]
        const dishes: PublicDish[] = data
          .filter(row => row.dish_id) // Filter out rows without dishes
          .map(row => ({
            dish_id: row.dish_id,
            dish_name: row.dish_name,
            dish_description: row.dish_description,
            dish_category: row.dish_category,
            allergens: row.allergens || [],
            cross_contamination_risks: row.cross_contamination_risks || [],
          }))

        setMenuData({
          business_name: firstRow.business_name || 'Restaurant',
          location_name: firstRow.location_name,
          dishes,
        })
      } catch (err) {
        console.error('Error:', err)
        setError('An error occurred. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [shareCode])

  // Get allergen color
  const getAllergenColor = (allergen: string): string => {
    const colors: Record<string, string> = {
      'Celery': 'bg-green-100 text-green-700',
      'Cereals containing gluten': 'bg-amber-100 text-amber-700',
      'Crustaceans': 'bg-red-100 text-red-700',
      'Eggs': 'bg-yellow-100 text-yellow-700',
      'Fish': 'bg-blue-100 text-blue-700',
      'Lupin': 'bg-purple-100 text-purple-700',
      'Milk': 'bg-sky-100 text-sky-700',
      'Molluscs': 'bg-teal-100 text-teal-700',
      'Mustard': 'bg-orange-100 text-orange-700',
      'Nuts': 'bg-amber-100 text-amber-800',
      'Peanuts': 'bg-rose-100 text-rose-700',
      'Sesame': 'bg-lime-100 text-lime-700',
      'Soybeans': 'bg-emerald-100 text-emerald-700',
      'Sulphur dioxide': 'bg-slate-100 text-slate-700',
    }
    return colors[allergen] || 'bg-gray-100 text-gray-700'
  }

  // Filter dishes by selected allergen
  const filteredDishes = selectedAllergen
    ? menuData?.dishes.filter(d =>
        !d.allergens.includes(selectedAllergen) &&
        !d.cross_contamination_risks.includes(selectedAllergen)
      )
    : menuData?.dishes

  // Group dishes by category
  const groupedDishes = filteredDishes?.reduce((acc, dish) => {
    const category = dish.dish_category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(dish)
    return acc
  }, {} as Record<string, PublicDish[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading allergen information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Oops!</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <UtensilsIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{menuData?.business_name}</h1>
              <p className="text-emerald-100 text-sm">{menuData?.location_name}</p>
            </div>
          </div>
          <p className="text-emerald-100 text-sm mt-3">
            Allergen information for our menu items
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Allergen Filter */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <LeafIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-slate-900">Filter by Allergen</h2>
          </div>
          <p className="text-sm text-slate-500 mb-3">
            Select an allergen to see dishes that are safe for you
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedAllergen(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !selectedAllergen
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Show All
            </button>
            {ALLERGENS.map(allergen => (
              <button
                key={allergen}
                onClick={() => setSelectedAllergen(allergen)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedAllergen === allergen
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {allergen}
              </button>
            ))}
          </div>
          {selectedAllergen && (
            <p className="text-sm text-emerald-600 mt-3 font-medium">
              Showing dishes without {selectedAllergen}
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <InfoIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Important Information</p>
            <p>
              While we take care to identify allergens, our kitchen handles multiple allergens.
              Cross-contamination may occur. Please speak to a member of staff if you have
              severe allergies.
            </p>
          </div>
        </div>

        {/* Menu Items */}
        {!menuData?.dishes.length ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <UtensilsIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No menu items available</p>
          </div>
        ) : !filteredDishes?.length ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <AlertTriangleIcon className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <p className="text-slate-700 font-medium">No dishes found</p>
            <p className="text-slate-500 text-sm mt-1">
              Unfortunately, all our dishes contain or may contain {selectedAllergen}.
            </p>
          </div>
        ) : (
          Object.entries(groupedDishes || {}).map(([category, dishes]) => (
            <div key={category} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">{category}</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {dishes.map(dish => (
                  <div key={dish.dish_id} className="p-4">
                    <h4 className="font-medium text-slate-900">{dish.dish_name}</h4>
                    {dish.dish_description && (
                      <p className="text-sm text-slate-500 mt-1">{dish.dish_description}</p>
                    )}

                    {dish.allergens.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-slate-500 mb-1.5">Contains:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {dish.allergens.map(allergen => (
                            <span
                              key={allergen}
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAllergenColor(allergen)}`}
                            >
                              {allergen}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {dish.cross_contamination_risks.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-amber-600 mb-1.5">
                          May contain traces of:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {dish.cross_contamination_risks.map(allergen => (
                            <span
                              key={allergen}
                              className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
                            >
                              {allergen}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {dish.allergens.length === 0 && dish.cross_contamination_risks.length === 0 && (
                      <p className="text-sm text-emerald-600 mt-2 font-medium">
                        No major allergens
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Footer */}
        <div className="text-center text-sm text-slate-400 py-4">
          <p>Powered by SFBB Pro</p>
          <p className="mt-1">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </main>
    </div>
  )
}
