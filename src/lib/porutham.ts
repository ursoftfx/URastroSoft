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

// Yoni (animal) per nakshatra (0-13), in the standard 27-star order.
const YONI = [
  0,1,2,3,3,4,5,2,5,6,6,7,8,9,8,9,10,10,4,11,12,11,13,0,13,7,1,
];
// Yoni names
const YONI_NAMES = ["குதிரை","யானை","ஆடு","பாம்பு","நாய்","பூனை","எலி","பசு","எருமை","புலி","மான்","குரங்கு","கீரி","சிங்கம்"];
// Yoni enemies (traditional)
const YONI_ENEMIES: [number, number][] = [
  [0,8],[1,13],[2,11],[3,12],[4,10],[5,6],[7,9],
];

// Gana: 0=Deva, 1=Manushya, 2=Rakshasa
const GANA = [
  0,1,2,1,0,1,0,0,2,2,1,1,0,2,0,2,0,2,2,1,1,0,2,2,1,1,0,
];

// Nadi: 0=Vata(Aadhi), 1=Pitta(Madhya), 2=Kapha(Anthya)
const NADI = [
  0,1,2,2,1,0,0,1,2,2,1,0,0,1,2,2,1,0,0,1,2,2,1,0,0,1,2,
];

// Rajju: 0=Pada(foot),1=Ooru(thigh),2=Nabhi(navel),3=Kanta(neck),4=Siro(head)
const RAJJU = [
  0,1,2,3,4,3,2,1,0,0,1,2,3,4,3,2,1,0,0,1,2,3,4,3,2,1,0,
];

// Vedha pairs (mutual obstruction)
const VEDHA_PAIRS: Array<[number, number]> = [
  [0,17],[1,16],[2,15],[3,14],[4,22],[5,21],[6,20],[7,19],
  [8,18],[9,26],[10,25],[11,24],[12,23],
];

// Star counts for Dina, Mahendra and Stree Deergha run from the bride's star to the groom's.
function starCount(fromNak: number, toNak: number): number {
  return ((toNak - fromNak + 27) % 27) + 1;
}

function streeDheergam(girlNak: number, boyNak: number): { score: number; max: number; note: string } {
  const count = starCount(girlNak, boyNak);
  if (count > 13) return { score: 1, max: 1, note: `${count} நட்சத்திர எண்ணிக்கை (சிறந்தது)` };
  if (count >= 7) return { score: 0.5, max: 1, note: `${count} நட்சத்திர எண்ணிக்கை (சாதாரணம்)` };
  return { score: 0, max: 1, note: `${count} நட்சத்திர எண்ணிக்கை (குறைவு)` };
}

// Dina porutham: count from the bride's star to the groom's, divide by 9.
function dina(
  girlNak: number, boyNak: number, girlRasi: number, boyRasi: number,
): { score: number; max: number; note: string } {
  const count = starCount(girlNak, boyNak);
  const rem = count % 9;
  // Auspicious remainders: 2,4,6,8,9(0)
  const good = [2, 4, 6, 8, 0];
  // Same-star exception: a star spanning two signs can agree when the partners' Moon signs differ.
  const spansRasis = Math.floor((girlNak * 4) / 9) !== Math.floor((girlNak * 4 + 3) / 9);
  const sameStarException = girlNak === boyNak && girlRasi !== boyRasi && spansRasis;
  const ok = good.includes(rem) || sameStarException;
  const note = sameStarException
    ? `ஒரே நட்சத்திரம், வேறு ராசி — விதிவிலக்கு ✓`
    : `எண்ணிக்கை ${count} (மீதி ${rem === 0 ? 9 : rem}) ${ok ? "✓" : "✗"}`;
  return { score: ok ? 1 : 0, max: 1, note };
}

// Gana porutham
function gana(boyNak: number, girlNak: number): { score: number; max: number; note: string } {
  const b = GANA[boyNak], g = GANA[girlNak];
  const names = ["தேவ", "மனுஷ்ய", "ராக்ஷஸ"];
  if (b === g) return { score: 1, max: 1, note: `இருவரும் ${names[b]} (சிறந்தது)` };
  // Deva-Manushya = average
  if ((b === 0 && g === 1) || (b === 1 && g === 0)) return { score: 0.5, max: 1, note: `${names[b]} - ${names[g]} (சாதாரணம்)` };
  return { score: 0, max: 1, note: `${names[b]} - ${names[g]} (சரியில்லை)` };
}

// Mahendra: the groom's star is at 4,7,10,13,16,19,22,25 from the bride's.
function mahendra(girlNak: number, boyNak: number): { score: number; max: number; note: string } {
  const count = starCount(girlNak, boyNak);
  const good = [4, 7, 10, 13, 16, 19, 22, 25];
  const ok = good.includes(count);
  return { score: ok ? 1 : 0, max: 1, note: `எண்ணிக்கை ${count} ${ok ? "✓" : "✗"}` };
}

// Yoni porutham
function yoni(boyNak: number, girlNak: number): { score: number; max: number; note: string } {
  const by = YONI[boyNak], gy = YONI[girlNak];
  if (by === gy) return { score: 1, max: 1, note: `இருவரும் ${YONI_NAMES[by]} (சிறந்தது)` };
  const enemyPair = YONI_ENEMIES.some(([a, b]) => (a === by && b === gy) || (a === gy && b === by));
  if (enemyPair) return { score: 0, max: 1, note: `${YONI_NAMES[by]} - ${YONI_NAMES[gy]} (பகை)` };
  return { score: 0.5, max: 1, note: `${YONI_NAMES[by]} - ${YONI_NAMES[gy]} (சாதாரணம்)` };
}

