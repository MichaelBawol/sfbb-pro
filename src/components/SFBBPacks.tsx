import { useState } from 'react'
import {
  BookOpenIcon,
  PlusIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckCircle2Icon,
  CircleIcon,
  TrashIcon,
  PenLineIcon,
  BuildingIcon,
  StoreIcon,
  HeartIcon,
  BabyIcon,
  LockIcon,
  CheckIcon,
  FileTextIcon,
} from 'lucide-react'
import { useAppContext } from '../hooks/useAppContext'
import {
  SFBBPackType,
  SFBBPack,
  SFBBPackSection,
  SFBB_PACK_LABELS,
  SFBB_PACK_DESCRIPTIONS,
} from '../types'

// Define pack sections for each business type
const PACK_SECTIONS: Record<SFBBPackType, SFBBPackSection[]> = {
  caterer: [
    {
      id: 'business-info',
      key: 'businessInfo',
      title: 'Business Information',
      description: 'Your business details and contact information',
      fields: [
        { key: 'businessName', label: 'Business Name', type: 'text', required: true },
        { key: 'address', label: 'Address', type: 'textarea', required: true },
        { key: 'phone', label: 'Phone Number', type: 'text' },
        { key: 'email', label: 'Email Address', type: 'text' },
        { key: 'localAuthority', label: 'Local Authority', type: 'text' },
        { key: 'registrationDate', label: 'Food Business Registration Date', type: 'date' },
        { key: 'businessType', label: 'Type of Food Business', type: 'text', placeholder: 'e.g., Restaurant, Cafe, Takeaway' },
      ],
    },
    {
      id: 'cross-contamination',
      key: 'crossContamination',
      title: 'Cross-Contamination',
      description: 'Methods to prevent cross-contamination',
      fields: [
        { key: 'separateEquipment', label: 'We use separate equipment for raw and ready-to-eat foods', type: 'checkbox' },
        { key: 'colourCodedBoards', label: 'We use colour-coded chopping boards', type: 'checkbox' },
        { key: 'handWashing', label: 'Staff wash hands between handling raw and ready-to-eat foods', type: 'checkbox' },
        { key: 'cleanWorkSurfaces', label: 'Work surfaces are cleaned and disinfected between tasks', type: 'checkbox' },
        { key: 'rawFoodStorage', label: 'Raw foods are stored below ready-to-eat foods in the fridge', type: 'checkbox' },
        { key: 'separatePreparation', label: 'We use separate preparation areas where possible', type: 'checkbox' },
        { key: 'safeMethodNotes', label: 'Additional notes on cross-contamination methods', type: 'textarea' },
      ],
    },
    {
      id: 'cleaning',
      key: 'cleaning',
      title: 'Cleaning',
      description: 'Cleaning schedules and methods',
      fields: [
        { key: 'cleaningSchedule', label: 'We have a cleaning schedule in place', type: 'checkbox' },
        { key: 'cleanAsYouGo', label: 'We follow the clean-as-you-go principle', type: 'checkbox' },
        { key: 'twoStageClean', label: 'We use a two-stage cleaning process (clean then disinfect)', type: 'checkbox' },
        { key: 'chemicalsStored', label: 'Cleaning chemicals are stored safely away from food', type: 'checkbox' },
        { key: 'cleaningProducts', label: 'List of cleaning products used', type: 'textarea', placeholder: 'e.g., Sanitiser brand, Degreaser brand' },
        { key: 'cleaningFrequency', label: 'How often equipment and surfaces are deep cleaned', type: 'textarea' },
      ],
    },
    {
      id: 'chilling',
      key: 'chilling',
      title: 'Chilling',
      description: 'Temperature control and chilling methods',
      fields: [
        { key: 'fridgeTemp', label: 'Fridges are set to 5°C or below', type: 'checkbox' },
        { key: 'freezerTemp', label: 'Freezers are set to -18°C or below', type: 'checkbox' },
        { key: 'tempChecks', label: 'We check temperatures regularly and keep records', type: 'checkbox' },
        { key: 'chilledQuickly', label: 'Hot food is chilled quickly before refrigerating', type: 'checkbox' },
        { key: 'deliveryChecks', label: 'We check temperatures of chilled deliveries', type: 'checkbox' },
        { key: 'defrostingMethod', label: 'How we defrost food safely', type: 'textarea', placeholder: 'e.g., In the fridge overnight' },
        { key: 'fridgeBreakdown', label: 'What we do if a fridge breaks down', type: 'textarea' },
      ],
    },
    {
      id: 'cooking',
      key: 'cooking',
      title: 'Cooking',
      description: 'Safe cooking methods and temperatures',
      fields: [
        { key: 'coreTemp', label: 'We cook food to a safe core temperature of 75°C', type: 'checkbox' },
        { key: 'probeThermometer', label: 'We use a probe thermometer to check temperatures', type: 'checkbox' },
        { key: 'probeCalibration', label: 'We calibrate our probe thermometer regularly', type: 'checkbox' },
        { key: 'hotHoldingTemp', label: 'Hot food is held at 63°C or above', type: 'checkbox' },
        { key: 'reheatingTemp', label: 'Reheated food reaches 75°C core temperature', type: 'checkbox' },
        { key: 'cookingMethods', label: 'Specific cooking methods for high-risk foods', type: 'textarea', placeholder: 'e.g., How we cook chicken, burgers, etc.' },
      ],
    },
    {
      id: 'management',
      key: 'management',
      title: 'Management',
      description: 'Staff training and supervision',
      fields: [
        { key: 'staffTrained', label: 'All food handlers receive food hygiene training', type: 'checkbox' },
        { key: 'supervisorTrained', label: 'At least one person has Level 3 food hygiene', type: 'checkbox' },
        { key: 'fitnessToWork', label: 'We have a policy for staff fitness to work', type: 'checkbox' },
        { key: 'personalHygiene', label: 'Staff follow personal hygiene rules', type: 'checkbox' },
        { key: 'protectiveClothing', label: 'Staff wear appropriate protective clothing', type: 'checkbox' },
        { key: 'trainingRecords', label: 'We keep records of staff training', type: 'checkbox' },
        { key: 'supervisionNotes', label: 'How we supervise and check food safety practices', type: 'textarea' },
      ],
    },
    {
      id: 'suppliers',
      key: 'suppliers',
      title: 'Safe Suppliers',
      description: 'Supplier approval and deliveries',
      fields: [
        { key: 'approvedSuppliers', label: 'We only use approved suppliers', type: 'checkbox' },
        { key: 'deliveryChecks', label: 'We check deliveries on arrival', type: 'checkbox' },
        { key: 'rejectUnsafe', label: 'We reject unsafe deliveries', type: 'checkbox' },
        { key: 'traceability', label: 'We can trace where our food comes from', type: 'checkbox' },
        { key: 'supplierList', label: 'List of main suppliers', type: 'textarea', placeholder: 'Supplier name, contact, products supplied' },
      ],
    },
    {
      id: 'allergens',
      key: 'allergens',
      title: 'Allergen Management',
      description: 'Managing allergens in your food',
      fields: [
        { key: 'allergenInfo', label: 'We have allergen information available for customers', type: 'checkbox' },
        { key: 'staffKnowledge', label: 'Staff know how to provide allergen information', type: 'checkbox' },
        { key: 'crossContact', label: 'We take steps to prevent allergen cross-contact', type: 'checkbox' },
        { key: 'separatePrep', label: 'We use separate equipment for allergen-free meals', type: 'checkbox' },
        { key: 'allergenProcedure', label: 'Procedure for handling allergen requests', type: 'textarea' },
        { key: 'allergenRecords', label: 'How we record allergen information for dishes', type: 'textarea' },
      ],
    },
    {
      id: 'opening-closing',
      key: 'openingClosing',
      title: 'Opening & Closing Checks',
      description: 'Daily checks before opening and closing',
      fields: [
        { key: 'openingChecks', label: 'We complete opening checks daily', type: 'checkbox' },
        { key: 'closingChecks', label: 'We complete closing checks daily', type: 'checkbox' },
        { key: 'checklistUsed', label: 'We use a checklist to ensure consistency', type: 'checkbox' },
        { key: 'openingList', label: 'List of opening checks', type: 'textarea', placeholder: 'e.g., Check fridge temps, wash hands, check stock dates' },
        { key: 'closingList', label: 'List of closing checks', type: 'textarea', placeholder: 'e.g., Clean down, secure food, empty bins' },
      ],
    },
    {
      id: 'proving-it',
      key: 'provingIt',
      title: 'Proving It',
      description: 'Documentation and records',
      fields: [
        { key: 'diaryKept', label: 'We keep an SFBB diary up to date', type: 'checkbox' },
        { key: 'fourWeeklyReview', label: 'We complete 4-weekly reviews', type: 'checkbox' },
        { key: 'tempRecords', label: 'We keep temperature records', type: 'checkbox' },
        { key: 'trainingRecords', label: 'We keep training records', type: 'checkbox' },
        { key: 'cleaningRecords', label: 'We keep cleaning records', type: 'checkbox' },
        { key: 'supplierRecords', label: 'We keep supplier records', type: 'checkbox' },
        { key: 'recordsLocation', label: 'Where records are kept', type: 'text', placeholder: 'e.g., In the office, in this app' },
      ],
    },
  ],
  retailer: [
    {
      id: 'business-info',
      key: 'businessInfo',
      title: 'Business Information',
      description: 'Your business details',
      fields: [
        { key: 'businessName', label: 'Business Name', type: 'text', required: true },
        { key: 'address', label: 'Address', type: 'textarea', required: true },
        { key: 'phone', label: 'Phone Number', type: 'text' },
        { key: 'email', label: 'Email Address', type: 'text' },
        { key: 'localAuthority', label: 'Local Authority', type: 'text' },
        { key: 'registrationDate', label: 'Food Business Registration Date', type: 'date' },
        { key: 'businessType', label: 'Type of Retail Business', type: 'text', placeholder: 'e.g., Convenience store, Butcher, Bakery' },
      ],
    },
    {
      id: 'stock-control',
      key: 'stockControl',
      title: 'Stock Control',
      description: 'Managing food stock and rotation',
      fields: [
        { key: 'fifo', label: 'We use first in, first out (FIFO) stock rotation', type: 'checkbox' },
        { key: 'dateChecks', label: 'We check use-by and best-before dates daily', type: 'checkbox' },
        { key: 'removeExpired', label: 'We remove expired products immediately', type: 'checkbox' },
        { key: 'stockRecords', label: 'We keep records of stock deliveries', type: 'checkbox' },
        { key: 'stockRotationNotes', label: 'How we manage stock rotation', type: 'textarea' },
      ],
    },
    {
      id: 'chilled-display',
      key: 'chilledDisplay',
      title: 'Chilled Display',
      description: 'Chilled cabinet and display management',
      fields: [
        { key: 'tempMonitoring', label: 'We monitor display cabinet temperatures', type: 'checkbox' },
        { key: 'tempRecords', label: 'We record temperatures at least twice daily', type: 'checkbox' },
        { key: 'loadLine', label: 'We do not overload cabinets above the load line', type: 'checkbox' },
        { key: 'doorsClosed', label: 'We keep cabinet doors closed when possible', type: 'checkbox' },
        { key: 'breakdownProcedure', label: 'What we do if a cabinet breaks down', type: 'textarea' },
      ],
    },
    {
      id: 'loose-foods',
      key: 'looseFoods',
      title: 'Loose Foods',
      description: 'Handling unwrapped and loose foods',
      fields: [
        { key: 'protectedFromCustomers', label: 'Loose foods are protected from contamination', type: 'checkbox' },
        { key: 'serveWithTongs', label: 'We use tongs or utensils, not hands', type: 'checkbox' },
        { key: 'separateUtensils', label: 'We use separate utensils for different foods', type: 'checkbox' },
        { key: 'allergenInfo', label: 'Allergen information is available for loose foods', type: 'checkbox' },
        { key: 'looseFoodProcedure', label: 'How we handle loose foods', type: 'textarea' },
      ],
    },
    {
      id: 'deliveries',
      key: 'deliveries',
      title: 'Deliveries',
      description: 'Receiving and checking deliveries',
      fields: [
        { key: 'checkTemps', label: 'We check temperatures of chilled deliveries', type: 'checkbox' },
        { key: 'checkCondition', label: 'We check condition of packaging', type: 'checkbox' },
        { key: 'checkDates', label: 'We check use-by dates are adequate', type: 'checkbox' },
        { key: 'putAwayQuickly', label: 'We put chilled items away within 15 minutes', type: 'checkbox' },
        { key: 'rejectCriteria', label: 'When we reject deliveries', type: 'textarea', placeholder: 'e.g., Above 8°C, damaged packaging, short dates' },
      ],
    },
    {
      id: 'cleaning',
      key: 'cleaning',
      title: 'Cleaning',
      description: 'Cleaning schedules and methods',
      fields: [
        { key: 'cleaningSchedule', label: 'We have a cleaning schedule', type: 'checkbox' },
        { key: 'equipmentCleaned', label: 'Equipment and surfaces are cleaned regularly', type: 'checkbox' },
        { key: 'spillsCleaned', label: 'Spills are cleaned up immediately', type: 'checkbox' },
        { key: 'chemicalsStored', label: 'Cleaning chemicals are stored safely', type: 'checkbox' },
        { key: 'cleaningNotes', label: 'Cleaning procedures', type: 'textarea' },
      ],
    },
    {
      id: 'allergens',
      key: 'allergens',
      title: 'Allergen Management',
      description: 'Managing allergens for customers',
      fields: [
        { key: 'allergenInfo', label: 'We provide allergen information on request', type: 'checkbox' },
        { key: 'staffTrained', label: 'Staff know about the 14 allergens', type: 'checkbox' },
        { key: 'labelsChecked', label: 'We check allergen labels on products', type: 'checkbox' },
        { key: 'crossContact', label: 'We prevent allergen cross-contact', type: 'checkbox' },
        { key: 'allergenProcedure', label: 'How we handle allergen requests', type: 'textarea' },
      ],
    },
    {
      id: 'management',
      key: 'management',
      title: 'Management & Staff',
      description: 'Staff training and supervision',
      fields: [
        { key: 'staffTrained', label: 'Staff receive food hygiene training', type: 'checkbox' },
        { key: 'fitnessToWork', label: 'We have a fitness to work policy', type: 'checkbox' },
        { key: 'handWashing', label: 'Staff wash hands regularly', type: 'checkbox' },
        { key: 'protectiveClothing', label: 'Staff wear appropriate clothing', type: 'checkbox' },
        { key: 'trainingNotes', label: 'Training provided to staff', type: 'textarea' },
      ],
    },
  ],
  care_home: [
    {
      id: 'business-info',
      key: 'businessInfo',
      title: 'Care Home Information',
      description: 'Your care home details',
      fields: [
        { key: 'homeName', label: 'Care Home Name', type: 'text', required: true },
        { key: 'address', label: 'Address', type: 'textarea', required: true },
        { key: 'phone', label: 'Phone Number', type: 'text' },
        { key: 'email', label: 'Email Address', type: 'text' },
        { key: 'manager', label: 'Manager Name', type: 'text' },
        { key: 'cqcNumber', label: 'CQC Registration Number', type: 'text' },
        { key: 'numberOfResidents', label: 'Number of Residents', type: 'text' },
      ],
    },
    {
      id: 'resident-needs',
      key: 'residentNeeds',
      title: 'Resident Needs',
      description: 'Managing individual dietary needs',
      fields: [
        { key: 'dietaryRecords', label: 'We keep dietary records for each resident', type: 'checkbox' },
        { key: 'allergyRecords', label: 'We record food allergies and intolerances', type: 'checkbox' },
        { key: 'textureModified', label: 'We can provide texture-modified foods', type: 'checkbox' },
        { key: 'specialDiets', label: 'We cater for special diets (religious, medical)', type: 'checkbox' },
        { key: 'hydration', label: 'We monitor residents\' fluid intake', type: 'checkbox' },
        { key: 'dietaryProcedure', label: 'How we manage individual dietary needs', type: 'textarea' },
      ],
    },
    {
      id: 'food-preparation',
      key: 'foodPreparation',
      title: 'Food Preparation',
      description: 'Safe food preparation practices',
      fields: [
        { key: 'separateEquipment', label: 'We use separate equipment for raw and ready-to-eat', type: 'checkbox' },
        { key: 'handWashing', label: 'Staff wash hands before preparing food', type: 'checkbox' },
        { key: 'cleanWorkSurfaces', label: 'Work surfaces are cleaned between tasks', type: 'checkbox' },
        { key: 'texturePrep', label: 'We have safe procedures for pureed foods', type: 'checkbox' },
        { key: 'prepNotes', label: 'Food preparation procedures', type: 'textarea' },
      ],
    },
    {
      id: 'cooking-reheating',
      key: 'cookingReheating',
      title: 'Cooking & Reheating',
      description: 'Safe cooking temperatures',
      fields: [
        { key: 'cookTo75', label: 'We cook food to 75°C core temperature', type: 'checkbox' },
        { key: 'probeUsed', label: 'We use a probe thermometer', type: 'checkbox' },
        { key: 'reheatOnce', label: 'We only reheat food once', type: 'checkbox' },
        { key: 'reheatTo75', label: 'Reheated food reaches 75°C', type: 'checkbox' },
        { key: 'holdingTemp', label: 'Hot food is held at 63°C or above', type: 'checkbox' },
        { key: 'cookingNotes', label: 'Cooking and reheating procedures', type: 'textarea' },
      ],
    },
    {
      id: 'chilling',
      key: 'chilling',
      title: 'Chilling & Storage',
      description: 'Temperature control',
      fields: [
        { key: 'fridgeTemp', label: 'Fridges are at 5°C or below', type: 'checkbox' },
        { key: 'freezerTemp', label: 'Freezers are at -18°C or below', type: 'checkbox' },
        { key: 'tempChecks', label: 'We check and record temperatures daily', type: 'checkbox' },
        { key: 'coolQuickly', label: 'We cool hot food quickly before refrigerating', type: 'checkbox' },
        { key: 'storageProcedure', label: 'Food storage procedures', type: 'textarea' },
      ],
    },
    {
      id: 'serving',
      key: 'serving',
      title: 'Serving Food',
      description: 'Safe food service to residents',
      fields: [
        { key: 'servingTime', label: 'Hot food is served within 2 hours of cooking', type: 'checkbox' },
        { key: 'individualPortions', label: 'We check portion sizes for individual needs', type: 'checkbox' },
        { key: 'assistedFeeding', label: 'Staff are trained in assisted feeding', type: 'checkbox' },
        { key: 'choking', label: 'Staff know choking first aid', type: 'checkbox' },
        { key: 'servingNotes', label: 'Food service procedures', type: 'textarea' },
      ],
    },
    {
      id: 'cleaning',
      key: 'cleaning',
      title: 'Cleaning',
      description: 'Kitchen cleaning procedures',
      fields: [
        { key: 'cleaningSchedule', label: 'We have a kitchen cleaning schedule', type: 'checkbox' },
        { key: 'twoStageClean', label: 'We clean then disinfect', type: 'checkbox' },
        { key: 'equipmentCleaned', label: 'Equipment is cleaned after each use', type: 'checkbox' },
        { key: 'chemicalsStored', label: 'Chemicals are stored away from food', type: 'checkbox' },
        { key: 'cleaningNotes', label: 'Cleaning procedures', type: 'textarea' },
      ],
    },
    {
      id: 'staff-training',
      key: 'staffTraining',
      title: 'Staff Training',
      description: 'Food safety training for care staff',
      fields: [
        { key: 'level2Training', label: 'Kitchen staff have Level 2 food hygiene', type: 'checkbox' },
        { key: 'level3Training', label: 'Supervisor has Level 3 food hygiene', type: 'checkbox' },
        { key: 'careStaffTraining', label: 'Care staff receive food safety awareness', type: 'checkbox' },
        { key: 'dysphagia', label: 'Staff are trained on dysphagia awareness', type: 'checkbox' },
        { key: 'trainingRecords', label: 'We keep training records', type: 'checkbox' },
        { key: 'trainingNotes', label: 'Training details', type: 'textarea' },
      ],
    },
  ],
  childminder: [
    {
      id: 'business-info',
      key: 'businessInfo',
      title: 'Childminder Information',
      description: 'Your business details',
      fields: [
        { key: 'name', label: 'Your Name', type: 'text', required: true },
        { key: 'address', label: 'Address', type: 'textarea', required: true },
        { key: 'phone', label: 'Phone Number', type: 'text' },
        { key: 'email', label: 'Email Address', type: 'text' },
        { key: 'ofstedNumber', label: 'Ofsted Registration Number', type: 'text' },
        { key: 'numberOfChildren', label: 'Maximum Number of Children', type: 'text' },
        { key: 'ageRange', label: 'Age Range of Children', type: 'text', placeholder: 'e.g., 0-5 years' },
      ],
    },
    {
      id: 'allergies',
      key: 'allergies',
      title: 'Allergies & Dietary Needs',
      description: 'Managing children\'s dietary requirements',
      fields: [
        { key: 'allergyInfo', label: 'I collect allergy information from parents', type: 'checkbox' },
        { key: 'allergyRecords', label: 'I keep records of each child\'s allergies', type: 'checkbox' },
        { key: 'parentConsent', label: 'I get written consent for foods given', type: 'checkbox' },
        { key: 'separatePrep', label: 'I prepare allergen-free foods separately', type: 'checkbox' },
        { key: 'allergyProcedure', label: 'How I manage food allergies', type: 'textarea' },
      ],
    },
    {
      id: 'food-preparation',
      key: 'foodPreparation',
      title: 'Food Preparation',
      description: 'Safe food preparation for children',
      fields: [
        { key: 'handWashing', label: 'I wash hands before preparing food', type: 'checkbox' },
        { key: 'cleanSurfaces', label: 'I clean work surfaces before preparation', type: 'checkbox' },
        { key: 'separateEquipment', label: 'I use separate boards for raw meat', type: 'checkbox' },
        { key: 'ageAppropriate', label: 'I prepare age-appropriate food sizes', type: 'checkbox' },
        { key: 'chokingHazards', label: 'I cut food to avoid choking hazards', type: 'checkbox' },
        { key: 'prepNotes', label: 'Food preparation notes', type: 'textarea' },
      ],
    },
    {
      id: 'cooking',
      key: 'cooking',
      title: 'Cooking',
      description: 'Safe cooking for children',
      fields: [
        { key: 'cookThoroughly', label: 'I cook food thoroughly, especially meat', type: 'checkbox' },
        { key: 'checkTemp', label: 'I check food is piping hot throughout', type: 'checkbox' },
        { key: 'coolDown', label: 'I let food cool before serving to children', type: 'checkbox' },
        { key: 'reheatOnce', label: 'I only reheat food once', type: 'checkbox' },
        { key: 'cookingNotes', label: 'Cooking procedures', type: 'textarea' },
      ],
    },
    {
      id: 'storage',
      key: 'storage',
      title: 'Food Storage',
      description: 'Safe storage of food',
      fields: [
        { key: 'fridgeBelow5', label: 'My fridge is set to 5°C or below', type: 'checkbox' },
        { key: 'checkDates', label: 'I check use-by dates', type: 'checkbox' },
        { key: 'coveredFood', label: 'I keep food covered in the fridge', type: 'checkbox' },
        { key: 'rawBelow', label: 'I store raw meat on the bottom shelf', type: 'checkbox' },
        { key: 'parentFood', label: 'I store food brought by parents safely', type: 'checkbox' },
        { key: 'storageNotes', label: 'Storage procedures', type: 'textarea' },
      ],
    },
    {
      id: 'bottle-feeding',
      key: 'bottleFeeding',
      title: 'Bottle Feeding',
      description: 'Safe bottle and formula preparation',
      fields: [
        { key: 'formulaPrep', label: 'I follow formula instructions carefully', type: 'checkbox' },
        { key: 'freshFormula', label: 'I make formula fresh each feed', type: 'checkbox' },
        { key: 'waterTemp', label: 'I use water at 70°C or above for formula', type: 'checkbox' },
        { key: 'sterilised', label: 'I use sterilised bottles and teats', type: 'checkbox' },
        { key: 'bottleStorage', label: 'I store breastmilk safely', type: 'checkbox' },
        { key: 'bottleNotes', label: 'Bottle feeding procedures', type: 'textarea' },
      ],
    },
    {
      id: 'hygiene',
      key: 'hygiene',
      title: 'Hygiene',
      description: 'Personal and kitchen hygiene',
      fields: [
        { key: 'handWashFrequent', label: 'I wash hands frequently', type: 'checkbox' },
        { key: 'beforeFood', label: 'I wash hands before handling food', type: 'checkbox' },
        { key: 'afterNappies', label: 'I wash hands after nappy changes', type: 'checkbox' },
        { key: 'childrenHands', label: 'I help children wash hands before eating', type: 'checkbox' },
        { key: 'cleanKitchen', label: 'I keep my kitchen clean', type: 'checkbox' },
        { key: 'hygieneNotes', label: 'Hygiene practices', type: 'textarea' },
      ],
    },
    {
      id: 'training',
      key: 'training',
      title: 'Training',
      description: 'Food safety knowledge',
      fields: [
        { key: 'foodHygieneTraining', label: 'I have completed food hygiene training', type: 'checkbox' },
        { key: 'allergenTraining', label: 'I understand the 14 allergens', type: 'checkbox' },
        { key: 'firstAid', label: 'I have current paediatric first aid', type: 'checkbox' },
        { key: 'chokingTraining', label: 'I know how to deal with choking', type: 'checkbox' },
        { key: 'trainingDetails', label: 'Training completed', type: 'textarea' },
      ],
    },
  ],
}

