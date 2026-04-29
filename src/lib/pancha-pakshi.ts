// Pancha Pakshi (5 birds) — based on Nakshatra
// Birds: Vulture(கழுகு), Owl(ஆந்தை), Crow(காகம்), Cock(சேவல்), Peacock(மயில்)
const NAKSHATRA_BIRD: Record<number, string> = {};
const BIRD_LIST = ["கழுகு", "ஆந்தை", "காகம்", "சேவல்", "மயில்"];
const BIRD_NAK: Record<string, number[]> = {
  "கழுகு": [0, 5, 10, 15, 20, 25],
  "ஆந்தை": [1, 6, 11, 16, 21, 26],
  "காகம்":  [2, 7, 12, 17, 22],
  "சேவல்":  [3, 8, 13, 18, 23],
  "மயில்":  [4, 9, 14, 19, 24],
};
for (const [b, naks] of Object.entries(BIRD_NAK)) {
  for (const n of naks) NAKSHATRA_BIRD[n] = b;
}

const BIRD_NATURE: Record<string, string> = {
  "கழுகு": "தலைமை, ஆட்சி, பெருமை — சக்தி வாய்ந்த பறவை. அதிகாரம் & தைரியம்.",
  "ஆந்தை":  "ஆழ்ந்த சிந்தனை, ரகசியம், ஞானம் — இரவு நேரத்தில் சக்தி.",
  "காகம்":  "கடின உழைப்பு, விழிப்புணர்வு, புத்திசாலித்தனம், தொடர்பு.",
  "சேவல்":  "உற்சாகம், போர்க்குணம், சுதந்திரம், தலைமை.",
  "மயில்":  "அழகு, கலை, ஆடம்பரம், ஈர்ப்பு, காதல்.",
};

const BIRD_FRIENDS: Record<string, string[]> = {
  "கழுகு": ["காகம்"],
  "ஆந்தை":  ["மயில்"],
  "காகம்":  ["கழுகு", "சேவல்"],
  "சேவல்":  ["காகம்", "மயில்"],
  "மயில்":  ["ஆந்தை", "சேவல்"],
};

const BIRD_ENEMIES: Record<string, string[]> = {
  "கழுகு": ["சேவல்"],
  "ஆந்தை":  ["காகம்"],
  "காகம்":  ["ஆந்தை"],
  "சேவல்":  ["கழுகு"],
  "மயில்":  [],
};

export interface PanchaPakshiResult {
  bird: string;
  nature: string;
  friends: string[];
  enemies: string[];
}

export function panchaPakshi(nakshatraIdx: number): PanchaPakshiResult {
  const bird = NAKSHATRA_BIRD[nakshatraIdx] || "காகம்";
  return {
    bird,
    nature: BIRD_NATURE[bird],
    friends: BIRD_FRIENDS[bird] || [],
    enemies: BIRD_ENEMIES[bird] || [],
  };
}
