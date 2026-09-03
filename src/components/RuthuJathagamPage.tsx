import { JathagamResult, NAKSHATRAS_TAMIL, RASIS_TAMIL } from "@/lib/jathagam";

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

const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;

// நாள் (weekday) ருது பலன்
const DAY_PHALA: Record<string, { palan: string; dosham: string; parikaram: string }> = {
  "ஞாயிறு": { palan: "தைரியம், தலைமைப் பண்பு; உடல் சூடு அதிகம்.", dosham: "பித்த தோஷம்", parikaram: "சூரிய நமஸ்காரம், ஆதித்ய ஹ்ருதயம் பாராயணம்." },
  "திங்கள்": { palan: "மென்மையான மனம், அழகு, செல்வ வளம்.", dosham: "மனச்சோர்வு", parikaram: "சிவ வழிபாடு, திங்கள் விரதம், வெண்பட்டு தானம்." },
  "செவ்வாய்": { palan: "வேகம், முனைப்பு; ரத்த சம்பந்தமான கவனம் தேவை.", dosham: "செவ்வாய் / ரத்த தோஷம்", parikaram: "முருகன் வழிபாடு, செவ்வாய் தோறும் கந்த சஷ்டி கவசம்." },
  "புதன்": { palan: "கல்வி, பேச்சுத் திறன், வணிக ஆற்றல்.", dosham: "நரம்பு பலவீனம்", parikaram: "விஷ்ணு சகஸ்ரநாமம், பச்சைப் பயறு தானம்." },
  "வியாழன்": { palan: "மிக உத்தமம் — நல்ல வாழ்க்கைத் துணை, மங்கல வாழ்வு.", dosham: "தோஷம் இல்லை", parikaram: "குரு பகவான் வழிபாடு, கடலைப்பருப்பு தானம்." },
  "வெள்ளி": { palan: "செல்வம், கலை ஆர்வம், அழகு, சுகபோகம்.", dosham: "தோஷம் இல்லை", parikaram: "லட்சுமி வழிபாடு, வெள்ளி விளக்கு ஏற்றுதல்." },
  "சனி": { palan: "பொறுமை; ஆனால் தாமதப் பலன்கள், உடல் சோர்வு.", dosham: "சனி தோஷம்", parikaram: "நவகிரக சனி வழிபாடு, எள் தீபம், ஏழைகளுக்கு அன்னதானம்." },
};

// திதி ருது பலன்
const tithiPhala = (i: number) => {
  const n = i % 15;
  if ([3, 7, 12, 13].includes(n)) return { palan: "ரிக்தா / விஷ்டி நாட்கள் — பொறுமை தேவை.", dosham: "திதி தோஷம்", parikaram: "துர்கை வழிபாடு, 5 விளக்கு ஏற்றுதல்." };
  if ([4, 9, 14].includes(n)) return { palan: "பூர்ணா திதி — நிறைவான, செழிப்பான பலன்.", dosham: "தோஷம் இல்லை", parikaram: "விநாயகர் அர்ச்சனை மட்டும் போதும்." };
  if ([1, 6, 11].includes(n)) return { palan: "பத்ரா திதி — மங்கலம், சுப நிகழ்வுகள்.", dosham: "தோஷம் இல்லை", parikaram: "பெருமாள் துளசி அர்ச்சனை." };
  return { palan: "நந்தா / ஜெயா திதி — வளர்ச்சி, வெற்றி.", dosham: "லேசான தோஷம்", parikaram: "நவகிரக பிரதட்சணம் 9 முறை." };
};

