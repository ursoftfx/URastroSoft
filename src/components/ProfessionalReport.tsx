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

interface Props { result: JathagamResult }

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
    width: "200mm", height: "139mm", maxHeight: "139mm",
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
export const ProfessionalReport = ({ result }: Props) => {
  const i = result.input;
  const birthDate = new Date(i.year, i.month - 1, i.day);
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
      if (ants.length === 0) {
        rows.push({ bhukti: `${maha.lord}/${bh.lord}`, ant: "—", start: fmtDate(bh.startDate), end: fmtDate(bh.endDate), age: bhAge });
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
  const totalPages = 1 + 2 + 2 + vargasPages + 1 + 1 + bhavaPalanPages.length + planetHousePages.length + planetRasiPages.length + 1 + 1 + lifeAreaPages + yogasPages.length + 1 + 1 + bhavaDeepPages + yearForecastPages.length + 1 + 1 + mantraPages.length + 1 + 1 + weekdayRemedyPages.length + 1 + 1 + 1 + 1 + 1 + 3 + dashaPages;

  let pn = 0;
  const next = () => ++pn;

  const planetRows = [
    { key: "ascendant", lon: result.ascendant.longitude, rasi: result.ascendant.rasiIndex, deg: result.ascendant.degreeInRasi, nak: result.ascendant.nakshatraIndex, pada: result.ascendant.pada, retro: false },
    ...result.planets.map(p => ({ key: p.key, lon: p.longitude, rasi: p.rasiIndex, deg: p.degreeInRasi, nak: p.nakshatraIndex, pada: p.pada, retro: !!p.retrograde })),
  ];

  return (
    <div id="professional-report-root">
      <style>{`
        @media print { @page { size: A4 portrait; margin: 5mm; } .print-area { margin: 0 auto 3mm auto !important; box-shadow: none !important; page-break-after: auto !important; break-after: auto !important; page-break-inside: avoid !important; break-inside: avoid !important; } body { margin: 0; } .no-print { display: none !important; } }
        #professional-report-root, #professional-report-root * { color: #000 !important; background-color: transparent !important; border-color: #000 !important; box-shadow: none !important; outline-color: #000 !important; }
        #professional-report-root .print-area { background-color: #fff !important; }
        #professional-report-root table { font-size: 8px; }
        #professional-report-root th, #professional-report-root td { padding: 1px 2px !important; }
      `}</style>

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

      {/* === PAGE 3 : Rasi + Navamsa + Bhava chart === */}
      <Page title="ராசி • நவாம்சம் • பாவ சக்கரம்" page={next()} total={totalPages} name={i.name}>
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

        <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={chartTitle}>பாவ சக்கரம் (Bhava)</div>
            <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
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
            <table style={{ width: "100%", fontSize: 8, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
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
        <div style={{ background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>பின்னாஷ்டக வர்க்கம்</div>
        <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
          <thead><tr style={{ background: "#fff8ee" }}>
            <th style={th}>கிரகம்</th>
            {RASIS_TAMIL.map(r => <th key={r} style={th}>{r}</th>)}
            <th style={th}>மொத்தம்</th>
          </tr></thead>
          <tbody>
            {Object.entries(result.ashtakavarga.bhinna).map(([planet, bindus]) => (
              <tr key={planet}>
                <td style={{ ...td, fontWeight: 700 }}>{PLANET_TA[planet] || planet}</td>
                {bindus.map((b, j) => <td key={j} style={{ ...td, textAlign: "center" }}>{b}</td>)}
                <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>{bindus.reduce((a, b) => a + b, 0)}</td>
              </tr>
            ))}
            <tr style={{ background: "#fff8ee" }}>
              <td style={{ ...td, fontWeight: 800 }}>சர்வாஷ்டகம்</td>
              {result.ashtakavarga.sarva.map((b, j) => <td key={j} style={{ ...td, textAlign: "center", fontWeight: 700 }}>{b}</td>)}
              <td style={{ ...td, textAlign: "center", fontWeight: 800 }}>{result.ashtakavarga.sarva.reduce((a, b) => a + b, 0)}</td>
            </tr>
          </tbody>
        </table>

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
          25-க்கு மேல் = வலுவான; 30-க்கு மேல் = மிக சிறந்தது. சர்வாஷ்டக மொத்தம் 337 (ஸ்டாண்டர்ட்).
        </div>
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
                  <div style={{ border: "1px solid #000", borderTop: 0, padding: "3px 6px", fontSize: 7.5, lineHeight: 1.25 }}>
                    <b>{maha.lord} தசை பலன் :</b> {DASHA_LORD_PALAN[lordKey]}
                  </div>
                )}
              </>
            )}
            <table style={{ width: "100%", fontSize: 8, lineHeight: 1.15, borderCollapse: "collapse", border: "1px solid #000", marginTop: 3, tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th style={{ ...th, padding: "1px 3px", width: "16%" }}>புத்தி</th>
                  <th style={{ ...th, padding: "1px 3px", width: "14%" }}>அந்தரம்</th>
                  <th style={{ ...th, padding: "1px 3px", width: "23%" }}>தொடக்கம்</th>
                  <th style={{ ...th, padding: "1px 3px", width: "23%" }}>முடிவு</th>
                  <th style={{ ...th, padding: "1px 3px", width: "8%" }}>வயது</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, ri) => (
                  <tr key={ri}>
                    <td style={{ ...td, padding: "1px 3px", fontWeight: r.bhukti ? 700 : 400 }}>{r.bhukti}</td>
                    <td style={{ ...td, padding: "1px 3px" }}>{r.ant}</td>
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
