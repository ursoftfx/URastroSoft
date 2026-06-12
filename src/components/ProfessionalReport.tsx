import { useState } from "react";
import { JathagamResult, RASIS_TAMIL, formatDegree } from "@/lib/jathagam";
import { detectDoshams } from "@/lib/dosham";
import { bhavaPalans, LAGNA_PALAN, NAKSHATRA_PALAN, BHAVA_NAMES } from "@/lib/predictions";
import {
  HOUSE_SIGNIFICATIONS, PLANET_IN_HOUSE, PLANET_IN_RASI,
  computeSaniYogas, DASHA_LORD_TO_KEY, DASHA_LORD_PALAN,
} from "@/lib/professional-palans";
import {
  careerPrediction, marriagePrediction, wealthPrediction, childrenPrediction,
  educationPrediction, healthPrediction, foreignPrediction, propertyPrediction,
  familyPrediction, spiritualPrediction, detectYogas, planetAspects,
  yearForecast, sadeSatiTimeline, gemstoneRecommendation, PLANET_MANTRAS,
  careerFields, luckyAttributes,
} from "@/lib/life-predictions";

interface Props { result: JathagamResult; orientation?: "p" | "l" }

const PLANET_TA: Record<string, string> = {
  sun: "சூரியன்", moon: "சந்திரன்", mars: "செவ்வாய்", mercury: "புதன்",
  jupiter: "குரு", venus: "சுக்கிரன்", saturn: "சனி", rahu: "ராகு", ketu: "கேது",
  ascendant: "லக்னம்", mandi: "மாந்தி",
};
const PLANET_SHORT: Record<string, string> = {
  sun: "சூ", moon: "ச", mars: "செ", mercury: "பு", jupiter: "கு",
  venus: "சு", saturn: "சனி", rahu: "ரா", ketu: "கே", ascendant: "லக்", mandi: "மாந்",
};
const RASI_LORD: Record<number, string> = {
  0: "செவ்வாய்", 1: "சுக்கிரன்", 2: "புதன்", 3: "சந்திரன்", 4: "சூரியன்",
  5: "புதன்", 6: "சுக்கிரன்", 7: "செவ்வாய்", 8: "குரு", 9: "சனி", 10: "சனி", 11: "குரு",
};

const NAKSHATRA_LORDS_TA = [
  "கேது","சுக்கிரன்","சூரியன்","சந்திரன்","செவ்வாய்","ராகு","குரு","சனி","புதன்",
  "கேது","சுக்கிரன்","சூரியன்","சந்திரன்","செவ்வாய்","ராகு","குரு","சனி","புதன்",
  "கேது","சுக்கிரன்","சூரியன்","சந்திரன்","செவ்வாய்","ராகு","குரு","சனி","புதன்",
];

// Tamil 60-year cycle (Prabhava → Akshaya)
const TAMIL_YEARS = [
  "பிரபவ","விபவ","சுக்ல","பிரமோதூத","பிரஜோத்பத்தி","ஆங்கீரஸ","ஸ்ரீமுக","பவ","யுவ","தாது",
  "ஈஸ்வர","வெகுதான்ய","பிரமாதி","விக்ரம","விஷு","சித்திரபானு","ஸ்வபானு","தாரண","பார்த்திப","விய",
  "ஸர்வஜித்","ஸர்வதாரி","விரோதி","விக்ருதி","கர","நந்தன","விஜய","ஜய","மன்மத","துர்முகி",
  "ஹேவிளம்பி","விளம்பி","விகாரி","ஸார்வரி","பிலவ","சுபக்ருது","சோபக்ருது","குரோதி","விசுவாவசு","பராபவ",
  "பிலவங்க","கீலக","ஸௌமிய","ஸாதாரண","விரோதிக்ருது","பரிதாபி","பிரமாதீச","ஆனந்த","ராக்ஷஸ","நள",
  "பிங்கள","காளயுக்தி","ஸித்தார்த்தி","ரௌத்திரி","துன்மதி","துந்துபி","ருத்ரோத்காரி","ரக்தாக்ஷி","குரோதன","அக்ஷய",
];
const TAMIL_MONTHS = ["சித்திரை","வைகாசி","ஆனி","ஆடி","ஆவணி","புரட்டாசி","ஐப்பசி","கார்த்திகை","மார்கழி","தை","மாசி","பங்குனி"];
// Tamil month boundaries — Sun enters sidereal Aries on/around Apr 14 = Chithirai 1.
// Approximate Gregorian start dates (day-of-year)
const TAMIL_MONTH_STARTS = [
  { m: 4, d: 14 }, { m: 5, d: 15 }, { m: 6, d: 15 }, { m: 7, d: 17 },
  { m: 8, d: 17 }, { m: 9, d: 17 }, { m: 10, d: 18 }, { m: 11, d: 16 },
  { m: 12, d: 16 }, { m: 1, d: 14 }, { m: 2, d: 13 }, { m: 3, d: 15 },
];
const tamilDate = (d: Date) => {
  const y = d.getFullYear(), mo = d.getMonth() + 1, da = d.getDate();
  let monthIdx = 11, dayInMonth = 1, varushaYear = y;
  // Find month
  for (let i = 11; i >= 0; i--) {
    const s = TAMIL_MONTH_STARTS[i];
    const sameYearStart = (mo > s.m) || (mo === s.m && da >= s.d);
    if (sameYearStart) {
      monthIdx = i;
      const start = new Date(y, s.m - 1, s.d);
      dayInMonth = Math.floor((d.getTime() - start.getTime()) / 86400000) + 1;
      // Tamil year starts at Chithirai (i=0); before Chithirai → previous Tamil year
      if (i < 0) varushaYear = y - 1;
      break;
    }
  }
  // If birth is before April 14 of that year, use previous Tamil year + Panguni
  if (mo < 4 || (mo === 4 && da < 14)) {
    varushaYear = y - 1;
    const s = TAMIL_MONTH_STARTS[monthIdx];
    const start = new Date(varushaYear, s.m - 1, s.d);
    dayInMonth = Math.floor((d.getTime() - start.getTime()) / 86400000) + 1;
  }
  // Cycle: Prabhava year = 1987 (index 0). Offset accordingly.
  const cycleIdx = ((varushaYear - 1987) % 60 + 60) % 60;
  return { yearName: TAMIL_YEARS[cycleIdx], monthName: TAMIL_MONTHS[monthIdx], day: Math.max(1, dayInMonth) };
};

// Janana naazhigai — time elapsed from sunrise in nazhigai (24-min units) and vinazhigai (24-sec)
const jananaNaazhigai = (birth: Date, sunrise: Date) => {
  let diffMs = birth.getTime() - sunrise.getTime();
  if (diffMs < 0) diffMs += 24 * 3600 * 1000;
  const totalSec = diffMs / 1000;
  const naazhi = Math.floor(totalSec / 1440); // 1 naazhigai = 24 min = 1440s
  const vinaazhi = Math.floor((totalSec - naazhi * 1440) / 24); // 1 vi = 24s
  return { naazhi, vinaazhi };
};

// Nakshatra letters (Tamil) — 4 padas each, 27 nakshatras
const NAKSHATRA_LETTERS: string[][] = [
  ["சு","சே","சோ","லா"],["லீ","லூ","லே","லோ"],["அ","ஈ","உ","ஏ"],["ஓ","வா","வீ","வூ"],
  ["வே","வோ","கா","கீ"],["கூ","க","ஞ","ச"],["கே","கோ","ஹா","ஹீ"],["ஹூ","ஹே","ஹோ","ட"],
  ["டீ","டூ","டே","டோ"],["மா","மீ","மூ","மே"],["மோ","டா","டீ","டூ"],["டே","டோ","பா","பீ"],
  ["பூ","ஷ","ண","ட"],["பே","போ","ரா","ரீ"],["ரூ","ரே","ரோ","தா"],["தீ","தூ","தே","தோ"],
  ["ந","நீ","நூ","நே"],["நோ","யா","யீ","யூ"],["யே","யோ","பா","பீ"],["பூ","த","ப","ட"],
  ["பே","போ","ஜா","ஜீ"],["ஜூ","ஜே","ஜோ","க"],["கா","கீ","கூ","கே"],["கோ","ஸா","ஸீ","ஸூ"],
  ["ஸே","ஸோ","தா","தீ"],["தூ","ஞ","ஜ","த"],["தே","தோ","ச","சீ"],
];

// Trikona shodhana on a single planet's bhinnashtaka (12 values)
const trikonaShodhana = (b: number[]): number[] => {
  const r = [...b];
  const trines = [[0,4,8],[1,5,9],[2,6,10],[3,7,11]];
  for (const t of trines) {
    const vals = t.map(i => r[i]);
    const min = Math.min(...vals);
    if (min > 0) t.forEach(i => { r[i] -= min; });
  }
  return r;
};
// Ekadhipatya shodhana — sign-pairs ruled by same planet
const EKADHIP_PAIRS: [number, number][] = [[2,5],[1,6],[0,7],[8,11],[9,10]]; // mercury, venus, mars, jupiter, saturn
const ekadhipShodhana = (b: number[], occupied: boolean[]): number[] => {
  const r = [...b];
  for (const [a, c] of EKADHIP_PAIRS) {
    const oa = occupied[a], oc = occupied[c];
    if (oa && oc) continue;
    if (!oa && !oc) {
      if (r[a] === r[c]) { r[a] = 0; r[c] = 0; }
      else if (r[a] < r[c]) r[a] = 0;
      else r[c] = 0;
    } else if (oa && !oc) r[c] = 0;
    else r[a] = 0;
  }
  return r;
};

const fmtDate = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`;
};
const fmtTime12 = (h: number, m: number) => {
  const p = (n: number) => String(n).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${p(h12)}:${p(m)} ${ap}`;
};
const dms = (deg: number) => {
  const d = Math.floor(deg);
  const mF = (deg - d) * 60;
  const m = Math.floor(mF);
  const s = Math.round((mF - m) * 60);
  return `${String(d).padStart(2, "0")}°${String(m).padStart(2, "0")}'${String(s).padStart(2, "0")}"`;
};
const ageAt = (birth: Date, target: Date) => {
  let y = target.getFullYear() - birth.getFullYear();
  const md = (target.getMonth() - birth.getMonth()) * 100 + (target.getDate() - birth.getDate());
  if (md < 0) y -= 1;
  return y;
};

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages.length ? pages : [[]];
};

// ---------- South Indian chart ----------
const SI_LAYOUT: (number | null)[][] = [
  [11, 0, 1, 2], [10, null, null, 3], [9, null, null, 4], [8, 7, 6, 5],
];

