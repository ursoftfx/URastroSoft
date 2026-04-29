// 10 Porutham (Thirumana Porutham) - traditional Tamil marriage compatibility
// References: classical Tamil panchangam matching (Dina, Gana, Mahendra, Stree-Dheerga,
// Yoni, Rasi, Rasiyathipathi, Vasya, Rajju, Vedha)

export const NAKSHATRAS = [
  "அஸ்வினி","பரணி","கார்த்திகை","ரோகிணி","மிருகசீரிஷம்","திருவாதிரை",
  "புனர்பூசம்","பூசம்","ஆயில்யம்","மகம்","பூரம்","உத்திரம்",
  "அஸ்தம்","சித்திரை","சுவாதி","விசாகம்","அனுஷம்","கேட்டை",
  "மூலம்","பூராடம்","உத்திராடம்","திருவோணம்","அவிட்டம்","சதயம்",
  "பூரட்டாதி","உத்திரட்டாதி","ரேவதி",
];

export const RASIS = [
  "மேஷம்","ரிஷபம்","மிதுனம்","கடகம்","சிம்மம்","கன்னி",
  "துலாம்","விருச்சிகம்","தனுசு","மகரம்","கும்பம்","மீனம்",
];

// Rasi lord (rasiyathipathi)
const RASI_LORDS = [
  "செவ்வாய்","சுக்ரன்","புதன்","சந்திரன்","சூரியன்","புதன்",
  "சுக்ரன்","செவ்வாய்","குரு","சனி","சனி","குரு",
];

// Yoni (animal) per nakshatra (0-13)
const YONI = [
  0,1,2,3,3,4,4,5,5,6,6,1,1,7,8,8,9,9,10,11,11,12,2,12,13,7,5,
];
// Yoni names
const YONI_NAMES = ["குதிரை","யானை","ஆடு","பாம்பு","நாய்","பூனை","எலி","பசு","எருமை","புலி","மான்","குரங்கு","சிங்கம்","மரக்கொன்னை"];
// Yoni male/female pairing — friendly pairs (each yoni has a natural mate)
const YONI_FRIENDS: Record<number, number[]> = {
  0:[0,1], 1:[1,0], 2:[2,8], 3:[3,12], 4:[4,5], 5:[5,4], 6:[6,7],
  7:[7,6], 8:[8,2], 9:[9,10], 10:[10,9], 11:[11,13], 12:[12,3], 13:[13,11],
};
// Yoni enemies (traditional)
const YONI_ENEMIES: [number, number][] = [
  [0,8],[1,12],[2,9],[3,11],[4,3],[5,6],[6,5],[7,9],[10,3],[11,3],[13,12],
];

// Gana: 0=Deva, 1=Manushya, 2=Rakshasa
const GANA = [
  0,2,0,1,0,1,0,0,2,2,1,1,0,1,0,2,0,2,2,1,1,0,2,2,1,1,0,
];

// Nadi: 0=Vata(Aadhi), 1=Pitta(Madhya), 2=Kapha(Anthya)
const NADI = [
  0,1,2,2,1,0,0,1,2,2,1,0,0,1,2,2,1,0,0,1,2,2,1,0,0,1,2,
];

// Rajju: 0=Pada(foot),1=Janu(knee),2=Kati(thigh),3=Naabhi(navel),4=Kanta(neck),5=Siras(head)
// Standard table — 27 nakshatras grouped vertically; using common Tamil mapping
const RAJJU = [
  0,1,2,3,4,5,4,3,2,1,0,1,2,3,4,5,4,3,2,1,0,1,2,3,4,5,4,
];

// Vedha pairs (mutual obstruction)
const VEDHA_PAIRS: Array<[number, number]> = [
  [0,17],[1,16],[2,15],[3,14],[4,13],[5,11],[6,10],[7,9],
  [18,26],[19,25],[20,24],[21,23],[8,22],
];

// Stree-dheerga: girl's nakshatra should be > 9 positions ahead of boy's (ideal >13)
function streeDheergam(boyNak: number, girlNak: number): { score: number; max: number; note: string } {
  const diff = ((girlNak - boyNak) + 27) % 27;
  if (diff >= 13) return { score: 1, max: 1, note: `${diff} நட்சத்திர இடைவெளி (சிறந்தது)` };
  if (diff >= 9) return { score: 0.5, max: 1, note: `${diff} நட்சத்திர இடைவெளி (சாதாரணம்)` };
  return { score: 0, max: 1, note: `${diff} நட்சத்திர இடைவெளி (குறைவு)` };
}

