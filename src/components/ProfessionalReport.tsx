import { JathagamResult, RASIS_TAMIL, formatDegree } from "@/lib/jathagam";
import { detectDoshams } from "@/lib/dosham";
import { bhavaPalans, LAGNA_PALAN, NAKSHATRA_PALAN, BHAVA_NAMES } from "@/lib/predictions";
import {
  HOUSE_SIGNIFICATIONS, PLANET_IN_HOUSE, PLANET_IN_RASI,
  computeSaniYogas, DASHA_LORD_TO_KEY, DASHA_LORD_PALAN,
} from "@/lib/professional-palans";

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

// ---------- South Indian chart ----------
const SI_LAYOUT: (number | null)[][] = [
  [11, 0, 1, 2], [10, null, null, 3], [9, null, null, 4], [8, 7, 6, 5],
];

const Chart = ({ title, chart, ascRasi, size = "lg" }: {
  title: string; chart: string[][]; ascRasi: number; size?: "lg" | "sm";
}) => {
  const cellH = size === "lg" ? 70 : 42;
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

// ---------- Page wrapper ----------
const Page = ({ children, title, subtitle, page, total, name }: any) => (
  <div className="a4-sheet print-area" style={{
    width: "210mm", minHeight: "297mm", padding: "10mm 12mm",
    margin: "6mm auto", background: "white", color: "#000",
    fontFamily: "'Latha','Tahoma',sans-serif", boxSizing: "border-box",
    pageBreakAfter: "always", borderTop: "4px solid #7a1a2b",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1.5px solid #c9a050", paddingBottom: 4, marginBottom: 8 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#7a1a2b", letterSpacing: 1 }}>UR ASTRO SOFT</div>
        <div style={{ fontSize: 9, color: "#666" }}>தமிழ் வேத ஜோதிட விரிவான ஜாதகம்</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#7a1a2b" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 9, color: "#555" }}>{subtitle}</div>}
        <div style={{ fontSize: 8, color: "#888" }}>{name} • பக்கம் {page} / {total}</div>
      </div>
    </div>
    {children}
    <div style={{ position: "absolute" }} />
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
  const dashaPages = result.dashaTree.length; // 9
  const vargasPages = Math.ceil(result.vargaCharts.length / 6); // 16/6 = 3
  const totalPages = 1 /*cover*/ + 1 /*positions*/ + 1 /*charts+kp*/ + vargasPages + 1 /*ashtak+sani*/ + 1 /*lagna+nak+bhava*/ + 1 /*planet-in-house*/ + 1 /*planet-in-rasi*/ + 1 /*doshas+remedies*/ + dashaPages;

  let pn = 0;
  const next = () => ++pn;

  const planetRows = [
    { key: "ascendant", lon: result.ascendant.longitude, rasi: result.ascendant.rasiIndex, deg: result.ascendant.degreeInRasi, nak: result.ascendant.nakshatraIndex, pada: result.ascendant.pada, retro: false },
    ...result.planets.map(p => ({ key: p.key, lon: p.longitude, rasi: p.rasiIndex, deg: p.degreeInRasi, nak: p.nakshatraIndex, pada: p.pada, retro: !!p.retrograde })),
  ];

  return (
    <div id="professional-report-root">
      <style>{`@media print { @page { size: A4 portrait; margin: 0; } .print-area { margin: 0 !important; box-shadow: none !important; page-break-after: always; } body { margin: 0; } .no-print { display: none !important; } }`}</style>

      {/* === COVER === */}
      <Page title="அட்டை" page={next()} total={totalPages} name={i.name}>
        <div style={{ textAlign: "center", padding: "40mm 0 20mm" }}>
          <div style={{ fontSize: 14, color: "#c9a050", letterSpacing: 4 }}>✦ ॐ ✦</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#7a1a2b", marginTop: 10, fontFamily: "serif" }}>ஜாதக அறிக்கை</div>
          <div style={{ fontSize: 14, color: "#555", marginTop: 4 }}>Professional Vedic Astrology Report</div>
          <div style={{ height: 2, background: "#c9a050", margin: "20mm auto", width: "60%" }} />
          <div style={{ fontSize: 28, fontWeight: 800, color: "#000" }}>{i.name}</div>
          {i.gender && <div style={{ fontSize: 14, color: "#555", marginTop: 4 }}>{i.gender}</div>}
          <div style={{ marginTop: "15mm", fontSize: 13, lineHeight: 2 }}>
            <div><b>பிறந்த தேதி :</b> {fmtDate(birthDate)}</div>
            <div><b>பிறந்த நேரம் :</b> {fmtTime12(i.hour, i.minute)}</div>
            <div><b>பிறந்த இடம் :</b> {i.placeName}</div>
            <div><b>ராசி / நட்சத்திரம் :</b> {result.rasiTamil} / {result.nakshatraTamil} ({result.pada}-ம் பாதம்)</div>
            <div><b>லக்னம் :</b> {result.lagnaTamil}</div>
          </div>
          <div style={{ marginTop: "20mm", fontSize: 10, color: "#888" }}>
            இது சுத்த திருக்கணித பஞ்சாங்கப்படி, லாஹிரி அயனாம்சம் கொண்டு கணிக்கப்பெற்றது.<br/>
            © UR ASTRO SOFT • www.urastrosoft.com
          </div>
        </div>
      </Page>

      {/* === PAGE 2 : Planet Positions, KP-style === */}
      <Page title="கிரக நிலைகள் & பஞ்சாங்கம்" page={next()} total={totalPages} name={i.name}>
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

        <div style={{ marginTop: 6, background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>கிரக நிலைகள் (Planetary Positions — KP Style)</div>
        <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
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

      {/* === Lagna + Nakshatra + Bhava palans === */}
      <Page title="லக்ன • நட்சத்திர • பாவாதிபதி பலன்" page={next()} total={totalPages} name={i.name}>
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

        <div style={{ marginTop: 8, background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>
          பாவாதிபதி நின்ற பலன் (12 வீடுகள்)
        </div>
        <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
          <thead><tr style={{ background: "#fff8ee" }}>
            <th style={th}>பாவம்</th><th style={th}>ராசி</th><th style={th}>அதிபதி</th><th style={th}>நின்ற இடம்</th><th style={th}>பலன்</th>
          </tr></thead>
          <tbody>
            {palans.map((b, idx) => (
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

      {/* === Planet in House palans === */}
      <Page title="கிரகங்கள் பாவங்களில் நின்ற பலன்" page={next()} total={totalPages} name={i.name}>
        <div style={{ background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>
          பாவத்தில் கிரகம் நின்ற பலன் (Planet in House)
        </div>
        <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
          <thead><tr style={{ background: "#fff8ee" }}>
            <th style={th}>கிரகம்</th><th style={th}>ராசி</th><th style={th}>பாவம்</th><th style={th}>பலன்</th>
          </tr></thead>
          <tbody>
            {result.planets.map(p => {
              const house = ((p.rasiIndex - result.ascendant.rasiIndex + 12) % 12) + 1;
              return (
                <tr key={p.key}>
                  <td style={{ ...td, fontWeight: 700 }}>{PLANET_TA[p.key]}</td>
                  <td style={td}>{p.rasiTamil}</td>
                  <td style={td}>{house}-ம் வீடு</td>
                  <td style={td}>{PLANET_IN_HOUSE[p.key]?.[house] || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Page>

      {/* === Planet in Rasi palans === */}
      <Page title="கிரகங்கள் ராசிகளில் நின்ற பலன்" page={next()} total={totalPages} name={i.name}>
        <div style={{ background: "#fbe9d0", padding: "3px 6px", fontSize: 11, fontWeight: 700, border: "1px solid #c9a050" }}>
          ராசியில் கிரகம் நின்ற பலன் (Planet in Sign)
        </div>
        <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
          <thead><tr style={{ background: "#fff8ee" }}>
            <th style={th}>கிரகம்</th><th style={th}>ராசி</th><th style={th}>பாகை</th><th style={th}>பலன்</th>
          </tr></thead>
          <tbody>
            {result.planets.map(p => (
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

      {/* === Dasha pages — one per Mahadasha with age === */}
      {result.dashaTree.map((maha, mi) => {
        const startAge = ageAt(birthDate, maha.startDate);
        const endAge = ageAt(birthDate, maha.endDate);
        const lordKey = DASHA_LORD_TO_KEY[maha.lord];
        return (
          <Page key={`d-${mi}`} title={`${mi + 1}. ${maha.lord} மகா தசை`} subtitle={`வயது ${startAge} - ${endAge}`} page={next()} total={totalPages} name={i.name}>
            <div style={{ background: "#fbe9d0", padding: "4px 8px", fontSize: 12, fontWeight: 700, border: "1px solid #c9a050", textAlign: "center" }}>
              {maha.lord} மகா தசை &nbsp;•&nbsp; {fmtDate(maha.startDate)} → {fmtDate(maha.endDate)} &nbsp;•&nbsp; வயது {startAge} - {endAge}
            </div>
            {lordKey && (
              <div style={{ border: "1px solid #c9a050", borderTop: 0, padding: 6, fontSize: 10, background: "#fff8ee" }}>
                <b>{maha.lord} தசை பலன் :</b> {DASHA_LORD_PALAN[lordKey]}
              </div>
            )}
            <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse", border: "1px solid #c9a050", marginTop: 4 }}>
              <thead>
                <tr style={{ background: "#fff8ee" }}>
                  <th style={th}>புத்தி</th><th style={th}>தொடக்கம்</th><th style={th}>முடிவு</th><th style={th}>வயது</th>
                  <th style={th}>அந்தரம்</th><th style={th}>தொடக்கம்</th><th style={th}>முடிவு</th>
                </tr>
              </thead>
              <tbody>
                {(maha.children || []).flatMap((bh, bi) => {
                  const ants = bh.children || [];
                  const span = Math.max(ants.length, 1);
                  const bhAge = ageAt(birthDate, bh.startDate);
                  if (ants.length === 0) {
                    return [(
                      <tr key={`b-${bi}`}>
                        <td style={{ ...td, fontWeight: 700 }}>{maha.lord}/{bh.lord}</td>
                        <td style={td}>{fmtDate(bh.startDate)}</td>
                        <td style={td}>{fmtDate(bh.endDate)}</td>
                        <td style={td}>{bhAge}</td>
                        <td style={td} colSpan={3}>—</td>
                      </tr>
                    )];
                  }
                  return ants.map((a, ai) => (
                    <tr key={`b-${bi}-${ai}`}>
                      {ai === 0 && (<>
                        <td rowSpan={span} style={{ ...td, fontWeight: 700, background: "#fff8ee", verticalAlign: "top" }}>{maha.lord}/{bh.lord}</td>
                        <td rowSpan={span} style={{ ...td, verticalAlign: "top" }}>{fmtDate(bh.startDate)}</td>
                        <td rowSpan={span} style={{ ...td, verticalAlign: "top" }}>{fmtDate(bh.endDate)}</td>
                        <td rowSpan={span} style={{ ...td, verticalAlign: "top" }}>{bhAge}</td>
                      </>)}
                      <td style={td}>{a.lord}</td>
                      <td style={td}>{fmtDate(a.startDate)}</td>
                      <td style={td}>{fmtDate(a.endDate)}</td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </Page>
        );
      })}
    </div>
  );
};

const tdL: React.CSSProperties = { border: "1px solid #c9a050", padding: "3px 6px", width: "20%", background: "#fff8ee" };
const tdR: React.CSSProperties = { border: "1px solid #c9a050", padding: "3px 6px", width: "30%" };
const td: React.CSSProperties = { border: "1px solid #c9a050", padding: "2px 4px", verticalAlign: "top" };
const th: React.CSSProperties = { border: "1px solid #c9a050", padding: "3px 4px", textAlign: "left", fontWeight: 700 };
const chartTitle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "#7a1a2b", textAlign: "center", marginBottom: 3 };
