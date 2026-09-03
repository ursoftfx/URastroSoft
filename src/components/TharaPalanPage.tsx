import { JathagamResult, NAKSHATRAS_TAMIL } from "@/lib/jathagam";

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

const cell: React.CSSProperties = { border: "1px solid #c9a050", padding: "3px 5px", fontSize: 10, verticalAlign: "top" };
const th: React.CSSProperties = { ...cell, background: "#fbe9d0", fontWeight: 700 };

const TARAS = [
  { name: "ஜென்ம தாரை", nature: "மத்திமம்", tone: "#7a1a2b", light: "#fbe9d0", palan: "உடல் நலம், மனநிலை சார்ந்த மாற்றங்கள். சொந்த முயற்சிக்கு பலன் உண்டு; பயணம் தவிர்க்கவும்.", parikaram: "ஜென்ம நட்சத்திர அதிதேவதைக்கு அர்ச்சனை." },
  { name: "சம்பத் தாரை", nature: "சுபம்", tone: "#1e8449", light: "#e9f7ef", palan: "செல்வம், பொருள் ஆதாயம், புதிய தொடக்கங்களுக்கு மிக உகந்தது.", parikaram: "லட்சுமி வழிபாடு — பலன் பெருகும்." },
  { name: "விபத் தாரை", nature: "அசுபம்", tone: "#c0392b", light: "#fdecea", palan: "இடையூறு, விபத்து, பண இழப்பு சாத்தியம். முக்கிய முடிவுகள் தவிர்க்கவும்.", parikaram: "மிருத்யுஞ்சய ஜபம், துர்கை தீபம் 9." },
  { name: "க்ஷேம தாரை", nature: "சுபம்", tone: "#0f4c75", light: "#e0efff", palan: "நலம், பாதுகாப்பு, மங்கல காரியங்கள் நிறைவேறும்.", parikaram: "விநாயகர் அர்ச்சனை." },
  { name: "பிரத்யரி தாரை", nature: "அசுபம்", tone: "#c0392b", light: "#fdecea", palan: "எதிர்ப்பு, வழக்கு, விரோதம். போட்டி அதிகரிக்கும்.", parikaram: "ஆஞ்சநேயர் வடை மாலை, சனி தீபம்." },
  { name: "சாதக தாரை", nature: "சுபம்", tone: "#1e8449", light: "#e9f7ef", palan: "தொடங்கிய காரியம் வெற்றி; வேலை, கல்வி முன்னேற்றம்.", parikaram: "முருகன் கந்த சஷ்டி கவசம்." },
  { name: "வத (நைதன) தாரை", nature: "அதி அசுபம்", tone: "#4a4a4a", light: "#e8e8e8", palan: "ஆபத்து, உடல் உபாதை, விபரீத முடிவுகள். மிகுந்த எச்சரிக்கை.", parikaram: "ருத்ர அபிஷேகம், எள் தானம், பயணம் தவிர்த்தல்." },
  { name: "மித்ர தாரை", nature: "சுபம்", tone: "#6c3483", light: "#f4ecf7", palan: "நண்பர் உதவி, கூட்டு முயற்சி வெற்றி, உறவுகள் வலுப்படும்.", parikaram: "பெருமாள் துளசி அர்ச்சனை." },
  { name: "அதி மித்ர (பரம மித்ர) தாரை", nature: "அதி சுபம்", tone: "#9a7d0a", light: "#fcf3cf", palan: "சர்வ காரிய சித்தி — திருமணம், கிரகப்பிரவேசம், புதிய தொழில் அனைத்திற்கும் சிறந்தது.", parikaram: "குரு பகவான் வழிபாடு." },
];