// நட்சத்திர ருது பலன் (27)
const NAK_PHALA: string[] = [
  "தலைமைப் பண்பு, சுயமாகச் செயல்படும் திறன்.",
  "செல்வ வளம், நல்ல திருமண வாழ்வு.",
  "கூர்மையான புத்தி; உடல் நலம் கவனிக்க.",
  "படைப்பாற்றல், அழகு, குழந்தை பாக்கியம்.",
  "பயண யோகம், மனச்சஞ்சலம் சற்று அதிகம்.",
  "தோஷம் மிகுந்தது — கண்டிப்பாக சாந்தி தேவை.",
  "மென்மை, மங்கலம், நல்ல குடும்ப வாழ்வு.",
  "பொருள் சேர்க்கை, நிலபுலன் யோகம்.",
  "ஆஸ்லேஷ தோஷம் — சர்ப்ப சாந்தி அவசியம்.",
  "அதிகார யோகம், பெருமை, தலைமை.",
  "செல்வம், நட்பு வட்டம், மகிழ்ச்சி.",
  "தர்ம சிந்தனை, தான தர்மம்.",
  "வணிக ஆற்றல், நல்ல ஆடம்பர வாழ்வு.",
  "மருத்துவம், சேவை மனப்பான்மை.",
  "மனித உறவுகளில் நிபுணத்துவம்.",
  "பொறுமை குறைவு — கோப நிவாரணம் தேவை.",
  "மங்கல வாழ்வு, நல்ல கணவன்/மனைவி யோகம்.",
  "ஆன்மிக நாட்டம், மூத்தோர் ஆசி.",
  "மூல தோஷம் — மாமியார்/மாமனார் தொடர்பில் கவனம்.",
  "நல்ல உணவு, சுகபோகம், வளமை.",
  "வெற்றி, செல்வாக்கு, அரசு அனுகூலம்.",
  "பணப்புழக்கம், சொத்து சேர்க்கை.",
  "கண்டகி — சாந்தி செய்தல் நல்லது.",
  "ஆராய்ச்சி, மறைபொருள் அறிவு.",
  "நிலையான வாழ்க்கை, பொறுமை.",
  "ஆன்மிக முதிர்ச்சி, தானம்.",
  "ரேவதி — சர்வ சுபம், மங்கலகரமான ருது.",
];

const DOSHA_NAKS = [5, 8, 15, 18, 22]; // ஆர்த்ரா, ஆயில்யம், சுவாதி, மூலம், சதயம்

