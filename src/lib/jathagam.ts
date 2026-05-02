// Vedic astrology calculations - sidereal positions using Lahiri ayanamsa
// Uses astronomia for high-precision astronomical calculations

import { julian, moonposition, solar, planetposition, base, elliptic, coord } from "astronomia";
import vsop87Bmercury from "astronomia/data/vsop87Bmercury";
import vsop87Bvenus from "astronomia/data/vsop87Bvenus";
import vsop87Bearth from "astronomia/data/vsop87Bearth";
import vsop87Bmars from "astronomia/data/vsop87Bmars";
import vsop87Bjupiter from "astronomia/data/vsop87Bjupiter";
import vsop87Bsaturn from "astronomia/data/vsop87Bsaturn";
import { computeUpagrahas } from "./upagrahas";
import { VARGAS, buildVargaChart } from "./vargas";

export const RASIS_TAMIL = [
  "மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி",
  "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்",
];

export const RASIS_EN = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

export const NAKSHATRAS_TAMIL = [
  "அஸ்வினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிஷம்", "திருவாதிரை",
  "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்",
  "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை",
  "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்",
  "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி",
];

export const NAKSHATRA_LORDS_TAMIL = [
  "கேது", "சுக்ரன்", "சூரியன்", "சந்திரன்", "செவ்வாய்", "ராகு",
  "குரு", "சனி", "புதன்", "கேது", "சுக்ரன்", "சூரியன்",
  "சந்திரன்", "செவ்வாய்", "ராகு", "குரு", "சனி", "புதன்",
  "கேது", "சுக்ரன்", "சூரியன்", "சந்திரன்", "செவ்வாய்", "ராகு",
  "குரு", "சனி", "புதன்",
];

export const PLANETS_TAMIL = {
  sun: "சூரியன்",
  moon: "சந்திரன்",
  mars: "செவ்வாய்",
  mercury: "புதன்",
  jupiter: "குரு",
  venus: "சுக்ரன்",
  saturn: "சனி",
  rahu: "ராகு",
  ketu: "கேது",
  ascendant: "லக்னம்",
};

// Lahiri ayanamsa approximation (degrees)
function lahiriAyanamsa(jd: number): number {
  // Reference: Lahiri ayanamsa = 23°51'11" at J2000 + ~50.27"/yr precession
  const t = (jd - 2451545.0) / 36525;
  const ay = 23.85 + 0.013966 * (jd - 2451545.0) / 365.25 * 0.0;
  // Better approximation:
  const ay2 = 23.85 + (jd - 2451545.0) / 365.25 * (50.2789 / 3600);
  return ay2;
}

function norm360(d: number): number {
  d = d % 360;
  return d < 0 ? d + 360 : d;
}

export interface BirthInput {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23 local
  minute: number; // 0-59
  tzOffsetHours: number; // e.g. +5.5 for IST
  latitude: number;
  longitude: number;
  placeName: string;
  name: string;
  gender?: string;
  phone?: string;
  fatherName?: string;
  motherName?: string;
}

export interface PlanetPosition {
  key: string;
  nameTamil: string;
  longitude: number; // sidereal
  rasiIndex: number; // 0-11
  rasiTamil: string;
  rasiEn: string;
  degreeInRasi: number;
  nakshatraIndex: number;
  nakshatraTamil: string;
  pada: number;
  retrograde?: boolean;
}

export const TITHIS_TAMIL = [
  "பிரதமை","துவிதியை","திருதியை","சதுர்த்தி","பஞ்சமி","சஷ்டி","சப்தமி","அஷ்டமி",
  "நவமி","தசமி","ஏகாதசி","துவாதசி","திரயோதசி","சதுர்த்தசி","பௌர்ணமி",
  "பிரதமை","துவிதியை","திருதியை","சதுர்த்தி","பஞ்சமி","சஷ்டி","சப்தமி","அஷ்டமி",
  "நவமி","தசமி","ஏகாதசி","துவாதசி","திரயோதசி","சதுர்த்தசி","அமாவாசை",
];