// Rasi porutham: count from the bride's Moon sign to the groom's.
function rasi(
  boyRasi: number, girlRasi: number, boyNak: number, girlNak: number,
): { score: number; max: number; note: string } {
  const count = ((boyRasi - girlRasi + 12) % 12) + 1;
  if (count === 1) {
    const sameStar = boyNak === girlNak;
    return { score: sameStar ? 0 : 1, max: 1, note: sameStar ? "ஒரே ராசி, ஒரே நட்சத்திரம் (பொருத்தமில்லை)" : "ஒரே ராசி, வேறு நட்சத்திரம் ✓" };
  }
  if (count === 7 || count === 8) return { score: 0.5, max: 1, note: `பெண் ராசியிலிருந்து ${count}-ம் இடம் (மிதமானது)` };
  if (count >= 9) return { score: 1, max: 1, note: `பெண் ராசியிலிருந்து ${count}-ம் இடம் ✓` };
  return { score: 0, max: 1, note: `பெண் ராசியிலிருந்து ${count}-ம் இடம் (பொருத்தமில்லை)` };
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
const PLANET_ENEMIES: Record<string, string[]> = {
  "சூரியன்": ["சுக்ரன்", "சனி"],
  "சந்திரன்": [],
  "செவ்வாய்": ["புதன்"],
  "புதன்": ["சந்திரன்"],
  "குரு": ["புதன்", "சுக்ரன்"],
  "சுக்ரன்": ["சூரியன்", "சந்திரன்"],
  "சனி": ["சூரியன்", "சந்திரன்", "செவ்வாய்"],
};
function rasiyathipathi(boyRasi: number, girlRasi: number): { score: number; max: number; note: string } {
  const bl = RASI_LORDS[boyRasi], gl = RASI_LORDS[girlRasi];
  if (bl === gl) return { score: 1, max: 1, note: `இருவருக்கும் ${bl} (சிறந்தது)` };
  const bf = PLANET_FRIENDS[bl] || [];
  const gf = PLANET_FRIENDS[gl] || [];
  const be = PLANET_ENEMIES[bl] || [];
  const ge = PLANET_ENEMIES[gl] || [];
  if (bf.includes(gl) && gf.includes(bl)) return { score: 1, max: 1, note: `${bl} - ${gl} (நட்பு)` };
  if (be.includes(gl) && ge.includes(bl)) return { score: 0, max: 1, note: `${bl} - ${gl} (பகை)` };
  if (be.includes(gl) || ge.includes(bl)) return { score: 0.5, max: 1, note: `${bl} - ${gl} (கலப்பு / மிதமான நிலை)` };
  if (bf.includes(gl) || gf.includes(bl)) return { score: 0.5, max: 1, note: `${bl} - ${gl} (ஒரு வழி நட்பு)` };
  return { score: 0.5, max: 1, note: `${bl} - ${gl} (சமம்)` };
}

// Vasya table: bride's rasi -> groom's rasi.
const VASYA: Record<number, number[]> = {
  0:[4,7], 1:[3,6], 2:[5], 3:[7,8], 4:[6], 5:[2,11],
  6:[2,11], 7:[9], 8:[3,5], 9:[11], 10:[0], 11:[9],
};
function vasya(boyRasi: number, girlRasi: number): { score: number; max: number; note: string } {
  const list = VASYA[girlRasi] || [];
  if (list.includes(boyRasi)) return { score: 1, max: 1, note: `${RASIS[boyRasi]} வசம் ✓` };
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
    { name: "தின பொருத்தம்", ...dina(girlNak, boyNak, girlRasi, boyRasi) },
    { name: "கண பொருத்தம்", ...gana(boyNak, girlNak) },
    { name: "மகேந்திர பொருத்தம்", ...mahendra(girlNak, boyNak) },
    { name: "ஸ்த்ரீ தீர்க்க பொருத்தம்", ...streeDheergam(girlNak, boyNak) },
    { name: "யோனி பொருத்தம்", ...yoni(boyNak, girlNak) },
    { name: "ராசி பொருத்தம்", ...rasi(boyRasi, girlRasi, boyNak, girlNak) },
    { name: "ராசியதிபதி பொருத்தம்", ...rasiyathipathi(boyRasi, girlRasi) },
    { name: "வசிய பொருத்தம்", ...vasya(boyRasi, girlRasi) },
    { name: "ரஜ்ஜு பொருத்தம்", ...rajju(boyNak, girlNak) },
    { name: "வேத பொருத்தம்", ...vedha(boyNak, girlNak) },
  ];
  const total = items.reduce((s, i) => s + i.score, 0);
  const max = items.reduce((s, i) => s + i.max, 0);
  let verdict = "";
  const pct = (total / max) * 100;
  const hasCriticalMismatch = items.some(
    (item) => (item.name.includes("ரஜ்ஜு") || item.name.includes("வேத")) && item.score === 0,
  );
  if (hasCriticalMismatch) verdict = "ரஜ்ஜு / வேதை குறிப்பு உள்ளது — முழு ஜாதகத்துடன் ஆலோசிக்கவும்";
  else if (pct >= 75) verdict = "10 பொருத்தக் கணக்கில் உயர்ந்த மதிப்பு — முழு ஜாதகத்தையும் பரிசீலிக்கவும்";
  else if (pct >= 60) verdict = "10 பொருத்தக் கணக்கில் நல்ல மதிப்பு — முழு ஜாதகத்தையும் பரிசீலிக்கவும்";
  else if (pct >= 40) verdict = "10 பொருத்தக் கணக்கில் மிதமான மதிப்பு — ஜோதிடரிடம் ஆலோசிக்கவும்";
  else verdict = "10 பொருத்தக் கணக்கில் குறைந்த மதிப்பு — ஜோதிடரிடம் ஆலோசிக்கவும்";
  return { items, total, max, verdict };
}