// Dina porutham: count from boy's star to girl's, divide by 9, remainder
function dina(boyNak: number, girlNak: number): { score: number; max: number; note: string } {
  const count = ((girlNak - boyNak + 27) % 27) + 1;
  const rem = count % 9;
  // Auspicious remainders: 2,4,6,8,9(0)
  const good = [2, 4, 6, 8, 0];
  const ok = good.includes(rem);
  return { score: ok ? 1 : 0, max: 1, note: `எண்ணிக்கை ${count} (மீதி ${rem === 0 ? 9 : rem}) ${ok ? "✓" : "✗"}` };
}

// Gana porutham
function gana(boyNak: number, girlNak: number): { score: number; max: number; note: string } {
  const b = GANA[boyNak], g = GANA[girlNak];
  const names = ["தேவ", "மனுஷ்ய", "ராக்ஷஸ"];
  if (b === g) return { score: 1, max: 1, note: `இருவரும் ${names[b]} (சிறந்தது)` };
  // Deva-Manushya = average
  if ((b === 0 && g === 1) || (b === 1 && g === 0)) return { score: 0.5, max: 1, note: `${names[b]} - ${names[g]} (சாதாரணம்)` };
  // Manushya-Rakshasa = average
  if ((b === 1 && g === 2) || (b === 2 && g === 1)) return { score: 0.5, max: 1, note: `${names[b]} - ${names[g]} (சாதாரணம்)` };
  return { score: 0, max: 1, note: `${names[b]} - ${names[g]} (சரியில்லை)` };
}

// Mahendra: girl's nakshatra at 4,7,10,13,16,19,22,25 from boy's
function mahendra(boyNak: number, girlNak: number): { score: number; max: number; note: string } {
  const count = ((girlNak - boyNak + 27) % 27) + 1;
  const good = [4, 7, 10, 13, 16, 19, 22, 25];
  const ok = good.includes(count);
  return { score: ok ? 1 : 0, max: 1, note: `எண்ணிக்கை ${count} ${ok ? "✓" : "✗"}` };
}

// Yoni porutham
function yoni(boyNak: number, girlNak: number): { score: number; max: number; note: string } {
  const by = YONI[boyNak], gy = YONI[girlNak];
  if (by === gy) return { score: 1, max: 1, note: `இருவரும் ${YONI_NAMES[by]} (சிறந்தது)` };
  const friends = YONI_FRIENDS[by] || [];
  const enemyPair = YONI_ENEMIES.some(([a, b]) => (a === by && b === gy) || (a === gy && b === by));
  if (enemyPair) return { score: 0, max: 1, note: `${YONI_NAMES[by]} - ${YONI_NAMES[gy]} (பகை)` };
  if (friends.includes(gy)) return { score: 0.75, max: 1, note: `${YONI_NAMES[by]} - ${YONI_NAMES[gy]} (நட்பு)` };
  return { score: 0.5, max: 1, note: `${YONI_NAMES[by]} - ${YONI_NAMES[gy]} (சாதாரணம்)` };
}

// Rasi porutham: girl's rasi should not be 2,3,4,5,6 from boy
function rasi(boyRasi: number, girlRasi: number): { score: number; max: number; note: string } {
  const fromBoy = ((girlRasi - boyRasi + 12) % 12) + 1;
  const fromGirl = ((boyRasi - girlRasi + 12) % 12) + 1;
  // Bad: 6,8,12 from each other
  const bad = [6, 8, 12];
  if (bad.includes(fromBoy) || bad.includes(fromGirl)) {
    return { score: 0, max: 1, note: `${fromBoy}/${fromGirl}-ம் இடம் (சரியில்லை)` };
  }
  return { score: 1, max: 1, note: `${fromBoy}/${fromGirl}-ம் இடம் ✓` };
}

// Rasiyathipathi (Rasi lord) friendship
const PLANET_FRIENDS: Record<string, string[]> = {
  "சூரியன்": ["சந்திரன்", "செவ்வாய்", "குரு"],
  "சந்திரன்": ["சூரியன்", "புதன்"],
  "செவ்வாய்": ["சூரியன்", "சந்திரன்", "குரு"],
  "புதன்": ["சூரியன்", "சுக்ரன்"],
  "குரு": ["சூரியன்", "சந்திரன்", "செவ்வாய்"],
  "சுக்ரன்": ["புதன்", "சனி"],
  "சனி": ["புதன்", "சுக்ரன்"],
};
function rasiyathipathi(boyRasi: number, girlRasi: number): { score: number; max: number; note: string } {
  const bl = RASI_LORDS[boyRasi], gl = RASI_LORDS[girlRasi];
  if (bl === gl) return { score: 1, max: 1, note: `இருவருக்கும் ${bl} (சிறந்தது)` };
  const bf = PLANET_FRIENDS[bl] || [];
  const gf = PLANET_FRIENDS[gl] || [];
  if (bf.includes(gl) && gf.includes(bl)) return { score: 1, max: 1, note: `${bl} - ${gl} (நட்பு)` };
  if (bf.includes(gl) || gf.includes(bl)) return { score: 0.5, max: 1, note: `${bl} - ${gl} (ஒரு வழி நட்பு)` };
  return { score: 0, max: 1, note: `${bl} - ${gl} (பகை)` };
}

