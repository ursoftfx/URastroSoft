import { useState } from "react";
import { JathagamResult, NAKSHATRAS_TAMIL } from "@/lib/jathagam";
import { computeNumerology, nameSuggestions } from "@/lib/numerology";

interface Props {
  result: JathagamResult;
}

const sheet: React.CSSProperties = {
  width: "210mm",
  minHeight: "297mm",
  padding: "8mm 10mm",
  margin: "auto",
  background: "white",
  color: "#000",
  fontFamily: "'Latha','Tahoma',sans-serif",
  boxSizing: "border-box",
  pageBreakBefore: "always",
  marginTop: "8mm",
};

const cell: React.CSSProperties = { border: "1px solid #c9a050", padding: "4px 6px", fontSize: 12, fontWeight: 700, verticalAlign: "top" };
const th: React.CSSProperties = { ...cell, background: "#fbe9d0" };
const h2: React.CSSProperties = { fontSize: 15, fontWeight: 800, color: "#7a1a2b", margin: "10px 0 6px" };

// Chaldean numerology letter values
const CHALDEAN: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

const reduceDigit = (n: number): number => {
  while (n > 9) n = String(n).split("").reduce((s, d) => s + +d, 0);
  return n;
};

const nameNumber = (name: string): number | null => {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "");
  if (!letters) return null;
  const sum = letters.split("").reduce((s, ch) => s + (CHALDEAN[ch] || 0), 0);
  return reduceDigit(sum);
};

const NUM_TRAITS: Record<number, { planet: string; good: string }> = {
  1: { planet: "சூரியன்", good: "தலைமை, சுயமரியாதை, வெற்றி" },
  2: { planet: "சந்திரன்", good: "நட்பு, மென்மை, அமைதி" },
  3: { planet: "குரு", good: "ஞானம், கல்வி, அதிர்ஷ்டம்" },
  4: { planet: "ராகு", good: "புதுமை, முயற்சி" },
  5: { planet: "புதன்", good: "வியாபாரம், புத்திக்கூர்மை" },
  6: { planet: "சுக்ரன்", good: "சுகம், கலை, அழகு" },
  7: { planet: "கேது", good: "ஆன்மிகம், சிந்தனை" },
  8: { planet: "சனி", good: "உழைப்பு, நிலைத்த வெற்றி" },
  9: { planet: "செவ்வாய்", good: "தைரியம், ஆற்றல்" },
};

