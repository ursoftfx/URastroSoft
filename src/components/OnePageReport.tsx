import { JathagamResult, RASIS_TAMIL, NAKSHATRAS_TAMIL, NAKSHATRA_LORDS_TAMIL } from "@/lib/jathagam";

interface Props {
  result: JathagamResult;
}

// Rasi lord (athipathi) for each rasi 0..11
const RASI_LORD_TA = [
  "செவ்வாய்", "சுக்கிரன்", "புதன்", "சந்திரன்", "சூரியன்", "புதன்",
  "சுக்கிரன்", "செவ்வாய்", "குரு", "சனி", "சனி", "குரு",
];

// Planet dignity (Nilai) — exaltation rasi (deg), debilitation rasi, own rasi(s), moolatrikona
const PLANET_DIGNITY: Record<string, { exalt: number; debil: number; own: number[]; mool: number; friends: number[]; enemies: number[] }> = {
  sun:     { exalt: 0,  debil: 6,  own: [4],     mool: 4, friends: [3,7,8],   enemies: [1,6,9,10] },
  moon:    { exalt: 1,  debil: 7,  own: [3],     mool: 1, friends: [0,2],     enemies: [] },
  mars:    { exalt: 9,  debil: 3,  own: [0,7],   mool: 0, friends: [4,8,3],   enemies: [2,5] },
  mercury: { exalt: 5,  debil: 11, own: [2,5],   mool: 5, friends: [4,6],     enemies: [3] },
  jupiter: { exalt: 3,  debil: 9,  own: [8,11],  mool: 8, friends: [0,3,4,7], enemies: [1,5,6] },
  venus:   { exalt: 11, debil: 5,  own: [1,6],   mool: 6, friends: [2,9,10],  enemies: [0,3,4] },
  saturn:  { exalt: 6,  debil: 0,  own: [9,10],  mool: 10,friends: [1,2,5,6], enemies: [0,3,4] },
  rahu:    { exalt: 1,  debil: 7,  own: [10],    mool: -1, friends: [], enemies: [] },
  ketu:    { exalt: 7,  debil: 1,  own: [7],     mool: -1, friends: [], enemies: [] },
};

const dignityLabel = (key: string, rasi: number): string => {
  const d = PLANET_DIGNITY[key];
  if (!d) return "—";
  if (rasi === d.exalt) return "உச்சம்";
  if (rasi === d.debil) return "நீசம்";
  if (rasi === d.mool) return "மூ.தி";
  if (d.own.includes(rasi)) return "சுய";
  if (d.friends.includes(rasi)) return "நட்பு";
  if (d.enemies.includes(rasi)) return "சத்ரு";
  return "சம";
};

// Yogi / Avayogi
const computeYogi = (sunLon: number, moonLon: number) => {
  const yogiPoint = ((sunLon + moonLon + 93 + 20 / 60) % 360 + 360) % 360;
  const nakSize = 360 / 27;
  const nakIdx = Math.floor(yogiPoint / nakSize);
  const yogiNak = NAKSHATRAS_TAMIL[nakIdx];
  const yogiLord = NAKSHATRA_LORDS_TAMIL[nakIdx];
  const avaIdx = (nakIdx + 6) % 27;
  const avayogiNak = NAKSHATRAS_TAMIL[avaIdx];
  const avayogiLord = NAKSHATRA_LORDS_TAMIL[avaIdx];
  // Duplicate (Dagdha) Rasi: rasi of yogi point
  const dupRasi = RASIS_TAMIL[Math.floor(yogiPoint / 30)];
  return { yogiNak, yogiLord, avayogiNak, avayogiLord, dupRasi };
};

const PLANET_SHORT_TA: Record<string, string> = {
  sun: "சூரி",
  moon: "சந்",
  mars: "செவ்",
  mercury: "புத",
  jupiter: "குரு",
  venus: "சுக்",
  saturn: "சனி",
  rahu: "ராகு",
  ketu: "கேது",
  ascendant: "லக்",
  mandi: "மாந்",
};

const PLANET_FULL_TA: Record<string, string> = {
  sun: "சூரியன்",
  moon: "சந்திரன்",
  mars: "செவ்வாய்",
  mercury: "புதன்",
  jupiter: "குரு",
  venus: "சுக்கிரன்",
  saturn: "சனி",
  rahu: "ராகு",
  ketu: "கேது",
};

const VAARAS = ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"];
// Chaldean order for Horai (planetary hour) - day lord starts the day, then this order repeats
const HORAI_ORDER = ["சூரியன்", "சுக்கிரன்", "புதன்", "சந்திரன்", "சனி", "குரு", "செவ்வாய்"];
const DAY_LORD_TA: Record<number, string> = {
  0: "சூரியன்", 1: "சந்திரன்", 2: "செவ்வாய்", 3: "புதன்",
  4: "குரு", 5: "சுக்கிரன்", 6: "சனி",
};

