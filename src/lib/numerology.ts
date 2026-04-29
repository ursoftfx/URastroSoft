// Numerology — Chaldean style for name (optional) + birth-date psychic + life path
export interface NumerologyResult {
  birthNumber: number;       // psychic - sum of birth day digits → single digit
  lifePath: number;          // sum of full DOB digits
  destiny: number;           // same as life path (alias)
  rulingPlanet: string;
  luckyDays: string[];
  luckyColors: string[];
  luckyNumbers: number[];
  description: string;
}

const PLANET_BY_NUM: Record<number, { planet: string; days: string[]; colors: string[]; lucky: number[]; desc: string }> = {
  1: { planet: "சூரியன்", days: ["ஞாயிறு", "திங்கள்"], colors: ["தங்க நிறம்", "ஆரஞ்சு"], lucky: [1, 10, 19, 28], desc: "தலைமை குணம், சுயமரியாதை, ஆணைய சக்தி." },
  2: { planet: "சந்திரன்", days: ["திங்கள்", "வெள்ளி"], colors: ["வெள்ளை", "வெள்ளி"], lucky: [2, 11, 20, 29], desc: "மென்மை, நட்பு, கற்பனை வளம், பெண் கடவுள் அருள்." },
  3: { planet: "குரு (வியாழன்)", days: ["வியாழன்", "வெள்ளி"], colors: ["மஞ்சள்", "ஊதா"], lucky: [3, 12, 21, 30], desc: "கல்வி, ஞானம், ஆன்மிகம், அதிர்ஷ்டம்." },
  4: { planet: "ராகு", days: ["சனி", "ஞாயிறு"], colors: ["நீலம்", "சாம்பல்"], lucky: [4, 13, 22, 31], desc: "மாறுபாடு, சோதனை, புதுமை, சர்ச்சை." },
  5: { planet: "புதன்", days: ["புதன்", "வெள்ளி"], colors: ["பச்சை", "வெள்ளை"], lucky: [5, 14, 23], desc: "வியாபாரம், புத்திக்கூர்மை, வேகம், தொடர்பு." },
  6: { planet: "சுக்ரன்", days: ["வெள்ளி", "புதன்"], colors: ["வெள்ளை", "ரோஜா"], lucky: [6, 15, 24], desc: "கலை, அழகு, காதல், ஆடம்பரம், சுகம்." },
  7: { planet: "கேது", days: ["திங்கள்", "ஞாயிறு"], colors: ["பச்சை", "வெளிர் நீலம்"], lucky: [7, 16, 25], desc: "தத்துவம், ரகசியம், அமைதி, ஆழ் சிந்தனை." },
  8: { planet: "சனி", days: ["சனி", "ஞாயிறு"], colors: ["கருப்பு", "நீலம்"], lucky: [8, 17, 26], desc: "உழைப்பு, நிலையம், கடின சோதனை, பெரும் வெற்றி." },
  9: { planet: "செவ்வாய்", days: ["செவ்வாய்", "வியாழன்"], colors: ["சிவப்பு", "ரத்த நிறம்"], lucky: [9, 18, 27], desc: "தைரியம், ஆற்றல், போர்க்குணம், தலைமை." },
};

const reduceDigit = (n: number): number => {
  while (n > 9) n = String(n).split("").reduce((s, d) => s + +d, 0);
  return n;
};

export function computeNumerology(day: number, month: number, year: number): NumerologyResult {
  const birthNumber = reduceDigit(day);
  const lifePath = reduceDigit(
    String(day).split("").reduce((s, d) => s + +d, 0) +
    String(month).split("").reduce((s, d) => s + +d, 0) +
    String(year).split("").reduce((s, d) => s + +d, 0)
  );
  const info = PLANET_BY_NUM[birthNumber];
  return {
    birthNumber,
    lifePath,
    destiny: lifePath,
    rulingPlanet: info.planet,
    luckyDays: info.days,
    luckyColors: info.colors,
    luckyNumbers: info.lucky,
    description: info.desc,
  };
}

