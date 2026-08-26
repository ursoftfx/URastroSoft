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

// தனிஷ்ட பஞ்சமி — அவிட்டம் (23) முதல் ரேவதி (27) வரை 5 நட்சத்திரங்கள்
const PANCHAMI_NAKS = [22, 23, 24, 25, 26]; // அவிட்டம், சதயம், பூரட்டாதி, உத்திரட்டாதி, ரேவதி

const PANCHAMI_DETAIL: Record<number, { palan: string; theevu: string; parikaram: string }> = {
  22: { palan: "அவிட்டம் — தனிஷ்ட பஞ்சமியின் தலைமை நட்சத்திரம். சொத்து, குடும்ப ஒற்றுமையில் இடையூறு; திருமணம் தாமதம் ஏற்படலாம்.", theevu: "அதிக தோஷம்", parikaram: "வசு தேவதைகளுக்கு தர்ப்பணம், 5 சனிக்கிழமை எள் தீபம், திருநள்ளாறு / திருவெண்காடு தரிசனம்." },
  23: { palan: "சதயம் — உடல்நலம், மனஅழுத்தம் சார்ந்த சிரமங்கள்; உறவுகளில் பிரிவு ஏற்படலாம்.", theevu: "நடுத்தர தோஷம்", parikaram: "வருண ஜபம், நீர்நிலைக் கரையில் தீப ஆராதனை, வைத்தீஸ்வரன் கோயில் வழிபாடு." },
  24: { palan: "பூரட்டாதி — சொந்த ஊர் விட்டு விலகுதல், பொருள் இழப்பு சாத்தியம்.", theevu: "நடுத்தர தோஷம்", parikaram: "அஜ ஏகபாத வழிபாடு, ருத்ர ஜபம், சிவாலயத்தில் 5 திங்கள் அபிஷேகம்." },
  25: { palan: "உத்திரட்டாதி — பெரும்பாலும் சுபம்; பஞ்சமி தோஷ தொடர்பு லேசானது.", theevu: "லேசான தோஷம்", parikaram: "அஹிர்புத்னிய வழிபாடு, நாக பிரதிஷ்டைக்கு பால் அபிஷேகம்." },
  26: { palan: "ரேவதி — தோஷ முடிவு நட்சத்திரம். பயணம், வெளிநாட்டு தொடர்பில் தடைகள் நீங்கும்.", theevu: "மிகக் குறைவு", parikaram: "பூஷா தேவதை வழிபாடு, பசுவுக்கு அகத்திக்கீரை தானம்." },
};

const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;