export const TharaPalanPage = ({ result }: Props) => {
  const janma = result.moon.nakshatraIndex;
  const rows = Array.from({ length: 27 }, (_, k) => {
    const idx = (janma + k) % 27;
    const tara = TARAS[k % 9];
    const cycle = Math.floor(k / 9) + 1;
    return { idx, tara, cycle };
  });

  return (
    <>
      <div className="a4-sheet print-area" style={sheet}>
        <div style={{ borderBottom: "2px solid #7a1a2b", paddingBottom: 5, marginBottom: 8 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#7a1a2b" }}>தாரா பலன் (9 தாரைகள்)</div>
          <div style={{ fontSize: 10, color: "#555" }}>
            ஜென்ம நட்சத்திரம்: {NAKSHATRAS_TAMIL[janma]} ({result.pada}ஆம் பாதம்) • ராசி: {result.rasiTamil}
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
          <thead>
            <tr>
              <th style={{ ...th, width: "18%" }}>தாரை</th>
              <th style={{ ...th, width: "12%" }}>தன்மை</th>
              <th style={{ ...th, width: "40%" }}>பலன்</th>
              <th style={th}>பரிகாரம்</th>
            </tr>
          </thead>
          <tbody>
            {TARAS.map((t, k) => (
              <tr key={k} style={{ background: t.light }}>
                <td style={{ ...cell, fontWeight: 700, color: t.tone, borderLeft: `3px solid ${t.tone}` }}>{k + 1}. {t.name}</td>
                <td style={{ ...cell, fontWeight: 700, color: t.tone }}>{t.nature}</td>
                <td style={cell}>{t.palan}</td>
                <td style={cell}>{t.parikaram}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ fontSize: 10.5, lineHeight: 1.6 }}>
          ஜென்ம நட்சத்திரத்திலிருந்து எண்ணி வரும் ஒவ்வொரு நட்சத்திரமும் ஒரு தாரைக்கு உரியது. 27 நட்சத்திரங்களும்
          9 தாரைகளாக மூன்று சுற்றுகளில் அமைகின்றன. நாள் நட்சத்திரம் எந்த தாரையில் வருகிறதோ அதற்கேற்ப அன்றைய
          பலன் அமையும். சுப காரியங்களுக்கு சம்பத், க்ஷேம, சாதக, மித்ர, அதிமித்ர தாரைகள் உகந்தவை.
        </div>

        <div style={{ marginTop: 8, fontSize: 9, textAlign: "center", borderTop: "1px solid #7a1a2b", paddingTop: 3, color: "#555" }}>
          தாரா பலன் — © AMMAN SOFTWARES
        </div>
      </div>

      {/* Page: 27 nakshatra tara mapping */}
      <div className="a4-sheet print-area" style={sheet}>
        <div style={{ borderBottom: "2px solid #7a1a2b", paddingBottom: 5, marginBottom: 8 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#7a1a2b" }}>27 நட்சத்திர தாரா அட்டவணை</div>
          <div style={{ fontSize: 10, color: "#555" }}>ஜென்ம நட்சத்திரம் {NAKSHATRAS_TAMIL[janma]} அடிப்படையில்</div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...th, width: "8%" }}>எண்</th>
              <th style={{ ...th, width: "20%" }}>நட்சத்திரம்</th>
              <th style={{ ...th, width: "22%" }}>தாரை</th>
              <th style={{ ...th, width: "12%" }}>சுற்று</th>
              <th style={th}>பலன் சுருக்கம்</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, k) => (
              <tr key={k} style={{ background: r.tara.light }}>
                <td style={{ ...cell, textAlign: "center", fontWeight: 700 }}>{k + 1}</td>
                <td style={{ ...cell, fontWeight: 700 }}>{NAKSHATRAS_TAMIL[r.idx]}</td>
                <td style={{ ...cell, fontWeight: 700, color: r.tara.tone, borderLeft: `3px solid ${r.tara.tone}` }}>{r.tara.name}</td>
                <td style={{ ...cell, textAlign: "center" }}>{r.cycle}</td>
                <td style={cell}>{r.tara.nature} — {r.tara.palan}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 8, fontSize: 9, textAlign: "center", borderTop: "1px solid #7a1a2b", paddingTop: 3, color: "#555" }}>
          தாரா பலன் அட்டவணை • © AMMAN SOFTWARES
        </div>
      </div>
    </>
  );
};