// Suggest first letters for a name based on Nakshatra Pada (traditional Tamil mapping)
const NAME_SYLLABLES: Record<number, string[][]> = {
  // index 0..26, each has 4 padas
  0:  [["சு","Chu"], ["சே","Che"], ["சோ","Cho"], ["லா","La"]],
  1:  [["லீ","Lee"], ["லூ","Lu"], ["லே","Le"], ["லோ","Lo"]],
  2:  [["அ","A"], ["ஈ","I"], ["உ","U"], ["ஏ","E"]],
  3:  [["ஓ","O"], ["வா","Va"], ["வீ","Vi"], ["வு","Vu"]],
  4:  [["வே","Ve"], ["வோ","Vo"], ["கா","Ka"], ["கீ","Ki"]],
  5:  [["கு","Ku"], ["க","Gha"], ["ங","Nga"], ["சா","Sa"]],
  6:  [["கே","Ke"], ["கோ","Ko"], ["ஹா","Ha"], ["ஹீ","Hi"]],
  7:  [["ஹு","Hu"], ["ஹே","He"], ["ஹோ","Ho"], ["டா","Da"]],
  8:  [["டீ","Di"], ["டூ","Du"], ["டே","De"], ["டோ","Do"]],
  9:  [["மா","Ma"], ["மீ","Mi"], ["மு","Mu"], ["மே","Me"]],
  10: [["மோ","Mo"], ["டா","Ta"], ["டீ","Ti"], ["டூ","Tu"]],
  11: [["டே","Te"], ["டோ","To"], ["பா","Pa"], ["பீ","Pi"]],
  12: [["பு","Pu"], ["ஷ","Sha"], ["ண","Na"], ["ட","Tha"]],
  13: [["பே","Pe"], ["போ","Po"], ["ரா","Ra"], ["ரீ","Ri"]],
  14: [["ரு","Ru"], ["ரே","Re"], ["ரோ","Ro"], ["தா","Ta"]],
  15: [["தீ","Ti"], ["தூ","Tu"], ["தே","Te"], ["தோ","To"]],
  16: [["நா","Na"], ["நீ","Ni"], ["நு","Nu"], ["நே","Ne"]],
  17: [["நோ","No"], ["யா","Ya"], ["யீ","Yi"], ["யூ","Yu"]],
  18: [["யே","Ye"], ["யோ","Yo"], ["பா","Bha"], ["பீ","Bhi"]],
  19: [["பு","Bhu"], ["தா","Dha"], ["பா","Pha"], ["டா","Dda"]],
  20: [["பே","Bhe"], ["போ","Bho"], ["ஜா","Ja"], ["ஜீ","Ji"]],
  21: [["ஜு","Ju"], ["ஜே","Je"], ["ஜோ","Jo"], ["கா","Gha"]],
  22: [["கீ","Gi"], ["கு","Gu"], ["கே","Ge"], ["கோ","Go"]],
  23: [["ஸா","Sa"], ["ஸீ","Si"], ["ஸு","Su"], ["ஸே","Se"]],
  24: [["ஸோ","So"], ["தா","Da"], ["தீ","Di"], ["தூ","Du"]],
  25: [["தே","Tha"], ["தோ","Jna"], ["சா","Cha"], ["சீ","Chi"]],
  26: [["தே","De"], ["தோ","Do"], ["சா","Cha"], ["சீ","Chi"]],
};

export function nameSuggestions(nakshatraIdx: number, pada: number): { primary: string; latin: string; allPadas: { pada: number; tamil: string; latin: string }[] } {
  const list = NAME_SYLLABLES[nakshatraIdx] || [["—","—"],["—","—"],["—","—"],["—","—"]];
  const [tamil, latin] = list[Math.max(0, Math.min(3, pada - 1))];
  const allPadas = list.map(([t, l], i) => ({ pada: i + 1, tamil: t, latin: l }));
  return { primary: tamil, latin, allPadas };
}
