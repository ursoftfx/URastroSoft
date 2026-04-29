// Divisional charts (Vargas) — 16 standard divisions
// Input: sidereal longitude. Output: rasi index (0-11) for that varga
import { norm360 } from "./astro-utils";

// D1 - Rasi
export const d1 = (lon: number) => Math.floor(lon / 30);

// D2 - Hora (wealth) — Sun's hora for odd, Moon's for even
export const d2 = (lon: number) => {
  const rasi = Math.floor(lon / 30);
  const deg = lon - rasi * 30;
  const oddRasi = rasi % 2 === 0; // Aries=0 is odd
  if (oddRasi) return deg < 15 ? 4 : 3; // Sun=Leo, Moon=Cancer
  return deg < 15 ? 3 : 4;
};

// D3 - Drekkana (siblings) — 1st, 5th, 9th from rasi
export const d3 = (lon: number) => {
  const rasi = Math.floor(lon / 30);
  const deg = lon - rasi * 30;
  const part = Math.floor(deg / 10);
  return (rasi + part * 4) % 12;
};

// D4 - Chaturthamsa (fortune/property)
export const d4 = (lon: number) => {
  const rasi = Math.floor(lon / 30);
  const deg = lon - rasi * 30;
  const part = Math.floor(deg / 7.5);
  return (rasi + part * 3) % 12;
};

// D7 - Saptamsa (children)
export const d7 = (lon: number) => {
  const rasi = Math.floor(lon / 30);
  const deg = lon - rasi * 30;
  const part = Math.floor(deg / (30 / 7));
  const start = rasi % 2 === 0 ? rasi : (rasi + 6) % 12;
  return (start + part) % 12;
};

// D9 - Navamsa
export const d9 = (lon: number) => {
  const rasi = Math.floor(lon / 30);
  const deg = lon - rasi * 30;
  const part = Math.floor(deg / (30 / 9));
  const startMap = [0, 8, 4, 0, 8, 4, 0, 8, 4, 0, 8, 4];
  return (startMap[rasi] + part) % 12;
};

// D10 - Dasamsa (career)
export const d10 = (lon: number) => {
  const rasi = Math.floor(lon / 30);
  const deg = lon - rasi * 30;
  const part = Math.floor(deg / 3);
  const start = rasi % 2 === 0 ? rasi : (rasi + 8) % 12;
  return (start + part) % 12;
};

// D12 - Dwadasamsa (parents)
export const d12 = (lon: number) => {
  const rasi = Math.floor(lon / 30);
  const deg = lon - rasi * 30;
  const part = Math.floor(deg / 2.5);
  return (rasi + part) % 12;
};

// D16 - Shodasamsa (vehicles, comforts)
export const d16 = (lon: number) => {
  const rasi = Math.floor(lon / 30);
  const deg = lon - rasi * 30;
  const part = Math.floor(deg / (30 / 16));
  const startMap = [0, 4, 8, 0, 4, 8, 0, 4, 8, 0, 4, 8];
  return (startMap[rasi] + part) % 12;
};

// D20 - Vimsamsa (spiritual)
export const d20 = (lon: number) => {
  const rasi = Math.floor(lon / 30);
  const deg = lon - rasi * 30;
  const part = Math.floor(deg / 1.5);
  const startMap = [0, 8, 4, 0, 8, 4, 0, 8, 4, 0, 8, 4];
  return (startMap[rasi] + part) % 12;
};

// D24 - Chaturvimsamsa (education)
export const d24 = (lon: number) => {
  const rasi = Math.floor(lon / 30);
  const deg = lon - rasi * 30;
  const part = Math.floor(deg / 1.25);
  const start = rasi % 2 === 0 ? 4 : 3; // Leo for odd, Cancer for even
  return (start + part) % 12;
};

// D27 - Saptavimsamsa / Bhamsa (strengths/weaknesses)
export const d27 = (lon: number) => {
  const rasi = Math.floor(lon / 30);
  const deg = lon - rasi * 30;
  const part = Math.floor(deg / (30 / 27));
  // Fire=Aries(0), Earth=Capricorn(9), Air=Libra(6), Water=Cancer(3)
  const startMap = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3];
  return (startMap[rasi] + part) % 12;
};