export const YOGAS_TAMIL = [
  "விஷ்கம்பம்","ப்ரீதி","ஆயுஷ்மான்","சௌபாக்கியம்","சோபனம்","அதிகண்டம்","சுகர்மம்","திருதி",
  "சூலம்","கண்டம்","விருத்தி","துருவம்","வியாகாதம்","ஹர்ஷணம்","வஜ்ரம்","சித்தி",
  "வியதீபாதம்","வரியான்","பரிகம்","சிவம்","சித்தம்","சாத்தியம்","சுபம்","சுக்லம்",
  "ப்ரம்மம்","ஐந்திரம்","வைதிருதி",
];

// 11 karanas: 7 movable repeat 8 times then 4 fixed at end of cycle (60 half-tithis)
export const KARANAS_TAMIL = [
  "பவ","பாலவ","கௌலவ","தைதுல","கரஜ","வணிஜ","விஷ்டி (பத்ரா)",
  "சகுனி","சதுஷ்பாத","நாகவ","கிம்ஸ்துக்னம்",
];

export interface PanchangamData {
  tithiIndex: number; // 0-29
  tithiTamil: string;
  paksha: "சுக்ல" | "கிருஷ்ண";
  yogaIndex: number; // 0-26
  yogaTamil: string;
  karanaIndex: number; // 0-10
  karanaTamil: string;
  vaaraTamil: string; // weekday
  sunriseLocal: Date;
  sunsetLocal: Date;
}

export interface MandiData {
  longitude: number;
  rasiIndex: number;
  rasiTamil: string;
  degreeInRasi: number;
  nakshatraTamil: string;
  pada: number;
}

export interface DashaNode {
  lord: string;
  startDate: Date;
  endDate: Date;
  children?: DashaNode[];
}

export interface AshtakavargaData {
  // Bhinna: per-planet bindus by rasi (7 planets x 12 rasis)
  bhinna: Record<string, number[]>;
  // Sarva: combined bindus per rasi
  sarva: number[];
}

export interface JathagamResult {
  input: BirthInput;
  jd: number;
  ayanamsa: number;
  ascendant: PlanetPosition;
  planets: PlanetPosition[];
  moon: PlanetPosition;
  sun: PlanetPosition;
  rasiTamil: string; // moon sign
  nakshatraTamil: string;
  pada: number;
  nakshatraLordTamil: string;
  lagnaTamil: string;
  // Vimshottari dasha
  currentDasha: { lord: string; startDate: Date; endDate: Date };
  dashaSequence: { lord: string; startDate: Date; endDate: Date }[];
  // Multi-level dasha tree (Maha → Bhukti → Antara → Sookshma → Athi-Sookshma)
  dashaTree: DashaNode[];
  currentDashaPath: { maha: string; bhukti: string; antara: string; sookshma: string; athiSookshma: string };
  // Rasi chart - 12 houses with planet keys
  rasiChart: string[][];
  // Navamsa chart D9 - 12 houses
  navamsaChart: string[][];
  navamsaPositions: { key: string; nameTamil: string; rasiIndex: number; rasiTamil: string }[];
  // Panchangam
  panchangam: PanchangamData;
  // Mandi / Gulika
  mandi: MandiData;
  gulika: MandiData;
  // Ashtakavarga
  ashtakavarga: AshtakavargaData;
  // Upagrahas (Dhuma, Vyatipata, Parivesha, Indrachapa, Upaketu)
  upagrahas: { key: string; name: string; longitude: number; rasiIndex: number; rasiTamil: string }[];
  // 16 Varga charts (D1..D60)
  vargaCharts: { key: string; label: string; tamilLabel: string; chart: string[][] }[];
}

function toJulianUT(input: BirthInput): number {
  // Convert local time to UT
  const utHourFloat = input.hour + input.minute / 60 - input.tzOffsetHours;
  // astronomia julian.CalendarGregorianToJD takes year, month, day(decimal)
  const dayFrac = input.day + utHourFloat / 24;
  return julian.CalendarGregorianToJD(input.year, input.month, dayFrac);
}

function getPlanetPosition(jd: number, ayanamsa: number, key: string, nameTamil: string, tropicalLon: number, retrograde = false): PlanetPosition {
  const sidereal = norm360(tropicalLon - ayanamsa);
  const rasiIndex = Math.floor(sidereal / 30);
  const degreeInRasi = sidereal - rasiIndex * 30;
  // Each nakshatra = 360/27 = 13.3333°, pada = nakshatra/4 = 3.3333°
  const nakshatraIndex = Math.floor(sidereal / (360 / 27));
  const padaSize = (360 / 27) / 4;
  const pada = Math.floor((sidereal - nakshatraIndex * (360 / 27)) / padaSize) + 1;
  return {
    key,
    nameTamil,
    longitude: sidereal,
    rasiIndex,
    rasiTamil: RASIS_TAMIL[rasiIndex],
    rasiEn: RASIS_EN[rasiIndex],
    degreeInRasi,
    nakshatraIndex,
    nakshatraTamil: NAKSHATRAS_TAMIL[nakshatraIndex],
    pada,
    retrograde,
  };
}

