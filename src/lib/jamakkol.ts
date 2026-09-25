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
}

const norm = (x: number) => ((x % 360) + 360) % 360;

/**
 * Rules (reverse-engineered & verified on 2 reference charts):
 * - Jamakkol day starts 6:00 AM; 8 jamams of 90 min (4 day + 4 night).
 * - At 6:00 AM the weekday lord's jama graha is at 0° (Mesha start).
 * - Jama grahas move backwards 45° per jamam (0.5°/min), all 45° apart.
 * - Udayam = Sun at sunrise, advancing 180° by sunset (and another 180° by next sunrise).
 * - Arudam = rasi chosen by the querent (default: udayam's rasi).
 * - Kavippu degree mirrors Arudam (30° − arudam degree).
 */
export function computeJamakkol(date: Date, place: { lat: number; lon: number; tz: number }, arudamRasi?: number): JamakkolData {
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

  const p = chart.panchangam as unknown as { sunriseLocal?: Date; sunsetLocal?: Date } | undefined;
  const sr = p?.sunriseLocal, ss = p?.sunsetLocal;
  const toMin = (d?: Date) => (d ? d.getHours() * 60 + d.getMinutes() : undefined);
  let srM = toMin(sr) ?? 360, ssM = toMin(ss) ?? 1080;
  if (!(ssM > srM)) { srM = 360; ssM = 1080; }
  const dayLen = ssM - srM;
  let u = minutes - srM; if (u < 0) u += 1440;
  const udayam = norm(chart.sun.longitude + (u <= dayLen ? (u / dayLen) * 180 : 180 + ((u - dayLen) / (1440 - dayLen)) * 180));

  const aRasi = arudamRasi ?? Math.floor(udayam / 30);
  const arudam = aRasi * 30;
  const kavippu = norm(360 - arudam);

  return { date, weekday, weekdayEn: DAY_EN[weekday], jamam, jama, udayam, arudam, kavippu, chart };
}
