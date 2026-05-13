import { JathagamResult } from "@/lib/jathagam";

interface Props {
  result: JathagamResult;
}

// 60 Tamil years (சர்வஜித் = #21 in cycle, 2007-08)
const TAMIL_YEARS_60 = [
  "பிரபவ", "விபவ", "சுக்ல", "பிரமோதூத", "பிரஜோத்பத்தி", "ஆங்கீரஸ", "ஸ்ரீமுக", "பவ", "யுவ", "தாது",
  "ஈஸ்வர", "வெகுதான்ய", "பிரமாதி", "விக்ரம", "விஷு", "சித்திரபானு", "சுபானு", "தாரண", "பார்த்திப", "வ்யய",
  "ஸர்வஜித்", "ஸர்வதாரி", "விரோதி", "விக்ருதி", "கர", "நந்தன", "விஜய", "ஜய", "மன்மத", "துர்முகி",
  "ஹேவிளம்பி", "விளம்பி", "விகாரி", "சார்வரி", "பிலவ", "சுபக்ருது", "சோபக்ருது", "குரோதி", "விசுவாவசு", "பராபவ",
  "பிலவங்க", "கீலக", "சௌமிய", "சாதாரண", "விரோதிக்ருது", "பரிதாபி", "பிரமாதீச", "ஆனந்த", "ராக்ஷஸ", "நள",
  "பிங்கள", "காளயுக்தி", "சித்தார்த்தி", "ரௌத்திரி", "துன்மதி", "துந்துபி", "ருத்ரோத்காரி", "ரக்தாக்ஷி", "க்ரோதன", "அக்ஷய",
];

// Tamil months 0..11 (Mesha sun → Chithirai)
const TAMIL_MONTHS = ["சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி", "ஐப்பசி", "கார்த்திகை", "மார்கழி", "தை", "மாசி", "பங்குனி"];

const VAARAS = ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"];

const PLANET_SHORT_TA: Record<string, string> = {
  sun: "சூரி", moon: "சந்", mars: "செவ்", mercury: "புத", jupiter: "குரு",
  venus: "சுக்", saturn: "சனி", rahu: "ராகு", ketu: "கேது", ascendant: "லக்", mandi: "மாந்",
};

const SI_LAYOUT: (number | null)[][] = [
  [11, 0, 1, 2],
  [10, null, null, 3],
  [9, null, null, 4],
  [8, 7, 6, 5],
];

const renderChart = (title: string, chart: string[][], ascRasi: number) => (
  <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
              <td key={c} style={{ position: "relative", border: "1px solid #000", height: 50, width: "25%", verticalAlign: "top" }}>
                {isLagna && (
                  <div style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, borderTop: "10px solid #7a1a2b", borderRight: "10px solid transparent" }} />
                )}
                <div style={{ fontSize: 9, padding: 2, lineHeight: 1.3 }}>
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