// Local Sidereal Time (in degrees) for ascendant calc
function localSiderealTime(jd: number, longitude: number): number {
  const t = (jd - 2451545.0) / 36525;
  let gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000;
  gmst = norm360(gmst);
  return norm360(gmst + longitude);
}

// Compute tropical ascendant given LST(deg), latitude(deg), obliquity(deg)
function computeAscendant(lstDeg: number, latDeg: number, oblDeg: number): number {
  const lst = (lstDeg * Math.PI) / 180;
  const lat = (latDeg * Math.PI) / 180;
  const obl = (oblDeg * Math.PI) / 180;
  // Standard formula: λ_Asc = atan2(cos(LST), -(sin(LST)·cos(ε) + tan(φ)·sin(ε)))
  const y = Math.cos(lst);
  const x = -(Math.sin(lst) * Math.cos(obl) + Math.tan(lat) * Math.sin(obl));
  let asc = Math.atan2(y, x) * (180 / Math.PI);
  asc = norm360(asc);
  return asc;
}

// Vimshottari dasha periods (years)
const DASHA_LORDS = ["கேது", "சுக்ரன்", "சூரியன்", "சந்திரன்", "செவ்வாய்", "ராகு", "குரு", "சனி", "புதன்"];
const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];
const NAK_TO_DASHA_INDEX = [0,1,2,3,4,5,6,7,8, 0,1,2,3,4,5,6,7,8, 0,1,2,3,4,5,6,7,8];

function computeDasha(moonLongitude: number, birthDate: Date) {
  const padaSize = 360 / 27;
  const nakIndex = Math.floor(moonLongitude / padaSize);
  const posInNak = moonLongitude - nakIndex * padaSize;
  const fractionElapsed = posInNak / padaSize;

  const startLordIdx = NAK_TO_DASHA_INDEX[nakIndex];
  const startLord = DASHA_LORDS[startLordIdx];
  const startYears = DASHA_YEARS[startLordIdx];

  // Remaining of first dasha
  const remainingYears = startYears * (1 - fractionElapsed);

  const sequence: { lord: string; startDate: Date; endDate: Date }[] = [];
  let cursor = new Date(birthDate);
  // First (partial) period
  let endFirst = addYears(cursor, remainingYears);
  sequence.push({ lord: startLord, startDate: cursor, endDate: endFirst });

  let idx = startLordIdx;
  cursor = endFirst;
  for (let i = 0; i < 8; i++) {
    idx = (idx + 1) % 9;
    const yrs = DASHA_YEARS[idx];
    const next = addYears(cursor, yrs);
    sequence.push({ lord: DASHA_LORDS[idx], startDate: cursor, endDate: next });
    cursor = next;
  }

  // Find current dasha
  const now = new Date();
  let current = sequence[0];
  for (const d of sequence) {
    if (now >= d.startDate && now < d.endDate) {
      current = d;
      break;
    }
  }
  return { current, sequence };
}

function addYears(date: Date, years: number): Date {
  const ms = years * 365.2425 * 24 * 3600 * 1000;
  return new Date(date.getTime() + ms);
}

// ----- Multi-level Vimshottari Dasha (5 levels) -----
function buildSubDasha(
  parentLord: string,
  parentStart: Date,
  parentEnd: Date,
  depth: number,
  maxDepth: number
): DashaNode[] {
  if (depth >= maxDepth) return [];
  const totalMs = parentEnd.getTime() - parentStart.getTime();
  const startIdx = DASHA_LORDS.indexOf(parentLord);
  const nodes: DashaNode[] = [];
  let cursor = new Date(parentStart);
  for (let i = 0; i < 9; i++) {
    const idx = (startIdx + i) % 9;
    const lord = DASHA_LORDS[idx];
    const fraction = DASHA_YEARS[idx] / 120;
    const subMs = totalMs * fraction;
    const end = new Date(cursor.getTime() + subMs);
    const node: DashaNode = { lord, startDate: new Date(cursor), endDate: end };
    if (depth + 1 < maxDepth) {
      node.children = buildSubDasha(lord, new Date(cursor), end, depth + 1, maxDepth);
    }
    nodes.push(node);
    cursor = end;
  }
  return nodes;
}