const dms = (deg: number): string => {
  const d = Math.floor(deg);
  const mF = (deg - d) * 60;
  const m = Math.floor(mF);
  const s = Math.round((mF - m) * 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d)}°${pad(m)}'${pad(s)}"`;
};

const fmtDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
};
const fmtTimeStr = (h: number, m: number) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${pad(h12)}:${pad(m)} ${ampm}`;
};
const fmtDateLong = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;

const SI_LAYOUT: (number | null)[][] = [
  [11, 0, 1, 2],
  [10, null, null, 3],
  [9, null, null, 4],
  [8, 7, 6, 5],
];

const renderChart = (title: string, chart: string[][], ascRasi: number) => (
  <table className="w-full" style={{ borderCollapse: "collapse" }}>
    <tbody>
      {SI_LAYOUT.map((row, r) => (
        <tr key={r}>
          {row.map((rasiIdx, c) => {
            if (rasiIdx === null) {
              if (r === 1 && c === 1) {
                return (
                  <td key={c} colSpan={2} rowSpan={2} style={{ border: "1px solid #000", textAlign: "center", verticalAlign: "middle" }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
                  </td>
                );
              }
              return null;
            }
            const planets = chart[rasiIdx] || [];
            const isLagna = rasiIdx === ascRasi;
            return (
              <td key={c} style={{ position: "relative", border: "1px solid #000", height: 60, width: "25%", verticalAlign: "top" }}>
                {isLagna && (
                  <div style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, borderTop: "10px solid #7a1a2b", borderRight: "10px solid transparent" }} />
                )}
                <div style={{ fontSize: 9, padding: 3, lineHeight: 1.3 }}>
                  {planets.map((p) => PLANET_SHORT_TA[p] || p).join(" ")}
                </div>
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  </table>
);

export const OnePageReport = ({ result }: Props) => {
  const i = result.input;
  const birthDate = new Date(i.year, i.month - 1, i.day);
  const dayIdx = birthDate.getDay();

  // Local sunrise/sunset (already returned in UTC ms from sunriseSunset; render as local TZ)
  const sr = result.panchangam.sunriseLocal;
  const ss = result.panchangam.sunsetLocal;
  const offMs = i.tzOffsetHours * 3600 * 1000;
  const srL = new Date(sr.getTime() + offMs);
  const ssL = new Date(ss.getTime() + offMs);
  const srStr = fmtTimeStr(srL.getUTCHours(), srL.getUTCMinutes());
  const ssStr = fmtTimeStr(ssL.getUTCHours(), ssL.getUTCMinutes());

  // Nakshatra Horai (planetary hour at birth)
  const birthMs = new Date(Date.UTC(i.year, i.month - 1, i.day, i.hour, i.minute) - i.tzOffsetHours * 3600 * 1000).getTime();
  let horai = "—";
  try {
    const dayMs = sr.getTime();
    const nightStart = ss.getTime();
    const nextSrApprox = sr.getTime() + 24 * 3600 * 1000;
    const isDay = birthMs >= dayMs && birthMs < nightStart;
    const dayLen = (nightStart - dayMs) / 12;
    const nightLen = (nextSrApprox - nightStart) / 12;
    const dayLordTa = DAY_LORD_TA[dayIdx];
    const startIdx = HORAI_ORDER.indexOf(dayLordTa);
    let horaIdx = 0;
    if (isDay) {
      horaIdx = Math.floor((birthMs - dayMs) / dayLen);
    } else if (birthMs >= nightStart) {
      horaIdx = 12 + Math.floor((birthMs - nightStart) / nightLen);
    }
    horai = HORAI_ORDER[(startIdx + horaIdx) % 7];
  } catch {}

  // Janana kala iruppu thisai (dasha balance at birth)
  const firstDasha = result.dashaSequence[0];
  let balanceStr = "—";
  if (firstDasha) {
    const totalMs = firstDasha.endDate.getTime() - firstDasha.startDate.getTime();
    const remMs = firstDasha.endDate.getTime() - birthMs;
    if (remMs > 0 && totalMs > 0) {
      const yrs = remMs / (1000 * 60 * 60 * 24 * 365.25);
      const y = Math.floor(yrs);
      const m = Math.floor((yrs - y) * 12);
      const d = Math.floor(((yrs - y) * 12 - m) * 30.4375);
      balanceStr = `${firstDasha.lord} திசை — ${y} வரு ${m} மா ${d} நா`;
    }
  }

  // Current dasha end date
  const cdEnd = fmtDateLong(result.currentDasha.endDate);

  // Tropical→Sidereal => ayanamsa = paavaka maatram
  const ayanam = result.ayanamsa;
  const ayanamStr = dms(ayanam);

  const tzSign = i.tzOffsetHours >= 0 ? "+" : "-";
  const tzAbs = Math.abs(i.tzOffsetHours);
  const tzH = Math.floor(tzAbs);
  const tzM = Math.round((tzAbs - tzH) * 60);
  const tzStr = `GMT ${tzSign}${tzH}:${String(tzM).padStart(2, "0")}`;

  const navAsc = result.navamsaPositions.find((n) => n.key === "ascendant")?.rasiIndex ?? 0;

  const rows = [
    { key: "ascendant", label: "லக்னம்", lon: result.ascendant.longitude, nak: result.ascendant.nakshatraTamil, rasiIdx: result.ascendant.rasiIndex, pada: result.ascendant.pada, retro: false },
    ...result.planets.map((p) => ({ key: p.key, label: PLANET_FULL_TA[p.key] || p.nameTamil, lon: p.longitude, nak: p.nakshatraTamil, rasiIdx: p.rasiIndex, pada: p.pada, retro: !!p.retrograde })),
    { key: "mandi", label: "மாந்தி", lon: result.mandi.longitude, nak: result.mandi.nakshatraTamil, rasiIdx: result.mandi.rasiIndex, pada: result.mandi.pada, retro: false },
  ];

  const yogi = computeYogi(result.sun.longitude, result.moon.longitude);

  return (
    <div className="a4-sheet print-area" style={{ width: "210mm", minHeight: "297mm", padding: "8mm 10mm", margin: "auto", background: "white", color: "#000", fontFamily: "'Latha','Tahoma',sans-serif" }}>
      <style>{`@media print { .print-area { margin: 0; box-shadow: none; } @page { size: A4 portrait; margin: 8mm; } .no-print { display: none !important; } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #7a1a2b", paddingBottom: 6 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1.5, color: "#7a1a2b" }}>UR ASTRO SOFT</div>
          <div style={{ fontSize: 11, color: "#555" }}>தமிழ் வேத ஜோதிட ஜாதகம் • Tamil Vedic Horoscope</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 10, color: "#555" }}>
          <div>www.urastrosoft.com</div>
          <div>{fmtDate(new Date())}</div>
        </div>
      </div>

      {/* Personal */}
      <table style={{ width: "100%", marginTop: 8, fontSize: 11, borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ padding: "2px 4px", width: "18%" }}><b>பெயர்</b></td>
            <td style={{ padding: "2px 4px", width: "32%" }}>: {i.name}</td>
            <td style={{ padding: "2px 4px", width: "18%" }}><b>பாலினம்</b></td>
            <td style={{ padding: "2px 4px", width: "32%" }}>: {i.gender || "—"}</td>
          </tr>
          <tr>
            <td style={{ padding: "2px 4px" }}><b>தந்தை பெயர்</b></td>
            <td style={{ padding: "2px 4px" }}>: {i.fatherName || "—"}</td>
            <td style={{ padding: "2px 4px" }}><b>தாய் பெயர்</b></td>
            <td style={{ padding: "2px 4px" }}>: {i.motherName || "—"}</td>
          </tr>
          <tr>
            <td style={{ padding: "2px 4px" }}><b>பிறந்த தேதி</b></td>
            <td style={{ padding: "2px 4px" }}>: {fmtDate(birthDate)} ({VAARAS[dayIdx]})</td>
            <td style={{ padding: "2px 4px" }}><b>பிறந்த நேரம்</b></td>
            <td style={{ padding: "2px 4px" }}>: {fmtTimeStr(i.hour, i.minute)}</td>
          </tr>
          <tr>
            <td style={{ padding: "2px 4px" }}><b>பிறந்த ஊர்</b></td>
            <td style={{ padding: "2px 4px" }}>: {i.placeName}</td>
            <td style={{ padding: "2px 4px" }}><b>நேர மண்டலம்</b></td>
            <td style={{ padding: "2px 4px" }}>: {tzStr}</td>
          </tr>
          <tr>
            <td style={{ padding: "2px 4px" }}><b>அட்சரேகை</b></td>
            <td style={{ padding: "2px 4px" }}>: {i.latitude.toFixed(4)}°N</td>
            <td style={{ padding: "2px 4px" }}><b>தீர்க்கரேகை</b></td>
            <td style={{ padding: "2px 4px" }}>: {i.longitude.toFixed(4)}°E</td>
          </tr>
        </tbody>
      </table>

      {/* Panchangam summary */}
      <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, textAlign: "center", background: "#fbe9d0", padding: "3px 0", border: "1px solid #c9a050" }}>
        பஞ்சாங்கம் & பிறப்பு விவரம்
      </div>
      <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
        <tbody>
          <tr>
            <td style={{ padding: "3px 6px", width: "25%" }}><b>ஜென்ம ராசி</b></td>
            <td style={{ padding: "3px 6px", width: "25%" }}>: {result.rasiTamil}</td>
            <td style={{ padding: "3px 6px", width: "25%" }}><b>ஜென்ம லக்னம்</b></td>
            <td style={{ padding: "3px 6px", width: "25%" }}>: {result.lagnaTamil}</td>
          </tr>
          <tr>
            <td style={{ padding: "3px 6px" }}><b>ஜென்ம நட்சத்திரம்</b></td>
            <td style={{ padding: "3px 6px" }}>: {result.nakshatraTamil} - பாதம் {result.pada}</td>
            <td style={{ padding: "3px 6px" }}><b>நட்சத்திர ஹோரை</b></td>
            <td style={{ padding: "3px 6px" }}>: {horai}</td>
          </tr>
          <tr>
            <td style={{ padding: "3px 6px" }}><b>திதி</b></td>
            <td style={{ padding: "3px 6px" }}>: {result.panchangam.tithiTamil} ({result.panchangam.paksha})</td>
            <td style={{ padding: "3px 6px" }}><b>யோகம்</b></td>
            <td style={{ padding: "3px 6px" }}>: {result.panchangam.yogaTamil}</td>
          </tr>
          <tr>
            <td style={{ padding: "3px 6px" }}><b>கரணம்</b></td>
            <td style={{ padding: "3px 6px" }}>: {result.panchangam.karanaTamil}</td>
            <td style={{ padding: "3px 6px" }}><b>வாரம்</b></td>
            <td style={{ padding: "3px 6px" }}>: {result.panchangam.vaaraTamil}</td>
          </tr>
          <tr>
            <td style={{ padding: "3px 6px" }}><b>சூரிய உதயம்</b></td>
            <td style={{ padding: "3px 6px" }}>: {srStr}</td>
            <td style={{ padding: "3px 6px" }}><b>சூரிய மறைவு</b></td>
            <td style={{ padding: "3px 6px" }}>: {ssStr}</td>
          </tr>
          <tr>
            <td style={{ padding: "3px 6px" }}><b>அயனம்</b></td>
            <td style={{ padding: "3px 6px" }}>: {dayIdx >= 0 && (i.month >= 1 && i.month <= 6 ? "உத்தராயணம்" : "தட்சிணாயணம்")}</td>
            <td style={{ padding: "3px 6px" }}><b>பாவக மாற்றம் (அயனாம்சம்)</b></td>
            <td style={{ padding: "3px 6px" }}>: {ayanamStr}</td>
          </tr>
          <tr>
            <td style={{ padding: "3px 6px" }} colSpan={2}><b>ஜனன கால இருப்பு திசை</b> : {balanceStr}</td>
            <td style={{ padding: "3px 6px" }}><b>நடப்பு தசா-புத்தி முடிவு</b></td>
            <td style={{ padding: "3px 6px" }}>: {cdEnd}</td>
          </tr>
          <tr>
            <td style={{ padding: "3px 6px" }}><b>யோகி</b></td>
            <td style={{ padding: "3px 6px" }}>: {yogi.yogiNak} ({yogi.yogiLord})</td>
            <td style={{ padding: "3px 6px" }}><b>அவயோகி</b></td>
            <td style={{ padding: "3px 6px" }}>: {yogi.avayogiNak} ({yogi.avayogiLord})</td>
          </tr>
          <tr>
            <td style={{ padding: "3px 6px" }}><b>துப்லிகேட் ராசி</b></td>
            <td style={{ padding: "3px 6px" }} colSpan={3}>: {yogi.dupRasi}</td>
          </tr>
        </tbody>
      </table>

      {/* Charts side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textAlign: "center", marginBottom: 2 }}>ராசி கட்டம் (D-1)</div>
          {renderChart("ராசி", result.rasiChart, result.ascendant.rasiIndex)}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textAlign: "center", marginBottom: 2 }}>நவாம்சம் (D-9)</div>
          {renderChart("நவாம்சம்", result.navamsaChart, navAsc)}
        </div>
      </div>

      {/* Planet positions table - full width below charts */}
      <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, textAlign: "center", background: "#fbe9d0", padding: "3px 0", border: "1px solid #c9a050" }}>
        கிரக நிலைகள் (Planetary Positions)
      </div>
      <table style={{ width: "100%", fontSize: 9.5, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
        <thead>
          <tr style={{ background: "#fff8ee" }}>
            <th style={{ border: "1px solid #c9a050", padding: 3, textAlign: "left" }}>கிரகம்</th>
            <th style={{ border: "1px solid #c9a050", padding: 3 }}>ராசி</th>
            <th style={{ border: "1px solid #c9a050", padding: 3 }}>பாகை</th>
            <th style={{ border: "1px solid #c9a050", padding: 3 }}>நட்சத்திரம்</th>
            <th style={{ border: "1px solid #c9a050", padding: 3 }}>பாதம்</th>
            <th style={{ border: "1px solid #c9a050", padding: 3 }}>அதிபதி</th>
            <th style={{ border: "1px solid #c9a050", padding: 3 }}>நிலை</th>
            <th style={{ border: "1px solid #c9a050", padding: 3 }}>நவாம்சம்</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => {
            const navKey = (r as any).key;
            const navPos = result.navamsaPositions.find((n) => n.key === navKey);
            const athipathi = RASI_LORD_TA[r.rasiIdx];
            const nilai = (r.key === "ascendant" || r.key === "mandi") ? "—" : dignityLabel(r.key, r.rasiIdx);
            return (
              <tr key={idx}>
                <td style={{ border: "1px solid #c9a050", padding: 3 }}>{r.label}{r.retro ? " (வ)" : ""}</td>
                <td style={{ border: "1px solid #c9a050", padding: 3 }}>{RASIS_TAMIL[r.rasiIdx]}</td>
                <td style={{ border: "1px solid #c9a050", padding: 3 }}>{dms(r.lon - r.rasiIdx * 30)}</td>
                <td style={{ border: "1px solid #c9a050", padding: 3 }}>{r.nak}</td>
                <td style={{ border: "1px solid #c9a050", padding: 3, textAlign: "center" }}>{r.pada}</td>
                <td style={{ border: "1px solid #c9a050", padding: 3 }}>{athipathi}</td>
                <td style={{ border: "1px solid #c9a050", padding: 3 }}>{nilai}</td>
                <td style={{ border: "1px solid #c9a050", padding: 3 }}>{navPos ? RASIS_TAMIL[navPos.rasiIndex] : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Dasha summary table */}
      <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, textAlign: "center", background: "#fbe9d0", padding: "2px 0", border: "1px solid #c9a050" }}>
        விம்சோத்தரி தசா வரிசை
      </div>
      <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
        <thead>
          <tr style={{ background: "#fff8ee" }}>
            <th style={{ border: "1px solid #c9a050", padding: 2 }}>தசை</th>
            <th style={{ border: "1px solid #c9a050", padding: 2 }}>தொடக்கம்</th>
            <th style={{ border: "1px solid #c9a050", padding: 2 }}>முடிவு</th>
            <th style={{ border: "1px solid #c9a050", padding: 2 }}>தசை</th>
            <th style={{ border: "1px solid #c9a050", padding: 2 }}>தொடக்கம்</th>
            <th style={{ border: "1px solid #c9a050", padding: 2 }}>முடிவு</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(result.dashaSequence.length / 2) }).map((_, rowIdx) => {
            const a = result.dashaSequence[rowIdx * 2];
            const b = result.dashaSequence[rowIdx * 2 + 1];
            return (
              <tr key={rowIdx}>
                <td style={{ border: "1px solid #c9a050", padding: 2 }}>{a?.lord || ""}</td>
                <td style={{ border: "1px solid #c9a050", padding: 2 }}>{a ? fmtDateLong(a.startDate) : ""}</td>
                <td style={{ border: "1px solid #c9a050", padding: 2 }}>{a ? fmtDateLong(a.endDate) : ""}</td>
                <td style={{ border: "1px solid #c9a050", padding: 2 }}>{b?.lord || ""}</td>
                <td style={{ border: "1px solid #c9a050", padding: 2 }}>{b ? fmtDateLong(b.startDate) : ""}</td>
                <td style={{ border: "1px solid #c9a050", padding: 2 }}>{b ? fmtDateLong(b.endDate) : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ marginTop: 8, fontSize: 9, textAlign: "center", borderTop: "1px solid #7a1a2b", paddingTop: 4, color: "#555" }}>
        இது சுத்த திருக்கணித பஞ்சாங்கப்படி கணிக்கப்பெற்ற இலவச ஜாதகம் — © UR ASTRO SOFT
      </div>
    </div>
  );
};