export const RuthuJathagamPage = ({ result }: Props) => {
  const i = result.input;
  const d = new Date(i.year, i.month - 1, i.day, i.hour, i.minute);
  const day = result.panchangam.vaaraTamil;
  const dayInfo = DAY_PHALA[day] || DAY_PHALA["வியாழன்"];
  const tp = tithiPhala(result.panchangam.tithiIndex);
  const nakIdx = result.moon.nakshatraIndex;
  const nakDosha = DOSHA_NAKS.includes(nakIdx);

  return (
    <div className="a4-sheet print-area" style={sheet}>
      <div style={{ borderBottom: "2px solid #7a1a2b", paddingBottom: 5, marginBottom: 8 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#7a1a2b" }}>ருது ஜாதகம் & பரிகாரம்</div>
        <div style={{ fontSize: 10, color: "#555" }}>
          {i.name || "ஜாதகர்"} • {fmt(d)} • {String(i.hour).padStart(2, "0")}:{String(i.minute).padStart(2, "0")} • {i.placeName || ""}
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
        <tbody>
          <tr>
            <td style={th}>ருது நாள்</td><td style={cell}>{day}</td>
            <td style={th}>திதி</td><td style={cell}>{result.panchangam.paksha} {result.panchangam.tithiTamil}</td>
          </tr>
          <tr>
            <td style={th}>நட்சத்திரம்</td><td style={cell}>{NAKSHATRAS_TAMIL[nakIdx]} — {result.pada}ஆம் பாதம்</td>
            <td style={th}>சந்திர ராசி</td><td style={cell}>{result.rasiTamil}</td>
          </tr>
          <tr>
            <td style={th}>லக்னம்</td><td style={cell}>{result.lagnaTamil}</td>
            <td style={th}>யோகம் / கரணம்</td><td style={cell}>{result.panchangam.yogaTamil} / {result.panchangam.karanaTamil}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: 12, fontWeight: 700, color: "#7a1a2b", margin: "6px 0 3px" }}>ருது கால பலன்கள்</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...th, width: "16%" }}>அங்கம்</th>
            <th style={{ ...th, width: "44%" }}>பலன்</th>
            <th style={{ ...th, width: "18%" }}>தோஷம்</th>
            <th style={th}>பரிகாரம்</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cell}>நாள் ({day})</td>
            <td style={cell}>{dayInfo.palan}</td>
            <td style={cell}>{dayInfo.dosham}</td>
            <td style={cell}>{dayInfo.parikaram}</td>
          </tr>
          <tr>
            <td style={cell}>நட்சத்திரம்</td>
            <td style={cell}>{NAK_PHALA[nakIdx]}</td>
            <td style={cell}>{nakDosha ? "நட்சத்திர தோஷம்" : "தோஷம் இல்லை"}</td>
            <td style={cell}>{nakDosha ? "ஜென்ம நட்சத்திர சாந்தி ஹோமம், நட்சத்திர அதிதேவதைக்கு அர்ச்சனை." : "ஜென்ம நட்சத்திர நாளில் தீப ஆராதனை."}</td>
          </tr>
          <tr>
            <td style={cell}>திதி</td>
            <td style={cell}>{tp.palan}</td>
            <td style={cell}>{tp.dosham}</td>
            <td style={cell}>{tp.parikaram}</td>
          </tr>
          <tr>
            <td style={cell}>லக்னம்</td>
            <td style={cell}>{result.lagnaTamil} லக்னத்தில் ருது நிகழ்வதால் உடல் அமைப்பு, குணநலன் இந்த ராசிக்குரிய தன்மை பெறும்.</td>
            <td style={cell}>—</td>
            <td style={cell}>லக்னாதிபதிக்குரிய கிரக ஸ்தலத்தில் அர்ச்சனை.</td>
          </tr>
          <tr>
            <td style={cell}>சந்திர ராசி</td>
            <td style={cell}>{result.rasiTamil} ராசி — மனநிலை, ஆரோக்கியம் இந்த ராசி அதிபதியின் தசையில் மேம்படும்.</td>
            <td style={cell}>—</td>
            <td style={cell}>சந்திரனுக்கு பால் அபிஷேகம், திங்கள் விரதம்.</td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: 12, fontWeight: 700, color: "#7a1a2b", margin: "8px 0 3px" }}>பொது ருது சாந்தி பரிகாரங்கள்</div>
      <ol style={{ fontSize: 10, lineHeight: 1.6, paddingLeft: 16, margin: 0 }}>
        <li>ருது நிகழ்ந்த 11, 16 அல்லது 21ஆம் நாளில் புண்ணியாஹவாசனம் செய்தல்.</li>
        <li>ஜென்ம நட்சத்திர அதிதேவதைக்கு அர்ச்சனை மற்றும் நட்சத்திர பரிகார ஸ்தலத்திற்குச் செல்லுதல்.</li>
        <li>துர்கை அம்மனுக்கு 9 நாட்கள் விளக்கு ஏற்றி, சிவப்பு மலர் சமர்ப்பணம்.</li>
        <li>ருது தோஷம் இருப்பின் நவகிரக சாந்தி ஹோமம் மற்றும் அன்னதானம்.</li>
        <li>சுமங்கலிப் பெண்களுக்கு மஞ்சள், குங்குமம், வளையல் தானம்.</li>
      </ol>

      <div style={{ marginTop: 8, fontSize: 9, textAlign: "center", borderTop: "1px solid #7a1a2b", paddingTop: 3, color: "#555" }}>
        ருது ஜாதகம் — {RASIS_TAMIL[result.moon.rasiIndex]} ராசி • © AMMAN SOFTWARES
      </div>
    </div>
  );
};