function computeDashaTree(moonLongitude: number, birthDate: Date): { tree: DashaNode[]; current: { maha: string; bhukti: string; antara: string; sookshma: string; athiSookshma: string } } {
  const padaSize = 360 / 27;
  const nakIndex = Math.floor(moonLongitude / padaSize);
  const posInNak = moonLongitude - nakIndex * padaSize;
  const fractionElapsed = posInNak / padaSize;
  const startLordIdx = NAK_TO_DASHA_INDEX[nakIndex];

  const tree: DashaNode[] = [];
  let cursor = new Date(birthDate);
  for (let i = 0; i < 9; i++) {
    const idx = (startLordIdx + i) % 9;
    const lord = DASHA_LORDS[idx];
    let yrs = DASHA_YEARS[idx];
    if (i === 0) yrs = yrs * (1 - fractionElapsed);
    const end = addYears(cursor, yrs);
    const node: DashaNode = { lord, startDate: new Date(cursor), endDate: end };
    node.children = buildSubDasha(lord, new Date(cursor), end, 1, 5);
    tree.push(node);
    cursor = end;
  }

  const now = new Date();
  const findCurrent = (nodes: DashaNode[]): DashaNode | null => {
    for (const n of nodes) if (now >= n.startDate && now < n.endDate) return n;
    return null;
  };
  const maha = findCurrent(tree);
  const bhukti = maha?.children ? findCurrent(maha.children) : null;
  const antara = bhukti?.children ? findCurrent(bhukti.children) : null;
  const sookshma = antara?.children ? findCurrent(antara.children) : null;
  const athi = sookshma?.children ? findCurrent(sookshma.children) : null;

  return {
    tree,
    current: {
      maha: maha?.lord ?? "",
      bhukti: bhukti?.lord ?? "",
      antara: antara?.lord ?? "",
      sookshma: sookshma?.lord ?? "",
      athiSookshma: athi?.lord ?? "",
    },
  };
}

// ----- Navamsa (D9) - Parashara rule -----
// Movable signs (Aries, Cancer, Libra, Capricorn) → navamsa starts from same sign
// Fixed signs (Taurus, Leo, Scorpio, Aquarius)    → navamsa starts from 9th sign
// Dual signs (Gemini, Virgo, Sagittarius, Pisces) → navamsa starts from 5th sign
// Resulting start map: [Aries, Capricorn, Libra, Cancer, Aries, Capricorn, Libra, Cancer, ...]
function navamsaRasi(siderealLon: number): number {
  const rasi = Math.floor(siderealLon / 30);
  const degInRasi = siderealLon - rasi * 30;
  const navIdx = Math.floor(degInRasi / (30 / 9)); // 0..8
  const startMap = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3];
  return (startMap[rasi] + navIdx) % 12;
}

