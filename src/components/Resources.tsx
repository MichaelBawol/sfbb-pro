import {
  BookOpenIcon,
  FileTextIcon,
  PhoneIcon,
  ExternalLinkIcon,
  GraduationCapIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  ClipboardListIcon,
  ThermometerIcon,
  BugIcon,
  SquareIcon,
} from 'lucide-react'

const QUICK_LINKS = [
  {
    title: 'Food Standards Agency',
    description: 'Official UK food safety guidance',
    url: 'https://www.food.gov.uk',
    icon: ShieldCheckIcon,
    color: 'blue',
  },
  {
    title: 'SFBB Pack Download',
    description: 'Safer Food Better Business resources',
    url: 'https://www.food.gov.uk/business-guidance/safer-food-better-business',
    icon: BookOpenIcon,
    color: 'emerald',
  },
  {
    title: 'Allergy Guidance',
    description: 'Food allergy labelling requirements',
    url: 'https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses',
    icon: AlertCircleIcon,
    color: 'amber',
  },
  {
    title: 'Food Hygiene Rating',
    description: 'Check and improve your rating',
    url: 'https://www.food.gov.uk/safety-hygiene/food-hygiene-rating-scheme',
    icon: ClipboardListIcon,
    color: 'violet',
  },
]

const TRAINING_RESOURCES = [
  {
    title: 'Level 2 Food Hygiene',
    description: 'Essential training for all food handlers',
    provider: 'Various providers',
  },
  {
    title: 'Level 3 Food Hygiene',
    description: 'Supervisors and managers',
    provider: 'Various providers',
  },
  {
    title: 'Allergen Awareness',
    description: 'Understanding the 14 allergens',
    provider: 'FSA Free Course',
  },
  {
    title: 'HACCP Training',
    description: 'Hazard analysis critical control points',
    provider: 'Various providers',
  },
]

const EMERGENCY_CONTACTS = [
  {
    name: 'Food Standards Agency',
    phone: '0330 332 7149',
    description: 'Report food safety issues',
  },
  {
    name: 'Environmental Health',
    phone: 'Contact your local council',
    description: 'Local food safety authority',
  },
  {
    name: 'Food Poisoning Hotline',
    phone: '0800 028 0245',
    description: 'Report suspected food poisoning',
  },
]

const TEMPERATURE_GUIDELINES = [
  { item: 'Fridge', temp: '0°C to 5°C', color: 'blue' },
  { item: 'Freezer', temp: '-18°C or below', color: 'indigo' },
  { item: 'Hot holding', temp: '63°C or above', color: 'red' },
  { item: 'Cooking (poultry)', temp: '75°C core', color: 'orange' },
  { item: 'Reheating', temp: '75°C core', color: 'amber' },
  { item: 'Chilled delivery', temp: '0°C to 8°C', color: 'cyan' },
]

