import {
  TheftIcon, AssaultIcon, BurglaryIcon, RobberyIcon, SexualOffenseIcon,
  VandalismIcon, DrugIcon, FraudIcon, WeaponIcon, TrespassIcon, VehicleIcon,
  DefaultCrimeIcon,
} from '../components/Icons.jsx';

const CATEGORY_COLORS = [
  { keys: ['theft', 'larceny', 'shoplifting'], bg: '#FFCD00', text: '#182B49' },
  { keys: ['assault', 'battery', 'fight'], bg: '#EF4444', text: '#ffffff' },
  { keys: ['burglary', 'break'], bg: '#3B82F6', text: '#ffffff' },
  { keys: ['robbery'], bg: '#EC4899', text: '#ffffff' },
  { keys: ['sex', 'rape', 'lewd'], bg: '#F97316', text: '#ffffff' },
  { keys: ['vandal', 'graffiti'], bg: '#A78BFA', text: '#ffffff' },
  { keys: ['drug', 'narcotic', 'marijuana', 'alcohol'], bg: '#10B981', text: '#ffffff' },
  { keys: ['fraud', 'embezzle', 'forgery'], bg: '#14B8A6', text: '#ffffff' },
  { keys: ['weapon', 'firearm', 'knife'], bg: '#DC2626', text: '#ffffff' },
  { keys: ['trespass'], bg: '#6B7280', text: '#ffffff' },
  { keys: ['vehicle', 'auto', 'car'], bg: '#8B5CF6', text: '#ffffff' },
];

const CATEGORY_ICONS = [
  { keys: ['theft', 'larceny', 'shoplifting'], icon: TheftIcon },
  { keys: ['assault', 'battery', 'fight'], icon: AssaultIcon },
  { keys: ['burglary', 'break'], icon: BurglaryIcon },
  { keys: ['robbery'], icon: RobberyIcon },
  { keys: ['sex', 'rape', 'lewd'], icon: SexualOffenseIcon },
  { keys: ['vandal', 'graffiti'], icon: VandalismIcon },
  { keys: ['drug', 'narcotic', 'marijuana', 'alcohol'], icon: DrugIcon },
  { keys: ['fraud', 'embezzle', 'forgery'], icon: FraudIcon },
  { keys: ['weapon', 'firearm', 'knife'], icon: WeaponIcon },
  { keys: ['trespass'], icon: TrespassIcon },
  { keys: ['vehicle', 'auto', 'car'], icon: VehicleIcon },
];

export function getCategoryColors(category) {
  if (!category) return { bg: '#182B49', text: '#ffffff' };
  const lower = category.toLowerCase();
  for (const entry of CATEGORY_COLORS) {
    if (entry.keys.some(k => lower.includes(k))) return { bg: entry.bg, text: entry.text };
  }
  return { bg: '#182B49', text: '#ffffff' };
}

export function getCategoryIcon(category) {
  if (!category) return DefaultCrimeIcon;
  const lower = category.toLowerCase();
  for (const entry of CATEGORY_ICONS) {
    if (entry.keys.some(k => lower.includes(k))) return entry.icon;
  }
  return DefaultCrimeIcon;
}
