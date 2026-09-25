import { computeJathagam, JathagamResult } from "@/lib/jathagam";

/** Jama grahas in fixed order, each 45° apart (verified against reference charts). */
export const JAMA_GRAHAS = [
  { key: "sun", short: "சூரி" },
  { key: "pambu", short: "பாம்பு" },
  { key: "moon", short: "சந்" },
  { key: "saturn", short: "சனி" },
  { key: "venus", short: "சுக்" },
  { key: "mercury", short: "புத" },
  { key: "jupiter", short: "குரு" },
  { key: "mars", short: "செவ்" },
] as const;

// Weekday lord (0=Sun … 6=Sat) → index in JAMA_GRAHAS
const DAY_LORD_IDX = [0, 2, 7, 5, 6, 4, 3];
const DAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export interface JamakkolData {
  date: Date;
  weekday: number;
  weekdayEn: string;
  jamam: number; // 1-8
  jama: { key: string; short: string; lon: number }[];
  udayam: number;
  arudam: number;
  kavippu: number;
  chart: JathagamResult;
  sunrise: number; // local minutes
  sunset: number;
}

const norm = (x: number) => ((x % 360) + 360) % 360;

/**
 * Rules (reverse-engineered & verified on 2 reference charts):
 * - Jamakkol day starts 6:00 AM; 8 jamams of 90 min (4 day + 4 night).
 * - At 6:00 AM the weekday lord's jama graha is at 0° (Mesha start).
 * - Jama grahas move backwards 45° per jamam (0.5°/min), all 45° apart.
 * - Udayam = Sun at sunrise, full 360° circle during day (sunrise→sunset) and again at night.
 * - Arudam = rasi chosen by the querent (default: udayam's rasi).
 * - Kavippu = mirror of Arudam (360° − arudam), ±1 rasi by udayam rasi parity.
 */
export function computeJamakkol(date: Date, place: { lat: number; lon: number; tz: number }, arudamRasi?: number, arudamDeg = 0): JamakkolData {
  const tzMs = place.tz * 3600_000;
  const local = new Date(date.getTime() + tzMs); // use UTC getters as local
  let minutes = local.getUTCHours() * 60 + local.getUTCMinutes() + local.getUTCSeconds() / 60;
  let weekday = local.getUTCDay();
  let t = minutes - 360;
  if (t < 0) { t += 1440; weekday = (weekday + 6) % 7; }
  const jamam = Math.min(8, Math.floor(t / 90) + 1);

  const sunStart = norm(0 - DAY_LORD_IDX[weekday] * 45);
  const sunLon = norm(sunStart - 0.5 * t);
  const jama = JAMA_GRAHAS.map((g, i) => ({ ...g, lon: norm(sunLon + i * 45) }));

  const chart = computeJathagam({
    year: local.getUTCFullYear(), month: local.getUTCMonth() + 1, day: local.getUTCDate(),
    hour: local.getUTCHours(), minute: local.getUTCMinutes() + local.getUTCSeconds() / 60,
    tzOffsetHours: place.tz, latitude: place.lat, longitude: place.lon, placeName: "", name: "",
  } as never);

  const { sr: srM, ss: ssM } = sunTimes(local.getUTCFullYear(), local.getUTCMonth() + 1, local.getUTCDate(), place.lat, place.lon, place.tz);
  const dayLen = ssM - srM;
  let u = minutes - srM; if (u < 0) u += 1440;
  const udayam = norm(chart.sun.longitude + (u <= dayLen ? (u / dayLen) * 360 : ((u - dayLen) / (1440 - dayLen)) * 360));
  const sunrise = srM, sunset = ssM;

  // Auto Arudam = clock minute-hand position from Mesham 0° (6° per minute), matches 3 refs.
  const minuteHand = norm((local.getUTCMinutes() + local.getUTCSeconds() / 60) * 6);
  const arudam = arudamRasi === undefined ? minuteHand : arudamRasi * 30 + Math.min(29.99, Math.max(0, arudamDeg));
  // Mirror of arudam, shifted +1 rasi when udayam is in an even rasi, −1 when odd (matches both references)
  const udayamEven = Math.floor(udayam / 30) % 2 === 1;
  const kavippu = norm(360 - arudam + (udayamEven ? 30 : -30));

  return { sunrise, sunset, date, weekday, weekdayEn: DAY_EN[weekday], jamam, jama, udayam, arudam, kavippu, chart };
}

/** NOAA sunrise/sunset in local minutes (upper limb, refraction). */
export function sunTimes(y: number, m: number, d: number, lat: number, lon: number, tz: number) {
  const rad = Math.PI / 180;
  const N = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86400000);
  const g = (2 * Math.PI / 365) * (N - 1);
  const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const ha = Math.acos(Math.cos(90.833 * rad) / (Math.cos(lat * rad) * Math.cos(decl)) - Math.tan(lat * rad) * Math.tan(decl)) / rad;
  const noon = 720 - 4 * lon - eqt + tz * 60;
  return { sr: noon - 4 * ha, ss: noon + 4 * ha };
}
