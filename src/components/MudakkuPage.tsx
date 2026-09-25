import { JathagamResult, NAKSHATRAS_TAMIL, RASIS_TAMIL, PLANETS_TAMIL } from "@/lib/jathagam";

interface Props { result: JathagamResult }

const sheet: React.CSSProperties = {
  width: "210mm", minHeight: "297mm", padding: "8mm 10mm", margin: "auto", marginTop: "8mm",
  background: "white", color: "#000", fontFamily: "'Latha','Tahoma',sans-serif",
  boxSizing: "border-box", pageBreakBefore: "always",
};
const cell: React.CSSProperties = { border: "1px solid #c9a050", padding: "4px 6px", fontSize: 11, verticalAlign: "top", fontWeight: 600 };
const th: React.CSSProperties = { ...cell, background: "#fbe9d0", fontWeight: 700 };

const NAK_TYPES = [
  { pos: [3, 12, 21], name: "விபத் தாரை", tone: "#c0392b", bg: "#fdecea", palan: "காரியத் தடை, பண இழப்பு, பயணத்தில் இடையூறு. புதிய தொடக்கம் தவிர்க்கவும்.", parikaram: "துர்கை அம்மனுக்கு 9 தீபம், வெல்லம் தானம்." },
  { pos: [5, 14, 23], name: "பிரத்யக் தாரை", tone: "#b9770e", bg: "#fef5e7", palan: "எதிர்ப்பு, வழக்கு, முயற்சிகள் முடங்குதல். ஒப்பந்தங்கள் தள்ளிப் போடவும்.", parikaram: "ஆஞ்சநேயர் வழிபாடு, உப்பு தானம்." },
  { pos: [7, 16, 25], name: "வத (நைதன) தாரை", tone: "#4a4a4a", bg: "#ececec", palan: "முழு முடக்கு — உடல் நலக் குறைவு, மன அழுத்தம். சுப காரியம் கூடாது.", parikaram: "ருத்ர அபிஷேகம், எள் தானம், மிருத்யுஞ்சய ஜபம்." },
];

const RASI_TYPES = [
  { h: 6, name: "6-ம் இடம் (ருண ரோக சத்ரு)", palan: "கடன், நோய், எதிரி தொல்லையால் முடக்கம்." },
  { h: 8, name: "8-ம் இடம் (அஷ்டமம் / சந்திராஷ்டமம்)", palan: "மிகக் கடுமையான முடக்கு — விபத்து, தடை, அவமானம்; முக்கிய முடிவுகள் தவிர்க்கவும்." },
  { h: 12, name: "12-ம் இடம் (விரயம்)", palan: "செலவு, இழப்பு, தூக்கமின்மை, அலைச்சல்." },
];

export const MudakkuPage = ({ result }: Props) => {
  const janma = result.moon.nakshatraIndex;
  const moonR = result.moon.rasiIndex;
  const lagR = result.ascendant.rasiIndex;
  const planetsIn = (r: number) =>
    result.planets.filter((p) => p.rasiIndex === r)
      .map((p) => PLANETS_TAMIL[p.key as keyof typeof PLANETS_TAMIL] ?? p.key).join(", ") || "—";

  return (
    <div style={sheet} className="a4-page">
      <h2 style={{ textAlign: "center", color: "#7a1a2b", fontSize: 20, fontWeight: 800, margin: 0 }}>முடக்கு நட்சத்திரம் & முடக்கு ராசி</h2>
      <p style={{ textAlign: "center", fontSize: 12, fontWeight: 700, margin: "4px 0 10px" }}>
        {result.input.name} — ஜென்ம நட்சத்திரம்: {NAKSHATRAS_TAMIL[janma]} ({result.pada}) · ராசி: {RASIS_TAMIL[moonR]} · லக்னம்: {RASIS_TAMIL[lagR]}
      </p>

      <h3 style={{ fontSize: 15, fontWeight: 800, color: "#7a1a2b" }}>முடக்கு நட்சத்திரங்கள்</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
        <thead><tr><th style={th}>தாரை</th><th style={th}>நட்சத்திரங்கள்</th><th style={th}>பலன்</th><th style={th}>பரிகாரம்</th></tr></thead>
        <tbody>
          {NAK_TYPES.map((t) => (
            <tr key={t.name} style={{ background: t.bg }}>
              <td style={{ ...cell, color: t.tone, fontWeight: 800 }}>{t.name}</td>
              <td style={cell}>{t.pos.map((n) => `${NAKSHATRAS_TAMIL[(janma + n - 1) % 27]} (${n})`).join(", ")}</td>
              <td style={cell}>{t.palan}</td>
              <td style={cell}>{t.parikaram}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ fontSize: 15, fontWeight: 800, color: "#7a1a2b" }}>முடக்கு ராசிகள்</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
        <thead><tr><th style={th}>இடம்</th><th style={th}>சந்திரனிலிருந்து</th><th style={th}>லக்னத்திலிருந்து</th><th style={th}>உள்ள கிரகங்கள் (ச / ல)</th><th style={th}>பலன்</th></tr></thead>
        <tbody>
          {RASI_TYPES.map((t) => {
            const fm = (moonR + t.h - 1) % 12, fl = (lagR + t.h - 1) % 12;
            return (
              <tr key={t.h} style={{ background: t.h === 8 ? "#fdecea" : "#fffaf0" }}>
                <td style={{ ...cell, fontWeight: 800 }}>{t.name}</td>
                <td style={cell}>{RASIS_TAMIL[fm]}</td>
                <td style={cell}>{RASIS_TAMIL[fl]}</td>
                <td style={cell}>{planetsIn(fm)} / {planetsIn(fl)}</td>
                <td style={cell}>{t.palan}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ border: "2px solid #c9a050", borderRadius: 8, padding: 8, background: "#fffaf0", fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>
        சந்திரன் முடக்கு நட்சத்திரங்களில் சஞ்சரிக்கும் நாட்களிலும், சந்திரன் {RASIS_TAMIL[(moonR + 7) % 12]} ராசியில் (சந்திராஷ்டமம்) இருக்கும் நாட்களிலும் திருமணம், கிரகப்பிரவேசம், புதிய தொழில், நீண்ட பயணம் போன்றவற்றைத் தவிர்க்கவும். இந்த இடங்களில் கிரகங்கள் இருந்தால் அவற்றின் தசா / புத்தி காலங்களில் முடக்கு பலன் அதிகரிக்கும் — உரிய பரிகாரம் செய்யவும்.
      </div>
    </div>
  );
};