const CHOPPING_BOARD_COLORS = [
  { color: 'Red', use: 'Raw meat', bgColor: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' },
  { color: 'Blue', use: 'Raw fish', bgColor: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
  { color: 'Yellow', use: 'Cooked meat', bgColor: 'bg-yellow-400', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' },
  { color: 'Green', use: 'Salad & fruit', bgColor: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
  { color: 'Brown', use: 'Vegetables', bgColor: 'bg-amber-700', textColor: 'text-amber-800', bgLight: 'bg-amber-50' },
  { color: 'White', use: 'Bakery & dairy', bgColor: 'bg-slate-200', textColor: 'text-slate-700', bgLight: 'bg-slate-50' },
  { color: 'Purple', use: 'Allergen-free', bgColor: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50' },
]

const CLEANING_CHEMICALS = [
  { name: 'Sanitiser', use: 'Food contact surfaces', dilution: 'Follow manufacturer' },
  { name: 'Degreaser', use: 'Ovens, grills, fryers', dilution: 'Follow manufacturer' },
  { name: 'Detergent', use: 'General cleaning', dilution: 'Follow manufacturer' },
  { name: 'Descaler', use: 'Kettles, dishwashers', dilution: 'Follow manufacturer' },
]

export default function Resources() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resources</h1>
        <p className="text-slate-500">Guidance, training & reference materials</p>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Quick Links</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {QUICK_LINKS.map((link, index) => {
            const Icon = link.icon
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 active:bg-slate-50"
              >
                <div className={`w-12 h-12 rounded-full bg-${link.color}-100 flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 text-${link.color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{link.title}</p>
                  <p className="text-sm text-slate-500">{link.description}</p>
                </div>
                <ExternalLinkIcon className="w-5 h-5 text-slate-400" />
              </a>
            )
          })}
        </div>
      </div>

      {/* Temperature Guidelines */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <ThermometerIcon className="w-5 h-5 text-blue-500" />
          <h2 className="font-semibold text-slate-900">Temperature Guidelines</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {TEMPERATURE_GUIDELINES.map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl bg-${item.color}-50 border border-${item.color}-100`}
              >
                <p className="font-medium text-slate-900 text-sm">{item.item}</p>
                <p className={`text-lg font-bold text-${item.color}-600`}>{item.temp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chopping Board Colour Codes */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <SquareIcon className="w-5 h-5 text-emerald-500" />
          <h2 className="font-semibold text-slate-900">Chopping Board Colour Codes</h2>
        </div>
        <div className="p-4">
          <p className="text-sm text-slate-500 mb-3">
            Use colour-coded boards to prevent cross-contamination
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CHOPPING_BOARD_COLORS.map((board, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl ${board.bgLight} border border-slate-100 flex items-center gap-3`}
              >
                <div className={`w-8 h-8 rounded-lg ${board.bgColor} flex-shrink-0 shadow-sm`} />
                <div>
                  <p className={`font-semibold text-sm ${board.textColor}`}>{board.color}</p>
                  <p className="text-xs text-slate-600">{board.use}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Training Resources */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <GraduationCapIcon className="w-5 h-5 text-violet-500" />
          <h2 className="font-semibold text-slate-900">Training Resources</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {TRAINING_RESOURCES.map((resource, index) => (
            <div key={index} className="p-4">
              <p className="font-medium text-slate-900">{resource.title}</p>
              <p className="text-sm text-slate-500">{resource.description}</p>
              <p className="text-xs text-slate-400 mt-1">{resource.provider}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 14 Allergens Quick Reference */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <AlertCircleIcon className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-slate-900">The 14 Allergens</h2>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              'Celery', 'Cereals (gluten)', 'Crustaceans', 'Eggs', 'Fish',
              'Lupin', 'Milk', 'Molluscs', 'Mustard', 'Nuts',
              'Peanuts', 'Sesame', 'Soybeans', 'Sulphur dioxide'
            ].map((allergen, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium"
              >
                {allergen}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Cleaning Chemicals Reference */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <BugIcon className="w-5 h-5 text-emerald-500" />
          <h2 className="font-semibold text-slate-900">Cleaning Chemicals</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {CLEANING_CHEMICALS.map((chemical, index) => (
            <div key={index} className="p-4">
              <p className="font-medium text-slate-900">{chemical.name}</p>
              <p className="text-sm text-slate-500">{chemical.use}</p>
              <p className="text-xs text-slate-400 mt-1">Dilution: {chemical.dilution}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <PhoneIcon className="w-5 h-5 text-red-500" />
          <h2 className="font-semibold text-slate-900">Emergency Contacts</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {EMERGENCY_CONTACTS.map((contact, index) => (
            <div key={index} className="p-4">
              <p className="font-medium text-slate-900">{contact.name}</p>
              <a
                href={`tel:${contact.phone.replace(/\s/g, '')}`}
                className="text-sfbb-600 font-medium"
              >
                {contact.phone}
              </a>
              <p className="text-sm text-slate-500">{contact.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SFBB 4-Week Diary Reminder */}
      <div className="bg-gradient-to-br from-sfbb-500 to-sfbb-600 rounded-2xl p-5 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <FileTextIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">SFBB Diary</h3>
            <p className="text-sfbb-100 text-sm mt-1">
              Remember to keep your SFBB diary up to date. Review and sign off records at least every 4 weeks.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
