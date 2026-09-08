import { JathagamResult, RASIS_TAMIL, NAKSHATRAS_TAMIL } from "@/lib/jathagam";
import { suniyaRasisFor, irundhaRasi as calcIrundha, mudakkuRasi as calcMudakku } from "@/lib/thithi-suniyam";

interface Props {
  result: JathagamResult;
}

const cell: React.CSSProperties = { border: "1px solid #c9a050", padding: "5px 8px", fontSize: 14, fontWeight: 700 };
const th: React.CSSProperties = { ...cell, background: "#fbe9d0", color: "#7a1a2b" };
const heading: React.CSSProperties = { fontSize: 16, fontWeight: 800, color: "#7a1a2b", margin: "12px 0 5px" };

export const ThithiSuniyamPage = ({ result }: Props) => {
  const pg = result.panchangam;
  const tithiInPaksha = (pg.tithiIndex % 15) + 1;
  const suniyaRasis = TITHI_SUNIYAM[tithiInPaksha] ?? [];

  const janma = result.moon.rasiIndex;
  const irundhaRasi = (janma + 7) % 12;  // 8-ஆம் ராசி
  const mudakkuRasi = (janma + 11) % 12; // 12-ஆம் ராசி

  const isSuniyam = (r: number) => suniyaRasis.includes(r);

  return (
    <div
      className="a4-sheet print-area bg-white rounded-lg p-5 border border-gold/30 mx-auto"
      style={{ fontFamily: "'Latha','Tahoma',sans-serif", color: "#000", marginTop: 16 }}
    >
      <div style={{ borderBottom: "2px solid #7a1a2b", paddingBottom: 6, marginBottom: 8, textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#7a1a2b" }}>திதி சூன்யம் • இறந்த ராசி • முடக்கு ராசி</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>
          {result.input.name} • {NAKSHATRAS_TAMIL[result.moon.nakshatraIndex]} • ஜென்ம ராசி: {RASIS_TAMIL[janma]}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 6, marginBottom: 6 }}>
        <Tile title="திதி" value={`${pg.tithiTamil} (${pg.paksha} பக்ஷம்)`} bg="linear-gradient(135deg,#f59e0b,#ef4444)" />
        <Tile title="இறந்த ராசி" value={RASIS_TAMIL[irundhaRasi]} bg="linear-gradient(135deg,#6366f1,#8b5cf6)" />
        <Tile title="முடக்கு ராசி" value={RASIS_TAMIL[mudakkuRasi]} bg="linear-gradient(135deg,#0d9488,#10b981)" />
      </div>

      <div style={heading}>திதி சூன்ய ராசிகள்</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ ...th, width: "38%" }}>இன்றைய/ஜென்ம திதி</td>
            <td style={cell}>{pg.tithiTamil} — {pg.paksha} பக்ஷம்</td>
          </tr>
          <tr>
            <td style={th}>சூன்ய ராசிகள்</td>
            <td style={{ ...cell, color: "#b91c1c" }}>
              {suniyaRasis.map((r) => RASIS_TAMIL[r]).join(" , ") || "—"}
            </td>
          </tr>
          <tr>
            <td style={th}>ஜென்ம ராசி நிலை</td>
            <td style={cell}>
              {isSuniyam(janma)
                ? "ஜென்ம ராசி திதி சூன்ய ராசியில் உள்ளது — சுப காரியங்களுக்கு பரிகாரம் அவசியம்."
                : "ஜென்ம ராசி திதி சூன்யத்தில் இல்லை — சுபம்."}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={heading}>12 ராசிகளுக்கான நிலை</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>ராசி</th>
            <th style={th}>திதி சூன்யம்</th>
            <th style={th}>குறிப்பு</th>
          </tr>
        </thead>
        <tbody>
          {RASIS_TAMIL.map((r, i) => (
            <tr key={r} style={{ background: i % 2 ? "#fdf6ec" : "white" }}>
              <td style={{ ...cell, color: i === janma ? "#7a1a2b" : "#000" }}>
                {r}{i === janma ? " (ஜென்ம ராசி)" : ""}
              </td>
              <td style={{ ...cell, color: isSuniyam(i) ? "#b91c1c" : "#15803d" }}>
                {isSuniyam(i) ? "சூன்யம்" : "இல்லை"}
              </td>
              <td style={cell}>
                {i === irundhaRasi ? "இறந்த ராசி (8)" : i === mudakkuRasi ? "முடக்கு ராசி (12)" : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={heading}>விளக்கமும் பரிகாரமும்</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ ...th, width: "26%" }}>திதி சூன்யம்</td>
            <td style={cell}>
              ஒவ்வொரு திதிக்கும் இரண்டு ராசிகள் பலனற்றவையாக (சூன்யம்) கருதப்படும். அந்த ராசிகளில் நிற்கும்
              கிரகங்களின் பலன் குறையும்; சூன்ய ராசி தொடர்பான சுப முகூர்த்தங்களை தவிர்ப்பது நல்லது.
            </td>
          </tr>
          <tr>
            <td style={th}>இறந்த ராசி</td>
            <td style={cell}>
              ஜென்ம ராசியிலிருந்து 8-ஆம் ராசி — {RASIS_TAMIL[irundhaRasi]}. இந்த ராசி நாட்களில் பயணம், புதிய
              தொடக்கம், கடன் பரிவர்த்தனை தவிர்க்கவும். சந்திரன் இந்த ராசியில் செல்லும் நாளில் அமைதி காக்கவும்.
            </td>
          </tr>
          <tr>
            <td style={th}>முடக்கு ராசி</td>
            <td style={cell}>
              ஜென்ம ராசியிலிருந்து 12-ஆம் ராசி — {RASIS_TAMIL[mudakkuRasi]}. செலவு, தடை, தாமதம் தரும் நாள்;
              முக்கிய ஒப்பந்தங்கள் ஒத்திவைக்கவும்.
            </td>
          </tr>
          <tr>
            <td style={th}>பரிகாரம்</td>
            <td style={cell}>
              இறந்த / முடக்கு ராசி நாட்களில் விநாயகர் வழிபாடு, துர்கை தீபம், அன்னதானம்; திதி சூன்ய நாளில்
              ஜென்ம நட்சத்திர அதிபதிக்கு உரிய தானம் செய்யவும்.
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: 10, fontSize: 10, textAlign: "center", borderTop: "1px solid #7a1a2b", paddingTop: 4, color: "#555", fontWeight: 700 }}>
        திதி சூன்யம் • இறந்த ராசி • முடக்கு ராசி — © AMMAN SOFTWARES
      </div>
    </div>
  );
};

const Tile = ({ title, value, bg }: { title: string; value: string; bg: string }) => (
  <div style={{ background: bg, color: "white", borderRadius: 6, padding: "8px 6px", textAlign: "center" }}>
    <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.9 }}>{title}</div>
    <div style={{ fontSize: 14, fontWeight: 800, overflowWrap: "anywhere" }}>{value}</div>
  </div>
);