// ----- Sunrise / Sunset (NOAA approximation) -----
function sunriseSunset(year: number, month: number, day: number, lat: number, lon: number, tzHours: number): { sunrise: Date; sunset: Date } {
  const dt = new Date(Date.UTC(year, month - 1, day));
  const start = new Date(Date.UTC(year, 0, 1));
  const N = Math.floor((dt.getTime() - start.getTime()) / 86400000) + 1;
  const calc = (rising: boolean): number => {
    const lonHour = lon / 15;
    const t = N + ((rising ? 6 : 18) - lonHour) / 24;
    const M = 0.9856 * t - 3.289;
    let L = M + 1.916 * Math.sin((M * Math.PI) / 180) + 0.02 * Math.sin((2 * M * Math.PI) / 180) + 282.634;
    L = norm360(L);
    let RA = (Math.atan(0.91764 * Math.tan((L * Math.PI) / 180)) * 180) / Math.PI;
    RA = norm360(RA);
    const Lq = Math.floor(L / 90) * 90;
    const RAq = Math.floor(RA / 90) * 90;
    RA = RA + (Lq - RAq);
    RA = RA / 15;
    const sinDec = 0.39782 * Math.sin((L * Math.PI) / 180);
    const cosDec = Math.cos(Math.asin(sinDec));
    const zenith = 90.833;
    const cosH = (Math.cos((zenith * Math.PI) / 180) - sinDec * Math.sin((lat * Math.PI) / 180)) / (cosDec * Math.cos((lat * Math.PI) / 180));
    if (cosH > 1 || cosH < -1) return rising ? 6 : 18;
    let H = (Math.acos(cosH) * 180) / Math.PI;
    if (rising) H = 360 - H;
    H = H / 15;
    const T = H + RA - 0.06571 * t - 6.622;
    let UT = T - lonHour;
    UT = ((UT % 24) + 24) % 24;
    return UT + tzHours;
  };
  const sr = calc(true);
  const ss = calc(false);
  const toDate = (h: number) => {
    let dayOff = 0;
    let hLocal = h;
    if (hLocal >= 24) { hLocal -= 24; dayOff = 1; }
    if (hLocal < 0) { hLocal += 24; dayOff = -1; }
    const hh = Math.floor(hLocal);
    const mm = Math.floor((hLocal - hh) * 60);
    const ss2 = Math.floor(((hLocal - hh) * 60 - mm) * 60);
    return new Date(Date.UTC(year, month - 1, day + dayOff, hh - tzHours, mm, ss2));
  };
  return { sunrise: toDate(sr), sunset: toDate(ss) };
}

const VAARA_TAMIL = ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"];

function computePanchangam(sunSidereal: number, moonSidereal: number, sunrise: Date, sunset: Date, birthLocal: Date): PanchangamData {
  const diff = norm360(moonSidereal - sunSidereal);
  const tithiIndex = Math.floor(diff / 12);
  const paksha: "சுக்ல" | "கிருஷ்ண" = tithiIndex < 15 ? "சுக்ல" : "கிருஷ்ண";
  const yogaSum = norm360(sunSidereal + moonSidereal);
  const yogaIndex = Math.floor(yogaSum / (360 / 27));
  const halfIdx = Math.floor(diff / 6);
  let karanaIndex: number;
  if (halfIdx === 0) karanaIndex = 10;
  else if (halfIdx >= 1 && halfIdx <= 56) karanaIndex = (halfIdx - 1) % 7;
  else if (halfIdx === 57) karanaIndex = 7;
  else if (halfIdx === 58) karanaIndex = 8;
  else karanaIndex = 9;
  const vaaraTamil = VAARA_TAMIL[birthLocal.getUTCDay()];
  return {
    tithiIndex, tithiTamil: TITHIS_TAMIL[tithiIndex], paksha,
    yogaIndex, yogaTamil: YOGAS_TAMIL[yogaIndex],
    karanaIndex, karanaTamil: KARANAS_TAMIL[karanaIndex],
    vaaraTamil, sunriseLocal: sunrise, sunsetLocal: sunset,
  };
}

// ----- Mandi / Gulika (traditional fractions of day/night, weekday Sun..Sat) -----
const GULIKA_DAY_FRAC = [26 / 30, 22 / 30, 18 / 30, 14 / 30, 10 / 30, 6 / 30, 2 / 30];
const GULIKA_NIGHT_FRAC = [10 / 30, 6 / 30, 2 / 30, 26 / 30, 22 / 30, 18 / 30, 14 / 30];

function computeUpagrahaLon(sunrise: Date, sunset: Date, lat: number, lon: number, ayanamsa: number, frac: number, isDaytime: boolean): number {
  const periodMs = isDaytime
    ? sunset.getTime() - sunrise.getTime()
    : 24 * 3600 * 1000 - (sunset.getTime() - sunrise.getTime());
  const startTime = isDaytime
    ? new Date(sunrise.getTime() + periodMs * frac)
    : new Date(sunset.getTime() + periodMs * frac);
  const jdGul = julian.CalendarGregorianToJD(
    startTime.getUTCFullYear(),
    startTime.getUTCMonth() + 1,
    startTime.getUTCDate() + (startTime.getUTCHours() + startTime.getUTCMinutes() / 60 + startTime.getUTCSeconds() / 3600) / 24
  );
  const lstG = localSiderealTime(jdGul, lon);
  const T = (jdGul - 2451545.0) / 36525;
  const obl = 23.4392911 - 0.0130042 * T;
  const ascTrop = computeAscendant(lstG, lat, obl);
  return norm360(ascTrop - ayanamsa);
}