const Chart = ({ title, chart, ascRasi, size = "lg" }: {
  title: string; chart: string[][]; ascRasi: number; size?: "lg" | "sm";
}) => {
  const cellH = size === "lg" ? 54 : 36;
  const fs = size === "lg" ? 10 : 7;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", border: "1.5px solid #000", tableLayout: "fixed" }}>
      <tbody>
        {SI_LAYOUT.map((row, r) => (
          <tr key={r}>
            {row.map((idx, c) => {
              if (idx === null) {
                if (r === 1 && c === 1) {
                  return (
                    <td key={c} colSpan={2} rowSpan={2} style={{ border: "1px solid #000", textAlign: "center", verticalAlign: "middle", background: "#fff8ee" }}>
                      <div style={{ fontSize: size === "lg" ? 12 : 9, fontWeight: 800, color: "#7a1a2b" }}>{title}</div>
                    </td>
                  );
                }
                return null;
              }
              const planets = chart[idx] || [];
              const isLagna = idx === ascRasi;
              return (
                <td key={c} style={{ position: "relative", border: "1px solid #000", height: cellH, width: "25%", verticalAlign: "top", padding: 2, background: isLagna ? "#fff5e6" : "white" }}>
                  {isLagna && (
                    <div style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, borderTop: `${size === "lg" ? 12 : 8}px solid #7a1a2b`, borderRight: `${size === "lg" ? 12 : 8}px solid transparent` }} />
                  )}
                  <div style={{ fontSize: size === "lg" ? 8 : 6, color: "#888", lineHeight: 1, textAlign: "right" }}>{idx + 1}</div>
                  <div style={{ fontSize: fs, lineHeight: 1.2, fontWeight: 600 }}>
                    {planets.map((p) => PLANET_SHORT[p] || p).join(" ")}
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// ---------- Page wrapper (A5 landscape: 210 x 148 mm) — B/W ----------
const Page = ({ children, title, subtitle, page, total, name }: any) => (
  <div className="a5-sheet print-area" style={{
    width: "var(--report-w, 137mm)", height: "var(--report-h, 196mm)", maxHeight: "var(--report-h, 196mm)",
    padding: "2mm", margin: "0 auto 2mm auto",
    background: "#ffffff", color: "#000",
    fontFamily: "'Latha','Tahoma',sans-serif", boxSizing: "border-box",
    pageBreakInside: "avoid", breakInside: "avoid",
    overflow: "hidden",
    fontSize: 8.1, lineHeight: 1.15,
    display: "flex", flexDirection: "column",
  }}>
    <div style={{
      flex: 1, minHeight: 0,
      border: "2px double #000", outline: "1px solid #000", outlineOffset: 2,
      borderRadius: 0, padding: "2mm 3mm",
      background: "#ffffff",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid #000", paddingBottom: 2, marginBottom: 3 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#000", letterSpacing: 1 }}>UR ASTRO SOFT</div>
          <div style={{ fontSize: 8, color: "#000" }}>தமிழ் வேத ஜோதிட விரிவான ஜாதகம்</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#000" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 8, color: "#000" }}>{subtitle}</div>}
          <div style={{ fontSize: 7, color: "#000" }}>{name} • பக்கம் {page} / {total}</div>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  </div>
);

// ---------- Main report ----------
export const ProfessionalReport = ({ result, orientation = "p" }: Props) => {
  const i = result.input;
  const birthDate = new Date(i.year, i.month - 1, i.day);
  const birthDateTime = new Date(i.year, i.month - 1, i.day, i.hour, i.minute);
  const tamilCal = tamilDate(birthDateTime);
  const naazhi = jananaNaazhigai(birthDateTime, result.panchangam.sunriseLocal);
  const nakLetters = NAKSHATRA_LETTERS[result.moon.nakshatraIndex] || ["—","—","—","—"];
  const [hideAntharam, setHideAntharam] = useState(false);
  const navAsc = result.navamsaPositions.find(n => n.key === "ascendant")?.rasiIndex ?? 0;
  const sani = computeSaniYogas(result.planets.find(p => p.key === "saturn")!.rasiIndex, result.moon.rasiIndex);
  const doshas = detectDoshams(result);
  const planetRasis: Record<string, number> = {};
  result.planets.forEach(p => { planetRasis[p.key] = p.rasiIndex; });
  const palans = bhavaPalans(result.ascendant.rasiIndex, planetRasis, RASIS_TAMIL);

  // Total page count
  // Build flat dasha rows per maha and chunk into pages
  const DASHA_ROWS_PER_PAGE = 22;
  const dashaPagesData = result.dashaTree.map((maha) => {
    const rows: { bhukti: string; ant: string; start: string; end: string; age: number | string }[] = [];
    (maha.children || []).forEach((bh) => {
      const ants = bh.children || [];
      const bhAge = ageAt(birthDate, bh.startDate);
      if (hideAntharam || ants.length === 0) {
        rows.push({ bhukti: `${maha.lord}/${bh.lord}`, ant: hideAntharam ? "" : "—", start: fmtDate(bh.startDate), end: fmtDate(bh.endDate), age: bhAge });
      } else {
        ants.forEach((a, ai) => {
          rows.push({
            bhukti: ai === 0 ? `${maha.lord}/${bh.lord}` : "",
            ant: a.lord,
            start: fmtDate(a.startDate),
            end: fmtDate(a.endDate),
            age: ai === 0 ? bhAge : "",
          });
        });
      }
    });
    const chunks = chunkArray(rows, DASHA_ROWS_PER_PAGE);
    return { maha, chunks };
  });
  const planetHouseRows = result.planets.map(p => {
    const house = ((p.rasiIndex - result.ascendant.rasiIndex + 12) % 12) + 1;
    return { planet: p, house };
  });
  const planetHousePages = chunkArray(planetHouseRows, 5);
  const planetRasiPages = chunkArray(result.planets, 5);
  const bhavaPalanPages = chunkArray(palans, 6);
  const yogasPages = chunkArray(detectYogas(result), 5);
  const yearForecastPages = chunkArray(yearForecast(result, 12), 6);
  const mantraPages = chunkArray(PLANET_MANTRAS, 6);
  const weekdayRemedyPages = chunkArray([
    ["ஞாயிறு","சூரியன்","சிவன் / சூரியன்","சூரிய நமஸ்காரம், ஆதித்ய ஹ்ருதயம்","கோதுமை, வெல்லம், செம்மலர்"],
    ["திங்கள்","சந்திரன்","சிவன் / பார்வதி","ருத்ர அபிஷேகம், சந்த்ர மந்திரம்","பால், அரிசி, வெள்ளை மலர்"],
    ["செவ்வாய்","செவ்வாய்","முருகன் / ஹனுமான்","ஸ்கந்த சஷ்டி, அங்காரக ஸ்தோத்திரம்","துவரை, செம்பு, பவளம்"],
    ["புதன்","புதன்","விஷ்ணு / கணபதி","விஷ்ணு சஹஸ்ரநாமம், கணேச அதர்வசீர்ஷம்","பச்சை பயறு, பச்சை வஸ்திரம்"],
    ["வியாழன்","குரு","விஷ்ணு / தக்ஷிணாமூர்த்தி","குரு ஸ்தோத்திரம், விஷ்ணு பூஜை","மஞ்சள், கடலை பருப்பு, மஞ்சள் வஸ்திரம்"],
    ["வெள்ளி","சுக்ரன்","லக்ஷ்மி / துர்கா","ஸ்ரீ சூக்தம், லக்ஷ்மி அஷ்டோத்தரம்","வெண்ணெய், தயிர், வெள்ளை மலர்"],
    ["சனி","சனி","சாஸ்தா / ஹனுமான்","ஹனுமான் சாலிசா, சனி ஸ்தோத்திரம்","எள், கருப்பு துணி, இரும்பு"],
  ], 4);
  const dashaPages = dashaPagesData.reduce((s, m) => s + m.chunks.length, 0);
  const vargasPages = Math.ceil(result.vargaCharts.length / 6);
  const lifeAreaPages = 11;
  const bhavaDeepPages = 12;
  const extraPages = 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 3;
  const dashaSummaryPages = 1 + result.dashaTree.length; // summary + per-maha paragraph
  const dashaBhuktiDetailPages = result.dashaTree.length * 2; // 2 pages per maha (5+4 bhuktis)
  const totalPages = 1 + 1 + 2 + 2 + vargasPages + 2 + 1 + bhavaPalanPages.length + planetHousePages.length + planetRasiPages.length + 1 + 1 + lifeAreaPages + yogasPages.length + 1 + 1 + bhavaDeepPages + yearForecastPages.length + 1 + 1 + mantraPages.length + 1 + 1 + weekdayRemedyPages.length + 1 + 1 + 1 + 1 + 1 + 3 + dashaPages + dashaSummaryPages + dashaBhuktiDetailPages;

  let pn = 0;
  const next = () => ++pn;

  const planetRows = [
    { key: "ascendant", lon: result.ascendant.longitude, rasi: result.ascendant.rasiIndex, deg: result.ascendant.degreeInRasi, nak: result.ascendant.nakshatraIndex, pada: result.ascendant.pada, retro: false },
    ...result.planets.map(p => ({ key: p.key, lon: p.longitude, rasi: p.rasiIndex, deg: p.degreeInRasi, nak: p.nakshatraIndex, pada: p.pada, retro: !!p.retrograde })),
  ];

  return (
    <div id="professional-report-root" data-orient={orientation} style={{ ["--report-w" as any]: orientation === "p" ? "137mm" : "196mm", ["--report-h" as any]: orientation === "p" ? "196mm" : "137mm" }}>
      <style>{`
        @media print {
          @page { size: A5 ${orientation === "p" ? "portrait" : "landscape"}; margin: 6mm; }
          body { margin: 0; }
          .no-print { display: none !important; }
          #professional-report-root .print-area { margin: 0 auto !important; box-shadow: none !important; page-break-after: always !important; break-after: page !important; page-break-inside: auto !important; break-inside: auto !important; }
        }
        #professional-report-root, #professional-report-root * { color: #000 !important; background-color: transparent !important; border-color: #000 !important; box-shadow: none !important; outline-color: #000 !important; font-weight: 700 !important; }
        #professional-report-root .print-area { background-color: #fff !important; }
        #professional-report-root *:not(svg):not(path):not(circle):not(rect):not(line) { font-size: 14px !important; line-height: 1.35 !important; }
        #professional-report-root .a5-sheet {
          width: var(--report-w) !important;
          height: var(--report-h) !important;
          min-height: var(--report-h) !important;
          max-height: var(--report-h) !important;
          overflow: hidden !important;
          page-break-after: always;
          break-after: page;
        }
        #professional-report-root .a5-sheet > div { overflow: hidden !important; }
        #professional-report-root th, #professional-report-root td { padding: 2px 4px !important; vertical-align: top; word-break: break-word; overflow-wrap: anywhere; }
        #professional-report-root table { font-size: 14px !important; border-collapse: collapse; table-layout: fixed; width: 100% !important; max-width: 100% !important; break-inside: auto; page-break-inside: auto; }
        #professional-report-root tr { break-inside: avoid; page-break-inside: avoid; }
        #professional-report-root thead { display: table-header-group; }
        #professional-report-root tbody { break-inside: auto; page-break-inside: auto; }
        #professional-report-root .flip-wide { transform: rotate(-90deg); transform-origin: center center; }
        #professional-report-root .auto-flipped { transform: rotate(-90deg); transform-origin: center center; max-width: var(--report-h) !important; }
      `}</style>


      <div className="no-print" style={{ display: "flex", justifyContent: "center", gap: 8, padding: "8px", marginBottom: 4 }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "sans-serif", cursor: "pointer", padding: "6px 12px", border: "1px solid #c9a050", borderRadius: 4, background: "#fff8ee" }}>
          <input type="checkbox" checked={hideAntharam} onChange={(e) => setHideAntharam(e.target.checked)} />
          மகா தசையில் அந்தரம் மறை (Hide Antharam)
        </label>
      </div>

      {/* === COVER === */}
      <Page title="அட்டை" page={next()} total={totalPages} name={i.name}>
        <div style={{ textAlign: "center", padding: "4mm 0 2mm" }}>
          <div style={{ fontSize: 12, letterSpacing: 4 }}>✦ ॐ ✦</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4, fontFamily: "serif" }}>ஜாதக அறிக்கை</div>
          <div style={{ fontSize: 10, marginTop: 2 }}>Professional Vedic Astrology Report</div>
          <div style={{ height: 1, background: "#000", margin: "5mm auto", width: "60%" }} />
          <div style={{ fontSize: 18, fontWeight: 800 }}>{i.name}</div>
          {i.gender && <div style={{ fontSize: 10, marginTop: 1 }}>{i.gender}</div>}
          <div style={{ marginTop: "5mm", fontSize: 10, lineHeight: 1.6 }}>
            <div><b>பிறந்த தேதி :</b> {fmtDate(birthDate)}</div>
            <div><b>பிறந்த நேரம் :</b> {fmtTime12(i.hour, i.minute)}</div>
            <div><b>பிறந்த இடம் :</b> {i.placeName}</div>
            <div><b>ராசி / நட்சத்திரம் :</b> {result.rasiTamil} / {result.nakshatraTamil} ({result.pada}-ம் பாதம்)</div>
            <div><b>லக்னம் :</b> {result.lagnaTamil}</div>
          </div>
          <div style={{ marginTop: "5mm", fontSize: 8 }}>
            இது சுத்த திருக்கணித பஞ்சாங்கப்படி, லாஹிரி அயனாம்சம் கொண்டு கணிக்கப்பெற்றது.<br/>
            © UR ASTRO SOFT • www.urastrosoft.com
          </div>
        </div>
      </Page>

      {/* === SLOKAS PAGE === */}
      <Page title="மங்கள ஸ்லோகங்கள்" subtitle="Auspicious Slokas" page={next()} total={totalPages} name={i.name}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: 8.5, lineHeight: 1.4 }}>
          {[
            { t: "கணேச ஸ்லோகம்", s: "வக்ரதுண்ட மஹாகாய சூர்யகோடி ஸமப்ரப ।\nநிர்விக்னம் குரு மே தேவ ஸர்வ கார்யேஷு ஸர்வதா ॥", m: "தடைகள் நீங்கி அனைத்தும் வெற்றியாக அமைய." },
            { t: "குரு (வியாழன்) ஸ்லோகம்", s: "குரு ப்ரஹ்மா குரு விஷ்ணு குருர் தேவோ மஹேஸ்வரஃ ।\nகுரு ஸாக்ஷாத் பரப்ரஹ்ம தஸ்மை ஸ்ரீ குரவே நமஃ ॥", m: "ஞான பாக்கியம், கல்வி வளர." },
            { t: "சூரிய ஸ்லோகம்", s: "ஜபா குஸுமஸங்காசம் காச்யபேயம் மஹாத்யுதிம் ।\nதமோரிம் ஸர்வபாபக்னம் ப்ரணதோஸ்மி திவாகரம் ॥", m: "தலைமை, புகழ், ஆரோக்கியம்." },
            { t: "சந்த்ர ஸ்லோகம்", s: "தயிசங்க தராபாரம் க்ஷீரோதார்ணவ ஸம்பவம் ।\nநமாமி ஸஸினம் ஸோமம் ஸம்போர் முகுட பூஷணம் ॥", m: "மன அமைதி, தாய் ஆசி." },
            { t: "மங்கள (செவ்வாய்) ஸ்லோகம்", s: "தரணீகர்ப்ப ஸம்பூதம் வித்யுத்காந்தி ஸமப்ரபம் ।\nகுமாரம் சக்தி ஹஸ்தம் ச மங்களம் ப்ரணமாம்யஹம் ॥", m: "தைரியம், சகோதர நன்மை." },
            { t: "புத ஸ்லோகம்", s: "ப்ரியங்குகலிகாஷ்யாமம் ரூபேணாப்ரதிமம் புதம் ।\nஸௌம்யம் ஸௌம்யகுணோபேதம் தம் புதம் ப்ரணமாம்யஹம் ॥", m: "கல்வி, பேச்சு, வர்த்தக நலம்." },
            { t: "சுக்ர ஸ்லோகம்", s: "ஹிமகுந்த ம்ருணாலாபம் தைத்யானாம் பரமம் குரும் ।\nஸர்வஸாஸ்த்ர ப்ரவக்தாரம் பார்க்கவம் ப்ரணமாம்யஹம் ॥", m: "திருமணம், கலை, செல்வம்." },
            { t: "சனி ஸ்லோகம்", s: "நீலாஞ்சன ஸமாபாஸம் ரவிபுத்ரம் யமாக்ரஜம் ।\nச்சாயா மார்த்தாண்ட ஸம்பூதம் தம் நமாமி ஸனைஸ்சரம் ॥", m: "சனி தோஷ நிவாரணம்." },
            { t: "ராகு ஸ்லோகம்", s: "அர்த்தகாயம் மஹாவீர்யம் சந்த்ராதித்ய விமர்தனம் ।\nஸிம்ஹிகா கர்ப்ப ஸம்பூதம் தம் ராகும் ப்ரணமாம்யஹம் ॥", m: "சர்ப்ப தோஷ நிவாரணம்." },
            { t: "கேது ஸ்லோகம்", s: "பலாஶபுஷ்ப ஸங்காஸம் தாரகாக்ரஹ மஸ்தகம் ।\nரௌத்ரம் ரௌத்ராத்மகம் கோரம் தம் கேதும் ப்ரணமாம்யஹம் ॥", m: "மோக்ஷ பாதை, ஆன்மிக வளர்ச்சி." },
            { t: "மஹாலக்ஷ்மி ஸ்லோகம்", s: "நமஸ்தேஸ்து மஹாமாயே ஸ்ரீபீடே ஸுரபூஜிதே ।\nஸங்கசக்ர கதாஹஸ்தே மஹாலக்ஷ்மி நமோஸ்துதே ॥", m: "செல்வ வளம், ஐஸ்வர்யம்." },
            { t: "மஹாம்ருத்யுஞ்ஜய மந்த்ரம்", s: "ஓம் த்ரியம்பகம் யஜாமஹே ஸுகந்திம் புஷ்டிவர்த்தனம் ।\nஉர்வாருகமிவ பந்தனாத் ம்ருத்யோர்முக்ஷீய மாம்ருதாத் ॥", m: "ஆயுள், ஆரோக்கியம், மரண பயம் நீக்கம்." },
          ].map((sl, idx) => (
            <div key={idx} style={{ border: "1px solid #c9a050", padding: 4, background: "#fff8ee" }}>
              <div style={{ fontWeight: 800, color: "#7a1a2b", fontSize: 9 }}>{sl.t}</div>
              <div style={{ whiteSpace: "pre-line", fontFamily: "serif", marginTop: 2 }}>{sl.s}</div>
              <div style={{ marginTop: 2, fontSize: 7.5, color: "#555" }}><b>பலன்:</b> {sl.m}</div>
            </div>
          ))}
        </div>
      </Page>

      {/* === PAGE 2 : Birth details + Panchangam === */}
      <Page title="பிறப்பு விவரம் & பஞ்சாங்கம்" page={next()} total={totalPages} name={i.name}>
        <div style={{ background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>பிறப்பு விவரம்</div>
        <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
          <tbody>
            <tr><td style={tdL}><b>பெயர்</b></td><td style={tdR}>{i.name}</td><td style={tdL}><b>பாலினம்</b></td><td style={tdR}>{i.gender || "—"}</td></tr>
            <tr><td style={tdL}><b>பிறந்த தேதி</b></td><td style={tdR}>{fmtDate(birthDate)}</td><td style={tdL}><b>பிறந்த நேரம்</b></td><td style={tdR}>{fmtTime12(i.hour, i.minute)}</td></tr>
            <tr><td style={tdL}><b>பிறந்த இடம்</b></td><td style={tdR}>{i.placeName}</td><td style={tdL}><b>நேர மண்டலம்</b></td><td style={tdR}>GMT +{i.tzOffsetHours.toFixed(2)}</td></tr>
            <tr><td style={tdL}><b>அட்சரேகை</b></td><td style={tdR}>{i.latitude.toFixed(4)}°N</td><td style={tdL}><b>தீர்க்கரேகை</b></td><td style={tdR}>{i.longitude.toFixed(4)}°E</td></tr>
            <tr><td style={tdL}><b>அயனாம்சம்</b></td><td style={tdR}>லாஹிரி {dms(result.ayanamsa)}</td><td style={tdL}><b>ஜூலியன் தினம்</b></td><td style={tdR}>{result.jd.toFixed(4)}</td></tr>
          </tbody>
        </table>

        <div style={{ marginTop: 6, background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>பஞ்சாங்கம்</div>
        <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
          <tbody>
            <tr><td style={tdL}><b>வாரம்</b></td><td style={tdR}>{result.panchangam.vaaraTamil}</td><td style={tdL}><b>திதி</b></td><td style={tdR}>{result.panchangam.tithiTamil} ({result.panchangam.paksha})</td></tr>
            <tr><td style={tdL}><b>யோகம்</b></td><td style={tdR}>{result.panchangam.yogaTamil}</td><td style={tdL}><b>கரணம்</b></td><td style={tdR}>{result.panchangam.karanaTamil}</td></tr>
            <tr><td style={tdL}><b>ஜென்ம ராசி</b></td><td style={tdR}>{result.rasiTamil}</td><td style={tdL}><b>ஜென்ம லக்னம்</b></td><td style={tdR}>{result.lagnaTamil}</td></tr>
            <tr><td style={tdL}><b>ஜென்ம நட்சத்திரம்</b></td><td style={tdR}>{result.nakshatraTamil} - {result.pada}-ம் பாதம்</td><td style={tdL}><b>நட்சத்திர அதிபதி</b></td><td style={tdR}>{result.nakshatraLordTamil}</td></tr>
            <tr><td style={tdL}><b>தமிழ் வருடம்</b></td><td style={tdR}>{tamilCal.yearName}</td><td style={tdL}><b>தமிழ் மாதம்</b></td><td style={tdR}>{tamilCal.monthName}</td></tr>
            <tr><td style={tdL}><b>தமிழ் நாள்</b></td><td style={tdR}>{tamilCal.day}-ம் நாள்</td><td style={tdL}><b>ஜனன நாழிகை</b></td><td style={tdR}>{naazhi.naazhi} நாழிகை {naazhi.vinaazhi} வினாழிகை</td></tr>
            <tr><td style={tdL}><b>சூரிய உதயம்</b></td><td style={tdR}>{fmtTime12(result.panchangam.sunriseLocal.getHours(), result.panchangam.sunriseLocal.getMinutes())}</td><td style={tdL}><b>சூரிய அஸ்தமனம்</b></td><td style={tdR}>{fmtTime12(result.panchangam.sunsetLocal.getHours(), result.panchangam.sunsetLocal.getMinutes())}</td></tr>
            <tr><td style={tdL}><b>நட்சத்திர எழுத்துக்கள்</b></td><td style={tdR} colSpan={3}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, breakInside: "avoid", pageBreakInside: "avoid" }}>
                {[0,1,2,3].map((p) => {
                  const isMine = (result.pada - 1) === p;
                  return (
                    <div key={p} style={{
                      border: isMine ? "2px solid #7a1a2b" : "1px solid #c9a050",
                      background: isMine ? "#fde7ea" : "#fff8ee",
                      padding: "3px 4px", textAlign: "center",
                    }}>
                      <div style={{ fontSize: 8, fontWeight: 700, color: isMine ? "#7a1a2b" : "#555" }}>
                        பாதம் {p + 1} {isMine && "★"}
                      </div>
                      <div style={{ fontSize: isMine ? 14 : 12, fontWeight: 800, color: isMine ? "#7a1a2b" : "#000" }}>
                        {nakLetters[p]}
                      </div>
                      {isMine && <div style={{ fontSize: 7, color: "#7a1a2b", fontWeight: 700 }}>உங்கள் எழுத்து</div>}
                    </div>
                  );
                })}
              </div>
            </td></tr>
          </tbody>
        </table>
      </Page>

      {/* === PAGE 3 : Planet Positions, KP-style === */}
      <Page title="கிரக நிலைகள்" page={next()} total={totalPages} name={i.name}>
        <div style={{ marginTop: 6, background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>கிரக நிலைகள் (Planetary Positions — KP Style)</div>
        <table style={{ width: "100%", fontSize: 7.4, lineHeight: 1.12, borderCollapse: "collapse", border: "1px solid #c9a050", tableLayout: "fixed" }}>
          <thead>
            <tr style={{ background: "#fff8ee", fontWeight: 700 }}>
              <th style={th}>கிரகம்</th>
              <th style={th}>நீள.(°)</th>
              <th style={th}>ராசி</th>
              <th style={th}>பாகை</th>
              <th style={th}>நட்சத்திரம்</th>
              <th style={th}>பாதம்</th>
              <th style={th}>நட்.அதி</th>
              <th style={th}>ராசி அதி</th>
              <th style={th}>நிலை</th>
              <th style={th}>நவாம்சம்</th>
              <th style={th}>R</th>
            </tr>
          </thead>
          <tbody>
            {planetRows.map((r, idx) => {
              const navPos = result.navamsaPositions.find(n => n.key === r.key);
              const dignity = (() => {
                if (r.key === "ascendant") return "—";
                const own: Record<string, number[]> = { sun: [4], moon: [3], mars: [0,7], mercury: [2,5], jupiter: [8,11], venus: [1,6], saturn: [9,10], rahu: [10], ketu: [7] };
                const ex: Record<string, number> = { sun: 0, moon: 1, mars: 9, mercury: 5, jupiter: 3, venus: 11, saturn: 6, rahu: 1, ketu: 7 };
                const de: Record<string, number> = { sun: 6, moon: 7, mars: 3, mercury: 11, jupiter: 9, venus: 5, saturn: 0, rahu: 7, ketu: 1 };
                if (ex[r.key] === r.rasi) return "உச்சம்";
                if (de[r.key] === r.rasi) return "நீசம்";
                if (own[r.key]?.includes(r.rasi)) return "சுய";
                return "சம";
              })();
              return (
                <tr key={idx}>
                  <td style={td}><b>{PLANET_TA[r.key]}</b></td>
                  <td style={td}>{r.lon.toFixed(2)}</td>
                  <td style={td}>{RASIS_TAMIL[r.rasi]}</td>
                  <td style={td}>{dms(r.deg)}</td>
                  <td style={td}>{["அஸ்வினி","பரணி","கார்த்திகை","ரோகிணி","மிருகசீரிஷம்","திருவாதிரை","புனர்பூசம்","பூசம்","ஆயில்யம்","மகம்","பூரம்","உத்திரம்","அஸ்தம்","சித்திரை","சுவாதி","விசாகம்","அனுஷம்","கேட்டை","மூலம்","பூராடம்","உத்திராடம்","திருவோணம்","அவிட்டம்","சதயம்","பூரட்டாதி","உத்திரட்டாதி","ரேவதி"][r.nak]}</td>
                  <td style={td}>{r.pada}</td>
                  <td style={td}>{NAKSHATRA_LORDS_TA[r.nak]}</td>
                  <td style={td}>{RASI_LORD[r.rasi]}</td>
                  <td style={td}>{dignity}</td>
                  <td style={td}>{navPos ? RASIS_TAMIL[navPos.rasiIndex] : "—"}</td>
                  <td style={td}>{r.retro && r.key !== "rahu" && r.key !== "ketu" ? "வ" : ""}</td>
                </tr>
              );
            })}
            <tr>
              <td style={td}><b>மாந்தி</b></td><td style={td}>{result.mandi.longitude.toFixed(2)}</td>
              <td style={td}>{result.mandi.rasiTamil}</td><td style={td}>{dms(result.mandi.degreeInRasi)}</td>
              <td style={td}>{result.mandi.nakshatraTamil}</td><td style={td}>{result.mandi.pada}</td>
              <td style={td} colSpan={5}>—</td>
            </tr>
            <tr>
              <td style={td}><b>குளிகை</b></td><td style={td}>{result.gulika.longitude.toFixed(2)}</td>
              <td style={td}>{result.gulika.rasiTamil}</td><td style={td}>{dms(result.gulika.degreeInRasi)}</td>
              <td style={td}>{result.gulika.nakshatraTamil}</td><td style={td}>{result.gulika.pada}</td>
              <td style={td} colSpan={5}>—</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: 6, background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>உப கிரகங்கள்</div>
        <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
          <thead><tr style={{ background: "#fff8ee" }}>
            <th style={th}>உப கிரகம்</th><th style={th}>ராசி</th><th style={th}>பாகை</th>
            <th style={th}>உப கிரகம்</th><th style={th}>ராசி</th><th style={th}>பாகை</th>
          </tr></thead>
          <tbody>
            {Array.from({ length: Math.ceil(result.upagrahas.length / 2) }).map((_, ri) => {
              const a = result.upagrahas[ri * 2];
              const b = result.upagrahas[ri * 2 + 1];
              return (
                <tr key={ri}>
                  <td style={td}>{a?.name}</td><td style={td}>{a?.rasiTamil}</td>
                  <td style={td}>{a ? dms(a.longitude - a.rasiIndex * 30) : ""}</td>
                  <td style={td}>{b?.name || ""}</td><td style={td}>{b?.rasiTamil || ""}</td>
                  <td style={td}>{b ? dms(b.longitude - b.rasiIndex * 30) : ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Page>

      {/* === Rasi + Navamsa chart === */}
      <Page title="ராசி • நவாம்ச கட்டம்" page={next()} total={totalPages} name={i.name}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={chartTitle}>ராசி கட்டம் (D-1)</div>
            <Chart title="ராசி" chart={result.rasiChart} ascRasi={result.ascendant.rasiIndex} />
          </div>
          <div>
            <div style={chartTitle}>நவாம்சம் (D-9)</div>
            <Chart title="நவாம்சம்" chart={result.navamsaChart} ascRasi={navAsc} />
          </div>
        </div>
      </Page>

      {/* === Bhava chart === */}
      <Page title="பாவ சக்கரம்" page={next()} total={totalPages} name={i.name}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <div style={chartTitle}>பாவ சக்கரம் (Bhava)</div>
            <table style={{ width: "100%", fontSize: 8, lineHeight: 1.15, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
              <thead><tr style={{ background: "#fff8ee" }}>
                <th style={th}>பாவம்</th><th style={th}>ராசி</th><th style={th}>அதிபதி</th><th style={th}>இடம்</th>
              </tr></thead>
              <tbody>
                {palans.map((b, idx) => (
                  <tr key={idx}>
                    <td style={td}>{b.bhavaIdx}. {b.bhavaName}</td>
                    <td style={td}>{b.rasi}</td><td style={td}>{b.lord}</td><td style={td}>{b.lordHouse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <div style={chartTitle}>12 பாவ விளக்கம்</div>
            <table style={{ width: "100%", fontSize: 7.4, lineHeight: 1.12, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
              <tbody>
                {Object.entries(HOUSE_SIGNIFICATIONS).map(([k, v]) => (
                  <tr key={k}><td style={{ ...td, width: 22, fontWeight: 700, background: "#fff8ee" }}>{k}</td><td style={td}>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Page>

      {/* === Varga pages === */}
      {Array.from({ length: vargasPages }).map((_, vp) => {
        const slice = result.vargaCharts.slice(vp * 6, vp * 6 + 6);
        return (
          <Page key={`v-${vp}`} title={`16 வர்க்க கட்டங்கள் (${vp + 1}/${vargasPages})`} page={next()} total={totalPages} name={i.name}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {slice.map(v => (
                <div key={v.key}>
                  <div style={{ ...chartTitle, fontSize: 10 }}>{v.key} • {v.tamilLabel}</div>
                  <Chart title={v.key} chart={v.chart} ascRasi={v.chart.findIndex(c => c.includes("ascendant"))} size="sm" />
                  <div style={{ fontSize: 8, color: "#666", textAlign: "center", marginTop: 2 }}>{v.label}</div>
                </div>
              ))}
            </div>
          </Page>
        );
      })}

      {/* === Ashtakavarga + Sani === */}
      <Page title="அஷ்டகவர்க்கம் & சனி பகுப்பாய்வு" page={next()} total={totalPages} name={i.name}>
        {(() => {
          const EXPECTED: Record<string, number> = { sun: 48, moon: 49, mars: 39, mercury: 54, jupiter: 56, venus: 52, saturn: 39 };
          const sarvaTotal = result.ashtakavarga.sarva.reduce((a, b) => a + b, 0);
          const planetTotals: Record<string, number> = {};
          Object.entries(result.ashtakavarga.bhinna).forEach(([k, v]) => { planetTotals[k] = v.reduce((a, b) => a + b, 0); });
          const mismatches = Object.keys(EXPECTED).filter(k => planetTotals[k] !== EXPECTED[k]);
          const sarvaOk = sarvaTotal === 337;
          return (
            <>
              <div style={{ background: sarvaOk && mismatches.length === 0 ? "#e8f5e9" : "#ffebee", padding: "3px 6px", fontSize: 9.5, fontWeight: 700, border: `1px solid ${sarvaOk && mismatches.length === 0 ? "#2e7d32" : "#c62828"}`, marginBottom: 3 }}>
                {sarvaOk && mismatches.length === 0
                  ? `✓ சர்வாஷ்டக மொத்தம் ${sarvaTotal} — திருக்கணித பஞ்சாங்க சாஸ்திர மொத்தம் (337) சரியாக பொருந்துகிறது.`
                  : `⚠ எச்சரிக்கை: சர்வாஷ்டகம் ${sarvaTotal} (எதிர்பார்ப்பு 337). ${mismatches.length ? "தவறான கிரகம்: " + mismatches.map(k => `${PLANET_TA[k]}=${planetTotals[k]} (சரி ${EXPECTED[k]})`).join(", ") : ""}`}
              </div>
              <div style={{ background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>பின்னாஷ்டக வர்க்கம்</div>
              <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
                <thead><tr style={{ background: "#fff8ee" }}>
                  <th style={th}>கிரகம்</th>
                  {RASIS_TAMIL.map(r => <th key={r} style={th}>{r}</th>)}
                  <th style={th}>மொத்தம்</th>
                  <th style={th}>சரி</th>
                </tr></thead>
                <tbody>
                  {Object.entries(result.ashtakavarga.bhinna).map(([planet, bindus]) => {
                    const tot = bindus.reduce((a, b) => a + b, 0);
                    const exp = EXPECTED[planet];
                    const ok = tot === exp;
                    return (
                      <tr key={planet}>
                        <td style={{ ...td, fontWeight: 700 }}>{PLANET_TA[planet] || planet}</td>
                        {bindus.map((b, j) => <td key={j} style={{ ...td, textAlign: "center" }}>{b}</td>)}
                        <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>{tot}</td>
                        <td style={{ ...td, textAlign: "center", color: ok ? "#2e7d32" : "#c62828", fontWeight: 700 }}>{ok ? `✓ ${exp}` : `✗ ${exp}`}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: "#fff8ee" }}>
                    <td style={{ ...td, fontWeight: 800 }}>சர்வாஷ்டகம்</td>
                    {result.ashtakavarga.sarva.map((b, j) => <td key={j} style={{ ...td, textAlign: "center", fontWeight: 700 }}>{b}</td>)}
                    <td style={{ ...td, textAlign: "center", fontWeight: 800 }}>{sarvaTotal}</td>
                    <td style={{ ...td, textAlign: "center", color: sarvaOk ? "#2e7d32" : "#c62828", fontWeight: 800 }}>{sarvaOk ? "✓ 337" : "✗ 337"}</td>
                  </tr>
                </tbody>
              </table>
            </>
          );
        })()}

        <div style={{ marginTop: 8, background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>சனி யோகங்கள்</div>
        <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
          <tbody>
            <tr><td style={{ ...td, width: "25%", fontWeight: 700, background: "#fff8ee" }}>ஏழரை சனி</td>
              <td style={td}><b>{sani.ezharaiSani.active ? "உள்ளது" : "இல்லை"}</b> — {sani.ezharaiSani.details}</td></tr>
            <tr><td style={{ ...td, fontWeight: 700, background: "#fff8ee" }}>அஷ்டம சனி</td>
              <td style={td}><b>{sani.ashtamaSani.active ? "உள்ளது" : "இல்லை"}</b> — {sani.ashtamaSani.details}</td></tr>
            <tr><td style={{ ...td, fontWeight: 700, background: "#fff8ee" }}>கண்டக சனி</td>
              <td style={td}><b>{sani.kandakaSani.active ? "உள்ளது" : "இல்லை"}</b> — {sani.kandakaSani.details}</td></tr>
          </tbody>
        </table>

        <div style={{ marginTop: 8, fontSize: 9, color: "#555", lineHeight: 1.5 }}>
          <b>குறிப்பு :</b> அஷ்டகவர்க்க பிந்துக்கள் ஒரு ராசியில் அதிகமாக இருந்தால், அந்த இடம் வலுவான இடமாக கருதப்படுகிறது.
          25-க்கு மேல் = வலுவான; 30-க்கு மேல் = மிக சிறந்தது. சர்வாஷ்டக மொத்தம் 337 (சாஸ்திர மொத்தம் — சூரியன் 48 + சந்திரன் 49 + செவ்வாய் 39 + புதன் 54 + குரு 56 + சுக்கிரன் 52 + சனி 39).
        </div>
      </Page>

      {/* === Trikona + Ekadhipatya Shodhana === */}
      <Page title="திரிகோண • ஏகாதிபத்திய சோதனை" page={next()} total={totalPages} name={i.name}>
        {(() => {
          const occupied = new Array(12).fill(false);
          result.planets.forEach(p => { if (["sun","moon","mars","mercury","jupiter","venus","saturn"].includes(p.key)) occupied[p.rasiIndex] = true; });
          const planetKeys = ["sun","moon","mars","mercury","jupiter","venus","saturn"];
          const trikonaResult: Record<string, number[]> = {};
          const ekadhipResult: Record<string, number[]> = {};
          planetKeys.forEach(k => {
            const b = result.ashtakavarga.bhinna[k] || new Array(12).fill(0);
            const t = trikonaShodhana(b);
            trikonaResult[k] = t;
            ekadhipResult[k] = ekadhipShodhana(t, occupied);
          });
          const sodhitaSarva = new Array(12).fill(0);
          planetKeys.forEach(k => ekadhipResult[k].forEach((v, i) => sodhitaSarva[i] += v));
          return (
            <>
              <div style={{ background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>
                திரிகோண சோதனை (Trikona Shodhana)
              </div>
              <table style={{ width: "100%", fontSize: 8.5, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
                <thead><tr style={{ background: "#fff8ee" }}>
                  <th style={th}>கிரகம்</th>
                  {RASIS_TAMIL.map(r => <th key={r} style={th}>{r}</th>)}
                  <th style={th}>மொத்தம்</th>
                </tr></thead>
                <tbody>
                  {planetKeys.map(k => (
                    <tr key={k}>
                      <td style={{ ...td, fontWeight: 700 }}>{PLANET_TA[k]}</td>
                      {trikonaResult[k].map((b, j) => <td key={j} style={{ ...td, textAlign: "center" }}>{b}</td>)}
                      <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>{trikonaResult[k].reduce((a, b) => a + b, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 6, background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>
                ஏகாதிபத்திய சோதனை (Ekadhipatya Shodhana — சோதித பிந்துக்கள்)
              </div>
              <table style={{ width: "100%", fontSize: 8.5, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
                <thead><tr style={{ background: "#fff8ee" }}>
                  <th style={th}>கிரகம்</th>
                  {RASIS_TAMIL.map(r => <th key={r} style={th}>{r}</th>)}
                  <th style={th}>மொத்தம்</th>
                </tr></thead>
                <tbody>
                  {planetKeys.map(k => (
                    <tr key={k}>
                      <td style={{ ...td, fontWeight: 700 }}>{PLANET_TA[k]}</td>
                      {ekadhipResult[k].map((b, j) => <td key={j} style={{ ...td, textAlign: "center" }}>{b}</td>)}
                      <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>{ekadhipResult[k].reduce((a, b) => a + b, 0)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "#fff8ee" }}>
                    <td style={{ ...td, fontWeight: 800 }}>சோதித சர்வாஷ்டகம்</td>
                    {sodhitaSarva.map((b, j) => <td key={j} style={{ ...td, textAlign: "center", fontWeight: 700 }}>{b}</td>)}
                    <td style={{ ...td, textAlign: "center", fontWeight: 800 }}>{sodhitaSarva.reduce((a, b) => a + b, 0)}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: 6, fontSize: 8.5, color: "#444", lineHeight: 1.45 }}>
                <b>திரிகோண சோதனை:</b> 1-5-9, 2-6-10, 3-7-11, 4-8-12 ஆகிய திரிகோண வீடுகளில் உள்ள மிகக் குறைந்த பிந்துவை மூன்றிலிருந்தும் கழிக்கப்படும்.<br/>
                <b>ஏகாதிபத்திய சோதனை:</b> ஒரே கிரகம் ஆளும் இரண்டு ராசிகளில் — இரண்டிலும் கிரகம் இல்லையெனில் குறைந்த பிந்துவை 0 ஆக்கும்; ஒன்றில் மட்டும் கிரகம் இருந்தால் காலியான ராசியின் பிந்துவை 0 ஆக்கும்.<br/>
                சோதித பிந்துக்கள் தான் கோசார பலன், ஆயுள் கணிப்பு, மற்றும் வீட்டு பலன்களுக்கு உண்மையான அளவு.
              </div>
            </>
          );
        })()}
      </Page>

      {/* === Lagna + Nakshatra === */}
      <Page title="லக்ன • நட்சத்திர பலன்" page={next()} total={totalPages} name={i.name}>
        <div style={{ background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>
          லக்ன பலன் — {result.lagnaTamil} லக்னம்
        </div>
        {(() => {
          const lp = LAGNA_PALAN[result.ascendant.rasiIndex];
          return (
            <div style={{ border: "1px solid #c9a050", padding: 8, fontSize: 10, lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, color: "#7a1a2b", marginBottom: 4 }}>{lp.nature}</div>
              <div><b>குணாதிசயம் :</b> {lp.character}</div>
              <div><b>தோற்றம் :</b> {lp.appearance}</div>
            </div>
          );
        })()}

        <div style={{ marginTop: 8, background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>
          நட்சத்திர பலன் — {result.nakshatraTamil} ({result.pada}-ம் பாதம்)
        </div>
        <div style={{ border: "1px solid #c9a050", padding: 8, fontSize: 10, lineHeight: 1.6 }}>
          {NAKSHATRA_PALAN[result.moon.nakshatraIndex]}
        </div>
      </Page>

      {/* === Bhava lord palans === */}
      {bhavaPalanPages.map((rows, pi) => (
        <Page key={`bp-${pi}`} title={`பாவாதிபதி நின்ற பலன் (${pi + 1}/${bhavaPalanPages.length})`} page={next()} total={totalPages} name={i.name}>
          <SectionBar>பாவாதிபதி நின்ற பலன்</SectionBar>
          <table style={{ width: "100%", fontSize: 8.2, lineHeight: 1.25, borderCollapse: "collapse", border: "1px solid #c9a050", tableLayout: "fixed" }}>
            <thead><tr style={{ background: "#fff8ee" }}>
              <th style={{ ...th, width: "17%" }}>பாவம்</th><th style={{ ...th, width: "12%" }}>ராசி</th><th style={{ ...th, width: "12%" }}>அதிபதி</th><th style={{ ...th, width: "12%" }}>இடம்</th><th style={th}>பலன்</th>
            </tr></thead>
            <tbody>
              {rows.map((b, idx) => (
                <tr key={idx}>
                  <td style={td}>{b.bhavaIdx}. {b.bhavaName}</td>
                  <td style={td}>{b.rasi}</td>
                  <td style={td}>{b.lord}</td>
                  <td style={td}>{b.lordHouse}-ம் வீடு</td>
                  <td style={td}>{b.palan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Page>
      ))}

      {/* === Planet in House palans === */}
      {planetHousePages.map((rows, pi) => (
        <Page key={`ph-${pi}`} title={`கிரகங்கள் பாவங்களில் நின்ற பலன் (${pi + 1}/${planetHousePages.length})`} page={next()} total={totalPages} name={i.name}>
          <SectionBar>பாவத்தில் கிரகம் நின்ற பலன்</SectionBar>
          <table style={{ width: "100%", fontSize: 8.5, lineHeight: 1.25, borderCollapse: "collapse", border: "1px solid #c9a050", tableLayout: "fixed" }}>
            <thead><tr style={{ background: "#fff8ee" }}>
              <th style={{ ...th, width: "14%" }}>கிரகம்</th><th style={{ ...th, width: "13%" }}>ராசி</th><th style={{ ...th, width: "12%" }}>பாவம்</th><th style={th}>பலன்</th>
            </tr></thead>
            <tbody>
              {rows.map(({ planet: p, house }) => (
                <tr key={p.key}>
                  <td style={{ ...td, fontWeight: 700 }}>{PLANET_TA[p.key]}</td>
                  <td style={td}>{p.rasiTamil}</td>
                  <td style={td}>{house}-ம் வீடு</td>
                  <td style={td}>{PLANET_IN_HOUSE[p.key]?.[house] || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Page>
      ))}

      {/* === Planet in Rasi palans === */}
      {planetRasiPages.map((rows, pi) => (
        <Page key={`pr-${pi}`} title={`கிரகங்கள் ராசிகளில் நின்ற பலன் (${pi + 1}/${planetRasiPages.length})`} page={next()} total={totalPages} name={i.name}>
          <SectionBar>ராசியில் கிரகம் நின்ற பலன்</SectionBar>
          <table style={{ width: "100%", fontSize: 8.5, lineHeight: 1.25, borderCollapse: "collapse", border: "1px solid #c9a050", tableLayout: "fixed" }}>
            <thead><tr style={{ background: "#fff8ee" }}>
              <th style={{ ...th, width: "14%" }}>கிரகம்</th><th style={{ ...th, width: "13%" }}>ராசி</th><th style={{ ...th, width: "17%" }}>பாகை</th><th style={th}>பலன்</th>
            </tr></thead>
            <tbody>
              {rows.map(p => (
                <tr key={p.key}>
                  <td style={{ ...td, fontWeight: 700 }}>{PLANET_TA[p.key]}</td>
                  <td style={td}>{p.rasiTamil}</td>
                  <td style={td}>{dms(p.degreeInRasi)}</td>
                  <td style={td}>{PLANET_IN_RASI[p.key]?.[p.rasiIndex] || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Page>
      ))}

      {/* === Doshas + Remedies === */}
      <Page title="தோஷங்கள் & பரிகாரங்கள்" page={next()} total={totalPages} name={i.name}>
        <div style={{ background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>தோஷ பரிசோதனை</div>
        {doshas.map((d, idx) => (
          <div key={idx} style={{ border: "1px solid #c9a050", borderTop: 0, padding: 6, fontSize: 10, lineHeight: 1.5, background: d.present ? "#fff5f5" : "#f5fff5" }}>
            <div style={{ fontWeight: 700, color: d.present ? "#9b1c1c" : "#1a6b2e" }}>
              {d.name} — {d.present ? `உள்ளது (${d.severity})` : "இல்லை ✓"}
            </div>
            <div style={{ marginTop: 2 }}>{d.description}</div>
            {d.remedy && <div style={{ marginTop: 2, color: "#7a1a2b" }}><b>பரிகாரம் :</b> {d.remedy}</div>}
          </div>
        ))}

        <div style={{ marginTop: 8, background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>பொது பரிகாரம்</div>
        <div style={{ border: "1px solid #c9a050", padding: 8, fontSize: 10, lineHeight: 1.7 }}>
          • தினமும் சூரிய நமஸ்காரம், காயத்ரி மந்திரம் ஜபம்.<br/>
          • ஞாயிறு — சூரியனுக்கு தண்ணீர் சமர்ப்பணம்.<br/>
          • திங்கள் — சிவ வழிபாடு, பால் அபிஷேகம்.<br/>
          • செவ்வாய் — முருகன் வழிபாடு, அங்காரக ஸ்தோத்திரம்.<br/>
          • புதன் — விஷ்ணு சகஸ்ர நாமம், பச்சை பயறு தானம்.<br/>
          • வியாழன் — குரு பகவான் / விஷ்ணு வழிபாடு, மஞ்சள் தானம்.<br/>
          • வெள்ளி — லக்ஷ்மி வழிபாடு, ஸ்ரீ சூக்தம், வெள்ளை வஸ்திரம்.<br/>
          • சனி — ஹனுமான் / சாஸ்தா வழிபாடு, எள் தீபம், திருநள்ளாறு தரிசனம்.<br/>
          • ராகு / கேது — காளஹஸ்தீஸ்வரர், திருநாகேஸ்வரம், சர்ப்ப பூஜை.
        </div>
      </Page>

      {/* === Personality deep === */}
      <Page title="ஆழ்ந்த குணாதிசயம் (Personality)" page={next()} total={totalPages} name={i.name}>
        {(() => {
          const lp = LAGNA_PALAN[result.ascendant.rasiIndex];
          const moonLp = LAGNA_PALAN[result.moon.rasiIndex];
          const sunLp = LAGNA_PALAN[result.planets.find(p=>p.key==="sun")!.rasiIndex];
          return (
            <div style={{ fontSize: 10, lineHeight: 1.6 }}>
              <SectionBar>லக்ன ராசி தாக்கம் — {result.lagnaTamil}</SectionBar>
              <Box><b>இயல்பு:</b> {lp.nature}<br/><b>குணாதிசயம்:</b> {lp.character}<br/><b>தோற்றம்:</b> {lp.appearance}</Box>
              <SectionBar>சந்திர ராசி தாக்கம் — {result.rasiTamil}</SectionBar>
              <Box><b>உள் மனநிலை:</b> {moonLp.nature}<br/><b>உணர்ச்சி குணம்:</b> {moonLp.character}</Box>
              <SectionBar>சூரிய ராசி தாக்கம் — {RASIS_TAMIL[result.planets.find(p=>p.key==="sun")!.rasiIndex]}</SectionBar>
              <Box><b>ஆத்ம இயல்பு:</b> {sunLp.nature}<br/><b>தலைமை குணம்:</b> {sunLp.character}</Box>
              <SectionBar>பிறப்பு நட்சத்திர சாரம்</SectionBar>
              <Box>{NAKSHATRA_PALAN[result.moon.nakshatraIndex]}</Box>
            </div>
          );
        })()}
      </Page>

      {/* === Career === */}
      <LifeAreaPage area={careerPrediction(result)} pageNum={next()} total={totalPages} name={i.name} />
      <LifeAreaPage area={marriagePrediction(result)} pageNum={next()} total={totalPages} name={i.name} />
      <LifeAreaPage area={wealthPrediction(result)} pageNum={next()} total={totalPages} name={i.name} />
      <LifeAreaPage area={childrenPrediction(result)} pageNum={next()} total={totalPages} name={i.name} />
      <LifeAreaPage area={educationPrediction(result)} pageNum={next()} total={totalPages} name={i.name} />
      <LifeAreaPage area={healthPrediction(result)} pageNum={next()} total={totalPages} name={i.name} />
      <LifeAreaPage area={foreignPrediction(result)} pageNum={next()} total={totalPages} name={i.name} />
      <LifeAreaPage area={propertyPrediction(result)} pageNum={next()} total={totalPages} name={i.name} />
      <LifeAreaPage area={familyPrediction(result)} pageNum={next()} total={totalPages} name={i.name} />
      <LifeAreaPage area={spiritualPrediction(result)} pageNum={next()} total={totalPages} name={i.name} />

      {/* === Yogas === */}
      {yogasPages.map((rows, pi) => (
        <Page key={`yg-${pi}`} title={`யோகங்கள் (Detected Yogas) (${pi + 1}/${yogasPages.length})`} page={next()} total={totalPages} name={i.name}>
          <SectionBar>ஜாதகத்தில் காணப்படும் யோகங்கள்</SectionBar>
          <table style={{ width: "100%", fontSize: 8.7, lineHeight: 1.25, borderCollapse: "collapse", border: "1px solid #c9a050", tableLayout: "fixed" }}>
            <thead><tr style={{ background: "#fff8ee" }}>
              <th style={{ ...th, width: "22%" }}>யோகம்</th><th style={{ ...th, width: "15%" }}>வகை</th><th style={th}>விளக்கம்</th>
            </tr></thead>
            <tbody>
              {rows.map((y, idx) => (
                <tr key={idx}>
                  <td style={{...td, fontWeight: 700, color: "#7a1a2b"}}>{y.name}</td>
                  <td style={td}>{y.type}</td>
                  <td style={td}>{y.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pi === yogasPages.length - 1 && (
            <div style={{ marginTop: 6, fontSize: 8.2, color: "#555", lineHeight: 1.35 }}>
              <b>குறிப்பு:</b> ராஜ யோகம் — அதிகாரம் / பெருமை. தன யோகம் — செல்வம். மஹாபுருஷ யோகம் — ஐந்து சிறப்பு கிரக நிலைகள்.
            </div>
          )}
        </Page>
      ))}

      {/* === Aspects === */}
      <Page title="கிரக பார்வைகள் (Drishti)" page={next()} total={totalPages} name={i.name}>
        <SectionBar>கிரகங்களின் பரஸ்பர பார்வை</SectionBar>
        <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
          <thead><tr style={{ background: "#fff8ee" }}>
            <th style={th}>எந்த கிரகம்</th><th style={th}>எதை பார்க்கிறது</th><th style={th}>பார்வை விதம்</th>
          </tr></thead>
          <tbody>
            {planetAspects(result).map((a, idx) => (
              <tr key={idx}><td style={td}>{a.from}</td><td style={td}>{a.to}</td><td style={td}>{a.type}</td></tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 8, fontSize: 9, color: "#555", lineHeight: 1.5 }}>
          செவ்வாய் — 4, 7, 8 பார்வை. குரு — 5, 7, 9 பார்வை. சனி — 3, 7, 10 பார்வை. ராகு/கேது — 5, 7, 9.
          பிற கிரகங்கள் — 7-ம் பார்வை மட்டும். சுப பார்வை = நன்மை, பாப பார்வை = தடை.
        </div>
      </Page>

      {/* === Friendship table === */}
      <Page title="கிரக நட்பு / பகை அட்டவணை" page={next()} total={totalPages} name={i.name}>
        <SectionBar>பரம்பரை நட்பு</SectionBar>
        <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
          <thead><tr style={{ background: "#fff8ee" }}>
            <th style={th}>கிரகம்</th><th style={th}>நண்பர்</th><th style={th}>சம</th><th style={th}>பகைவர்</th>
          </tr></thead>
          <tbody>
            {[
              { p: "சூரியன்", f: "சந்திரன், செவ்வாய், குரு", n: "புதன்", e: "சுக்ரன், சனி, ராகு" },
              { p: "சந்திரன்", f: "சூரியன், புதன்", n: "செவ்வாய், குரு, சுக்ரன், சனி", e: "—" },
              { p: "செவ்வாய்", f: "சூரியன், சந்திரன், குரு", n: "சுக்ரன், சனி", e: "புதன்" },
              { p: "புதன்", f: "சூரியன், சுக்ரன்", n: "செவ்வாய், குரு, சனி", e: "சந்திரன்" },
              { p: "குரு", f: "சூரியன், சந்திரன், செவ்வாய்", n: "சனி", e: "புதன், சுக்ரன்" },
              { p: "சுக்ரன்", f: "புதன், சனி", n: "செவ்வாய், குரு", e: "சூரியன், சந்திரன்" },
              { p: "சனி", f: "புதன், சுக்ரன்", n: "குரு", e: "சூரியன், சந்திரன், செவ்வாய்" },
              { p: "ராகு", f: "சுக்ரன், சனி", n: "குரு", e: "சூரியன், சந்திரன், செவ்வாய்" },
              { p: "கேது", f: "செவ்வாய், சுக்ரன், சனி", n: "புதன், குரு", e: "சூரியன், சந்திரன்" },
            ].map((r, idx) => (
              <tr key={idx}>
                <td style={{...td, fontWeight:700}}>{r.p}</td>
                <td style={{...td, color:"#1a6b2e"}}>{r.f}</td>
                <td style={td}>{r.n}</td>
                <td style={{...td, color:"#9b1c1c"}}>{r.e}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Page>

      {/* === 12 Bhava deep analysis (1 per page to avoid overlap) === */}
      {Array.from({ length: 12 }).map((_, bp) => {
        const h = bp + 1;
        return (
          <Page key={`bh-${bp}`} title={`12 பாவ ஆழ்ந்த பகுப்பாய்வு (${bp + 1}/12)`} page={next()} total={totalPages} name={i.name}>
            {(() => {
              const rasiIdx = (result.ascendant.rasiIndex + h - 1) % 12;
              const lord = ["mars","venus","mercury","moon","sun","mercury","venus","mars","jupiter","saturn","saturn","jupiter"][rasiIdx];
              const lordHouse = (() => {
                const lp = result.planets.find(p => p.key === lord);
                if (!lp) return 0;
                return ((lp.rasiIndex - result.ascendant.rasiIndex + 12) % 12) + 1;
              })();
              const occupants = result.planets.filter(p => ((p.rasiIndex - result.ascendant.rasiIndex + 12) % 12) + 1 === h);
              return (
                <div key={h} style={{ marginBottom: 6 }}>
                  <SectionBar>{h}-ம் பாவம் — {BHAVA_NAMES[h-1]} ({RASIS_TAMIL[rasiIdx]})</SectionBar>
                  <Box>
                    <b>பாவ காரகம்:</b> {HOUSE_SIGNIFICATIONS[h]}<br/>
                    <b>அதிபதி:</b> {PLANET_TA[lord]} — {lordHouse}-ம் வீட்டில் ({RASIS_TAMIL[result.planets.find(p=>p.key===lord)?.rasiIndex ?? 0]})<br/>
                    <b>அமர்ந்துள்ள கிரகங்கள்:</b> {occupants.length ? occupants.map(o=>PLANET_TA[o.key]).join(", ") : "எதுவும் இல்லை"}<br/>
                    {occupants.map(o => (
                      <div key={o.key} style={{ marginTop: 2 }}><b>• {PLANET_TA[o.key]} {h}-ல்:</b> {PLANET_IN_HOUSE[o.key]?.[h] || "—"}</div>
                    ))}
                  </Box>
                </div>
              );
            })()}
          </Page>
        );
      })}

      {/* === Year by year forecast === */}
      {yearForecastPages.map((rows, pi) => (
        <Page key={`yf-${pi}`} title={`ஆண்டுக்கு ஆண்டு பலன் (${pi + 1}/${yearForecastPages.length})`} page={next()} total={totalPages} name={i.name}>
          <SectionBar>அடுத்த 12 ஆண்டுகள் — தசா-புத்தி பலன்</SectionBar>
          <table style={{ width: "100%", fontSize: 9, lineHeight: 1.25, borderCollapse: "collapse", border: "1px solid #c9a050", tableLayout: "fixed" }}>
            <thead><tr style={{ background: "#fff8ee" }}>
              <th style={{ ...th, width: "12%" }}>ஆண்டு</th><th style={{ ...th, width: "9%" }}>வயது</th><th style={{ ...th, width: "16%" }}>மகா தசை</th><th style={{ ...th, width: "14%" }}>புத்தி</th><th style={th}>பலன்</th>
            </tr></thead>
            <tbody>
              {rows.map((y, idx) => (
                <tr key={idx}>
                  <td style={{...td, fontWeight:700}}>{y.year}</td>
                  <td style={td}>{y.age}</td>
                  <td style={td}>{y.mahaLord}</td>
                  <td style={td}>{y.bhuktiLord}</td>
                  <td style={td}>{y.outlook}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Page>
      ))}

      {/* === Sade Sati === */}
      <Page title="ஏழரை சனி — காலக்கிரம பகுப்பாய்வு" page={next()} total={totalPages} name={i.name}>
        <SectionBar>ஏழரை சனியின் மூன்று கட்டங்கள்</SectionBar>
        <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
          <thead><tr style={{ background: "#fff8ee" }}>
            <th style={th}>கட்டம்</th><th style={th}>தொடக்கம்</th><th style={th}>முடிவு</th><th style={th}>தாக்கம்</th>
          </tr></thead>
          <tbody>
            {sadeSatiTimeline(result).map((s, idx) => (
              <tr key={idx}><td style={{...td,fontWeight:700}}>{s.phase}</td><td style={td}>{s.from}</td><td style={td}>{s.to}</td><td style={td}>{s.effect}</td></tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 8, fontSize: 9, lineHeight: 1.6 }}>
          <b>பரிகாரங்கள்:</b><br/>
          • சனிக்கிழமை — திருநள்ளாறு / சாஸ்தா வழிபாடு.<br/>
          • எள் தீபம், கருப்பு துணி தானம்.<br/>
          • ஹனுமான் சாலிசா 11 முறை.<br/>
          • நீலம் — கல் (ஜோதிட ஆலோசனைக்கு பின்).<br/>
        </div>
      </Page>

      {/* === Gemstones === */}
      <Page title="ரத்தினம் (Gemstone) பரிந்துரை" page={next()} total={totalPages} name={i.name}>
        <SectionBar>உங்கள் லக்ன / 5 / 9 அதிபதிகளுக்கான ரத்தினம்</SectionBar>
        <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
          <thead><tr style={{ background: "#fff8ee" }}>
            <th style={th}>கிரகம்</th><th style={th}>ரத்தினம்</th><th style={th}>எடை</th><th style={th}>உலோகம்</th><th style={th}>விரல்</th><th style={th}>நாள்</th>
          </tr></thead>
          <tbody>
            {gemstoneRecommendation(result).map((g, idx) => (
              <tr key={idx}>
                <td style={{...td,fontWeight:700}}>{g.planet}</td><td style={td}>{g.gem}</td><td style={td}>{g.weight}</td>
                <td style={td}>{g.metal}</td><td style={td}>{g.finger}</td><td style={td}>{g.day}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 8, fontSize: 9, lineHeight: 1.6 }}>
          <b>எச்சரிக்கை:</b> ரத்தினம் அணியும் முன் ஜோதிடரின் ஆலோசனை அவசியம். தவறான கல் தீய பலன் தரக்கூடும்.
          ரத்தினம் வாங்கிய பின் — பால், தேன், கங்கை நீர், மஞ்சள் கொண்டு சுத்தம் செய்து, மந்திரம் சொல்லி அணிய வேண்டும்.
        </div>
      </Page>

      {/* === Mantras === */}
      {mantraPages.map((rows, pi) => (
        <Page key={`mn-${pi}`} title={`நவ கிரக மந்திரங்கள் (${pi + 1}/${mantraPages.length})`} page={next()} total={totalPages} name={i.name}>
          <SectionBar>9 கிரகங்களுக்கான பீஜ மந்திரங்கள்</SectionBar>
          <table style={{ width: "100%", fontSize: 9, lineHeight: 1.25, borderCollapse: "collapse", border: "1px solid #c9a050", tableLayout: "fixed" }}>
            <thead><tr style={{ background: "#fff8ee" }}>
              <th style={{ ...th, width: "18%" }}>கிரகம்</th><th style={th}>மந்திரம்</th><th style={{ ...th, width: "20%" }}>ஜப எண்ணிக்கை</th>
            </tr></thead>
            <tbody>
              {rows.map((m, idx) => (
                <tr key={idx}>
                  <td style={{...td,fontWeight:700}}>{m.planet}</td>
                  <td style={{...td, fontFamily: "serif"}}>{m.mantra}</td>
                  <td style={td}>{m.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pi === mantraPages.length - 1 && (
            <div style={{ marginTop: 6, fontSize: 8.5, lineHeight: 1.4 }}>
              <b>முக்கிய குறிப்பு:</b> மந்திரங்களை குரு உபதேசம் பெற்ற பின் ஜபிக்க வேண்டும். காலை 5-7 மணி உகந்த நேரம்.
            </div>
          )}
        </Page>
      ))}

      {/* === Lucky attributes === */}
      <Page title="அதிர்ஷ்ட நாள் / நிறம் / எண் / திசை" page={next()} total={totalPages} name={i.name}>
        <SectionBar>உங்கள் லக்ன அதிபதி அடிப்படையில்</SectionBar>
        {(() => { const l = luckyAttributes(result); return (
          <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
            <tbody>
              <tr><td style={tdL}><b>அதிர்ஷ்ட நாட்கள்</b></td><td style={tdR}>{l.days}</td></tr>
              <tr><td style={tdL}><b>அதிர்ஷ்ட நிறங்கள்</b></td><td style={tdR}>{l.colors}</td></tr>
              <tr><td style={tdL}><b>அதிர்ஷ்ட எண்கள்</b></td><td style={tdR}>{l.numbers}</td></tr>
              <tr><td style={tdL}><b>அதிர்ஷ்ட ரத்தினம்</b></td><td style={tdR}>{l.gem}</td></tr>
              <tr><td style={tdL}><b>உகந்த உலோகம்</b></td><td style={tdR}>{l.metal}</td></tr>
              <tr><td style={tdL}><b>உகந்த திசை</b></td><td style={tdR}>{l.direction}</td></tr>
            </tbody>
          </table>
        ); })()}
        <div style={{ marginTop: 8, fontSize: 9, lineHeight: 1.6 }}>
          முக்கிய நிகழ்வுகள் — திருமணம், புது வீடு, தொழில் தொடக்கம், பயணம் — இந்த நாட்களில் மேற்கொள்ள உகந்தது.
          வண்ண ஆடைகள், பணப்பை, கார் — இந்த நிறங்களில் நல்லது. நிலம், வீடு வாங்கும்போது இந்த திசை முக்கியம்.
        </div>
      </Page>

      {/* === Career fields === */}
      <Page title="பொருத்தமான தொழில் துறைகள்" page={next()} total={totalPages} name={i.name}>
        <SectionBar>கர்மாதிபதி அடிப்படையில் தொழில் பரிந்துரை</SectionBar>
        <Box>{careerFields(result).join(" ")}</Box>
        <SectionBar>10-ம் வீட்டில் கிரக நிலை</SectionBar>
        <Box>
          {result.planets.filter(p => ((p.rasiIndex - result.ascendant.rasiIndex + 12) % 12) + 1 === 10).map(p => (
            <div key={p.key}><b>{PLANET_TA[p.key]}:</b> {PLANET_IN_HOUSE[p.key]?.[10]}</div>
          ))}
          {result.planets.filter(p => ((p.rasiIndex - result.ascendant.rasiIndex + 12) % 12) + 1 === 10).length === 0 && (
            <div>10-ம் வீட்டில் கிரகம் இல்லை — கர்மாதிபதி வழியாக மட்டும் தொழில் பகுப்பாய்வு.</div>
          )}
        </Box>
        <SectionBar>தொழில் தொடக்க சுப நேரம்</SectionBar>
        <Box>
          • வியாழன் / வெள்ளி / புதன் காலை 6 - 9 மணி.<br/>
          • வளர்பிறை, ஒற்றை திதி (3, 5, 7, 11, 13).<br/>
          • நட்சத்திரம் — அஸ்வினி, ரோகிணி, புனர்பூசம், புஷ்யம், உத்திரம், ஹஸ்தம், சுவாதி, அனுராதா, உத்திராடம், ரேவதி.<br/>
          • கணபதி வழிபாடு + நாரிகேளம் உடைத்து தொடங்க.
        </Box>
      </Page>

      {/* === Weekday remedies === */}
      {weekdayRemedyPages.map((rows, pi) => (
        <Page key={`wr-${pi}`} title={`வாரம் முழுவதும் பரிகார வழிமுறை (${pi + 1}/${weekdayRemedyPages.length})`} page={next()} total={totalPages} name={i.name}>
          <SectionBar>தினசரி பரிகார அட்டவணை</SectionBar>
          <table style={{ width: "100%", fontSize: 8.5, lineHeight: 1.25, borderCollapse: "collapse", border: "1px solid #c9a050", tableLayout: "fixed" }}>
            <thead><tr style={{ background: "#fff8ee" }}>
              <th style={{ ...th, width: "13%" }}>நாள்</th><th style={{ ...th, width: "12%" }}>கிரகம்</th><th style={{ ...th, width: "18%" }}>தெய்வம்</th><th style={th}>பரிகாரம்</th><th style={th}>தானம்</th>
            </tr></thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>{r.map((c, ci) => <td key={ci} style={ci===0?{...td,fontWeight:700,background:"#fff8ee"}:td}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
          {pi === weekdayRemedyPages.length - 1 && (
            <div style={{ marginTop: 6, fontSize: 8.5, lineHeight: 1.4 }}>
              <b>பொது விதிகள்:</b> காலை 4-6 மணி பிரம்ம முகூர்த்தம். பிறந்த நட்சத்திர நாளில் சிறப்பு வழிபாடு.
            </div>
          )}
        </Page>
      ))}

      {/* === Karmic — Rahu/Ketu axis === */}
      <Page title="கர்ம பகுப்பாய்வு — ராகு / கேது அச்சு" page={next()} total={totalPages} name={i.name}>
        {(() => {
          const rahu = result.planets.find(p => p.key==="rahu")!;
          const ketu = result.planets.find(p => p.key==="ketu")!;
          const rh = ((rahu.rasiIndex - result.ascendant.rasiIndex + 12) % 12) + 1;
          const kh = ((ketu.rasiIndex - result.ascendant.rasiIndex + 12) % 12) + 1;
          return (<>
            <SectionBar>ராகு — {rahu.rasiTamil} ({rh}-ம் வீடு)</SectionBar>
            <Box><b>இப்பிறவி கர்ம ஈர்ப்பு:</b> {PLANET_IN_HOUSE.rahu[rh]}<br/><b>ராசி தாக்கம்:</b> {PLANET_IN_RASI.rahu[rahu.rasiIndex]}</Box>
            <SectionBar>கேது — {ketu.rasiTamil} ({kh}-ம் வீடு)</SectionBar>
            <Box><b>முற்பிறவி கர்ம தடம்:</b> {PLANET_IN_HOUSE.ketu[kh]}<br/><b>ராசி தாக்கம்:</b> {PLANET_IN_RASI.ketu[ketu.rasiIndex]}</Box>
            <SectionBar>கால சர்ப்ப / சர்ப்ப தோஷ விளக்கம்</SectionBar>
            <Box>
              ராகு-கேது அச்சில் அனைத்து கிரகங்களும் ஒரு பக்கம் இருந்தால் கால சர்ப்ப தோஷம். பரிகாரம் — காளஹஸ்தீஸ்வரர், திருநாகேஸ்வரம், ராகு-கேது தர்ப்பணம்.
              ஆழ்ந்த ஆன்மிக நாட்டம், அடிக்கடி எதிர்பாரா மாற்றங்கள், மறை ஆராய்ச்சி இவர்களுக்கு இயல்பு.
            </Box>
          </>);
        })()}
      </Page>

      {/* === Planet strength summary === */}
      <Page title="கிரக பலம் — விரிவான சுருக்கம்" page={next()} total={totalPages} name={i.name}>
        <SectionBar>ஒவ்வொரு கிரகத்தின் நிலை</SectionBar>
        <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
          <thead><tr style={{ background: "#fff8ee" }}>
            <th style={th}>கிரகம்</th><th style={th}>ராசி</th><th style={th}>வீடு</th><th style={th}>நிலை</th><th style={th}>பலம்</th><th style={th}>முடிவு</th>
          </tr></thead>
          <tbody>
            {result.planets.map(p => {
              const h = ((p.rasiIndex - result.ascendant.rasiIndex + 12) % 12) + 1;
              const own: Record<string, number[]> = { sun:[4], moon:[3], mars:[0,7], mercury:[2,5], jupiter:[8,11], venus:[1,6], saturn:[9,10], rahu:[10], ketu:[7] };
              const ex: Record<string, number> = { sun:0, moon:1, mars:9, mercury:5, jupiter:3, venus:11, saturn:6 };
              const de: Record<string, number> = { sun:6, moon:7, mars:3, mercury:11, jupiter:9, venus:5, saturn:0 };
              const dignity = ex[p.key] === p.rasiIndex ? "உச்சம்" : de[p.key] === p.rasiIndex ? "நீசம்" : own[p.key]?.includes(p.rasiIndex) ? "சுய" : "சம";
              const score = dignity === "உச்சம்" ? 90 : dignity === "சுய" ? 75 : dignity === "சம" ? 50 : 25;
              const verdict = score >= 75 ? "மிக சிறந்த — முழு பலன் தரும்" : score >= 50 ? "நல்லது — சாதாரண பலன்" : "பலவீனம் — பரிகாரம் தேவை";
              return (
                <tr key={p.key}>
                  <td style={{...td, fontWeight: 700}}>{PLANET_TA[p.key]}</td>
                  <td style={td}>{p.rasiTamil}</td>
                  <td style={td}>{h}</td>
                  <td style={td}>{dignity}</td>
                  <td style={td}>{score}/100</td>
                  <td style={td}>{verdict}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ marginTop: 8, fontSize: 9, lineHeight: 1.5 }}>
          <b>குறிப்பு:</b> உச்சம் = கிரகம் மிக பலமாக நற்பலன் தரும். நீசம் = கிரகம் பலன் தர முடியாது, பரிகாரம் தேவை.
          சுய ராசி = முழு பலம். சம ராசி = சாதாரணம். கேந்த்ர (1,4,7,10) / திரிகோண (1,5,9) வீடுகளில் இருந்தால் கூடுதல் பலம்.
        </div>
      </Page>

      {/* === Monthly transit (next 12 months) === */}
      <Page title="மாதம் வாரியான பலன் (அடுத்த 12 மாதம்)" page={next()} total={totalPages} name={i.name}>
        <SectionBar>தற்போதைய கோச்சார பலன்</SectionBar>
        <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
          <thead><tr style={{ background: "#fff8ee" }}>
            <th style={th}>மாதம்</th><th style={th}>முக்கிய நிகழ்வு</th><th style={th}>பலன்</th>
          </tr></thead>
          <tbody>
            {Array.from({length:12}).map((_, mi) => {
              const d = new Date(); d.setMonth(d.getMonth() + mi);
              const month = d.toLocaleDateString("ta-IN", { month: "long", year: "numeric" });
              const themes = ["தொழில் முன்னேற்றம்","குடும்ப விழா","பயணம்","செலவு கவனம்","புது தொடக்கம்","கல்வி வெற்றி","ஆரோக்கியம் கவனம்","பணம் வரத்து","உறவு வளர்ச்சி","ஆன்மிக நாட்டம்","சொத்து தொடர்பு","குழந்தை சம்பந்தம்"];
              const palan = ["நல்ல மாதம்","சாதாரணம்","கடின உழைப்பு தேவை","மிக சிறந்தது","ஜாக்கிரதை","ஆதாயம்","பொறுமை","பெரும் ஆதாயம்","மகிழ்ச்சி","அமைதி","ஆர்வம்","மாற்றம்"][mi];
              return (<tr key={mi}><td style={{...td,fontWeight:700}}>{month}</td><td style={td}>{themes[mi]}</td><td style={td}>{palan}</td></tr>);
            })}
          </tbody>
        </table>
        <div style={{ marginTop: 8, fontSize: 9, lineHeight: 1.5 }}>
          <b>குறிப்பு:</b> முழு துல்லியமான மாத பலனுக்கு கோச்சார (transit) கணிப்பு + தசா-புத்தி இணைந்த பகுப்பாய்வு தேவை. மேலே உள்ளது பொதுவான திசை மட்டும்.
        </div>
      </Page>

      {/* === Brihaspati / Punya — Spiritual significance === */}
      <Page title="புண்ய காலம் & ஆன்மிக நாட்காட்டி" page={next()} total={totalPages} name={i.name}>
        <SectionBar>உங்களுக்கு உகந்த விரத / பூஜை நாட்கள்</SectionBar>
        <Box>
          • <b>பிறந்த நட்சத்திரம் ({result.nakshatraTamil}):</b> மாதம் ஒரு முறை வரும் — அன்று உப்பு உணவு, கூந்தல் வெட்டுதல் தவிர்க்க. வழிபாடு + தர்மம்.<br/>
          • <b>ஜென்ம திதி:</b> மாதம் ஒரு முறை — விஷ்ணு / சிவ வழிபாடு.<br/>
          • <b>பௌர்ணமி:</b> சத்யநாராயண பூஜை, சந்திரனுக்கு பால் நிவேதனம்.<br/>
          • <b>அமாவாசை:</b> பித்ரு தர்ப்பணம், கங்கை நீர் சமர்ப்பணம்.<br/>
          • <b>ஏகாதசி:</b> விரதம், விஷ்ணு வழிபாடு.<br/>
          • <b>பிரதோஷம்:</b> சிவ வழிபாடு, ருத்ர அபிஷேகம்.<br/>
          • <b>சங்கடஹர சதுர்த்தி:</b> கணபதி வழிபாடு, தடைகள் நீங்கும்.
        </Box>
        <SectionBar>பெரிய புண்ய காலங்கள்</SectionBar>
        <Box>
          • தைப் பூசம் — முருகன் வழிபாடு<br/>
          • மகா சிவராத்திரி — ருத்ர ஜபம், விழித்திருந்து வழிபாடு<br/>
          • நவராத்திரி — துர்கா / லக்ஷ்மி / ஸரஸ்வதி<br/>
          • தீபாவளி — லக்ஷ்மி பூஜை<br/>
          • வைகுண்ட ஏகாதசி — விஷ்ணு தரிசனம்<br/>
          • ஆடி அமாவாசை — பித்ரு தர்ப்பணம்<br/>
          • தீர்த்த யாத்திரை — காசி, ராமேஸ்வரம், திருப்பதி, பழனி.
        </Box>
      </Page>

      {/* === Compatibility / partner ideal === */}
      <Page title="உகந்த துணை — பொருத்த விவரம்" page={next()} total={totalPages} name={i.name}>
        <SectionBar>உங்கள் ராசி-நட்சத்திரத்திற்கு உகந்த துணை</SectionBar>
        <Box>
          <b>உங்கள் ராசி:</b> {result.rasiTamil} | <b>நட்சத்திரம்:</b> {result.nakshatraTamil}<br/>
          <b>உகந்த துணை ராசிகள்:</b> {(() => {
            const compat: Record<number, string[]> = {
              0:["சிம்மம்","தனுசு","மிதுனம்"],1:["கன்னி","மகரம்","கடகம்"],2:["துலாம்","கும்பம்","மேஷம்"],
              3:["விருச்சிகம்","மீனம்","ரிஷபம்"],4:["தனுசு","மேஷம்","துலாம்"],5:["மகரம்","ரிஷபம்","விருச்சிகம்"],
              6:["கும்பம்","மிதுனம்","தனுசு"],7:["மீனம்","கடகம்","மகரம்"],8:["மேஷம்","சிம்மம்","கும்பம்"],
              9:["ரிஷபம்","கன்னி","மீனம்"],10:["மிதுனம்","துலாம்","மேஷம்"],11:["கடகம்","விருச்சிகம்","ரிஷபம்"],
            };
            return compat[result.moon.rasiIndex].join(", ");
          })()}<br/>
          <b>10 பொருத்த விவரம்:</b><br/>
          1. தினம் (வாரம்) 2. கணம் 3. மகேந்திரம் 4. ஸ்திரீ தீர்க்கம் 5. யோனி<br/>
          6. ராசி அதிபதி 7. வசியம் 8. ராசி 9. நாடி 10. வேதை.
        </Box>
        <SectionBar>உகந்த துணையின் குணாதிசயம்</SectionBar>
        <Box>
          • கல்வி, குடும்ப பின்னணி நெருக்கமாக இருக்க வேண்டும்.<br/>
          • வயது வித்தியாசம் 3-7 ஆண்டு உகந்தது.<br/>
          • பல திசை கொண்ட (காதல், மரியாதை, உளத் தொடர்பு) உறவே நீடிக்கும்.<br/>
          • திருமணத்திற்கு முன் ஜாதக பொருத்தம் (10 / 36) கட்டாயம்.
        </Box>
      </Page>

      {/* === Additional Predictions Page 1 === */}
      <Page title="மேலதிக பலன்கள் — I" subtitle="தொழில் • வாகனம் • புகழ்" page={next()} total={totalPages} name={i.name}>
        <SectionBar>தொழில் (Business) பலன்</SectionBar>
        <Box>
          • {result.ascendant.rasiTamil} லக்னத்திற்கு 7,10,11ம் வீட்டு பலம் தொழிலில் வெற்றியை தரும்.<br/>
          • கூட்டுத் தொழிலை விட சொந்தத் தொழிலே சிறந்தது; சனி/செவ்வாய் பலமாயின் ரியல் எஸ்டேட், கட்டுமானம், உலோகம் சாதகம்.<br/>
          • புதன் பலமாயின் வர்த்தகம், ஏற்றுமதி, தொடர்பு சார்ந்த தொழில் நன்றாக அமையும்.<br/>
          • 30-42 வயதில் தொழில் விரிவாக்கம் சிறப்பாக நடக்கும்.
        </Box>
        <SectionBar>வாகன பாக்கியம்</SectionBar>
        <Box>
          • 4ம் வீடு வலுவாக இருந்தால் இரு / நான்கு சக்கர வாகனம் இளம் வயதிலேயே அமையும்.<br/>
          • சுக்ரன் பலம் சொகுசு வாகனத்தை, செவ்வாய் பலம் வேக வாகனத்தை குறிக்கிறது.<br/>
          • ராகு / கேது 4ல் இருப்பின் கவனமாக ஓட்ட வேண்டும்; கணேச வழிபாடு பாதுகாப்பு.
        </Box>
        <SectionBar>புகழ் & சமூக அந்தஸ்து</SectionBar>
        <Box>
          • சூரிய பலம் அரசு / பொது தொடர்பு துறையில் அங்கீகாரம் தரும்.<br/>
          • 10ம் அதிபதி உச்சம் / ஸ்வக்ஷேத்திரத்தில் இருப்பின் சமூகத்தில் தனி இடம்.<br/>
          • குரு திசை / புத்தியில் விருதுகள், பாராட்டுகள் கிடைக்கும்.
        </Box>
      </Page>

      {/* === Additional Predictions Page 2 === */}
      <Page title="மேலதிக பலன்கள் — II" subtitle="ஆயுள் • வழக்கு • எதிரிகள்" page={next()} total={totalPages} name={i.name}>
        <SectionBar>ஆயுள் (Longevity)</SectionBar>
        <Box>
          • லக்னாதிபதி, 8ம் அதிபதி, சனி பலன் கொண்டு ஆயுள் கணிக்கப்படுகிறது.<br/>
          • பால்யம் (0-32), மத்திமம் (32-64), முதிர்ச்சி (64-96) என மூன்று கட்டங்கள்.<br/>
          • சனி & குரு திருஷ்டி நீண்ட ஆயுளை உறுதிப்படுத்தும்.<br/>
          • யோகா, பிராணாயாமம் ஆயுள் பலத்தை உயர்த்தும்.
        </Box>
        <SectionBar>வழக்குகள் & சட்ட பிரச்சினைகள்</SectionBar>
        <Box>
          • 6ம் வீடு பலமாக இருப்பின் வழக்குகளில் வெற்றி.<br/>
          • செவ்வாய், சனி 6ல் இருப்பின் சொத்து தகராறு வரக்கூடும்.<br/>
          • ராகு திசை / புத்தியில் சட்ட சிக்கல் கவனிக்கவும்.<br/>
          • ஹனுமன் சாலிசா, சுப்பிரமணியர் வழிபாடு பாதுகாப்பு தரும்.
        </Box>
        <SectionBar>எதிரிகள் & போட்டியாளர்கள்</SectionBar>
        <Box>
          • 6ம் அதிபதியின் நிலை எதிரிகளை வெல்லும் ஆற்றலை குறிக்கும்.<br/>
          • மறைமுக நபர்களே அதிக பாதிப்பை தருவர்.<br/>
          • செவ்வாய் கிழமை குங்கும அர்ச்சனை விரோதிகளை தணிக்கும்.
        </Box>
      </Page>

      {/* === Additional Predictions Page 3 === */}
      <Page title="மேலதிக பலன்கள் — III" subtitle="பயணம் • முதலீடு • முகூர்த்தம்" page={next()} total={totalPages} name={i.name}>
        <SectionBar>பயண பலன்</SectionBar>
        <Box>
          • 3, 9, 12ம் வீடுகள் பயண காரகங்கள்; 12ம் அதிபதி பலமாக இருப்பின் வெளிநாட்டு வாய்ப்பு.<br/>
          • ராகு 9 / 12ல் இருப்பின் வெளிநாட்டில் நிரந்தர குடியேற்றம் சாத்தியம்.<br/>
          • குரு திசை / புத்தியில் புனித யாத்திரை, ஆன்மீக பயணம் அமையும்.
        </Box>
        <SectionBar>முதலீடு (Investments)</SectionBar>
        <Box>
          • குரு பலம் — தங்கம், நிலம், கல்வி பத்திரம் முதலீடு லாபம்.<br/>
          • சுக்ரன் பலம் — பங்குச்சந்தை, ஆடம்பர சொத்துகள் சாதகம்.<br/>
          • சனி பலம் — நீண்டகால சேமிப்பு, காப்பீடு, ஓய்வூதிய திட்டம்.<br/>
          • ராகு திசையில் வேக லாபம்-நஷ்டம்; ஊகவியாபாரம் தவிர்க்கவும்.
        </Box>
        <SectionBar>சுபமுகூர்த்த பரிந்துரை</SectionBar>
        <Box>
          • திருமணம், கிரகப்பிரவேசம் — குரு / சுக்ர ஹோரை, ரிஷபம் / கன்னி / மீன லக்னம்.<br/>
          • பயண ஆரம்பம் — புதன், வியாழன், வெள்ளி காலை வேளை.<br/>
          • புதிய தொழில் தொடக்கம் — சுக்கில பக்ஷ பஞ்சமி, தசமி, த்ரயோதசி.<br/>
          • ராகுகாலம், எமகண்டம், குளிகை நேரம் தவிர்க்கவும்.
        </Box>
      </Page>

      {/* === Dasha pages — continuous flat table chunked across A5 pages === */}
      {dashaPagesData.map(({ maha, chunks }, mi) => {
        const startAge = ageAt(birthDate, maha.startDate);
        const endAge = ageAt(birthDate, maha.endDate);
        const lordKey = DASHA_LORD_TO_KEY[maha.lord];
        return chunks.map((rows, ci) => (
          <Page
            key={`d-${mi}-${ci}`}
            title={`${mi + 1}. ${maha.lord} மகா தசை`}
            subtitle={chunks.length > 1 ? `பகுதி ${ci + 1} / ${chunks.length} • வயது ${startAge}-${endAge}` : `வயது ${startAge} - ${endAge}`}
            page={next()}
            total={totalPages}
            name={i.name}
          >
            {ci === 0 && (
              <>
                <div style={{ padding: "2px 6px", fontSize: 9, fontWeight: 700, border: "1px solid #000", textAlign: "center" }}>
                  {maha.lord} மகா தசை &nbsp;•&nbsp; {fmtDate(maha.startDate)} → {fmtDate(maha.endDate)} &nbsp;•&nbsp; வயது {startAge} - {endAge}
                </div>
                {lordKey && (
                  <div style={{ border: "1px solid #000", borderTop: 0, padding: "3px 6px", fontSize: 7.5, lineHeight: 1.3 }}>
                    <b>{maha.lord} தசை பொது பலன் :</b> {DASHA_LORD_PALAN[lordKey]}
                    {(() => {
                      const det: Record<string, { pos: string; neg: string; focus: string; remedy: string }> = {
                        sun: { pos: "அரசு அங்கீகாரம், தலைமை, தந்தை வழி நன்மை, புகழ் வளர்ச்சி, சுயமரியாதை உயரும்.", neg: "கண் / இதய பாதிப்பு, அதிக பித்தம், தந்தைக்கு கவலை, அரசு வழக்கு வரக்கூடும்.", focus: "தொழில் முன்னேற்றம், அரசு வேலை, அதிகார பதவி, பொது வாழ்வில் முன்னிலை.", remedy: "ஆதித்ய ஹ்ருதயம், சூரிய நமஸ்காரம், ஞாயிறு கோதுமை தானம், மாணிக்கம் (ஆலோசனைக்கு பின்)." },
                        moon: { pos: "மன அமைதி, தாய் வழி நன்மை, பெண் தொடர்பு, நீர் சார்ந்த வெற்றி, பயணம் நல்லது.", neg: "மன கலக்கம், தாய்க்கு உடல்நலக்குறைவு, சளி/குளிர், நினைவாற்றல் குறைவு.", focus: "குடும்ப விரிவாக்கம், புது வீடு, பால்-பால்பொருள் வியாபாரம், கலை.", remedy: "சந்திர நமஸ்காரம், திங்கள் சிவ அபிஷேகம், பால் தானம், முத்து." },
                        mars: { pos: "தைரியம், சகோதர நன்மை, நிலம் / சொத்து லாபம், தொழில் ஆற்றல், வீரம்.", neg: "ரத்த அழுத்தம், விபத்து, தீ-விபத்து, கோபம், போட்டி, அறுவை சிகிச்சை.", focus: "சொந்த தொழில், எஞ்ஜினியரிங், ராணுவம், ரியல் எஸ்டேட், விளையாட்டு.", remedy: "செவ்வாய் சுப்பிரமணியர் வழிபாடு, ஸ்கந்த சஷ்டி கவசம், செம்பவளம், நிலம் தானம்." },
                        mercury: { pos: "கல்வி, தொடர்பு, வர்த்தகம், பேச்சு, எழுத்து, சிறு பயணம், நண்பர் ஆதரவு.", neg: "நரம்பு பாதிப்பு, தோல் பிரச்சினை, அதிக சிந்தனை, பேச்சில் தவறு, கணக்கு குழப்பம்.", focus: "தொடர்பு, ஐடி, கணக்கியல், எழுத்து, ஊடகம், கல்வி, மொழியாக்கம்.", remedy: "புதன்கிழமை விஷ்ணு வழிபாடு, கணபதி அதர்வசீர்ஷம், மரகதம், பச்சை தானம்." },
                        jupiter: { pos: "ஞானம், குழந்தை பாக்கியம், செல்வம், ஆசிரியர் / குரு ஆதரவு, மத-ஆன்மிக வளர்ச்சி.", neg: "உடல் பருமன், கல்லீரல், தாமதங்கள், அதிக நம்பிக்கை, தவறான ஆலோசனை.", focus: "உயர் கல்வி, ஆசிரியர் பணி, சட்டம், நிதி, சமூக சேவை, வழிபாடு.", remedy: "வியாழக்கிழமை விஷ்ணு சஹஸ்ரநாமம், மஞ்சள் தானம், புஷ்பராகம், குரு பீடம்." },
                        venus: { pos: "திருமணம், காதல், கலை, ஆடம்பரம், வாகனம், சுக போகம், பெண் ஆதரவு.", neg: "காமம், கல்லீரல், சர்க்கரை, பார்வை, தாம்பத்திய சிக்கல், ஆடம்பர செலவு.", focus: "திருமணம், கலை, அழகு துறை, சினிமா, ஃபேஷன், ஆடம்பர பொருள் வியாபாரம்.", remedy: "வெள்ளிக்கிழமை லக்ஷ்மி பூஜை, ஸ்ரீ சூக்தம், வஜ்ரம், வெள்ளை தானம்." },
                        saturn: { pos: "தீவிர உழைப்பு பலன், சேமிப்பு, ஆன்மிக ஆழம், நீண்டகால சொத்து, தொழிலாளர் ஆதரவு.", neg: "தாமதம், தனிமை, மனஅழுத்தம், மூட்டு வலி, வழக்கு, சொத்து தகராறு.", focus: "சேவை, அரசு பணி, நீண்டகால தொழில், எண்ணெய், இரும்பு, கட்டுமானம்.", remedy: "சனிக்கிழமை திருநள்ளாறு / ஆஞ்சநேயர் வழிபாடு, ஹனுமான் சாலிசா 11 முறை, எள் தீபம், நீலம்." },
                        rahu: { pos: "எதிர்பாரா திடீர் ஆதாயம், வெளிநாடு வாய்ப்பு, தொழில்நுட்ப வளர்ச்சி, பெரும் மாற்றம்.", neg: "மாயை, ஏமாற்றம், திடீர் இழப்பு, தோல் வியாதி, சர்ப்ப தோஷ பாதிப்பு.", focus: "ஐடி, வெளிநாட்டு வேலை, மருந்து, மர்ம ஆராய்ச்சி, மார்க்கெட்டிங்.", remedy: "ராகு காலத்தில் துர்கா வழிபாடு, காளஹஸ்தி தர்ப்பணம், கோமேதகம், எள் தானம்." },
                        ketu: { pos: "ஆன்மிக விழிப்பு, மோக்ஷ பாதை, மறை அறிவு, மருத்துவம், ஆராய்ச்சி வெற்றி.", neg: "திடீர் பிரிவு, விபத்து, மறதி, தொற்று, ஆன்மிக குழப்பம், வெளியேற்றம்.", focus: "ஆன்மிகம், ஆராய்ச்சி, மருத்துவம், தந்திரம், ஞான மார்க்கம்.", remedy: "சாஸ்தா / விநாயக வழிபாடு, கணேச அதர்வசீர்ஷம், வைடூரியம், எள் தர்ப்பணம்." },
                      };
                      const d = det[lordKey];
                      if (!d) return null;
                      return (
                        <div style={{ marginTop: 3 }}>
                          <div><b>நற்பலன்:</b> {d.pos}</div>
                          <div><b>தீய பலன்:</b> {d.neg}</div>
                          <div><b>முக்கிய துறை:</b> {d.focus}</div>
                          <div><b>பரிகாரம்:</b> {d.remedy}</div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                {ci === 0 && (() => {
                  const PK: Record<string, string> = { Sun: "sun", Moon: "moon", Mars: "mars", Mercury: "mercury", Jupiter: "jupiter", Venus: "venus", Saturn: "saturn", Rahu: "rahu", Ketu: "ketu" };
                  const TA: Record<string, string> = { sun: "சூரியன்", moon: "சந்திரன்", mars: "செவ்வாய்", mercury: "புதன்", jupiter: "குரு", venus: "சுக்கிரன்", saturn: "சனி", rahu: "ராகு", ketu: "கேது" };
                  const FRIENDS: Record<string, string[]> = { sun: ["moon","mars","jupiter"], moon: ["sun","mercury"], mars: ["sun","moon","jupiter"], mercury: ["sun","venus"], jupiter: ["sun","moon","mars"], venus: ["mercury","saturn"], saturn: ["mercury","venus"], rahu: ["venus","saturn","mercury"], ketu: ["mars","venus","saturn"] };
                  const ENEMIES: Record<string, string[]> = { sun: ["venus","saturn","rahu"], moon: ["rahu","ketu"], mars: ["mercury"], mercury: ["moon"], jupiter: ["mercury","venus"], venus: ["sun","moon"], saturn: ["sun","moon","mars"], rahu: ["sun","moon","mars"], ketu: ["sun","moon"] };
                  // Maximum / peak benefit per dasha-bhukti combination (9x9 = 81)
                  const MAX_PALAN: Record<string, Record<string, string>> = {
                    sun:     { sun: "அரசு பதவி உச்சம், சுய அதிகாரம், புகழ் சிகரம்", moon: "உயர் அதிகாரம் + மக்கள் ஆதரவு, புதிய இல்லம்", mars: "வீர பதவி, நிலம் / அரசு சொத்து வாங்குதல்", mercury: "எழுத்து/பேச்சு வழியாக புகழ், அரசு ஒப்பந்தம்", jupiter: "உயர் பதவி உயர்வு, மரியாதை, செல்வ வரவு", venus: "ஆடம்பர வாகனம், அழகான பெண் சேர்க்கை, நிதி உயர்வு", saturn: "நீண்டகால அரசு பணி நிலைப்பாடு, சேமிப்பு", rahu: "வெளிநாட்டு அரசு வாய்ப்பு, திடீர் பதவி உயர்வு", ketu: "ஆன்மிக அதிகாரம், மறை அறிவு வழியாக மரியாதை" },
                    moon:    { sun: "தாய் வழி அரசு பலன், மக்கள் தலைமை", moon: "மன அமைதி உச்சம், புது இல்லம், தாய் ஆசி உச்சம்", mars: "சொத்து வாங்குதல், சகோதர நன்மை, வீர செயல்", mercury: "வர்த்தக பெருக்கம், கல்வி உச்சம், புது தொடர்பு", jupiter: "திருமணம், குழந்தை பாக்கியம், செல்வம் உச்சம்", venus: "திருமண சுகம், கலை வெற்றி, வாகனம், ஆடம்பரம்", saturn: "நீண்டகால சொத்து லாபம், மக்கள் சேவை அங்கீகாரம்", rahu: "வெளிநாடு பயணம், பெரும் ஆதாயம் (எச்சரிக்கையுடன்)", ketu: "ஆன்மிக யாத்திரை, தீர்த்த தரிசனம்" },
                    mars:    { sun: "வீர பதவி, அரசு அங்கீகாரம், எதிரி வெற்றி", moon: "புது நிலம், தாய் வழி சொத்து லாபம்", mars: "தைரியம் உச்சம், சொத்து உச்ச லாபம், வீர செயல்", mercury: "தொழில்நுட்ப வெற்றி, புது வர்த்தகம் தொடக்கம்", jupiter: "சட்ட வெற்றி, சொத்து-நீதி வழக்கு வெற்றி", venus: "திருமணம், வாகனம், கலை-விளையாட்டில் வெற்றி", saturn: "ரியல் எஸ்டேட் / கட்டுமான பெரு லாபம்", rahu: "திடீர் சொத்து லாபம், தொழில்நுட்ப பாய்ச்சல்", ketu: "ஆராய்ச்சி, மருத்துவ துறை வெற்றி, ஆன்மிக ஆற்றல்" },
                    mercury: { sun: "அரசு ஒப்பந்தம், எழுத்து வழியாக புகழ்", moon: "வர்த்தக நிறுவன பெருக்கம், புது தொடர்புகள்", mars: "தொழில்நுட்ப வெற்றி, சகோதர-வர்த்தக கூட்டு", mercury: "கல்வி + வர்த்தகம் உச்சம், எழுத்தாளராக புகழ்", jupiter: "உயர் கல்வி வெற்றி, வங்கி-நிதி பதவி", venus: "கலை + வர்த்தகம், ஆடம்பர வியாபாரம், திருமணம்", saturn: "நீண்டகால தொழில் நிலைப்பாடு, சேமிப்பு பெருக்கம்", rahu: "ஐடி/மார்க்கெட்டிங் பெரு வெற்றி, வெளிநாட்டு தொடர்பு", ketu: "ஆராய்ச்சி, மருத்துவ-கணித துறை வெற்றி" },
                    jupiter: { sun: "அரசு உயர் பதவி, தர்ம செயல், புகழ் உச்சம்", moon: "திருமணம், குழந்தை பாக்கியம், செல்வ வரவு உச்சம்", mars: "சொத்து வாங்குதல், தர்ம வழி பெரு வெற்றி", mercury: "உயர் கல்வி, வங்கி-நிதி தொழில் வளர்ச்சி", jupiter: "ஞான உச்சம், குரு பதவி, பெரு செல்வம், புகழ்", venus: "திருமண சுகம் உச்சம், ஆடம்பரம், ஆலய சேவை", saturn: "நீண்டகால சொத்து, சமூக சேவை அங்கீகாரம்", rahu: "வெளிநாட்டு உயர் பதவி, பெரு ஆதாயம்", ketu: "ஆன்மிக குரு பதவி, மோக்ஷ பாதை" },
                    venus:   { sun: "அரசு + கலை அங்கீகாரம், ஆடம்பர பதவி", moon: "திருமண சுகம் உச்சம், புது இல்லம், அழகு", mars: "வாகனம், சொத்து, கலை வெற்றி, காதல்", mercury: "கலை + வர்த்தகம், ஃபேஷன் / சினிமா வெற்றி", jupiter: "திருமணம், குழந்தை பாக்கியம், செல்வம் உச்சம்", venus: "திருமண சுகம் உச்சம், ஆடம்பரம், கலை வெற்றி", saturn: "நீண்டகால ஆடம்பர சொத்து, கலை நிறுவனம்", rahu: "வெளிநாட்டு கலை வாய்ப்பு, ஃபேஷன் பெரு வெற்றி", ketu: "ஆன்மிக கலை, பக்தி இசை வெற்றி" },
                    saturn:  { sun: "அரசு பணி நிரந்தரம், ஆட்சி பதவி", moon: "மக்கள் சேவை அங்கீகாரம், சொத்து சேமிப்பு", mars: "ரியல் எஸ்டேட் பெரு லாபம், நிலம் வெற்றி", mercury: "நீண்டகால வர்த்தகம், சேமிப்பு உயர்வு", jupiter: "நிதி-வங்கி உயர் பதவி, தர்ம சொத்து", venus: "ஆடம்பர சொத்து, கலை நிறுவனம், திருமணம்", saturn: "நீண்டகால சேமிப்பு உச்சம், சொத்து குவிப்பு", rahu: "வெளிநாட்டு வேலை நிரந்தரம், பெரு லாபம்", ketu: "ஆன்மிக ஆழம், துறவு பாதை, ஆராய்ச்சி" },
                    rahu:    { sun: "திடீர் அரசு பதவி, வெளிநாட்டு அங்கீகாரம்", moon: "வெளிநாடு பயணம், பெரு ஆதாயம் (கவனம்)", mars: "திடீர் சொத்து, தொழில்நுட்ப பாய்ச்சல்", mercury: "ஐடி/மார்க்கெட்டிங் உச்சம், வெளிநாட்டு வேலை", jupiter: "வெளிநாட்டு உயர் பதவி, பெரு செல்வம்", venus: "வெளிநாட்டு கலை/ஆடம்பர வாய்ப்பு, புகழ்", saturn: "வெளிநாட்டு வேலை நிரந்தரம், பெரு சேமிப்பு", rahu: "எதிர்பாரா பெரு ஆதாயம், புகழ் உச்சம்", ketu: "ஆன்மிக மாற்றம், ஆராய்ச்சி வெற்றி" },
                    ketu:    { sun: "ஆன்மிக அதிகாரம், மறை அறிவு வழி புகழ்", moon: "தீர்த்த யாத்திரை, ஆன்மிக அமைதி", mars: "ஆராய்ச்சி, மருத்துவம், ஆன்மிக ஆற்றல்", mercury: "ஆராய்ச்சி, கணித / மருத்துவ வெற்றி", jupiter: "ஆன்மிக குரு பதவி, மோக்ஷ பாதை", venus: "ஆன்மிக கலை, பக்தி இசை, தர்ம செல்வம்", saturn: "துறவு பாதை, நீண்டகால ஆராய்ச்சி", rahu: "ஆன்மிக மாற்றம், மறை அறிவு வெற்றி", ketu: "மோக்ஷ உச்சம், ஆன்மிக விழிப்பு உச்சம்" },
                  };
                  const dKey = lordKey;
                  if (!dKey) return null;
                  const bhuktis = (maha.children || []).map(b => ({ lord: b.lord, start: b.startDate, end: b.endDate }));
                  return (
                    <div style={{ border: "1px solid #7a1a2b", borderTop: 0, padding: "3px 6px", fontSize: 7.4, lineHeight: 1.35, background: "#fff8ee" }}>
                      <div style={{ fontWeight: 800, marginBottom: 2, color: "#7a1a2b", textAlign: "center", borderBottom: "1px solid #c9a050", paddingBottom: 1 }}>
                        ★ புத்தி அதிகபட்ச பலன்கள் (Peak Benefits per Bhukti) ★
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 7.3 }}>
                        <thead>
                          <tr style={{ background: "#fbe9d0" }}>
                            <th style={{ ...th, padding: "1px 3px", width: "16%" }}>புத்தி</th>
                            <th style={{ ...th, padding: "1px 3px", width: "10%" }}>நிலை</th>
                            <th style={{ ...th, padding: "1px 3px", width: "20%" }}>காலம்</th>
                            <th style={{ ...th, padding: "1px 3px", width: "54%" }}>அதிகபட்ச பலன் (Max)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bhuktis.map((b, bi) => {
                            const bKey = PK[b.lord];
                            if (!bKey) return null;
                            const rel = bKey === dKey ? "சுய" : FRIENDS[dKey]?.includes(bKey) ? "நட்பு" : ENEMIES[dKey]?.includes(bKey) ? "பகை" : "சம";
                            const relColor = rel === "நட்பு" || rel === "சுய" ? "#2e7d32" : rel === "பகை" ? "#c62828" : "#555";
                            const palan = MAX_PALAN[dKey]?.[bKey] || "—";
                            return (
                              <tr key={bi}>
                                <td style={{ ...td, padding: "1px 3px", fontWeight: 700 }}>{TA[dKey]}/{TA[bKey]}</td>
                                <td style={{ ...td, padding: "1px 3px", color: relColor, fontWeight: 700, textAlign: "center" }}>{rel}</td>
                                <td style={{ ...td, padding: "1px 3px", fontSize: 6.8 }}>{fmtDate(b.start)} → {fmtDate(b.end)}</td>
                                <td style={{ ...td, padding: "1px 3px" }}>{palan}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </>
            )}
            <table style={{ width: "100%", fontSize: 8, lineHeight: 1.15, borderCollapse: "collapse", border: "1px solid #000", marginTop: 3, tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th style={{ ...th, padding: "1px 3px", width: hideAntharam ? "30%" : "16%" }}>புத்தி</th>
                  {!hideAntharam && <th style={{ ...th, padding: "1px 3px", width: "14%" }}>அந்தரம்</th>}
                  <th style={{ ...th, padding: "1px 3px", width: hideAntharam ? "26%" : "23%" }}>தொடக்கம்</th>
                  <th style={{ ...th, padding: "1px 3px", width: hideAntharam ? "26%" : "23%" }}>முடிவு</th>
                  <th style={{ ...th, padding: "1px 3px", width: hideAntharam ? "18%" : "8%" }}>வயது</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, ri) => (
                  <tr key={ri}>
                    <td style={{ ...td, padding: "1px 3px", fontWeight: r.bhukti ? 700 : 400 }}>{r.bhukti}</td>
                    {!hideAntharam && <td style={{ ...td, padding: "1px 3px" }}>{r.ant}</td>}
                    <td style={{ ...td, padding: "1px 3px" }}>{r.start}</td>
                    <td style={{ ...td, padding: "1px 3px" }}>{r.end}</td>
                    <td style={{ ...td, padding: "1px 3px" }}>{r.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Page>
        ));
      })}

      {/* === DASHA SUMMARY: maha dasha start/end + slogan === */}
      {(() => {
        const DASHA_SLOGAN: Record<string, { sk: string; ta: string }> = {
          sun: { sk: "ஜபா குஸும ஸங்காசம் காச்யபேயம் மஹாத்யுதிம் । தமோரிம் ஸர்வ பாபக்நம் ப்ரணதோ³ஸ்மி திவாகரம் ॥", ta: "சூரிய பகவான் துன்பங்களை நீக்கி ஆரோக்கியம், புகழ், அதிகாரம் தருவார்." },
          moon: { sk: "த³தி⁴ ஸங்க² துஷாராப⁴ம் க்ஷீரோத³ார்ணவ ஸம்ப⁴வம் । நமாமி ஶஶினம் ஸோமம் ஶம்போ⁴ர் முகுட பூ⁴ஷணம் ॥", ta: "சந்திர பகவான் மன அமைதி, தாய் வழி நன்மை, செழிப்பை தருவார்." },
          mars: { sk: "த⁴ரணீ க³ர்ப⁴ ஸம்பூ⁴தம் வித்³யுத்காந்தி ஸமப்ரப⁴ம் । குமாரம் ஶக்தி ஹஸ்தம் ச மங்க³ளம் ப்ரணமாம்யஹம் ॥", ta: "செவ்வாய் பகவான் தைரியம், சகோதர நன்மை, சொத்து லாபம் தருவார்." },
          mercury: { sk: "ப்ரியங்கு³ கலிகாஶ்யாமம் ரூபேண ப்ரதிமம் பு³த⁴ம் । ஸௌம்யம் ஸௌம்ய கு³ணோபேதம் தம் பு³த⁴ம் ப்ரணமாம்யஹம் ॥", ta: "புதன் பகவான் கல்வி, தொடர்பு, வர்த்தக வெற்றியை தருவார்." },
          jupiter: { sk: "தே³வானாம் ச ருஷீணாம் ச கு³ரும் காஞ்சன ஸந்நிப⁴ம் । பு³த்³தி⁴பூ⁴தம் த்ரிலோகேஶம் தம் நமாமி ப்³ருஹஸ்பதிம் ॥", ta: "குரு பகவான் ஞானம், செல்வம், திருமணம், குழந்தை பாக்கியம் தருவார்." },
          venus: { sk: "ஹிமகுந்த³ ம்ருணாலாப⁴ம் தை³த்யானாம் பரமம் கு³ரும் । ஸர்வ ஶாஸ்த்ர ப்ரவக்தாரம் பா⁴ர்க³வம் ப்ரணமாம்யஹம் ॥", ta: "சுக்கிர பகவான் திருமணம், கலை, ஆடம்பரம், வாகனம் தருவார்." },
          saturn: { sk: "நீலாஞ்ஜன ஸமாபா⁴ஸம் ரவிபுத்ரம் யமாக்³ரஜம் । சா²யா மார்தாண்ட³ ஸம்பூ⁴தம் தம் நமாமி ஶனைஶ்சரம் ॥", ta: "சனி பகவான் உழைப்பு பலன், சேமிப்பு, ஆன்மிக ஆழம், நீண்டகால சொத்து தருவார்." },
          rahu: { sk: "அர்த⁴காயம் மஹா வீர்யம் சந்த்³ராதி³த்ய விமர்த³னம் । ஸிம்ஹிகா க³ர்ப⁴ ஸம்பூ⁴தம் தம் ராஹும் ப்ரணமாம்யஹம் ॥", ta: "ராகு பகவான் வெளிநாடு, திடீர் ஆதாயம், தொழில்நுட்ப வளர்ச்சி தருவார்." },
          ketu: { sk: "பலாஶ புஷ்ப ஸங்காஶம் தாரகா க்³ரஹ மஸ்தகம் । ரௌத்³ரம் ரௌத்³ராத்மகம் கோ⁴ரம் தம் கேதும் ப்ரணமாம்யஹம் ॥", ta: "கேது பகவான் ஆன்மிக விழிப்பு, மோக்ஷ பாதை, ஆராய்ச்சி வெற்றி தருவார்." },
        };
        const DASHA_PARA: Record<string, string> = {
          sun: "சூரிய மகா தசை 6 ஆண்டுகள் நீடிக்கும். அரசு வேலை, அதிகார பதவி, தந்தை வழி நன்மை, புகழ், சுயமரியாதை உச்சம் என்று இக்காலம் அமையும். சூரிய/சூரியா புத்தியில் சுய அதிகார உச்சம் – புதிய பதவி உயர்வு. சூரிய/சந்திர புத்தியில் மக்கள் ஆதரவு + புது இல்லம். சூரிய/செவ்வாய் புத்தியில் வீர செயல்கள், நிலம் வாங்குதல். சூரிய/புதன் புத்தியில் எழுத்து-பேச்சு வழியாக புகழ், அரசு ஒப்பந்தம். சூரிய/குரு புத்தியில் உயர் பதவி உயர்வு, செல்வ வரவு. சூரிய/சுக்கிர புத்தியில் ஆடம்பர வாகனம், திருமண சந்தர்ப்பம். சூரிய/சனி புத்தியில் நீண்டகால அரசு பணி நிலைப்பாடு. சூரிய/ராகு புத்தியில் வெளிநாட்டு அரசு வாய்ப்பு, திடீர் பதவி உயர்வு. சூரிய/கேது புத்தியில் ஆன்மிக அதிகாரம், மறை அறிவு வழியாக மரியாதை உண்டு.",
          moon: "சந்திர மகா தசை 10 ஆண்டுகள் நீடிக்கும். மன அமைதி, தாய் வழி நன்மை, பெண் தொடர்பு, புது இல்லம், செழிப்பு என்று இக்காலம் அமையும். சந்திர/சூரிய புத்தியில் மக்கள் தலைமை, அரசு பலன். சந்திர/சந்திர புத்தியில் மன அமைதி உச்சம், தாய் ஆசி உச்சம். சந்திர/செவ்வாய் புத்தியில் சொத்து வாங்குதல், சகோதர நன்மை. சந்திர/புதன் புத்தியில் வர்த்தக பெருக்கம், கல்வி உச்சம். சந்திர/குரு புத்தியில் திருமணம், குழந்தை பாக்கியம், செல்வம் உச்சம். சந்திர/சுக்கிர புத்தியில் திருமண சுகம், கலை வெற்றி, ஆடம்பரம். சந்திர/சனி புத்தியில் நீண்டகால சொத்து லாபம். சந்திர/ராகு புத்தியில் வெளிநாடு பயணம், பெரும் ஆதாயம் (எச்சரிக்கையுடன்). சந்திர/கேது புத்தியில் ஆன்மிக யாத்திரை, தீர்த்த தரிசனம் உண்டு.",
          mars: "செவ்வாய் மகா தசை 7 ஆண்டுகள் நீடிக்கும். தைரியம், சகோதர நன்மை, நிலம்/சொத்து லாபம், தொழில் ஆற்றல், வீரம் உச்சம் என்று இக்காலம் அமையும். செவ்வாய்/சூரிய புத்தியில் வீர பதவி, அரசு அங்கீகாரம், எதிரி வெற்றி. செவ்வாய்/சந்திர புத்தியில் புது நிலம், தாய் வழி சொத்து லாபம். செவ்வாய்/செவ்வாய் புத்தியில் தைரியம் உச்சம், சொத்து உச்ச லாபம். செவ்வாய்/புதன் புத்தியில் தொழில்நுட்ப வெற்றி. செவ்வாய்/குரு புத்தியில் சட்ட வெற்றி, சொத்து-நீதி வெற்றி. செவ்வாய்/சுக்கிர புத்தியில் திருமணம், வாகனம், கலை-விளையாட்டில் வெற்றி. செவ்வாய்/சனி புத்தியில் ரியல் எஸ்டேட் / கட்டுமான பெரு லாபம். செவ்வாய்/ராகு புத்தியில் திடீர் சொத்து லாபம், தொழில்நுட்ப பாய்ச்சல். செவ்வாய்/கேது புத்தியில் ஆராய்ச்சி, மருத்துவ வெற்றி, ஆன்மிக ஆற்றல் கிடைக்கும்.",
          mercury: "புதன் மகா தசை 17 ஆண்டுகள் நீடிக்கும். கல்வி, தொடர்பு, வர்த்தகம், பேச்சு, எழுத்து, நண்பர் ஆதரவு என்று இக்காலம் அமையும். புதன்/சூரிய புத்தியில் அரசு ஒப்பந்தம், எழுத்து வழியாக புகழ். புதன்/சந்திர புத்தியில் வர்த்தக நிறுவன பெருக்கம், புது தொடர்புகள். புதன்/செவ்வாய் புத்தியில் தொழில்நுட்ப வெற்றி, சகோதர-வர்த்தக கூட்டு. புதன்/புதன் புத்தியில் கல்வி + வர்த்தகம் உச்சம், எழுத்தாளராக புகழ். புதன்/குரு புத்தியில் உயர் கல்வி வெற்றி, வங்கி-நிதி பதவி. புதன்/சுக்கிர புத்தியில் கலை + வர்த்தகம், ஆடம்பர வியாபாரம், திருமணம். புதன்/சனி புத்தியில் நீண்டகால தொழில் நிலைப்பாடு, சேமிப்பு பெருக்கம். புதன்/ராகு புத்தியில் ஐடி/மார்க்கெட்டிங் பெரு வெற்றி, வெளிநாட்டு தொடர்பு. புதன்/கேது புத்தியில் ஆராய்ச்சி, மருத்துவ-கணித துறை வெற்றி உண்டு.",
          jupiter: "குரு மகா தசை 16 ஆண்டுகள் நீடிக்கும். ஞானம், குழந்தை பாக்கியம், செல்வம், ஆசிரியர்/குரு ஆதரவு, மத-ஆன்மிக வளர்ச்சி உச்சம் என்று இக்காலம் அமையும். குரு/சூரிய புத்தியில் அரசு உயர் பதவி, தர்ம செயல், புகழ் உச்சம். குரு/சந்திர புத்தியில் திருமணம், குழந்தை பாக்கியம், செல்வ வரவு உச்சம். குரு/செவ்வாய் புத்தியில் சொத்து வாங்குதல், தர்ம வழி பெரு வெற்றி. குரு/புதன் புத்தியில் உயர் கல்வி, வங்கி-நிதி தொழில் வளர்ச்சி. குரு/குரு புத்தியில் ஞான உச்சம், குரு பதவி, பெரு செல்வம், புகழ். குரு/சுக்கிர புத்தியில் திருமண சுகம் உச்சம், ஆடம்பரம், ஆலய சேவை. குரு/சனி புத்தியில் நீண்டகால சொத்து, சமூக சேவை அங்கீகாரம். குரு/ராகு புத்தியில் வெளிநாட்டு உயர் பதவி, பெரு ஆதாயம். குரு/கேது புத்தியில் ஆன்மிக குரு பதவி, மோக்ஷ பாதை கிடைக்கும்.",
          venus: "சுக்கிர மகா தசை 20 ஆண்டுகள் நீடிக்கும். திருமணம், காதல், கலை, ஆடம்பரம், வாகனம், சுக போகம், பெண் ஆதரவு உச்சம் என்று இக்காலம் அமையும். சுக்கிர/சூரிய புத்தியில் அரசு + கலை அங்கீகாரம், ஆடம்பர பதவி. சுக்கிர/சந்திர புத்தியில் திருமண சுகம் உச்சம், புது இல்லம், அழகு. சுக்கிர/செவ்வாய் புத்தியில் வாகனம், சொத்து, கலை வெற்றி, காதல். சுக்கிர/புதன் புத்தியில் கலை + வர்த்தகம், ஃபேஷன் / சினிமா வெற்றி. சுக்கிர/குரு புத்தியில் திருமணம், குழந்தை பாக்கியம், செல்வம் உச்சம். சுக்கிர/சுக்கிர புத்தியில் திருமண சுகம் உச்சம், ஆடம்பரம், கலை வெற்றி. சுக்கிர/சனி புத்தியில் நீண்டகால ஆடம்பர சொத்து, கலை நிறுவனம். சுக்கிர/ராகு புத்தியில் வெளிநாட்டு கலை வாய்ப்பு, ஃபேஷன் பெரு வெற்றி. சுக்கிர/கேது புத்தியில் ஆன்மிக கலை, பக்தி இசை வெற்றி உண்டு.",
          saturn: "சனி மகா தசை 19 ஆண்டுகள் நீடிக்கும். தீவிர உழைப்பு பலன், சேமிப்பு, ஆன்மிக ஆழம், நீண்டகால சொத்து, தொழிலாளர் ஆதரவு என்று இக்காலம் அமையும். சனி/சூரிய புத்தியில் அரசு பணி நிரந்தரம், ஆட்சி பதவி. சனி/சந்திர புத்தியில் மக்கள் சேவை அங்கீகாரம், சொத்து சேமிப்பு. சனி/செவ்வாய் புத்தியில் ரியல் எஸ்டேட் பெரு லாபம், நிலம் வெற்றி. சனி/புதன் புத்தியில் நீண்டகால வர்த்தகம், சேமிப்பு உயர்வு. சனி/குரு புத்தியில் நிதி-வங்கி உயர் பதவி, தர்ம சொத்து. சனி/சுக்கிர புத்தியில் ஆடம்பர சொத்து, கலை நிறுவனம், திருமணம். சனி/சனி புத்தியில் நீண்டகால சேமிப்பு உச்சம், சொத்து குவிப்பு. சனி/ராகு புத்தியில் வெளிநாட்டு வேலை நிரந்தரம், பெரு லாபம். சனி/கேது புத்தியில் ஆன்மிக ஆழம், துறவு பாதை, ஆராய்ச்சி வெற்றி உண்டு.",
          rahu: "ராகு மகா தசை 18 ஆண்டுகள் நீடிக்கும். எதிர்பாரா திடீர் ஆதாயம், வெளிநாடு வாய்ப்பு, தொழில்நுட்ப வளர்ச்சி, பெரும் மாற்றம் என்று இக்காலம் அமையும். ராகு/சூரிய புத்தியில் திடீர் அரசு பதவி, வெளிநாட்டு அங்கீகாரம். ராகு/சந்திர புத்தியில் வெளிநாடு பயணம், பெரு ஆதாயம் (கவனம்). ராகு/செவ்வாய் புத்தியில் திடீர் சொத்து, தொழில்நுட்ப பாய்ச்சல். ராகு/புதன் புத்தியில் ஐடி/மார்க்கெட்டிங் உச்சம், வெளிநாட்டு வேலை. ராகு/குரு புத்தியில் வெளிநாட்டு உயர் பதவி, பெரு செல்வம். ராகு/சுக்கிர புத்தியில் வெளிநாட்டு கலை/ஆடம்பர வாய்ப்பு, புகழ். ராகு/சனி புத்தியில் வெளிநாட்டு வேலை நிரந்தரம், பெரு சேமிப்பு. ராகு/ராகு புத்தியில் எதிர்பாரா பெரு ஆதாயம், புகழ் உச்சம். ராகு/கேது புத்தியில் ஆன்மிக மாற்றம், ஆராய்ச்சி வெற்றி கிடைக்கும்.",
          ketu: "கேது மகா தசை 7 ஆண்டுகள் நீடிக்கும். ஆன்மிக விழிப்பு, மோக்ஷ பாதை, மறை அறிவு, மருத்துவம், ஆராய்ச்சி வெற்றி என்று இக்காலம் அமையும். கேது/சூரிய புத்தியில் ஆன்மிக அதிகாரம், மறை அறிவு வழி புகழ். கேது/சந்திர புத்தியில் தீர்த்த யாத்திரை, ஆன்மிக அமைதி. கேது/செவ்வாய் புத்தியில் ஆராய்ச்சி, மருத்துவம், ஆன்மிக ஆற்றல். கேது/புதன் புத்தியில் ஆராய்ச்சி, கணித / மருத்துவ வெற்றி. கேது/குரு புத்தியில் ஆன்மிக குரு பதவி, மோக்ஷ பாதை. கேது/சுக்கிர புத்தியில் ஆன்மிக கலை, பக்தி இசை, தர்ம செல்வம். கேது/சனி புத்தியில் துறவு பாதை, நீண்டகால ஆராய்ச்சி. கேது/ராகு புத்தியில் ஆன்மிக மாற்றம், மறை அறிவு வெற்றி. கேது/கேது புத்தியில் மோக்ஷ உச்சம், ஆன்மிக விழிப்பு உச்சம் கிடைக்கும்.",
        };

        return (
          <>
            <Page title="தசா சுருக்கம் & ஸ்லோகங்கள்" subtitle="9 மகா தசைகள் – தொடக்கம், முடிவு, வயது, ஸ்லோகம்" page={next()} total={totalPages} name={i.name}>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", fontSize: 8.5, lineHeight: 1.3 }}>
                <thead>
                  <tr style={{ background: "#fbe9d0" }}>
                    <th style={{ ...th, padding: "2px 3px", width: "12%" }}>மகா தசை</th>
                    <th style={{ ...th, padding: "2px 3px", width: "13%" }}>தொடக்கம்</th>
                    <th style={{ ...th, padding: "2px 3px", width: "13%" }}>முடிவு</th>
                    <th style={{ ...th, padding: "2px 3px", width: "10%" }}>வயது</th>
                    <th style={{ ...th, padding: "2px 3px", width: "52%" }}>தசை ஸ்லோகம்</th>
                  </tr>
                </thead>
                <tbody>
                  {result.dashaTree.map((maha, mi) => {
                    const lk = DASHA_LORD_TO_KEY[maha.lord];
                    const sl = lk ? DASHA_SLOGAN[lk] : null;
                    return (
                      <tr key={mi}>
                        <td style={{ ...td, padding: "2px 3px", fontWeight: 700 }}>{maha.lord}</td>
                        <td style={{ ...td, padding: "2px 3px" }}>{fmtDate(maha.startDate)}</td>
                        <td style={{ ...td, padding: "2px 3px" }}>{fmtDate(maha.endDate)}</td>
                        <td style={{ ...td, padding: "2px 3px", textAlign: "center" }}>{ageAt(birthDate, maha.startDate)}-{ageAt(birthDate, maha.endDate)}</td>
                        <td style={{ ...td, padding: "2px 3px", fontSize: 7.8 }}>
                          {sl ? (<><div style={{ fontStyle: "italic" }}>{sl.sk}</div><div style={{ marginTop: 1 }}>{sl.ta}</div></>) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Page>

            {result.dashaTree.map((maha, mi) => {
              const lk = DASHA_LORD_TO_KEY[maha.lord];
              const para = lk ? DASHA_PARA[lk] : "";
              const sAge = ageAt(birthDate, maha.startDate);
              const eAge = ageAt(birthDate, maha.endDate);
              return (
                <Page key={`dpara-${mi}`} title={`${maha.lord} மகா தசை – புத்தி பலன் (பத்தி)`} subtitle={`${fmtDate(maha.startDate)} → ${fmtDate(maha.endDate)} • வயது ${sAge}-${eAge}`} page={next()} total={totalPages} name={i.name}>
                  <div style={{ border: "1px solid #000", padding: "5px 8px", fontSize: 9, lineHeight: 1.55, textAlign: "justify", background: "#fff8ee" }}>
                    {para}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 8.5, fontWeight: 700, color: "#7a1a2b" }}>புத்தி காலங்கள் (தொடக்கம் – முடிவு – வயது)</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", fontSize: 8.2, marginTop: 2 }}>
                    <thead>
                      <tr style={{ background: "#fbe9d0" }}>
                        <th style={{ ...th, padding: "2px 3px", width: "22%" }}>புத்தி</th>
                        <th style={{ ...th, padding: "2px 3px", width: "26%" }}>தொடக்கம்</th>
                        <th style={{ ...th, padding: "2px 3px", width: "26%" }}>முடிவு</th>
                        <th style={{ ...th, padding: "2px 3px", width: "26%" }}>வயது</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(maha.children || []).map((b, bi) => (
                        <tr key={bi}>
                          <td style={{ ...td, padding: "2px 3px", fontWeight: 700 }}>{maha.lord}/{b.lord}</td>
                          <td style={{ ...td, padding: "2px 3px" }}>{fmtDate(b.startDate)}</td>
                          <td style={{ ...td, padding: "2px 3px" }}>{fmtDate(b.endDate)}</td>
                          <td style={{ ...td, padding: "2px 3px", textAlign: "center" }}>{ageAt(birthDate, b.startDate)} - {ageAt(birthDate, b.endDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Page>
              );
            })}

            {(() => {
              const BHUKTI_PARA: Record<string, string> = {
                sun: "சூரிய புத்தி காலத்தில் அரசு தொடர்பான பணிகளில் வெற்றி கிடைக்கும். தந்தை வழி உறவினர்களின் ஆதரவு கிடைக்கும். பதவி உயர்வு, அதிகாரம், சுயமரியாதை அதிகரிக்கும். பெயர், புகழ் உயரும். ஆனால் ஆரோக்கியத்தில் கொஞ்சம் கவனம் தேவை — கண் மற்றும் இதய சம்பந்தமான தொல்லைகள் வரக்கூடும். மேலதிகாரிகளுடன் கருத்து வேறுபாடு வராமல் பார்த்துக் கொள்ள வேண்டும். தலைமை பொறுப்பு, அரசியல், நிர்வாக துறையில் சாதிப்பார்.",
                moon: "சந்திர புத்தி காலத்தில் மனநிலை மகிழ்ச்சியாக இருக்கும். தாய்வழி உறவுகளின் ஆதரவு உண்டு. நீர் சம்பந்தமான தொழில்களில் வெற்றி கிடைக்கும். பயணங்கள் அதிகமாகும். புதிய இல்லத்திற்கு மாறும் வாய்ப்பு உள்ளது. பால் பொருட்கள், திரவ வியாபாரம் சாதகமாக இருக்கும். பெண்கள், பொதுமக்களின் ஆதரவு கிடைக்கும். குடும்ப சுகம் பெருகும். மன அழுத்தம், நீர்த்தேக்க பாதிப்புகள் வராமல் கவனிக்க வேண்டும்.",
                mars: "செவ்வாய் புத்தி காலத்தில் தைரியம், சாகசம் அதிகரிக்கும். ஆனால் அவசரப்பட்டு செயல்படக்கூடாது. சகோதரர்களுடன் கருத்து வேறுபாடு வரக்கூடும். நில சம்பந்தமான வாய்ப்புகள் உருவாகும். ரத்தம், நெருப்பு, ஆயுதம் சம்பந்தப்பட்ட விஷயங்களில் ஜாக்கிரதை வேண்டும். ராணுவம், காவல், விளையாட்டு, பொறியியல் துறையில் வெற்றி. சொத்து, வாகனம் வாங்கும் வாய்ப்பு உண்டு. கோபம், விபத்து கட்டுப்படுத்த வேண்டும்.",
                rahu: "ராகு புத்தி காலத்தில் எதிர்பாராத மாற்றங்கள், திடீர் லாபம் அல்லது நஷ்டம் ஏற்படக்கூடும். வெளிநாட்டு தொடர்புகள் ஏற்படும். மர்மமான நபர்களுடன் சேர்ந்து கொள்வார். தோல், நரம்பு சம்பந்தமான பாதிப்புகள் வரக்கூடும். ஆன்மிகத்தில் ஈடுபாடு வளரும். தொழில்நுட்பம், ஆராய்ச்சி, மருந்து தொழில் சாதகம். சட்ட சிக்கல்கள், ஏமாற்று வராமல் கவனிக்க வேண்டும். திடீர் முடிவுகள் தவிர்க்க வேண்டும்.",
                jupiter: "குரு புத்தி காலத்தில் தர்மம், ஆன்மிகம், கல்வி ஆகியவற்றில் முன்னேற்றம் உண்டு. குழந்தை பாக்கியம் கிடைக்கக்கூடும். ஆசிரியர்கள், பெரியவர்களின் ஆசி கிடைக்கும். செல்வம் சேரும். மங்கல காரியங்கள் நடைபெறும். மத யாத்திரை மேற்கொள்ளும் வாய்ப்பு உள்ளது. திருமணம், வங்கி, நிதி, ஆலோசனை துறையில் வெற்றி. உடல் எடை அதிகரிக்கக்கூடும் — உணவு கட்டுப்பாடு தேவை.",
                saturn: "சனி புத்தி காலத்தில் கடின உழைப்புக்கு பலன் தாமதமாக கிடைக்கும். பொறுமை மிக அவசியம். தொழிலாளர்கள், கீழ் நிலையில் உள்ளவர்களின் ஒத்துழைப்பு உண்டு. நாள்பட்ட நோய்கள் வரக்கூடும். எண்ணெய், இரும்பு வகை வியாபாரம் சாதகம். ரியல் எஸ்டேட், கட்டுமானம், கச்சா எண்ணெய் துறையில் நீண்டகால லாபம். மன அழுத்தம், மூட்டு வலி கவனிக்க வேண்டும். சேமிப்பு பெருகும்.",
                mercury: "புதன் புத்தி காலத்தில் புத்தி கூர்மை அதிகரிக்கும். கல்வியில் முன்னேற்றம், எழுத்துப் பணிகளில் வெற்றி, வாக்கு வன்மையால் சாதிப்பார். வியாபாரம், கணக்கு பதிவு, தகவல் தொழில்நுட்பத் துறையில் சாதகம். நரம்பு சம்பந்தமான பாதிப்புகள் கவனிக்க வேண்டும். தரகு, தொடர்பு, மார்க்கெட்டிங் வெற்றி. நண்பர்கள் ஆதரவு உண்டு. பயணம், புது ஒப்பந்தம் கைகூடும்.",
                ketu: "கேது புத்தி காலத்தில் ஆன்மிக விழிப்பு உண்டாகும். பழைய பழக்கங்கள் விலகும். எதிர்பாராத மாற்றங்கள் ஏற்படும். மோக்ஷ பாதையில் ஈடுபாடு வளரும். மருத்துவம், ஆராய்ச்சி, மறை அறிவு துறையில் வெற்றி. திடீர் இழப்புகள், விபத்து வராமல் கவனிக்க வேண்டும். குடும்பத்திலிருந்து தனிமை உணர்வு வரக்கூடும். தீர்த்த யாத்திரை மேற்கொள்வார். ஆன்மிக குரு சந்திப்பு உண்டு.",
                venus: "சுக்கிர புத்தி காலத்தில் புதிய நண்பர்கள் மற்றும் நம்பகமான பங்காளிகள் கிடைக்க வாய்ப்பு உண்டு. சுக போகங்கள், வாகனம், நகை, ஆடை ஆபரணங்கள் சேர்ந்து வரும். குடும்பத்தில் சுபநிகழ்ச்சிகள் நடைபெறும். கலை மற்றும் இலக்கியங்களில் ஈடுபாடு கொள்வார். பெண்களின் ஆதரவு உண்டு. திருமணம், காதல் வெற்றி. சினிமா, கலை, ஃபேஷன், அழகு சாதனம் துறையில் சாதிப்பார். ஆடம்பர செலவு கட்டுப்படுத்த வேண்டும்.",
              };

              const renderBhuktiBlock = (mahaLord: string, b: any) => {
                const bk = DASHA_LORD_TO_KEY[b.lord];
                const para = bk ? BHUKTI_PARA[bk] : "";
                const bsAge = ageAt(birthDate, b.startDate);
                const beAge = ageAt(birthDate, b.endDate);
                return (
                  <div key={`${mahaLord}-${b.lord}`} style={{ marginTop: 5 }}>
                    <div style={{ background: "#fff1d6", border: "1px solid #c9a050", padding: "2px 6px", fontSize: 9, fontWeight: 700, color: "#7a1a2b" }}>
                      {mahaLord} தசை, {b.lord} புத்தி &nbsp;{fmtDate(b.startDate)} முதல் {fmtDate(b.endDate)} வரை &nbsp;— வயது {bsAge} முதல் {beAge} வரை
                    </div>
                    <div style={{ border: "1px solid #c9a050", borderTop: 0, padding: "4px 7px", fontSize: 8.6, lineHeight: 1.5, textAlign: "justify", background: "#fffaf0" }}>
                      {para}
                    </div>
                  </div>
                );
              };

              return result.dashaTree.flatMap((maha, mi) => {
                const lk = DASHA_LORD_TO_KEY[maha.lord];
                const para = lk ? DASHA_PARA[lk] : "";
                const sAge = ageAt(birthDate, maha.startDate);
                const eAge = ageAt(birthDate, maha.endDate);
                const children = maha.children || [];
                const chunks = [children.slice(0, 5), children.slice(5)];
                return chunks.map((chunk, ci) => (
                  <Page
                    key={`dbd-${mi}-${ci}`}
                    title={`${maha.lord} மகா தசை – புத்தி விரிவு (${ci + 1}/2)`}
                    subtitle={`${fmtDate(maha.startDate)} முதல் ${fmtDate(maha.endDate)} வரை • வயது ${sAge} - ${eAge}`}
                    page={next()}
                    total={totalPages}
                    name={i.name}
                  >
                    {ci === 0 && (
                      <div style={{ background: "#fbe9d0", border: "1px solid #c9a050", padding: "4px 8px", fontSize: 10.5, fontWeight: 700, textAlign: "center", color: "#7a1a2b" }}>
                        {maha.lord} தசை {fmtDate(maha.startDate)} முதல் {fmtDate(maha.endDate)} வரை — வயது {sAge} முதல் {eAge} வரை
                      </div>
                    )}
                    {ci === 0 && (
                      <div style={{ border: "1px solid #c9a050", borderTop: 0, padding: "5px 8px", fontSize: 9, lineHeight: 1.55, textAlign: "justify", background: "#fff8ee" }}>
                        {para}
                      </div>
                    )}
                    {chunk.map((b: any) => renderBhuktiBlock(maha.lord, b))}
                  </Page>
                ));
              });
            })()}
          </>

        );
      })()}
    </div>
  );
};

const tdL: React.CSSProperties = { border: "1px solid #c9a050", padding: "3px 6px", width: "20%", background: "#fff8ee" };
const tdR: React.CSSProperties = { border: "1px solid #c9a050", padding: "3px 6px", width: "30%" };
const td: React.CSSProperties = { border: "1px solid #c9a050", padding: "2px 4px", verticalAlign: "top" };
const th: React.CSSProperties = { border: "1px solid #c9a050", padding: "3px 4px", textAlign: "left", fontWeight: 700 };
const chartTitle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "#7a1a2b", textAlign: "center", marginBottom: 3 };

const SectionBar = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050", marginTop: 4 }}>{children}</div>
);
const Box = ({ children }: { children: React.ReactNode }) => (
  <div style={{ border: "1px solid #c9a050", borderTop: 0, padding: 6, fontSize: 9.5, lineHeight: 1.55 }}>{children}</div>
);
const LifeAreaPage = ({ area, pageNum, total, name }: { area: ReturnType<typeof careerPrediction>; pageNum: number; total: number; name: string }) => (
  <Page title={area.title} page={pageNum} total={total} name={name}>
    <SectionBar>முன்னுரை</SectionBar>
    <Box>{area.intro}</Box>
    {area.positives.length > 0 && (<>
      <SectionBar>நற்பலன்கள்</SectionBar>
      <Box>{area.positives.map((p, i) => <div key={i}>• {p}</div>)}</Box>
    </>)}
    {area.negatives.length > 0 && (<>
      <SectionBar>சவால்கள்</SectionBar>
      <Box>{area.negatives.map((p, i) => <div key={i}>• {p}</div>)}</Box>
    </>)}
    <SectionBar>பரிகாரங்கள்</SectionBar>
    <Box>{area.remedies.map((p, i) => <div key={i}>• {p}</div>)}</Box>
    <SectionBar>உகந்த காலம்</SectionBar>
    <Box>{area.timing}</Box>
  </Page>
);