const PACK_TYPE_ICONS: Record<SFBBPackType, any> = {
  caterer: BuildingIcon,
  retailer: StoreIcon,
  care_home: HeartIcon,
  childminder: BabyIcon,
}

export default function SFBBPacks() {
  const {
    sfbbPacks,
    addSFBBPack,
    updateSFBBPackSection,
    deleteSFBBPack,
    signOffSFBBPack,
    hasFeature,
    business,
  } = useAppContext()

  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedPack, setSelectedPack] = useState<SFBBPack | null>(null)
  const [selectedSection, setSelectedSection] = useState<SFBBPackSection | null>(null)
  const [newPackType, setNewPackType] = useState<SFBBPackType | null>(null)
  const [newPackName, setNewPackName] = useState('')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [signOffName, setSignOffName] = useState('')
  const [showSignOff, setShowSignOff] = useState(false)

  // Check if professional feature is available
  const hasProfessional = hasFeature('sfbb_packs')

  if (!hasProfessional) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SFBB Packs</h1>
          <p className="text-slate-500">Digital Safer Food Better Business packs</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockIcon className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Professional Feature</h2>
          <p className="text-slate-600 mb-4">
            Digital SFBB packs are available on the Professional plan. Upgrade to create and manage
            your SFBB documentation digitally.
          </p>
          <button
            onClick={() => window.location.href = '/settings'}
            className="px-6 py-2 bg-sfbb-600 text-white rounded-xl font-medium"
          >
            Upgrade to Professional
          </button>
        </div>
      </div>
    )
  }

  const handleCreatePack = async () => {
    if (!newPackType || !newPackName.trim()) return

    const pack = await addSFBBPack({
      packType: newPackType,
      name: newPackName.trim(),
    })

    if (pack) {
      setSelectedPack(pack)
      setView('edit')
      setNewPackType(null)
      setNewPackName('')
    }
  }

  const handleSelectPack = (pack: SFBBPack) => {
    setSelectedPack(pack)
    setSelectedSection(null)
    setView('edit')
  }

  const handleSelectSection = (section: SFBBPackSection) => {
    setSelectedSection(section)
    // Load existing data for this section
    if (selectedPack) {
      setFormData(selectedPack.data[section.key] || {})
    }
  }

  const handleSaveSection = async () => {
    if (!selectedPack || !selectedSection) return

    await updateSFBBPackSection(selectedPack.id, selectedSection.key, formData)

    // Update local selectedPack state with the new section data
    setSelectedPack(prev => {
      if (!prev) return prev
      return {
        ...prev,
        data: {
          ...prev.data,
          [selectedSection.key]: {
            ...(prev.data[selectedSection.key] || {}),
            ...formData,
          },
        },
        updatedAt: new Date().toISOString(),
      }
    })

    setSelectedSection(null)
    setFormData({})
  }

  const handleDeletePack = async (id: string) => {
    await deleteSFBBPack(id)
    setDeleteConfirm(null)
    if (selectedPack?.id === id) {
      setSelectedPack(null)
      setView('list')
    }
  }

  const handleSignOff = async () => {
    if (!selectedPack || !signOffName.trim()) return
    const now = new Date().toISOString()
    await signOffSFBBPack(selectedPack.id, signOffName.trim())

    // Update local state immediately
    setSelectedPack(prev => {
      if (!prev) return prev
      return {
        ...prev,
        signedOff: true,
        signedOffBy: signOffName.trim(),
        signedOffAt: now,
        updatedAt: now,
      }
    })

    setShowSignOff(false)
    setSignOffName('')
  }

  const getSections = () => {
    if (!selectedPack) return []
    return PACK_SECTIONS[selectedPack.packType] || []
  }

  const getSectionProgress = (sectionKey: string): number => {
    if (!selectedPack) return 0
    const sectionData = selectedPack.data[sectionKey] || {}
    const section = getSections().find(s => s.key === sectionKey)
    if (!section) return 0

    const totalFields = section.fields.filter(f => f.type !== 'textarea').length
    const completedFields = section.fields.filter(f => {
      if (f.type === 'textarea') return false
      const value = sectionData[f.key]
      if (f.type === 'checkbox') return value === true
      return value && value.toString().trim() !== ''
    }).length

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0
  }

  const getOverallProgress = (): number => {
    if (!selectedPack) return 0
    const sections = getSections()
    if (sections.length === 0) return 0

    const totalProgress = sections.reduce((sum, s) => sum + getSectionProgress(s.key), 0)
    return Math.round(totalProgress / sections.length)
  }

  // List view
  if (view === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SFBB Packs</h1>
            <p className="text-slate-500">Digital Safer Food Better Business packs</p>
          </div>
          <button
            onClick={() => setView('create')}
            className="flex items-center gap-2 px-4 py-2 bg-sfbb-600 text-white rounded-xl font-medium"
          >
            <PlusIcon className="w-5 h-5" />
            New Pack
          </button>
        </div>

        {sfbbPacks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-sfbb-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpenIcon className="w-8 h-8 text-sfbb-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No SFBB Packs Yet</h2>
            <p className="text-slate-600 mb-4">
              Create your first digital SFBB pack to document your food safety procedures.
            </p>
            <button
              onClick={() => setView('create')}
              className="px-6 py-2 bg-sfbb-600 text-white rounded-xl font-medium"
            >
              Create Pack
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sfbbPacks.map((pack) => {
              const Icon = PACK_TYPE_ICONS[pack.packType]
              const sections = PACK_SECTIONS[pack.packType] || []
              const completedSections = sections.filter(s => {
                const data = pack.data[s.key] || {}
                return Object.keys(data).length > 0
              }).length

              return (
                <div
                  key={pack.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => handleSelectPack(pack)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50"
                  >
                    <div className="w-12 h-12 bg-sfbb-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-sfbb-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 truncate">{pack.name}</p>
                        {pack.signedOff && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Signed Off
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{SFBB_PACK_LABELS[pack.packType]}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {completedSections}/{sections.length} sections started
                      </p>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div className="bg-gradient-to-br from-sfbb-500 to-sfbb-600 rounded-2xl p-5 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <FileTextIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">SFBB Documentation</h3>
              <p className="text-sfbb-100 text-sm mt-1">
                Keep your SFBB pack up to date. Environmental Health Officers may ask to see your
                documentation during inspections.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Create view
  if (view === 'create') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setView('list')
              setNewPackType(null)
              setNewPackName('')
            }}
            className="p-2 -ml-2 text-slate-600"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create SFBB Pack</h1>
            <p className="text-slate-500">Select your business type</p>
          </div>
        </div>

        <div className="space-y-3">
          {(Object.keys(SFBB_PACK_LABELS) as SFBBPackType[]).map((type) => {
            const Icon = PACK_TYPE_ICONS[type]
            const isSelected = newPackType === type

            return (
              <button
                key={type}
                onClick={() => setNewPackType(type)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors ${
                  isSelected
                    ? 'border-sfbb-500 bg-sfbb-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-sfbb-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${isSelected ? 'text-sfbb-700' : 'text-slate-900'}`}>
                    {SFBB_PACK_LABELS[type]}
                  </p>
                  <p className="text-sm text-slate-500">{SFBB_PACK_DESCRIPTIONS[type]}</p>
                </div>
                {isSelected && (
                  <CheckCircle2Icon className="w-6 h-6 text-sfbb-500" />
                )}
              </button>
            )
          })}
        </div>

        {newPackType && (
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Pack Name
              </label>
              <input
                type="text"
                value={newPackName}
                onChange={(e) => setNewPackName(e.target.value)}
                placeholder={business?.name || 'e.g., My Business SFBB Pack'}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sfbb-500"
              />
            </div>
            <button
              onClick={handleCreatePack}
              disabled={!newPackName.trim()}
              className="w-full py-3 bg-sfbb-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Pack
            </button>
          </div>
        )}
      </div>
    )
  }

  // Edit view - section selection
  if (view === 'edit' && selectedPack && !selectedSection) {
    const sections = getSections()
    const progress = getOverallProgress()

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setView('list')
              setSelectedPack(null)
            }}
            className="p-2 -ml-2 text-slate-600"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 truncate">{selectedPack.name}</h1>
            <p className="text-slate-500 text-sm">{SFBB_PACK_LABELS[selectedPack.packType]}</p>
          </div>
          <button
            onClick={() => setDeleteConfirm(selectedPack.id)}
            className="p-2 text-red-500"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-900">Overall Progress</span>
            <span className="text-sfbb-600 font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-sfbb-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {selectedPack.signedOff && (
            <p className="text-sm text-green-600 mt-2">
              Signed off by {selectedPack.signedOffBy} on{' '}
              {new Date(selectedPack.signedOffAt!).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Sections */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Pack Sections</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {sections.map((section) => {
              const sectionProgress = getSectionProgress(section.key)
              const hasData = selectedPack.data[section.key] && Object.keys(selectedPack.data[section.key]).length > 0

              return (
                <button
                  key={section.id}
                  onClick={() => handleSelectSection(section)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    sectionProgress === 100
                      ? 'bg-green-100'
                      : hasData
                      ? 'bg-amber-100'
                      : 'bg-slate-100'
                  }`}>
                    {sectionProgress === 100 ? (
                      <CheckCircle2Icon className="w-5 h-5 text-green-600" />
                    ) : hasData ? (
                      <PenLineIcon className="w-5 h-5 text-amber-600" />
                    ) : (
                      <CircleIcon className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{section.title}</p>
                    <p className="text-sm text-slate-500 truncate">{section.description}</p>
                  </div>
                  {hasData && (
                    <span className="text-xs text-slate-400">{sectionProgress}%</span>
                  )}
                  <ChevronRightIcon className="w-5 h-5 text-slate-400" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Sign Off */}
        {!selectedPack.signedOff && (
          <button
            onClick={() => setShowSignOff(true)}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-medium"
          >
            Sign Off Pack
          </button>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Pack?</h3>
              <p className="text-slate-600 mb-4">
                This will permanently delete this SFBB pack and all its data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 border border-slate-200 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePack(deleteConfirm)}
                  className="flex-1 py-2 bg-red-600 text-white rounded-xl font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sign Off Modal */}
        {showSignOff && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Sign Off Pack</h3>
              <p className="text-slate-600 mb-4">
                Enter your name to confirm this SFBB pack is complete and accurate.
              </p>
              <input
                type="text"
                value={signOffName}
                onChange={(e) => setSignOffName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-sfbb-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSignOff(false)
                    setSignOffName('')
                  }}
                  className="flex-1 py-2 border border-slate-200 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOff}
                  disabled={!signOffName.trim()}
                  className="flex-1 py-2 bg-green-600 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  Sign Off
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Edit view - section form
  if (view === 'edit' && selectedPack && selectedSection) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedSection(null)
              setFormData({})
            }}
            className="p-2 -ml-2 text-slate-600"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{selectedSection.title}</h1>
            <p className="text-slate-500 text-sm">{selectedSection.description}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          {selectedSection.fields.map((field) => (
            <div key={field.key}>
              {field.type === 'checkbox' ? (
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    formData[field.key]
                      ? 'bg-sfbb-500 border-sfbb-500 text-white'
                      : 'border-slate-300'
                  }`}>
                    {formData[field.key] && <CheckIcon className="w-4 h-4" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={formData[field.key] || false}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.checked })}
                    className="sr-only"
                  />
                  <span className="text-slate-700">{field.label}</span>
                </label>
              ) : field.type === 'textarea' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sfbb-500 resize-none"
                  />
                  {field.helpText && (
                    <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>
                  )}
                </div>
              ) : field.type === 'date' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="date"
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sfbb-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sfbb-500"
                  />
                  {field.helpText && (
                    <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSaveSection}
          className="w-full py-3 bg-sfbb-600 text-white rounded-xl font-medium"
        >
          Save Section
        </button>
      </div>
    )
  }

  return null
}