function makeMandiData(siderealLon: number): MandiData {
  const rasiIndex = Math.floor(siderealLon / 30);
  const degreeInRasi = siderealLon - rasiIndex * 30;
  const nakIdx = Math.floor(siderealLon / (360 / 27));
  const padaSize = (360 / 27) / 4;
  const pada = Math.floor((siderealLon - nakIdx * (360 / 27)) / padaSize) + 1;
  return {
    longitude: siderealLon, rasiIndex, rasiTamil: RASIS_TAMIL[rasiIndex],
    degreeInRasi, nakshatraTamil: NAKSHATRAS_TAMIL[nakIdx], pada,
  };
}

// ----- Ashtakavarga (Bhinnashtakavarga - classical Parashara rules) -----
const ASHTAK_RULES: Record<string, Record<string, number[]>> = {
  sun: { sun: [1,2,4,7,8,9,10,11], moon: [3,6,10,11], mars: [1,2,4,7,8,9,10,11], mercury: [3,5,6,9,10,11,12], jupiter: [5,6,9,11], venus: [6,7,12], saturn: [1,2,4,7,8,9,10,11], ascendant: [3,4,6,10,11,12] },
  moon: { sun: [3,6,7,8,10,11], moon: [1,3,6,7,9,10,11], mars: [2,3,5,6,9,10,11], mercury: [1,3,4,5,7,8,10,11], jupiter: [1,4,7,8,10,11,12], venus: [3,4,5,7,9,10,11], saturn: [3,5,6,11], ascendant: [3,6,10,11] },
  mars: { sun: [3,5,6,10,11], moon: [3,6,11], mars: [1,2,4,7,8,10,11], mercury: [3,5,6,11], jupiter: [6,10,11,12], venus: [6,8,11,12], saturn: [1,4,7,8,9,10,11], ascendant: [1,3,6,10,11] },
  mercury: { sun: [5,6,9,11,12], moon: [2,4,6,8,10,11], mars: [1,2,4,7,8,9,10,11], mercury: [1,3,5,6,9,10,11,12], jupiter: [6,8,11,12], venus: [1,2,3,4,5,8,9,11], saturn: [1,2,4,7,8,9,10,11], ascendant: [1,2,4,6,8,10,11] },
  jupiter: { sun: [1,2,3,4,7,8,9,10,11], moon: [2,5,7,9,11], mars: [1,2,4,7,8,10,11], mercury: [1,2,4,5,6,9,10,11], jupiter: [1,2,3,4,7,8,10,11], venus: [2,5,6,9,10,11], saturn: [3,5,6,12], ascendant: [1,2,4,5,6,7,9,10,11] },
  venus: { sun: [8,11,12], moon: [1,2,3,4,5,8,9,11,12], mars: [3,5,6,9,11,12], mercury: [3,5,6,9,11], jupiter: [5,8,9,10,11], venus: [1,2,3,4,5,8,9,10,11], saturn: [3,4,5,8,9,10,11], ascendant: [1,2,3,4,5,8,9,11] },
  saturn: { sun: [1,2,4,7,8,10,11], moon: [3,6,11], mars: [3,5,6,10,11,12], mercury: [6,8,9,10,11,12], jupiter: [5,6,11,12], venus: [6,11,12], saturn: [3,5,6,11], ascendant: [1,3,4,6,10,11] },
};

function computeAshtakavarga(planets: PlanetPosition[], ascendant: PlanetPosition): AshtakavargaData {
  const bhinna: Record<string, number[]> = {};
  const sarva = new Array(12).fill(0);
  const refMap: Record<string, number> = {
    sun: planets.find(p => p.key === "sun")!.rasiIndex,
    moon: planets.find(p => p.key === "moon")!.rasiIndex,
    mars: planets.find(p => p.key === "mars")!.rasiIndex,
    mercury: planets.find(p => p.key === "mercury")!.rasiIndex,
    jupiter: planets.find(p => p.key === "jupiter")!.rasiIndex,
    venus: planets.find(p => p.key === "venus")!.rasiIndex,
    saturn: planets.find(p => p.key === "saturn")!.rasiIndex,
    ascendant: ascendant.rasiIndex,
  };
  for (const target of Object.keys(ASHTAK_RULES)) {
    const bindus = new Array(12).fill(0);
    const rules = ASHTAK_RULES[target];
    for (const contributor of Object.keys(rules)) {
      const refRasi = refMap[contributor];
      for (const houseNum of rules[contributor]) {
        const targetRasi = (refRasi + houseNum - 1) % 12;
        bindus[targetRasi] += 1;
      }
    }
    bhinna[target] = bindus;
    for (let i = 0; i < 12; i++) sarva[i] += bindus[i];
  }
  return { bhinna, sarva };
}