// Sample baby name ideas per starting syllable (common Tamil names)
const SAMPLE_NAMES: Record<string, string[]> = {
  "அ": ["அருண்", "அன்பு", "அமிர்தா", "அபினயா"], "ஆ": ["ஆனந்த்", "ஆதித்யா"],
  "ஈ": ["ஈஸ்வரன்", "ஈஸ்வரி"], "உ": ["உமா", "உதயன்"], "ஏ": ["ஏழிசை"],
  "ஓ": ["ஓம் பிரகாஷ்"], "சு": ["சுரேஷ்", "சுதா"], "சே": ["சேதுபதி"],
  "சோ": ["சோமு", "சௌந்தர்யா"], "லா": ["லட்சுமி", "லலிதா"], "லீ": ["லீலா"],
  "லூ": ["லூக்காஸ்"], "லே": ["லேகா"], "லோ": ["லோகேஷ்", "லோகேஸ்வரி"],
  "வா": ["வாணி", "வாசுதேவன்"], "வீ": ["வீணா", "வீரன்"], "வு": ["வுல்லி"],
  "வே": ["வேலன்", "வேணி"], "வோ": ["வோகநாதன்"], "கா": ["கார்த்திக்", "காவ்யா"],
  "கீ": ["கீர்த்தி", "கீர்த்தனா"], "கு": ["குணா", "குருவில்"], "கே": ["கேசவன்"],
  "கோ": ["கோபால்", "கோமதி"], "ஹா": ["ஹரி", "ஹரணி"], "ஹீ": ["ஹீரா"],
  "ஹு": ["ஹுசைன்"], "ஹே": ["ஹேமா", "ஹேமந்த்"], "ஹோ": ["ஹோசங்"],
  "டா": ["டாக்டர் பாபு"], "டீ": ["டீக்ஷித்"], "டே": ["டேவித்"], "டோ": ["டோமினிக்"],
  "மா": ["மாலினி", "மணி", "மாதவன்"], "மீ": ["மீனா", "மீனாட்சி"], "மு": ["முருகன்", "முத்து"],
  "மே": ["மேகனா", "மேனகா"], "மோ": ["மோகன்", "மோனிகா"], "டீ2": [],
  "டூ": ["டூப்"], "டே2": [], "டோ2": [], "பா": ["பாலா", "பார்வதி", "பாஸ்கர்"],
  "பீ": ["பீமன்"], "பு": ["பூர்ணிமா", "புஷ்பா"], "ஷ": ["ஷாந்தி", "ஷீலா"],
  "ண": ["ணந்தினி"], "ட": ["டரா"], "பே": ["பேபி", "பெரியசாமி"],
  "போ": ["போபதி"], "ரா": ["ராஜ்", "ராணி", "ராமன்"], "ரீ": ["ரீட்டா", "ரீனா"],
  "ரு": ["ருத்ரா", "ருக்மணி"], "ரே": ["ரேணு", "ரேவதி"], "ரோ": ["ரோஹித்", "ரோஜா"],
  "தா": ["தாரா", "தனுஷ்", "தாமரை"], "தீ": ["தீபன்", "தீபா"], "தூ": ["தூயவன்"],
  "தே": ["தேவி", "தேவன்"], "தோ": ["தோள்"], "நா": ["நாகராஜ்", "நந்தினி"],
  "நீ": ["நீலா", "நீலன்"], "நு": ["நுரையும்"], "நே": ["நேத்ரா"], "நோ": ["நோபல்"],
  "யா": ["யாழினி", "யாதவ்"], "யீ": ["யீசு"], "யூ": ["யூசுப்"], "யே": ["யேசுதாஸ்"],
  "யோ": ["யோகேஷ்", "யோகா"], "பு2": [], "ஜா": ["ஜானகி", "ஜெயலட்சுமி"],
  "ஜீ": ["ஜீவா", "ஜீவன்"], "ஜு": ["ஜுவல்"], "ஜே": ["ஜேம்ஸ்"], "ஜோ": ["ஜோதி", "ஜோசப்"],
  "கீ2": [], "கு2": [], "கே2": [], "கோ2": [],
  "ஸா": ["ஸாரதா", "ஸாம்ராஜ்"], "ஸீ": ["ஸீதா", "ஸீநிவாஸ்"], "ஸு": ["ஸுதர்சன்", "ஸுபாஷ்"],
  "ஸே": ["ஸேது", "ஸேணல்"], "ஸோ": ["ஸோனா", "ஸோனியா"], "தா2": [], "தீ2": [], "தூ2": [],
  "தே2": [], "தோ2": [], "சா": ["சரண்யா", "சந்தோஷ்"], "சீ": ["சீரன்"],
  "தே3": [], "தோ3": [], "சா2": [], "சீ2": [],
};