// Vasya: rasis controlled by boy's rasi
const VASYA: Record<number, number[]> = {
  0:[4,7], 1:[3,9], 2:[5,7], 3:[7,8], 4:[5,3], 5:[2,8], 6:[9,5],
  7:[3,4], 8:[11,9], 9:[0,10], 10:[0], 11:[9,5],
};
function vasya(boyRasi: number, girlRasi: number): { score: number; max: number; note: string } {
  const list = VASYA[boyRasi] || [];
  if (list.includes(girlRasi)) return { score: 1, max: 1, note: `${RASIS[girlRasi]} வசம் ✓` };
  const reverse = VASYA[girlRasi] || [];
  if (reverse.includes(boyRasi)) return { score: 0.5, max: 1, note: "ஒரு வழி வசம்" };
  return { score: 0, max: 1, note: "வசியம் இல்லை" };
}

// Rajju: same rajju is dosha
function rajju(boyNak: number, girlNak: number): { score: number; max: number; note: string } {
  const names = ["பாத","ஜானு","கடி","நாபி","கண்ட","சிரோ"];
  const b = RAJJU[boyNak], g = RAJJU[girlNak];
  if (b === g) return { score: 0, max: 1, note: `இருவரும் ${names[b]} ரஜ்ஜு (தோஷம்)` };
  return { score: 1, max: 1, note: `${names[b]} - ${names[g]} (சரி)` };
}

// Vedha
function vedha(boyNak: number, girlNak: number): { score: number; max: number; note: string } {
  const hit = VEDHA_PAIRS.some(([a, b]) => (a === boyNak && b === girlNak) || (a === girlNak && b === boyNak));
  if (hit) return { score: 0, max: 1, note: "வேதை உள்ளது (தோஷம்)" };
  return { score: 1, max: 1, note: "வேதை இல்லை ✓" };
}

export interface PoruthamItem {
  name: string;
  score: number;
  max: number;
  note: string;
}

export interface PoruthamResult {
  items: PoruthamItem[];
  total: number;
  max: number;
  verdict: string;
}

export function compute10Porutham(
  boyNak: number, boyRasi: number,
  girlNak: number, girlRasi: number
): PoruthamResult {
  const items: PoruthamItem[] = [
    { name: "தின பொருத்தம்", ...dina(boyNak, girlNak) },
    { name: "கண பொருத்தம்", ...gana(boyNak, girlNak) },
    { name: "மகேந்திர பொருத்தம்", ...mahendra(boyNak, girlNak) },
    { name: "ஸ்த்ரீ தீர்க்க பொருத்தம்", ...streeDheergam(boyNak, girlNak) },
    { name: "யோனி பொருத்தம்", ...yoni(boyNak, girlNak) },
    { name: "ராசி பொருத்தம்", ...rasi(boyRasi, girlRasi) },
    { name: "ராசியதிபதி பொருத்தம்", ...rasiyathipathi(boyRasi, girlRasi) },
    { name: "வசிய பொருத்தம்", ...vasya(boyRasi, girlRasi) },
    { name: "ரஜ்ஜு பொருத்தம்", ...rajju(boyNak, girlNak) },
    { name: "வேத பொருத்தம்", ...vedha(boyNak, girlNak) },
  ];
  const total = items.reduce((s, i) => s + i.score, 0);
  const max = items.reduce((s, i) => s + i.max, 0);
  let verdict = "";
  const pct = (total / max) * 100;
  if (pct >= 75) verdict = "சிறந்த பொருத்தம் — திருமணம் சாத்தியம்";
  else if (pct >= 60) verdict = "நல்ல பொருத்தம் — பரிசீலனை செய்யலாம்";
  else if (pct >= 40) verdict = "சாதாரண பொருத்தம் — ஜோதிடரை அணுகவும்";
  else verdict = "குறைந்த பொருத்தம் — ஆலோசனை அவசியம்";
  return { items, total, max, verdict };
}