export const DhanishtaPanchamiPage = ({ result }: Props) => {
  const i = result.input;
  const d = new Date(i.year, i.month - 1, i.day, i.hour, i.minute);
  const nakIdx = result.moon.nakshatraIndex;
  const affected = PANCHAMI_NAKS.includes(nakIdx);
  const pada = result.pada;
  const isTithiPanchami = result.panchangam.tithiIndex % 15 === 4;

  // தீவிரம்: அவிட்டம் 3,4 பாதம் + பஞ்சமி திதி = முழு தோஷம்
  const severity = !affected
    ? "தோஷம் இல்லை"
    : nakIdx === 22 && pada >= 3
      ? "முழு (பூரண) தனிஷ்ட பஞ்சமி தோஷம்"
      : isTithiPanchami
        ? "தீவிர தோஷம் (பஞ்சமி திதி சேர்க்கை)"
        : "பகுதி தோஷம்";

  return (
    <div className="a4-sheet print-area" style={sheet}>
      <div style={{ borderBottom: "2px solid #7a1a2b", paddingBottom: 5, marginBottom: 8 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#7a1a2b" }}>தனிஷ்ட பஞ்சமி — விவரம் & பரிகாரங்கள்</div>
        <div style={{ fontSize: 10, color: "#555" }}>
          {i.name || "ஜாதகர்"} • {fmt(d)} • ஜென்ம நட்சத்திரம்: {NAKSHATRAS_TAMIL[nakIdx]} ({pada}ஆம் பாதம்)
        </div>
      </div>

      <div
        style={{
          border: `2px solid ${affected ? "#c0392b" : "#1e8449"}`,
          background: affected ? "#fdecea" : "#e9f7ef",
          padding: "6px 8px",
          borderRadius: 4,
          marginBottom: 8,
          fontSize: 11,
          fontWeight: 700,
          color: affected ? "#7a1a2b" : "#145a32",
        }}
      >
        தோஷ நிலை: {severity}
        {affected && <span style={{ fontWeight: 400 }}> — கீழ்க்கண்ட பரிகாரங்கள் செய்யப்பட வேண்டும்.</span>}
      </div>

      <div style={{ fontSize: 11, lineHeight: 1.6, marginBottom: 8 }}>
        அவிட்டம் (தனிஷ்டா) நட்சத்திரத்தின் இரண்டாம் பாதி முதல் ரேவதி வரை உள்ள ஐந்து நட்சத்திரங்கள் <b>பஞ்சக</b> எனவும்,
        இதன் தொடக்கமான தனிஷ்டாவை மையமாகக் கொண்டு <b>தனிஷ்ட பஞ்சமி</b> எனவும் அழைக்கப்படுகிறது. இக்காலத்தில்
        பிறத்தல் / மங்கல நிகழ்வுகள் நடத்துதல் தடை எனச் சாஸ்திரம் கூறுகிறது. பரிகாரம் செய்தால் தோஷம் நீங்கும்.
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: "#7a1a2b", margin: "6px 0 3px" }}>பஞ்சக நட்சத்திரங்களும் பலனும்</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...th, width: "14%" }}>நட்சத்திரம்</th>
            <th style={{ ...th, width: "42%" }}>பலன்</th>
            <th style={{ ...th, width: "14%" }}>தீவிரம்</th>
            <th style={th}>பரிகாரம்</th>
          </tr>
        </thead>
        <tbody>
          {PANCHAMI_NAKS.map((n) => {
            const info = PANCHAMI_DETAIL[n];
            const mine = n === nakIdx;
            return (
              <tr key={n} style={{ background: mine ? "#fcf3cf" : "#fff" }}>
                <td style={{ ...cell, fontWeight: 700 }}>{NAKSHATRAS_TAMIL[n]}{mine ? " ★" : ""}</td>
                <td style={cell}>{info.palan}</td>
                <td style={cell}>{info.theevu}</td>
                <td style={cell}>{info.parikaram}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ fontSize: 12, fontWeight: 700, color: "#7a1a2b", margin: "8px 0 3px" }}>தனிஷ்ட பஞ்சமி பரிகாரங்கள்</div>
      <ol style={{ fontSize: 10.5, lineHeight: 1.65, paddingLeft: 16, margin: 0 }}>
        <li>பிறந்த 27ஆம் நாள் அல்லது ஜென்ம நட்சத்திர நாளில் <b>தனிஷ்ட பஞ்சமி சாந்தி ஹோமம்</b> செய்தல்.</li>
        <li>அஷ்ட வசுக்களுக்கு (தனிஷ்டா அதிதேவதை) தர்ப்பணம் மற்றும் திலஹோமம்.</li>
        <li>5 நட்சத்திரங்களைக் குறிக்கும் விதமாக <b>5 நெய் தீபங்கள்</b> சிவாலயத்தில் 5 வாரங்கள் ஏற்றுதல்.</li>
        <li>ருத்ர ஜபம் / மிருத்யுஞ்சய ஜபம் 5 ஆவர்த்தி.</li>
        <li>திருநள்ளாறு (சனி), வைத்தீஸ்வரன் கோயில் (செவ்வாய்) தரிசனம்.</li>
        <li>பஞ்ச தானம் — அரிசி, எள், துணி, வெல்லம், தட்சிணை ஐந்து பேருக்கு வழங்குதல்.</li>
        <li>தோஷ காலத்தில் மங்கல காரியங்கள், கிரகப்பிரவேசம், பயணம் தவிர்த்தல்.</li>
      </ol>

      <div style={{ marginTop: 10, fontSize: 9, textAlign: "center", borderTop: "1px solid #7a1a2b", paddingTop: 3, color: "#555" }}>
        தனிஷ்ட பஞ்சமி பரிகார பதிவு • © ASTRO UR
      </div>
    </div>
  );
};