export const BabyNamesPage = ({ result }: Props) => {
  const { year, month, day } = result.input;
  const numer = computeNumerology(day, month, year);
  const janma = result.moon.nakshatraIndex;
  const pada = result.pada;
  const names = nameSuggestions(janma, pada);

  const [babyName, setBabyName] = useState("");
  const nNum = nameNumber(babyName);
  const isLucky = nNum !== null && (nNum === numer.birthNumber || nNum === numer.lifePath);

  const syllableNames = (syl: string): string[] => {
    const exact = SAMPLE_NAMES[syl];
    if (exact && exact.length) return exact;
    return [];
  };

  return (
    <div className="a4-sheet print-area" style={sheet}>
      <div style={{ borderBottom: "2px solid #7a1a2b", paddingBottom: 5, marginBottom: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#7a1a2b" }}>குழந்தை பெயர்கள் &amp; எண் ஜோதிடம் (Pronology)</div>
        <div style={{ fontSize: 11, color: "#555", fontWeight: 700 }}>
          ஜென்ம நட்சத்திரம்: {NAKSHATRAS_TAMIL[janma]} ({pada}ஆம் பாதம்) • ராசி: {result.rasiTamil} •
          பிறந்த தேதி: {day}/{month}/{year}
        </div>
      </div>

      {/* Naming syllables */}
      <div style={h2}>1. நட்சத்திர பாத பெயர் எழுத்துக்கள்</div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 6 }}>
        <thead>
          <tr>
            <th style={{ ...th, width: "10%" }}>பாதம்</th>
            <th style={{ ...th, width: "20%" }}>எழுத்து</th>
            <th style={{ ...th, width: "15%" }}>Latin</th>
            <th style={th}>பரிந்துரை பெயர்கள்</th>
          </tr>
        </thead>
        <tbody>
          {names.allPadas.map((p) => (
            <tr key={p.pada} style={{ background: p.pada === pada ? "#fcf3cf" : "white" }}>
              <td style={{ ...cell, textAlign: "center" }}>
                {p.pada} {p.pada === pada && <span style={{ color: "#9a7d0a" }}>★ ஜென்ம</span>}
              </td>
              <td style={{ ...cell, fontSize: 14, color: "#7a1a2b" }}>{p.tamil}</td>
              <td style={cell}>{p.latin}</td>
              <td style={cell}>{syllableNames(p.tamil).join(", ") || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
        ★ ஜென்ம பாத எழுத்து: <span style={{ color: "#7a1a2b", fontSize: 15 }}>{names.primary}</span> ({names.latin}) —
        இந்த எழுத்தில் தொடங்கும் பெயர் குழந்தைக்கு மிக உகந்தது.
      </div>

      {/* Birth numerology */}
      <div style={h2}>2. பிறப்பு எண் ஜோதிடம்</div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
        <tbody>
          <tr>
            <td style={{ ...th, width: "30%" }}>பிறப்பு எண் (Psychic No.)</td>
            <td style={{ ...cell, fontSize: 16, color: "#7a1a2b" }}>{numer.birthNumber}</td>
            <td style={{ ...th, width: "25%" }}>ஆளும் கிரகம்</td>
            <td style={cell}>{numer.rulingPlanet}</td>
          </tr>
          <tr>
            <td style={th}>வாழ்க்கை பாதை எண் (Life Path)</td>
            <td style={{ ...cell, fontSize: 16, color: "#7a1a2b" }}>{numer.lifePath}</td>
            <td style={th}>அதிர்ஷ்ட எண்கள்</td>
            <td style={cell}>{numer.luckyNumbers.join(", ")}</td>
          </tr>
          <tr>
            <td style={th}>அதிர்ஷ்ட நாட்கள்</td>
            <td style={cell}>{numer.luckyDays.join(", ")}</td>
            <td style={th}>அதிர்ஷ்ட நிறங்கள்</td>
            <td style={cell}>{numer.luckyColors.join(", ")}</td>
          </tr>
          <tr>
            <td style={th}>குணாதிசயம்</td>
            <td style={cell} colSpan={3}>{numer.description}</td>
          </tr>
        </tbody>
      </table>

      {/* Name numerology calculator */}
      <div style={h2}>3. பெயர் எண் கணிப்பு (Chaldean Pronology)</div>
      <div className="no-print" style={{ marginBottom: 8 }}>
        <input
          value={babyName}
          onChange={(e) => setBabyName(e.target.value)}
          placeholder="Enter baby name in English (e.g. KAVIYA)"
          style={{ border: "1px solid #c9a050", borderRadius: 6, padding: "6px 10px", fontSize: 13, width: "70%", fontWeight: 700 }}
        />
      </div>
      {nNum !== null ? (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
          <tbody>
            <tr style={{ background: isLucky ? "#e9f7ef" : "#fdecea" }}>
              <td style={{ ...th, width: "30%" }}>பெயர்: {babyName.toUpperCase()}</td>
              <td style={{ ...cell, fontSize: 16, color: "#7a1a2b" }}>எண்: {nNum}</td>
              <td style={{ ...th, width: "20%" }}>கிரகம்</td>
              <td style={cell}>{NUM_TRAITS[nNum].planet}</td>
            </tr>
            <tr style={{ background: isLucky ? "#e9f7ef" : "#fdecea" }}>
              <td style={th}>பலன்</td>
              <td style={cell} colSpan={3}>
                {NUM_TRAITS[nNum].good}.
                {isLucky
                  ? " ✔ பிறப்பு எண் / வாழ்க்கை எண்ணுடன் பொருந்துகிறது — மிக சிறந்த பெயர்!"
                  : ` ⚠ பிறப்பு எண் ${numer.birthNumber} அல்லது வாழ்க்கை எண் ${numer.lifePath} கொண்ட பெயர் இன்னும் உகந்தது.`}
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
          மேலே பெயரை உள்ளிடவும் — பெயர் எண்ணும் பொருந்துதலும் காட்டப்படும்.
          (பிறப்பு எண் {numer.birthNumber} அல்லது வாழ்க்கை எண் {numer.lifePath} வரும் பெயர் அதிர்ஷ்டமானது.)
        </div>
      )}

      {/* Number meaning table */}
      <div style={h2}>4. எண் 1–9 அர்த்த அட்டவணை</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...th, width: "8%" }}>எண்</th>
            <th style={{ ...th, width: "18%" }}>கிரகம்</th>
            <th style={th}>குணங்கள்</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(NUM_TRAITS).map(([n, v]) => (
            <tr key={n} style={{ background: +n === numer.birthNumber || +n === numer.lifePath ? "#fcf3cf" : "white" }}>
              <td style={{ ...cell, textAlign: "center", color: "#7a1a2b" }}>{n}</td>
              <td style={cell}>{v.planet}</td>
              <td style={cell}>{v.good}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 10, fontSize: 9, textAlign: "center", borderTop: "1px solid #7a1a2b", paddingTop: 3, color: "#555", fontWeight: 700 }}>
        குழந்தை பெயர்கள் &amp; எண் ஜோதிடம் • © AMMAN SOFTWARES
      </div>
    </div>
  );
};
