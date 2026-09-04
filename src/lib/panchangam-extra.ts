// Extra Tamil panchangam helpers: Tamil year, colors, nalla neram, chandrashtama

export const TAMIL_YEARS = [
  "பிரபவ", "விபவ", "சுக்ல", "பிரமோதூத", "பிரசோற்பத்தி", "ஆங்கீரச", "ஸ்ரீமுக", "பவ", "யுவ", "தாது",
  "ஈஸ்வர", "பஹுதான்ய", "பிரமாதி", "விக்ரம", "விஷு", "சித்திரபானு", "சுபானு", "தாரண", "பார்த்திப", "விய",
  "சர்வஜித்", "சர்வதாரி", "விரோதி", "விக்ரிதி", "கர", "நந்தன", "விஜய", "ஜய", "மன்மத", "துர்முகி",
  "ஹேவிளம்பி", "விளம்பி", "விகாரி", "சார்வரி", "பிலவ", "சுபக்ருத்", "சோபக்ருத்", "குரோதி", "விஸ்வாவசு", "பராபவ",
  "பிலவங்க", "கீலக", "சௌம்ய", "சாதாரண", "விரோதக்ருத்", "பரிதாபி", "பிரமாதீச", "ஆனந்த", "ராக்ஷஸ", "அனல",
  "பிங்கல", "காளயுக்தி", "சித்தார்த்தி", "ரௌத்திரி", "துன்மதி", "துந்துபி", "ருத்ரோத்காரி", "ரக்தாக்ஷி", "குரோதன", "அக்ஷய",
];

/** Tamil year name. sunRasiIndex 0-8 = Chithirai-Maargazhi (same greg year), 9-11 = Thai-Panguni (prev greg year). */
export const tamilYearName = (gregYear: number, sunRasiIndex: number): string => {
  const base = sunRasiIndex <= 8 ? gregYear : gregYear - 1;
  const idx = ((base - 1987) % 60 + 60) % 60;
  return `${TAMIL_YEARS[idx]} வருடம்`;
};

/** Approximate day-of-Tamil-month from sun's degree in rasi (sun moves ~0.9856°/day). */
export const tamilMonthDay = (sunDegreeInRasi: number): number =>
  Math.min(32, Math.floor(sunDegreeInRasi / 0.9856) + 1);

/** Planet display colors (Tamil name key). */
export const PLANET_COLORS: Record<string, string> = {
  "சூரியன்": "#d97706",
  "சந்திரன்": "#475569",
  "செவ்வாய்": "#dc2626",
  "புதன்": "#16a34a",
  "குரு": "#b45309",
  "சுக்ரன்": "#db2777",
  "சனி": "#1d4ed8",
  "ராகு": "#7c3aed",
  "கேது": "#0f766e",
};

export const planetColor = (name: string): string =>
  PLANET_COLORS[Object.keys(PLANET_COLORS).find((k) => name.startsWith(k)) ?? ""] ?? "#7a1a2b";

/** Convert minutes-after-sunrise to நாழிகை/விநாடி text. */
export const toNaazhigai = (minutes: number): string => {
  const n = Math.floor(minutes / 24);
  const v = Math.round(((minutes % 24) / 24) * 60);
  return `${n} நாழிகை ${v} விநாடி`;
};

/** Nalla neram: நல்ல நேரம் from நட்சத்திர count — approximated by weekday (two windows). */
const NALLA_SEGS: [number, number][] = [
  [1, 4], // ஞாயிறு
  [2, 6], // திங்கள்
  [1, 5], // செவ்வாய்
  [4, 6], // புதன்
  [2, 5], // வியாழன்
  [1, 6], // வெள்ளி
  [3, 6], // சனி
];
export const nallaNeramSegs = (weekday: number): [number, number] => NALLA_SEGS[weekday] ?? [1, 4];

/** Chandrashtama warning: janma nakshatra for whom today's moon star is ashtama. */
export const chandrashtamaFor = (todayNakIdx: number): number => (todayNakIdx + 20) % 27;

/** Five-limb gradient tiles */
export const LIMB_GRADIENTS = [
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#8b5cf6,#6366f1)",
  "linear-gradient(135deg,#10b981,#0d9488)",
  "linear-gradient(135deg,#ec4899,#f43f5e)",
  "linear-gradient(135deg,#3b82f6,#06b6d4)",
];
