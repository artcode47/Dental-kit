import {
  AcademicCapIcon,
  WrenchIcon,
  ShieldCheckIcon,
  PuzzlePieceIcon,
  BeakerIcon,
  ScissorsIcon,
  FaceSmileIcon,
  SparklesIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

const ICONS = {
  'academic-cap': AcademicCapIcon,
  'wrench': WrenchIcon,
  'shield-check': ShieldCheckIcon,
  'puzzle-piece': PuzzlePieceIcon,
  'beaker': BeakerIcon,
  'scissors': ScissorsIcon,
  'face-smile': FaceSmileIcon,
  'sparkles': SparklesIcon,
  // 'leaf' not available in our Heroicons version; map to Sparkles as fallback
  'leaf': SparklesIcon,
  'cpu-chip': CpuChipIcon,
  'tool': WrenchScrewdriverIcon,
};

export function getCategoryIcon(category, props = {}) {
  if (!category) return null;
  const key = (typeof category === 'string' ? category : category.icon || category.slug || category.name || '')
    .toString()
    .trim()
    .toLowerCase();

  if (ICONS[key]) return ICONS[key];

  // heuristic mapping by keywords in name/slug
  if (/anatomy/.test(key)) return AcademicCapIcon;
  if (/operative|restor/.test(key)) return WrenchIcon;
  if (/fixed|crown/.test(key)) return ShieldCheckIcon;
  if (/removable|proth/.test(key)) return PuzzlePieceIcon;
  if (/endo/.test(key)) return BeakerIcon;
  if (/surg/.test(key)) return ScissorsIcon;
  if (/pedo|pediatric/.test(key)) return FaceSmileIcon;
  if (/ortho/.test(key)) return SparklesIcon;
  if (/perio/.test(key)) return SparklesIcon;
  if (/device|equip/.test(key)) return CpuChipIcon;
  if (/instrument|tool/.test(key)) return WrenchScrewdriverIcon;

  return WrenchIcon; // sensible default
}