const fmtTime = (h: number, m: number) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${pad(h12)}:${pad(m)} ${ampm}`;
};

export const JenanaKurippu = ({ result }: Props) => {
  const i = result.input;
  const birthDate = new Date(i.year, i.month - 1, i.day);
  const dayIdx = birthDate.getDay();

  // Birth letter from nakshatra+pada
  const NAK_LETTERS: string[][] = [
    ["சு", "சே", "சோ", "லா"], ["லீ", "லூ", "லே", "லோ"], ["அ", "ஈ", "உ", "ஏ"],
    ["ஓ", "வா", "வீ", "வூ"], ["வே", "வோ", "கா", "கீ"], ["கூ", "க", "ங", "ச"],
    ["கே", "கோ", "ஹா", "ஹி"], ["ஹூ", "ஹெ", "ஹோ", "டா"], ["டீ", "டூ", "டே", "டோ"],
    ["மா", "மீ", "மூ", "மே"], ["மோ", "டா", "டி", "டு"], ["டே", "டோ", "பா", "பீ"],
    ["பூ", "ஷா", "ண", "ட"], ["ரா", "ரீ", "ரூ", "ரே"], ["ரோ", "தா", "தீ", "தூ"],
    ["தே", "தோ", "நா", "நீ"], ["நூ", "ய", "யி", "யு"], ["யே", "யோ", "பா", "பீ"],
    ["பூ", "தா", "ண", "ட"], ["பே", "போ", "ரா", "ரீ"], ["ரூ", "ரே", "ரோ", "தா"],
    ["தீ", "தூ", "தே", "தோ"], ["கா", "கி", "கு", "கே"], ["கோ", "ஸா", "ஸி", "ஸு"],
    ["ஸே", "ஸோ", "தா", "தீ"], ["தூ", "தெ", "தோ", "ஞ"], ["தே", "தோ", "சா", "சீ"],
  ];
  const nakIdx = result.moon.nakshatraIndex;
  const letter = NAK_LETTERS[nakIdx]?.[result.pada - 1] || "—";

  // Sunrise local
  const offMs = i.tzOffsetHours * 3600 * 1000;
  const srL = new Date(result.panchangam.sunriseLocal.getTime() + offMs);
  const ssL = new Date(result.panchangam.sunsetLocal.getTime() + offMs);
  const srStr = fmtTime(srL.getUTCHours(), srL.getUTCMinutes());

  // Naazhikai since sunrise (1 nazhi = 24min, 1 vinaadi = 24sec)
  const birthMs = new Date(Date.UTC(i.year, i.month - 1, i.day, i.hour, i.minute) - offMs).getTime();
  const secsSinceSr = Math.max(0, (birthMs - result.panchangam.sunriseLocal.getTime()) / 1000);
  const nazhi = Math.floor(secsSinceSr / 1440);
  const vinaadi = Math.floor((secsSinceSr % 1440) / 24);

  // Day length & remaining naazhikai (sunrise → sunset = 30 nazhi nominal)
  const dayLenSec = (result.panchangam.sunsetLocal.getTime() - result.panchangam.sunriseLocal.getTime()) / 1000;
  const totalDayNazhi = dayLenSec / 1440;
  const remainingNazhi = Math.max(0, totalDayNazhi - secsSinceSr / 1440);
  const remN = Math.floor(remainingNazhi);
  const remV = Math.floor((remainingNazhi - remN) * 60);

  // Tamil month — sun's sidereal rasi at sunrise
  const sunRasi = result.sun.rasiIndex;
  const tamilMonth = TAMIL_MONTHS[sunRasi];

  // Tamil date in month — days since sun entered current rasi
  // sun moves ~0.9856°/day; degInRasi/0.9856 ≈ days into month
  const sunDegInRasi = result.sun.longitude - sunRasi * 30;
  const tamilDate = Math.floor(sunDegInRasi / 0.9856) + 1;

  // Tamil year — solar year, new year = Mesha sankranti (~April 14)
  // Reference: 1987-04-14 = "பிரபவ" (#0)
  let solarYear = i.year;
  if (i.month < 4 || (i.month === 4 && i.day < 14)) solarYear -= 1;
  const tamilYearIdx = ((solarYear - 1987) % 60 + 60) % 60;
  const tamilYear = TAMIL_YEARS_60[tamilYearIdx];

  // Ayanam — Uttarayanam (Margazhi mid → Aani mid; sun lon 270-90 trop) approx by month
  const ayanam = (i.month >= 1 && i.month <= 6) ? "உத்தராயணம்" : "தட்சிணாயணம்";

  // Dasha balance at birth
  const firstDasha = result.dashaSequence[0];
  let balanceY = 0, balanceM = 0, balanceD = 0;
  let firstLord = "—";
  if (firstDasha) {
    const remMs = firstDasha.endDate.getTime() - birthMs;
    if (remMs > 0) {
      const yrs = remMs / (1000 * 60 * 60 * 24 * 365.25);
      balanceY = Math.floor(yrs);
      balanceM = Math.floor((yrs - balanceY) * 12);
      balanceD = Math.floor(((yrs - balanceY) * 12 - balanceM) * 30.4375);
      firstLord = firstDasha.lord;
    }
  }

  const navAsc = result.navamsaPositions.find((n) => n.key === "ascendant")?.rasiIndex ?? 0;

  return (
    <div
      className="a4-sheet print-area"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "12mm 14mm",
        margin: "auto",
        background: "white",
        color: "#000",
        fontFamily: "'Latha','Tahoma',sans-serif",
        boxSizing: "border-box",
        fontSize: 13,
        lineHeight: 1.7,
      }}
    >
      <style>{`@media print { .print-area { margin: 0; box-shadow: none; } @page { size: A4 portrait; margin: 0; } .no-print { display: none !important; } body { margin: 0; } }`}</style>

      <div style={{ textAlign: "center", fontSize: 16, fontWeight: 700, color: "#7a1a2b" }}>
        தென்னாடுடைய சிவனே போற்றி
      </div>
      <div style={{ textAlign: "center", fontSize: 18, fontWeight: 800, marginTop: 4 }}>
        ஜெனன குறிப்பு
      </div>

      <div style={{ background: "#fff8ee", border: "1px solid #c9a050", padding: "8px 14px", marginTop: 10, textAlign: "center", fontSize: 13, fontStyle: "italic" }}>
        ஜனனி ஜென்ம செளக்யானம் வர்தனி குலசம்பதாம் /<br />
        பதவி பூர்வ புண்யானாம் லிக்யதே ஜென்ம பத்ரிகா //
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
        <div></div>
        <div>
          <div>ஜெனன இடம் : <b>{i.placeName}</b></div>
          <div>சூரிய உதயம் : <b>{srStr}</b></div>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div>ஜாதகர் பெயர் ; <b>{i.name}</b></div>
        <div style={{ marginLeft: 24 }}>ஆங்கிலம் வருடம் <b>{String(i.day).padStart(2, "0")}.{String(i.month).padStart(2, "0")}.{i.year}</b></div>
        <div style={{ marginLeft: 24 }}>
          தமிழ் <b>{tamilYear}</b> வருடம், <b>{tamilMonth}</b> மாதம் <b>{tamilDate}</b> ந் தேதி <b>{VAARAS[dayIdx]}</b> கிழமை
        </div>
        <div style={{ marginLeft: 24 }}>
          <b>{String(i.hour).padStart(2, "0")}</b> மணி <b>{String(i.minute).padStart(2, "0")}</b> நிமிடத்திற்கு {i.gender === "female" ? "பெண்" : "ஆண்"} குழந்தை ஜெனனம்.
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ marginLeft: 24 }}>ஜெனன நட்சத்திரம் <b>{result.nakshatraTamil}</b> &nbsp;&nbsp; பாதம் <b>{result.pada}</b></div>
        <div style={{ marginLeft: 24 }}>இராசி <b>{result.rasiTamil}</b></div>
        <div style={{ marginLeft: 24 }}>இலக்னம் <b>{result.lagnaTamil}</b></div>
        <div style={{ marginLeft: 24 }}>
          <b>{result.panchangam.paksha}</b> பக்ஷ <b>{result.panchangam.tithiTamil}</b> திதி &nbsp;&nbsp; நவாம்சம் <b>{result.navamsaPositions.find((n) => n.key === "ascendant")?.rasiTamil || "—"}</b>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12, alignItems: "start" }}>
        <div>
          <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, marginBottom: 2 }}>இராசி</div>
          {renderChart("இராசி", result.rasiChart, result.ascendant.rasiIndex)}
        </div>
        <div>
          <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, marginBottom: 2 }}>நவாம்சம்</div>
          {renderChart("அம்சம்", result.navamsaChart, navAsc)}
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.9 }}>
          <div>ஜெனன நாழிகை : <b>{nazhi} நாழி {vinaadi} வினாடி</b></div>
          <div style={{ marginTop: 4 }}>ஆதியந்த பரம நாழி</div>
          <div style={{ borderBottom: "1px dotted #555", height: 1, marginBottom: 6 }} />
          <div>சென்றது நாழிகை</div>
          <div style={{ fontWeight: 700 }}>{nazhi}.{String(vinaadi).padStart(2, "0")}</div>
          <div style={{ borderBottom: "1px dotted #555", height: 1, marginBottom: 6 }} />
          <div>இருப்பு நாழிகை</div>
          <div style={{ fontWeight: 700 }}>{remN}.{String(remV).padStart(2, "0")}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
        <div>
          <div><b>{firstLord}</b> திசை இருப்பு ; வரு <b>{balanceY}</b> மா <b>{balanceM}</b> நா <b>{balanceD}</b></div>
          <div style={{ marginTop: 8 }}>நாம நட்சத்திர எழுத்து</div>
          <div style={{ border: "1.5px solid #000", padding: "6px 18px", display: "inline-block", marginTop: 4, fontSize: 18, fontWeight: 700, minWidth: 60, textAlign: "center" }}>
            {letter}
          </div>
        </div>
        <div style={{ fontSize: 12 }}>
          <div>தந்தை ; திரு <b>{i.fatherName || "—"}</b></div>
          <div>தாய் ; திருமதி <b>{i.motherName || "—"}</b></div>
          <div>ஊர் : <b>{i.placeName}</b></div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: "#7a1a2b", fontWeight: 700, borderTop: "1px solid #7a1a2b", paddingTop: 8 }}>
        UR ASTRO SOFT — தமிழ் வேத ஜோதிட ஜாதகம்
      </div>
    </div>
  );
};