export function computeJathagam(input: BirthInput): JathagamResult {
  const jd = toJulianUT(input);
  const ayanamsa = lahiriAyanamsa(jd);

  // Sun (apparent geocentric ecliptic longitude)
  const sunLon = (solar.apparentLongitude(base.J2000Century(jd)) * 180) / Math.PI;

  // Moon
  const moonPos = moonposition.position(jd);
  const moonLon = (moonPos.lon * 180) / Math.PI;

  // Planets via VSOP87B - geocentric apparent ecliptic longitude using elliptic.position
  const earth = new planetposition.Planet(vsop87Bearth);
  const planetData: { key: string; data: any }[] = [
    { key: "mercury", data: vsop87Bmercury },
    { key: "venus", data: vsop87Bvenus },
    { key: "mars", data: vsop87Bmars },
    { key: "jupiter", data: vsop87Bjupiter },
    { key: "saturn", data: vsop87Bsaturn },
  ];

  const planetTropical: Record<string, number> = {
    sun: sunLon,
    moon: moonLon,
  };
  const planetRetro: Record<string, boolean> = {};

  // Convert equatorial -> ecliptic longitude (degrees, normalised)
  const eqToEclLon = (ra: number, dec: number) => {
    const eq = new coord.Equatorial(ra, dec);
    const ecl = eq.toEcliptic(base.SOblJ2000, base.COblJ2000);
    return norm360((ecl.lon * 180) / Math.PI);
  };

  for (const p of planetData) {
    try {
      const planet = new planetposition.Planet(p.data);
      const eq = elliptic.position(planet, earth, jd);
      const lon = eqToEclLon(eq.ra, eq.dec);
      // Retrograde detection: compare with position 1 day later
      const eq2 = elliptic.position(planet, earth, jd + 1);
      const lon2 = eqToEclLon(eq2.ra, eq2.dec);
      let delta = lon2 - lon;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      planetRetro[p.key] = delta < 0;
      planetTropical[p.key] = lon;
    } catch (e) {
      planetTropical[p.key] = 0;
      planetRetro[p.key] = false;
    }
  }

  // Rahu (Mean Lunar Node ascending) - always retrograde in Vedic
  const T = (jd - 2451545.0) / 36525;
  const meanNode = norm360(125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000);
  planetTropical.rahu = meanNode;
  planetTropical.ketu = norm360(meanNode + 180);

  // Ascendant
  const lst = localSiderealTime(jd, input.longitude);
  const obliquity = 23.4392911 - 0.0130042 * T; // degrees
  const ascTropical = computeAscendant(lst, input.latitude, obliquity);

  const planets: PlanetPosition[] = [
    getPlanetPosition(jd, ayanamsa, "sun", PLANETS_TAMIL.sun, planetTropical.sun),
    getPlanetPosition(jd, ayanamsa, "moon", PLANETS_TAMIL.moon, planetTropical.moon),
    getPlanetPosition(jd, ayanamsa, "mars", PLANETS_TAMIL.mars, planetTropical.mars, planetRetro.mars),
    getPlanetPosition(jd, ayanamsa, "mercury", PLANETS_TAMIL.mercury, planetTropical.mercury, planetRetro.mercury),
    getPlanetPosition(jd, ayanamsa, "jupiter", PLANETS_TAMIL.jupiter, planetTropical.jupiter, planetRetro.jupiter),
    getPlanetPosition(jd, ayanamsa, "venus", PLANETS_TAMIL.venus, planetTropical.venus, planetRetro.venus),
    getPlanetPosition(jd, ayanamsa, "saturn", PLANETS_TAMIL.saturn, planetTropical.saturn, planetRetro.saturn),
    getPlanetPosition(jd, ayanamsa, "rahu", PLANETS_TAMIL.rahu, planetTropical.rahu, true),
    getPlanetPosition(jd, ayanamsa, "ketu", PLANETS_TAMIL.ketu, planetTropical.ketu, true),
  ];
  const ascendant = getPlanetPosition(jd, ayanamsa, "ascendant", PLANETS_TAMIL.ascendant, ascTropical);
  const moon = planets.find((p) => p.key === "moon")!;
  const sun = planets.find((p) => p.key === "sun")!;

  // Rasi chart - 12 houses keyed by rasi index (0=Aries)
  const rasiChart: string[][] = Array.from({ length: 12 }, () => []);
  for (const p of planets) rasiChart[p.rasiIndex].push(p.key);
  rasiChart[ascendant.rasiIndex].unshift("ascendant");

  // Birth date as JS Date (UT adjusted). tzOffsetHours can be fractional (e.g. 5.5) so
  // convert the offset into whole minutes to avoid passing fractional hours to Date.UTC.
  const utMinutes = Math.round((input.hour * 60 + input.minute) - input.tzOffsetHours * 60);
  const localDate = new Date(Date.UTC(input.year, input.month - 1, input.day, 0, utMinutes));

  const dasha = computeDasha(moon.longitude, localDate);
  const lordIdx = NAK_TO_DASHA_INDEX[moon.nakshatraIndex];

  // Multi-level dasha
  const dashaTreeData = computeDashaTree(moon.longitude, localDate);

  // Navamsa chart
  const navamsaPositions = [...planets, ascendant].map((p) => {
    const navIdx = navamsaRasi(p.longitude);
    return { key: p.key, nameTamil: p.nameTamil, rasiIndex: navIdx, rasiTamil: RASIS_TAMIL[navIdx] };
  });
  const navamsaChart: string[][] = Array.from({ length: 12 }, () => []);
  for (const np of navamsaPositions) {
    if (np.key === "ascendant") navamsaChart[np.rasiIndex].unshift("ascendant");
    else navamsaChart[np.rasiIndex].push(np.key);
  }

  // Sunrise / sunset / panchangam
  const { sunrise, sunset } = sunriseSunset(input.year, input.month, input.day, input.latitude, input.longitude, input.tzOffsetHours);
  const birthMs = localDate.getTime();
  const isDaytime = birthMs >= sunrise.getTime() && birthMs < sunset.getTime();
  const panchangam = computePanchangam(sun.longitude, moon.longitude, sunrise, sunset, localDate);

  // Mandi & Gulika
  const weekday = sunrise.getUTCDay();
  const gulikaFrac = isDaytime ? GULIKA_DAY_FRAC[weekday] : GULIKA_NIGHT_FRAC[weekday];
  const gulikaLon = computeUpagrahaLon(sunrise, sunset, input.latitude, input.longitude, ayanamsa, gulikaFrac, isDaytime);
  // Mandi traditionally = same Saturn-portion (some traditions equate them)
  const mandiLon = gulikaLon;
  const gulika = makeMandiData(gulikaLon);
  const mandi = makeMandiData(mandiLon);

  // Ashtakavarga
  const ashtakavarga = computeAshtakavarga(planets, ascendant);

  // Upagrahas
  const upagrahas = computeUpagrahas(sun.longitude).map((u) => ({
    ...u, rasiTamil: RASIS_TAMIL[u.rasiIndex],
  }));

  // 16 Varga charts
  const planetLons = planets.map((p) => ({ key: p.key, longitude: p.longitude }));
  const vargaCharts = VARGAS.map((v) => ({
    key: v.key,
    label: v.label,
    tamilLabel: v.tamilLabel,
    chart: buildVargaChart(v.fn, planetLons, ascendant.longitude),
  }));

  return {
    input, jd, ayanamsa, ascendant, planets, moon, sun,
    rasiTamil: moon.rasiTamil,
    nakshatraTamil: moon.nakshatraTamil,
    pada: moon.pada,
    nakshatraLordTamil: DASHA_LORDS[lordIdx],
    lagnaTamil: ascendant.rasiTamil,
    currentDasha: dasha.current,
    dashaSequence: dasha.sequence,
    dashaTree: dashaTreeData.tree,
    currentDashaPath: dashaTreeData.current,
    rasiChart,
    navamsaChart,
    navamsaPositions,
    panchangam,
    mandi,
    gulika,
    ashtakavarga,
    upagrahas,
    vargaCharts,
  };
}

export function formatDegree(deg: number): string {
  const d = Math.floor(deg);
  const mFloat = (deg - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${d}° ${m}' ${s}"`;
}
