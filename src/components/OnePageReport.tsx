import { JathagamResult, RASIS_TAMIL } from "@/lib/jathagam";

interface Props {
  result: JathagamResult;
}

const PLANET_SHORT_TA: Record<string, string> = {
  sun: "சூரி",
  moon: "சந்",
  mars: "செவ்",
  mercury: "புத(வ)",
  jupiter: "குரு",
  venus: "சுக்",
  saturn: "சனி",
  rahu: "ராகு",
  ketu: "கேது",
  ascendant: "1-லக்",
};

const PLANET_FULL_TA: Record<string, string> = {
  sun: "சூரியன்",
  moon: "சந்திரன்",
  mars: "செவ்வாய்",
  mercury: "புதன்(வ)",
  jupiter: "குரு",
  venus: "சுக்கிரன்",
  saturn: "சனி",
  rahu: "ராகு",
  ketu: "கேது",
};

const dms = (deg: number): string => {
  const d = Math.floor(deg);
  const mF = (deg - d) * 60;
  const m = Math.floor(mF);
  const s = Math.round((mF - m) * 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d)}:${pad(m)}:${pad(s)}`;
};

const padaParen = (lon: number): string => {
  const padaSize = (360 / 27) / 4;
  const nakIdx = Math.floor(lon / (360 / 27));
  const pada = Math.floor((lon - nakIdx * (360 / 27)) / padaSize) + 1;
  return `(${pada})`;
};

const RELATION_LABELS: Record<string, string> = {
  own: "ஆட்சி",
  exalt: "உச்சம்",
  debil: "நீசம்",
  friend: "நட்பு",
  neutral: "சமம்",
  enemy: "பகை",
};

const SIGN_LORD: Record<number, string> = {
  0: "mars", 1: "venus", 2: "mercury", 3: "moon", 4: "sun", 5: "mercury",
  6: "venus", 7: "mars", 8: "jupiter", 9: "saturn", 10: "saturn", 11: "jupiter",
};
const OWN_SIGNS: Record<string, number[]> = {
  sun: [4], moon: [3], mars: [0, 7], mercury: [2, 5], jupiter: [8, 11],
  venus: [1, 6], saturn: [9, 10],
};
const EXALT_SIGN: Record<string, number> = { sun: 0, moon: 1, mars: 9, mercury: 5, jupiter: 3, venus: 11, saturn: 6 };
const DEBIL_SIGN: Record<string, number> = { sun: 6, moon: 7, mars: 3, mercury: 11, jupiter: 9, venus: 5, saturn: 0 };
const NATURAL_FRIENDS: Record<string, string[]> = {
  sun: ["moon", "mars", "jupiter"],
  moon: ["sun", "mercury"],
  mars: ["sun", "moon", "jupiter"],
  mercury: ["sun", "venus"],
  jupiter: ["sun", "moon", "mars"],
  venus: ["mercury", "saturn"],
  saturn: ["mercury", "venus"],
};
const NATURAL_ENEMIES: Record<string, string[]> = {
  sun: ["venus", "saturn"],
  moon: [],
  mars: ["mercury"],
  mercury: ["moon"],
  jupiter: ["mercury", "venus"],
  venus: ["sun", "moon"],
  saturn: ["sun", "moon", "mars"],
};
const relationOf = (planet: string, rasiIdx: number): string => {
  if (OWN_SIGNS[planet]?.includes(rasiIdx)) return RELATION_LABELS.own;
  if (EXALT_SIGN[planet] === rasiIdx) return RELATION_LABELS.exalt;
  if (DEBIL_SIGN[planet] === rasiIdx) return RELATION_LABELS.debil;
  const lord = SIGN_LORD[rasiIdx];
  if (lord === planet) return RELATION_LABELS.own;
  if (NATURAL_FRIENDS[planet]?.includes(lord)) return RELATION_LABELS.friend;
  if (NATURAL_ENEMIES[planet]?.includes(lord)) return RELATION_LABELS.enemy;
  return RELATION_LABELS.neutral;
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

const VAARAS = ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"];

const SI_LAYOUT: (number | null)[][] = [
  [11, 0, 1, 2],
  [10, null, null, 3],
  [9, null, null, 4],
  [8, 7, 6, 5],
];

const renderChart = (
  title: string,
  chart: string[][],
  ascRasi: number,
) => (
  <table className="w-full" style={{ borderCollapse: "collapse" }}>
    <tbody>
      {SI_LAYOUT.map((row, r) => (
        <tr key={r}>
          {row.map((rasiIdx, c) => {
            if (rasiIdx === null) {
              if (r === 1 && c === 1) {
                return (
                  <td key={c} colSpan={2} rowSpan={2} className="chart-center">
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
                  </td>
                );
              }
              return null;
            }
            const planets = chart[rasiIdx] || [];
            const isLagna = rasiIdx === ascRasi;
            return (
              <td key={c} className="chart-cell" style={{ position: "relative", border: "1px solid #000", height: 60, width: "25%" }}>
                {isLagna && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: 0,
                      height: 0,
                      borderTop: "8px solid #1a1a1a",
                      borderRight: "8px solid transparent",
                    }}
                  />
                )}
                <div style={{ fontSize: 9, padding: 2 }}>
                  {planets
                    .filter((p) => p !== "ascendant")
                    .map((p) => PLANET_SHORT_TA[p])
                    .join(" ")}
                  {planets.includes("ascendant") && (
                    <span style={{ display: "block" }}>{PLANET_SHORT_TA.ascendant}</span>
                  )}
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
  const tamilDate = `குரோதன கார்த்திகை-${i.day}`;
  const sunrise = result.panchangam.sunriseLocal;
  const sunset = result.panchangam.sunsetLocal;
  const srLocal = new Date(sunrise.getTime() + i.tzOffsetHours * 3600 * 1000);
  const ssLocal = new Date(sunset.getTime() + i.tzOffsetHours * 3600 * 1000);
  const srStr = fmtTimeStr(srLocal.getUTCHours(), srLocal.getUTCMinutes());
  const ssStr = fmtTimeStr(ssLocal.getUTCHours(), ssLocal.getUTCMinutes());
  const tzSign = i.tzOffsetHours >= 0 ? "+" : "-";
  const tzAbs = Math.abs(i.tzOffsetHours);
  const tzH = Math.floor(tzAbs);
  const tzM = Math.round((tzAbs - tzH) * 60);
  const tzStr = `${tzH}:${String(tzM).padStart(2, "0")} ${tzSign === "+" ? "E" : "W"}`;

  const yogaLord = result.panchangam.yogaTamil;

  const rows = [
    { key: "ascendant", lon: result.ascendant.longitude, label: "1-லக்னம்", rasiIdx: result.ascendant.rasiIndex, p: result.ascendant },
    ...result.planets.map((p) => ({ key: p.key, lon: p.longitude, label: PLANET_FULL_TA[p.key] || p.nameTamil, rasiIdx: p.rasiIndex, p })),
    { key: "mandi", lon: result.mandi.longitude, label: "மாந்தி", rasiIdx: result.mandi.rasiIndex, p: { nakshatraTamil: result.mandi.nakshatraTamil, pada: result.mandi.pada, degreeInRasi: result.mandi.degreeInRasi } as any },
  ];

  return (
    <div className="a4-sheet print-area" style={{ width: "210mm", minHeight: "297mm", padding: "10mm", margin: "auto", background: "white", color: "#000" }}>
      <style>{`@media print { .print-area { margin: 0; } @page { size: A4; margin: 10mm; } }`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #000", paddingBottom: 4 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>UR ASTRO SOFT</div>
          <div style={{ fontSize: 12, color: "#444" }}>தமிழ் வேத ஜோதிட ஜாதகம்</div>
        </div>
        <button onClick={() => window.print()} style={{ padding: "5px 10px", cursor: "pointer" }}>Print Report</button>
      </div>

      <div style={{ marginTop: 10, fontSize: 16, fontWeight: 700 }}>{i.name}</div>

      <table style={{ width: "100%", marginTop: 10, fontSize: 12 }}>
        <tbody>
          <tr>
            <td>பாலினம்: {i.gender || "—"}</td>
            <td>தேதி: {fmtDate(birthDate)} {VAARAS[birthDate.getDay()]}</td>
          </tr>
          <tr>
            <td>தொலைபேசி: {i.phone || "—"}</td>
            <td>நேரம்: {fmtTimeStr(i.hour, i.minute)}</td>
          </tr>
          <tr>
            <td>சொந்த ஊர்: {i.placeName}</td>
            <td>லக்னம்: {result.lagnaTamil}</td>
          </tr>
          <tr>
            <td>ராசி: {result.rasiTamil}</td>
            <td>நட்சத்திரம்: {result.nakshatraTamil} பாதம் {result.pada}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, textAlign: "center", borderBottom: "1px solid #000" }}>துல்லியமான நிராயண கிரக நிலைகள்</div>
      <table style={{ width: "100%", marginTop: 5, fontSize: 11, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #000" }}>
            <th style={{ textAlign: "left" }}>கிரகம்</th>
            <th style={{ textAlign: "left" }}>பாகை</th>
            <th style={{ textAlign: "left" }}>நட்சத்திரம்</th>
            <th style={{ textAlign: "left" }}>ராசி</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} style={{ borderBottom: "1px dotted #ccc" }}>
              <td>{r.label}</td>
              <td>{dms(r.lon)}</td>
              <td>{(r.p as any).nakshatraTamil}</td>
              <td>{RASIS_TAMIL[r.rasiIdx]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        <div>{renderChart("ராசி", result.rasiChart, result.ascendant.rasiIndex)}</div>
        <div>{renderChart("நவாம்சம்", result.navamsaChart, result.navamsaPositions.find((n) => n.key === "ascendant")?.rasiIndex ?? 0)}</div>
      </div>

      <div style={{ marginTop: 20, fontSize: 11, borderTop: "1px solid #000", paddingTop: 10 }}>
        <div>திசை இருப்பு: {result.currentDasha.lord} திசையில் {Math.max(0, Math.floor((result.currentDasha.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365.25)))} வரு, {Math.max(0, Math.floor(((result.currentDasha.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30.4375)) % 12))} மா</div>
        <div style={{ marginTop: 10, textAlign: "center" }}>இது சுத்த திருக்கணித பஞ்சாங்கத்தின்படி கணிக்கப்பெற்றது. UR ASTRO SOFT</div>
      </div>
    </div>
  );
};