// D30 - Trimsamsa (misfortunes) — uneven
export const d30 = (lon: number) => {
  const rasi = Math.floor(lon / 30);
  const deg = lon - rasi * 30;
  const odd = rasi % 2 === 0;
  if (odd) {
    if (deg < 5) return 0;       // Mars→Aries
    if (deg < 10) return 10;     // Saturn→Aquarius
    if (deg < 18) return 8;      // Jupiter→Sagittarius
    if (deg < 25) return 2;      // Mercury→Gemini
    return 6;                    // Venus→Libra
  } else {
    if (deg < 5) return 1;       // Venus→Taurus
    if (deg < 12) return 5;      // Mercury→Virgo
    if (deg < 20) return 11;     // Jupiter→Pisces
    if (deg < 25) return 9;      // Saturn→Capricorn
    return 7;                    // Mars→Scorpio
  }
};

// D40 - Khavedamsa (auspicious effects)
export const d40 = (lon: number) => {
  const rasi = Math.floor(lon / 30);
  const deg = lon - rasi * 30;
  const part = Math.floor(deg / 0.75);
  const start = rasi % 2 === 0 ? 0 : 6;
  return (start + part) % 12;
};

// D45 - Akshavedamsa (general indications)
export const d45 = (lon: number) => {
  const rasi = Math.floor(lon / 30);
  const deg = lon - rasi * 30;
  const part = Math.floor(deg / (30 / 45));
  // Movable=Aries, Fixed=Leo, Dual=Sagittarius
  const startMap = [0, 4, 8, 0, 4, 8, 0, 4, 8, 0, 4, 8];
  return (startMap[rasi] + part) % 12;
};

// D60 - Shashtiamsa (overall fine indications)
export const d60 = (lon: number) => {
  const rasi = Math.floor(lon / 30);
  const deg = lon - rasi * 30;
  const part = Math.floor(deg / 0.5);
  return (rasi + part) % 12;
};

export interface VargaDef {
  key: string;
  label: string;
  tamilLabel: string;
  fn: (lon: number) => number;
}

export const VARGAS: VargaDef[] = [
  { key: "D1",  label: "Rasi",          tamilLabel: "ராசி",            fn: d1 },
  { key: "D2",  label: "Hora",          tamilLabel: "ஹோரை",            fn: d2 },
  { key: "D3",  label: "Drekkana",      tamilLabel: "த்ரேக்காணம்",      fn: d3 },
  { key: "D4",  label: "Chaturthamsa",  tamilLabel: "சதுர்த்தாம்சம்",   fn: d4 },
  { key: "D7",  label: "Saptamsa",      tamilLabel: "சப்தாம்சம்",       fn: d7 },
  { key: "D9",  label: "Navamsa",       tamilLabel: "நவாம்சம்",          fn: d9 },
  { key: "D10", label: "Dasamsa",       tamilLabel: "தசாம்சம்",          fn: d10 },
  { key: "D12", label: "Dwadasamsa",    tamilLabel: "துவாதசாம்சம்",     fn: d12 },
  { key: "D16", label: "Shodasamsa",    tamilLabel: "ஷோடசாம்சம்",       fn: d16 },
  { key: "D20", label: "Vimsamsa",      tamilLabel: "விம்சாம்சம்",       fn: d20 },
  { key: "D24", label: "Chaturvimsamsa",tamilLabel: "சதுர்விம்சாம்சம்", fn: d24 },
  { key: "D27", label: "Bhamsa",        tamilLabel: "பாம்சம்",          fn: d27 },
  { key: "D30", label: "Trimsamsa",     tamilLabel: "த்ரிம்சாம்சம்",    fn: d30 },
  { key: "D40", label: "Khavedamsa",    tamilLabel: "கவேதாம்சம்",       fn: d40 },
  { key: "D45", label: "Akshavedamsa",  tamilLabel: "அக்ஷவேதாம்சம்",    fn: d45 },
  { key: "D60", label: "Shashtiamsa",   tamilLabel: "ஷஷ்டியாம்சம்",     fn: d60 },
];

export type VargaChart = string[][]; // 12 rasis -> planet keys

export function buildVargaChart(
  fn: (lon: number) => number,
  planets: { key: string; longitude: number }[],
  ascendantLon: number
): VargaChart {
  const chart: string[][] = Array.from({ length: 12 }, () => []);
  chart[fn(ascendantLon)].unshift("ascendant");
  for (const p of planets) chart[fn(p.longitude)].push(p.key);
  return chart;
}
