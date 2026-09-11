import { JathagamResult, RASIS_TAMIL, NAKSHATRAS_TAMIL, NAKSHATRA_LORDS_TAMIL, computeJathagam } from "@/lib/jathagam";
import {
  padamTemple, thithiTemple, yogamTemple, karanamTemple,
  NAVAGRAHA_TEMPLES, THITHI_TEMPLES, YOGAM_TEMPLES, KARANAM_TEMPLES,
} from "@/lib/temples";
import { DashaTableA4 } from "@/components/DashaTableA4";
import { suniyaRasisFor } from "@/lib/thithi-suniyam";

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

// பிருகு நந்தி நாடி தொடர் (BNN sequence)
// லக்னம் முதல் 12 ராசி வரிசையில் கிரகங்களை ஒரே தொடராக அமைக்கிறது.
export const buildBnnSequence = (result: JathagamResult): string[] => {
  const seq: string[] = [];
  const lagnaIdx = result.ascendant.rasiIndex;

  for (let k = 0; k < 12; k++) {
    const rIdx = (lagnaIdx + k) % 12;

    const ps = result.planets
      .filter((p) => p.rasiIndex === rIdx)
      .sort((a, b) => {
        const aDeg = ((Number(a.longitude) % 30) + 30) % 30;
        const bDeg = ((Number(b.longitude) % 30) + 30) % 30;
        return aDeg - bDeg;
      });

    const parts: string[] = [];

    if (k === 0) parts.push("லக்");

    parts.push(
      ...ps.map(
        (p) =>
          `${PLANET_SHORT_TA[p.key] || p.nameTamil}${p.retrograde ? "(வ)" : ""}`
      )
    );

    if (parts.length > 0) {
      seq.push(`${parts.join("·")}(${RASIS_TAMIL[rIdx]})`);
    }
  }

  return seq;
};

export const BnnSequenceBlock = ({ result }: Props) => {
  const seq = buildBnnSequence(result);

  return (
    <div style={{ marginTop: 6 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textAlign: "center",
          background: "#fbe9d0",
          padding: "2px 0",
          border: "1px solid #c9a050",
        }}
      >
        பிருகு நந்தி நாடி தொடர் (BNN Sequence)
      </div>

      <div
        style={{
          border: "1px solid #c9a050",
          borderTop: "none",
          background: "#fffdf7",
          padding: "6px 8px",
          fontSize: 11,
          fontWeight: 800,
          lineHeight: 1.9,
          color: "#1a3a8a",
          textAlign: "center",
        }}
      >
        {seq.length > 0
          ? seq.map((seg, idx) => (
              <span key={`${seg}-${idx}`}>
                <span
                  style={{
                    background: idx % 2 ? "#eef4ff" : "#fff3e0",
                    border: "1px solid #d8b878",
                    borderRadius: 10,
                    padding: "1px 7px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {seg}
                </span>
                {idx < seq.length - 1 && (
                  <span
                    style={{
                      color: "#7a1a2b",
                      margin: "0 4px",
                      fontWeight: 900,
                    }}
                  >
                    →
                  </span>
                )}
              </span>
            ))
          : <span style={{ color: "#777" }}>—</span>}
      </div>

      <div
        style={{
          fontSize: 8.5,
          color: "#555",
          fontWeight: 700,
          marginTop: 2,
          textAlign: "center",
        }}
      >
        லக்னம் முதல் ராசி வரிசையில் கிரகங்கள் அடுக்கப்பட்டுள்ளன — (வ) =
        வக்ர கதி. இத்தொடரின் அடிப்படையில் கிரக சேர்க்கை / 2-ம் / 12-ம்
        பலன்கள் நாடி முறைப்படி வாசிக்கப்படும்.
      </div>
    </div>
  );
};

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
  planetPositions: any[] = [],
  transitChart?: string[][],
  transitPositions: any[] = [],
  suniyaRasis: number[] = []
) => {
  // Birth planet lookup: rasiChart contains only keys,
  // while longitude/rasiIndex are stored in planetPositions.
  const planetMap: Record<string, any> = {};

  for (const p of planetPositions || []) {
    if (p && p.key) {
      planetMap[p.key] = p;
    }
  }

  // Return the degree INSIDE the planet's current Rasi.
  const getDegree = (planet: any): string => {
  if (!planet) return "";

  const longitude = Number(planet.longitude ?? planet.lon);
  const rasiIndex = Number(planet.rasiIndex ?? planet.rasiIdx);

  if (!Number.isFinite(longitude) || !Number.isFinite(rasiIndex)) {
    return "";
  }

  let degree = longitude - rasiIndex * 30;
  degree = ((degree % 30) + 30) % 30;

  const deg = Math.floor(degree);
  const min = Math.floor((degree - deg) * 60);

  return `${String(deg).padStart(2, "0")}°${String(min).padStart(2, "0")}'`;
};

  const getBirthDegree = (key: string): string => {
    return getDegree(planetMap[key]);
  };

  // Transit planet lookup.
  const transitMap: Record<string, any> = {};

  for (const p of transitPositions || []) {
    if (p && p.key) {
      transitMap[p.key] = p;
    }
  }

  const getTransitDegree = (key: string): string => {
    return getDegree(transitMap[key]);
  };

  return (
    <table
      className="w-full"
      style={{
        borderCollapse: "collapse",
        tableLayout: "fixed",
        width: "100%",
      }}
    >
      <tbody>
        {SI_LAYOUT.map((row, r) => (
          <tr key={r}>
            {row.map((rasiIdx, c) => {
              // Center area of South Indian chart.
              if (rasiIdx === null) {
                if (r === 1 && c === 1) {
                  return (
                    <td
                      key={c}
                      colSpan={2}
                      rowSpan={2}
                      style={{
                        border: "1px solid #000",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {title}
                      </div>

                      {transitChart && (
                        <div
                          style={{
                            fontSize: 8,
                            fontWeight: 400,
                            color: "#0a6b2c",
                            marginTop: 4,
                            lineHeight: 1.2,
                          }}
                        >
                          மேல்: ஜென்மம்
                          <br />
                          கீழ் (பச்சை): கோசாரம்
                        </div>
                      )}
                    </td>
                  );
                }

                return null;
              }

              const planets = chart[rasiIdx] || [];

              const transits = transitChart
                ? (transitChart[rasiIdx] || []).filter(
                    (p) => p !== "ascendant" && p !== "mandi"
                  )
                : [];

              const isLagna = rasiIdx === ascRasi;
              const isSuniya = suniyaRasis.includes(rasiIdx);

              return (
                <td
                  key={c}
                  style={{
                    position: "relative",
                    border: "1px solid #000",
                    height: 60,
                    width: "25%",
                    background: isSuniya ? "#fdecec" : undefined,
                    verticalAlign: "top",
                    overflow: "hidden",
                  }}
                >
                  {/* Lagna marker */}
                  {isLagna && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: 0,
                        height: 0,
                        borderTop: "10px solid #7a1a2b",
                        borderRight: "10px solid transparent",
                        zIndex: 3,
                      }}
                    />
                  )}

                  {/* திதி சூன்ய ராசி marker */}
                  {isSuniya && (
                    <div
                      style={{
                        position: "absolute",
                        top: 45,
                        right: 1,
                        background: "#c0262c",
                        color: "#fff",
                        fontSize: 7,
                        fontWeight: 800,
                        padding: "0 3px",
                        borderRadius: 3,
                        lineHeight: 1.5,
                        zIndex: 4,
                      }}
                    >
                      தி.சூ
                    </div>
                  )}

                  {/* Birth planets */}
                  <div
                    style={{
                      fontSize: 10,
                      padding: 3,
                      paddingBottom: transitChart ? 16 : 3,
                      lineHeight: 1.15,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {planets.map((key) => {
                      const name = PLANET_SHORT_TA[key] || key;
                      const planet = planetMap[key];
                      const degree = getBirthDegree(key);

                      return (
                        <div
                          key={key}
                          style={{
                            display: "block",
                            whiteSpace: "nowrap",
                            fontWeight: 700,
                          }}
                        >
                          <span>{name}</span>

                          {planet?.retrograde && (
                            <span> (வ)</span>
                          )}

                          {degree && (
                            <span
                              style={{
                                marginLeft: 3,
                                fontSize: 10,
                                color: "#7a1a2b",
                                fontWeight: 600,
                              }}
                            >
                              {degree}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Transit planets */}
                  {transitChart && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        borderTop: "1px dashed #0a6b2c",
                        background: "#e9f7ee",
                        fontSize: 7.5,
                        padding: "2px 3px",
                        color: "#0a6b2c",
                        fontWeight: 700,
                        lineHeight: 1.15,
                        minHeight: 13,
                        overflow: "hidden",
                        zIndex: 2,
                      }}
                    >
                      {transits.length > 0
                        ? transits.map((key) => {
                            const name =
                              PLANET_SHORT_TA[key] || key;
                            const degree = getTransitDegree(key);

                            return (
                              <span
                                key={key}
                                style={{
                                  display: "inline-block",
                                  marginRight: 4,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {name}
                                {degree && (
                                  <span
                                    style={{
                                      marginLeft: 2,
                                      fontSize: 6.5,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {degree}
                                  </span>
                                )}
                              </span>
                            );
                          })
                        : "\u00A0"}
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

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
  const letter = NAK_LETTERS[nakIdx] || [];  
  const formattedLetters = letter.join(", ");
// --------------------------------------------------
// CURRENT DASHA
// --------------------------------------------------

const now = new Date();

const currentDashaLord = result.currentDasha.lord;

const cdStart = fmtDateLong(
  result.currentDasha.startDate
);

const cdEnd = fmtDateLong(
  result.currentDasha.endDate
);


// --------------------------------------------------
// VIMSHOTTARI DASHA YEARS
// --------------------------------------------------

const DASA_YEARS: Record<string, number> = {
  கேது: 7,
  சுக்கிரன்: 20,
  சூரியன்: 6,
  சந்திரன்: 10,
  செவ்வாய்: 7,
  ராகு: 18,
  குரு: 16,
  சனி: 19,
  புதன்: 17,
};


// --------------------------------------------------
// DASHA ORDER
// --------------------------------------------------

const DASA_ORDER = [
  "கேது",
  "சுக்கிரன்",
  "சூரியன்",
  "சந்திரன்",
  "செவ்வாய்",
  "ராகு",
  "குரு",
  "சனி",
  "புதன்",
];


// --------------------------------------------------
// FIND CURRENT PUTI / ANTARDASHA
// --------------------------------------------------

const getPuthi = (
  dashaLord: string,
  dashaStart: Date,
  dashaEnd: Date,
  date: Date
) => {
  const dashaIndex = DASA_ORDER.indexOf(dashaLord);

  if (dashaIndex === -1) {
    return null;
  }

  const totalDashaMs =
    dashaEnd.getTime() -
    dashaStart.getTime();

  if (totalDashaMs <= 0) {
    return null;
  }

  // புத்தி வரிசை:
  // தசை அதிபதியிலிருந்து தொடங்கும்
  const puthiOrder = Array.from(
    { length: DASA_ORDER.length },
    (_, index) =>
      DASA_ORDER[
        (dashaIndex + index) %
          DASA_ORDER.length
      ]
  );

  let puthiStart = new Date(dashaStart);

  for (const puthiLord of puthiOrder) {
    const puthiYears =
      DASA_YEARS[puthiLord];

    if (!puthiYears) {
      continue;
    }

    // புத்தி காலம்
    // = மகாதசை மொத்த காலம் × புத்தி வருடம் / 120
    const puthiMs =
      totalDashaMs *
      (puthiYears / 120);

    const puthiEnd = new Date(
      puthiStart.getTime() +
        puthiMs
    );

    if (
      date.getTime() >=
        puthiStart.getTime() &&
      date.getTime() <
        puthiEnd.getTime()
    ) {
      return {
        lord: puthiLord,
        startDate: new Date(puthiStart),
        endDate: new Date(puthiEnd),
      };
    }

    puthiStart = puthiEnd;
  }

  return null;
};


// --------------------------------------------------
// GET CURRENT PUTI
// --------------------------------------------------

const currentPuthi = getPuthi(
  currentDashaLord,
  result.currentDasha.startDate,
  result.currentDasha.endDate,
  now
);


// --------------------------------------------------
// CURRENT PUTI DETAILS
// --------------------------------------------------

const puthiLord =
  currentPuthi?.lord ?? "—";

const puthiStart =
  currentPuthi
    ? fmtDateLong(
        currentPuthi.startDate
      )
    : "—";

const puthiEnd =
  currentPuthi
    ? fmtDateLong(
        currentPuthi.endDate
      )
    : "—";

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
  
const rasiDegree = (planet: any) => {
  const degree = planet.lon - planet.rasiIdx * 30;
  return dms(degree);
};

// திதி சூன்ய ராசிகள்
const suniyaRasis = suniyaRasisFor(
  Number(result.panchangam?.tithiIndex ?? 0)
);

  // Current gochara (transit) chart for today at birth place
  let transitChart: string[][] | undefined;
  let transitPositions: any[] = [];
  let transitDateStr = "";
  try {
    const now = new Date();
    const transit = computeJathagam({
      name: "gochara",
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      latitude: i.latitude,
      longitude: i.longitude,
      tzOffsetHours: i.tzOffsetHours,
      placeName: i.placeName,
    });
    transitChart = transit.rasiChart;
    transitPositions = transit.planets || [];
    transitDateStr = fmtDate(now);
  } catch {}

  return (
    <>
    <div className="a4-sheet print-area" style={{ width: "210mm", height: "297mm", padding: "8mm 10mm", margin: "auto", background: "white", color: "#000", fontFamily: "'Latha','Tahoma',sans-serif", boxSizing: "border-box", overflow: "hidden" }}>
      <style>{`@media print { .print-area { margin: 0; box-shadow: none; height: 297mm; } @page { size: A4 portrait; margin: 0; } .no-print { display: none !important; } body { margin: 0; } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #7a1a2b", paddingBottom: 6 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1.5, color: "#7a1a2b" }}>AMMAN SOFTWARES</div>
          <div style={{ fontSize: 14, color: "#555" }}><b>அம்மன் ஜோதிட நிலையம், 93424 41467</b></div>
        </div>
        <div style={{ textAlign: "right", fontSize: 10, color: "#555" }}>
          <div>{i.name}</div>
          <div>{fmtDate(new Date())}</div>
        </div>
      </div>

      {/* Personal */}
      <table style={{ width: "100%", marginTop: 8, fontSize: 11, borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ padding: "2px 4px", width: "18%" }}><b>பெயர்</b></td>
            <td style={{ padding: "2px 4px", width: "32%" }}>: <b>{i.name}</b></td>
            <td style={{ padding: "2px 4px", width: "18%" }}><b>பாலினம்</b></td>
            <td style={{ padding: "2px 4px", width: "32%" }}>: <b>{i.gender || "—"}</b></td>
          </tr>
          <tr>
            <td style={{ padding: "2px 4px" }}><b>பிறந்த தேதி</b></td>
            <td style={{ padding: "2px 4px" }}>: <b>{fmtDate(birthDate)} ({VAARAS[dayIdx]})</b></td>
            <td style={{ padding: "2px 4px" }}><b>தந்தை பெயர்</b></td>
            <td style={{ padding: "2px 4px" }}>: <b>{i.fatherName || "—"}</b></td>
          </tr>
          <tr>
            <td style={{ padding: "2px 4px" }}><b>பிறந்த நேரம்</b></td>
            <td style={{ padding: "2px 4px" }}>: <b>{fmtTimeStr(i.hour, i.minute)}</b></td>
            <td style={{ padding: "2px 4px" }}><b>தாய் பெயர்</b></td>
            <td style={{ padding: "2px 4px" }}>: <b>{i.motherName || "—"}</b></td>
          </tr>
          <tr>
            <td style={{ padding: "2px 4px" }}><b>பிறந்த ஊர்</b></td>
            <td style={{ padding: "2px 4px" }}>: <b>{i.placeName}</b></td>
            <td style={{ padding: "2px 4px" }}><b>நேர மண்டலம்</b></td>
            <td style={{ padding: "2px 4px" }}>: <b>{tzStr}</b></td>
          </tr>
          </tbody>
      </table>

      {/* Panchangam summary */}
            <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
        <tbody>
          <tr>
            <td style={{ padding: "3px 6px", width: "25%" }}><b>ஜென்ம ராசி</b></td>
            <td style={{ padding: "3px 6px", width: "25%" }}>: <b> {result.rasiTamil}</b></td>
            <td style={{ padding: "3px 6px", width: "25%" }}><b>ஜென்ம லக்னம்</b></td>
            <td style={{ padding: "3px 6px", width: "25%" }}>: <b> {result.lagnaTamil}</b></td>
          </tr>
          <tr>
            <td style={{ padding: "3px 6px" }}><b>ஜென்ம நட்சத்திரம்</b></td>
            <td style={{ padding: "3px 6px" }}>: <b>{result.nakshatraTamil} - பாதம் {result.pada}</b></td>
            <td style={{ padding: "3px 6px" }}><b>நட்சத்திர ஹோரை</b></td>
            <td style={{ padding: "3px 6px" }}>: <b>{horai}</b></td>
          </tr>
          <tr>
            <td style={{ padding: "3px 6px" }}><b>யோகம்</b></td>
            <td style={{ padding: "3px 6px" }}>: <b>{result.panchangam.yogaTamil}</b></td>
            <td style={{ padding: "3px 6px" }}><b>அயனம்</b></td>
            <td style={{ padding: "3px 6px" }}>: <b>{dayIdx >= 0 && (i.month >= 1 && i.month <= 6 ? "உத்தராயணம்" : "தட்சிணாயணம்")}</b></td>
          </tr>
          <tr>
            <td style={{ padding: "3px 6px" }}><b>கரணம்</b></td>
            <td style={{ padding: "3px 6px" }}>: <b>{result.panchangam.karanaTamil}</b></td>
            <td style={{ padding: "3px 6px" }}><b>வாரம்</b></td>
            <td style={{ padding: "3px 6px" }}>: <b>{result.panchangam.vaaraTamil}</b></td>
          </tr>
          <tr>
            <td style={{ padding: "3px 6px" }}><b>திதி</b></td>
            <td style={{ padding: "3px 6px" }}>: <b>{result.panchangam.tithiTamil} ({result.panchangam.paksha})</b></td>
            <td style={{ padding: "3px 6px" }}><b>யோகி/அவயோகி</b></td>
            <td style={{ padding: "3px 6px" }}>: <b>{yogi.yogiNak} ({yogi.yogiLord})/{yogi.avayogiNak} ({yogi.avayogiLord})</b></td>
          </tr>
          
        </tbody>
      </table>
   {/* Charts side by side (Rasi shows gochara transits outside natal planets) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textAlign: "center", marginBottom: 2 }}>
            ராசி கட்டம் (D-1) + கோசாரம் {transitDateStr && <span style={{ color: "#0a6b2c", fontSize: 12, fontWeight: 400 }}>({transitDateStr})</span>}
          </div>
          
          {renderChart(
            "ராசி + கோசாரம்",
            result.rasiChart,
            result.ascendant.rasiIndex,
            result.planets,
            transitChart,
            transitPositions,
            suniyaRasis,
          )}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textAlign: "center", marginBottom: 2 }}>நவாம்சம் (D-9)</div>
          {renderChart(
            "நவாம்சம்",
            result.navamsaChart,
            navAsc,
            []
          )}
        </div>
      </div>

      {/* BNN Sequence */}
      <BnnSequenceBlock result={result} />

      {/* Planet positions table - full width below charts */}
      <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, textAlign: "center", background: "#fbe9d0", padding: "3px 0", border: "1px solid #c9a050" }}>
        <b>கிரக நிலைகள்</b> 
              </div>
      <table style={{ width: "100%", fontSize: 9.5, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
        <thead>
          <tr style={{ background: "#fff8ee" }}>
            <th style={{ border: "1px solid #c9a050", padding: 3, textAlign: "left" }}>கிரகம்</th>
            <th style={{ border: "1px solid #c9a050", padding: 3 }}>நட்சத்திரம்</th>
            <th style={{ border: "1px solid #c9a050", padding: 3 }}>பாதம்</th>
            <th style={{ border: "1px solid #c9a050", padding: 3 }}>ராசி</th>
            <th style={{ border: "1px solid #c9a050", padding: 3 }}>நவாம்சம்</th>
            <th style={{ border: "1px solid #c9a050", padding: 3 }}>நிலை</th>
            <th style={{ border: "1px solid #c9a050", padding: 3 }}>பாகை</th>
            <th style={{ border: "1px solid #c9a050", padding: 3 }}>அதிபதி</th>
            
            
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => {
            const navKey = (r as any).key;
            const navPos = result.navamsaPositions.find((n) => n.key === navKey);
            const athipathi = RASI_LORD_TA[r.rasiIdx];
            const nilai = (r.key === "ascendant" || r.key === "mandi") ? "—" : dignityLabel(r.key, r.rasiIdx);
            return (
                   
              <tr key={idx} style={{ fontWeight: 700 }}>
                <td style={{ border: "1px solid #c9a050", padding: 3 }}>{r.label}{r.retro ? " (வ)" : ""}</td>
                <td style={{ border: "1px solid #c9a050", padding: 3 }}>{r.nak}</td>
                <td style={{ border: "1px solid #c9a050", padding: 3, textAlign: "center" }}>{r.pada}</td>
                <td style={{ border: "1px solid #c9a050", padding: 3 }}>{RASIS_TAMIL[r.rasiIdx]}</td>
                <td style={{ border: "1px solid #c9a050", padding: 3 }}>{navPos ? RASIS_TAMIL[navPos.rasiIndex] : "—"}</td>
                <td style={{ border: "1px solid #c9a050", padding: 3 }}>{nilai}</td>
                <td style={{ border: "1px solid #c9a050", padding: 3 }}>{dms(r.lon - r.rasiIdx * 30)}</td>
                <td style={{ border: "1px solid #c9a050", padding: 3 }}>{athipathi}</td>
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
      <div style={{ marginTop: 10, fontSize: 12, padding: "2px 4px" }}><b>நட்சத்திர எழுத்து:{formattedLetters || "—"}</b> </div>
            <div style={{ fontSize: 12, padding: "2px 4px" }}><b>ஜனன கால இருப்பு திசை</b> : <b>{balanceStr}</b></div>
            <div style={{ fontSize: 12, padding: "2px 4px" }}>
  <b>நடப்பு தசா-புத்தி முடிவு</b> : <b>{currentDashaLord} தசை - {puthiLord} புத்தி</b> : <b>{cdStart}</b> - <b>{cdEnd}</b>

                               
</div>

      {/* Footer */}
      <div style={{ marginTop: 8, fontSize: 9, textAlign: "center", borderTop: "1px solid #7a1a2b", paddingTop: 4, color: "#555" }}>
         © AMMAN SOFTWARES
      </div>
    </div>

    {/* ===== PAGE 2: 108 Padam Location + Aspect (Parvai) Chart ===== */}
    <PadamAspectPage result={result} />

{/* ===== PAGE 4: திசை அடிப்படையிலான கிரக நிலை ===== */}
    <DirectionPage result={result} />

    
    {/* ===== PAGE 3: பரிகார தலங்கள் (Temples) ===== */}
    <TemplesPage result={result} />

        {/* ===== PAGE 6+: தசா – புத்தி – அந்தரம் அட்டவணை ===== */}
    <DashaTableA4 result={result} />

    </>
      
  );
};

// ---------- Page 4: Direction-based planet placement ----------
const DIRECTIONS = [
  { key: "north", label: "வடக்கை", rasis: [3, 7, 11], flow: "down" as const },   // water
  { key: "west", label: "மேற்கை", rasis: [2, 6, 10], flow: "up" as const },      // air
  { key: "east", label: "கிழக்கை", rasis: [0, 4, 8], flow: "down" as const },    // fire
  { key: "south", label: "தெற்கை", rasis: [1, 5, 9], flow: "up" as const },      // earth
];
const DIR_ORDER = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"];

const DirectionPage = ({ result }: Props) => {
  const items = DIR_ORDER.map((k) => {
    const p = result.planets.find((x) => x.key === k)!;
    return {
      key: k,
      name: PLANET_FULL_TA[k] || p.nameTamil,
      rasi: p.rasiIndex,
      rasiTa: RASIS_TAMIL[p.rasiIndex],
      deg: p.longitude - p.rasiIndex * 30,
      nak: p.nakshatraTamil,
      pada: p.pada,
      retro: !!p.retrograde,
    };
  });

  const box: React.CSSProperties = {
    border: "1px solid #333", background: "#fffdf7", padding: "6px 8px",
    minHeight: "52mm", boxSizing: "border-box",
  };

  const renderBox = (d: typeof DIRECTIONS[number]) => {
    // order by பாகை (degree within rasi): 0 → 30 in the direction of flow
    const list = items
      .filter((it) => d.rasis.includes(it.rasi))
      .sort((a, b) => (d.flow === "down" ? a.deg - b.deg : b.deg - a.deg));
    const scale = d.flow === "down" ? ["0°", "↓", "30°"] : ["30°", "↑", "0°"];
    return (
      <div style={{ display: "flex", gap: 3, alignItems: "stretch" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", fontSize: 8, color: "#b0451a", fontWeight: 700, padding: "2px 0" }}>
          <span>{scale[0]}</span>
          <span style={{ fontSize: 11 }}>{scale[1]}</span>
          <span>{scale[2]}</span>
        </div>
        <div style={{ ...box, flex: 1 }}>
          <div style={{ fontSize: 9, color: "#7a1a2b", letterSpacing: 1, marginBottom: 6 }}>{d.label}</div>
          {list.length === 0 && <div style={{ fontSize: 9, color: "#999" }}>—</div>}
          {list.map((it) => (
            <div key={it.key} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#111" }}>
                {it.name} <span style={{ color: "#7a1a2b", fontWeight: 400 }}>·</span>{" "}
                <span style={{ color: "#2a4fb5", fontWeight: 700 }}>{it.rasiTa}</span>
                {it.retro && <span style={{ color: "#b00", fontSize: 9 }}> (வ)</span>}
              </div>
              <div style={{ fontSize: 8.5, color: "#555" }}>{dms(it.deg)}</div>
              <div style={{ fontSize: 8.5, color: "#b0451a" }}>{it.nak} - {it.pada}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const north = DIRECTIONS[0], west = DIRECTIONS[1], east = DIRECTIONS[2], south = DIRECTIONS[3];

  return (
    <div className="a4-sheet print-area" style={{ width: "210mm", height: "297mm", padding: "8mm 10mm", margin: "auto", background: "white", color: "#000", fontFamily: "'Latha','Tahoma',sans-serif", boxSizing: "border-box", overflow: "hidden", pageBreakBefore: "always", marginTop: "8mm" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #7a1a2b", paddingBottom: 6 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1, color: "#7a1a2b" }}>திசை அடிப்படையிலான கிரக நிலை</div>
          <div style={{ fontSize: 12, color: "#555" }}>Direction-wise Planetary Positions (Degrees & Nakshatra)</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 10, color: "#555" }}>{result.input.name}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "auto auto auto", gap: "4mm", marginTop: "10mm" }}>
        <div />
        {renderBox(north)}
        <div />

        {renderBox(west)}
        <div style={{ ...box, border: "1px dashed #d08", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 9, color: "#b0451a" }}>மத்தி</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#2a4fb5" }}>{RASIS_TAMIL[result.ascendant.rasiIndex]}</div>
          <div style={{ fontSize: 9, color: "#555" }}>லக்னம்</div>
          <div style={{ fontSize: 8.5, color: "#555", marginTop: 4 }}>{dms(result.ascendant.longitude - result.ascendant.rasiIndex * 30)}</div>
          <div style={{ fontSize: 8.5, color: "#b0451a" }}>{result.ascendant.nakshatraTamil} - {result.ascendant.pada}</div>
        </div>
        {renderBox(east)}

        <div />
        {renderBox(south)}
        <div />
      </div>

      <div style={{ marginTop: "10mm", fontSize: 9, color: "#555", lineHeight: 1.4 }}>
        <b>குறிப்பு:</b> கிரகங்கள் அமர்ந்துள்ள ராசியின் தத்துவப்படி திசை பிரிக்கப்பட்டுள்ளது — நெருப்பு ராசிகள் (மேஷம், சிம்மம், தனுசு) கிழக்கு; பூமி ராசிகள் (ரிஷபம், கன்னி, மகரம்) தெற்கு; காற்று ராசிகள் (மிதுனம், துலாம், கும்பம்) மேற்கு; நீர் ராசிகள் (கடகம், விருச்சிகம், மீனம்) வடக்கு. ஒவ்வொரு பெட்டியிலும் கிரகங்கள் <b>பாகை (0° → 30°)</b> வரிசைப்படி அடுக்கப்பட்டுள்ளன — வடக்கு &amp; கிழக்கு பெட்டிகளில் மேலிருந்து கீழ் (0°↓30°), மேற்கு &amp; தெற்கு பெட்டிகளில் கீழிருந்து மேல் (0°↑30°). (வ) = வக்ர கதி.
      </div>

      <div style={{ marginTop: 6, fontSize: 9, textAlign: "center", borderTop: "1px solid #7a1a2b", paddingTop: 3, color: "#555" }}>
        © AMMAN SOFTWARES — Direction Chart (Page 4/4)
      </div>
    </div>
  );
};



// ---------- Page 2 ----------
const PLANET_SYMBOL: Record<string, string> = {
  sun: "சூரி", moon: "சந்", mars: "செவ்", mercury: "புத",
  jupiter: "குரு", venus: "சுக்", saturn: "சனி", rahu: "ரா", ketu: "கே",
};
const PLANET_ORDER = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"];
const ASPECT_HOUSES: Record<string, number[]> = {
  sun: [7], moon: [7], mercury: [7], venus: [7],
  mars: [4, 7, 8], jupiter: [5, 7, 9], saturn: [3, 7, 10],
  rahu: [3, 7, 11], ketu: [3, 7, 11],
};

const PadamAspectPage = ({ result }: Props) => {
  const planetInfo = result.planets.map((p) => ({
    key: p.key,
    rasi: p.rasiIndex,
    retro: !!p.retrograde,
    lon: p.longitude,
  }));

  const aspectMap: Record<number, { key: string; retro: boolean; house: number }[]> = {};
  for (let r = 0; r < 12; r++) aspectMap[r] = [];
  planetInfo.forEach((p) => {
    (ASPECT_HOUSES[p.key] || []).forEach((h) => {
      const off = h - 1;
      const t = p.retro ? ((p.rasi - off) % 12 + 12) % 12 : (p.rasi + off) % 12;
      aspectMap[t].push({ key: p.key, retro: p.retro, house: h });
    });
  });

  const renderAspectChart = () => (
    <table className="w-full" style={{ borderCollapse: "collapse" }}>
      <tbody>
        {SI_LAYOUT.map((row, r) => (
          <tr key={r}>
            {row.map((rasiIdx, c) => {
              if (rasiIdx === null) {
                if (r === 1 && c === 1) {
                  return (
                    <td key={c} colSpan={2} rowSpan={2} style={{ border: "1px solid #000", textAlign: "center", verticalAlign: "middle", background: "#fbe9d0" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#7a1a2b" }}>கிரக பார்வை</div>
                      <div style={{ fontSize: 9 }}>Aspect Chart</div>
                    </td>
                  );
                }
                return null;
              }
              const occupants = planetInfo.filter((p) => p.rasi === rasiIdx);
              const aspects = aspectMap[rasiIdx] || [];
              const isLagna = rasiIdx === result.ascendant.rasiIndex;
              return (
                <td key={c} style={{ position: "relative", border: "1px solid #000", height: 82, width: "25%", verticalAlign: "top", padding: 3 }}>
                  {isLagna && (
                    <div style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, borderTop: "10px solid #7a1a2b", borderRight: "10px solid transparent" }} />
                  )}
                  <div style={{ fontSize: 15, lineHeight: 1.2, fontWeight: 700, color: "#7a1a2b" }}>
                    {occupants.map((p) => (
                      <span key={p.key}>{PLANET_SYMBOL[p.key]}{p.retro ? "ᴿ" : ""} </span>
                    ))}
                  </div>
                  {aspects.length > 0 && (
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#0a6b3a", marginTop: 2, lineHeight: 1.2 }}>
                      <span style={{ fontWeight: 700 }}> </span>
                      {aspects.map((a, i) => (
                        <span key={i}>{PLANET_SYMBOL[a.key]}{a.retro ? "↺" : ""} </span>
                      ))}
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const nakSize = 360 / 27;
  const padSize = nakSize / 4;
  const padamOccupants: Record<string, { key: string; retro: boolean }[]> = {};
  planetInfo.forEach((p) => {
    const nakIdx = Math.floor(p.lon / nakSize) % 27;
    const pada = Math.floor((p.lon - nakIdx * nakSize) / padSize) + 1;
    (padamOccupants[`${nakIdx}-${pada}`] ||= []).push({ key: p.key, retro: p.retro });
  });
  {
    const lon = result.ascendant.longitude;
    const nakIdx = Math.floor(lon / nakSize) % 27;
    const pada = Math.floor((lon - nakIdx * nakSize) / padSize) + 1;
    (padamOccupants[`${nakIdx}-${pada}`] ||= []).push({ key: "ascendant", retro: false });
  }

  return (
    <div className="a4-sheet print-area" style={{ width: "210mm", height: "297mm", padding: "8mm 10mm", margin: "auto", background: "white", color: "#000", fontFamily: "'Latha','Tahoma',sans-serif", boxSizing: "border-box", overflow: "hidden", pageBreakBefore: "always", marginTop: "8mm" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #7a1a2b", paddingBottom: 6 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1, color: "#7a1a2b" }}>கிரக பார்வை & 108 பாத நிலைப்படம்</div>
          </div>
        <div style={{ textAlign: "right", fontSize: 10, color: "#555" }}>{result.input.name}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 10, marginTop: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textAlign: "center", background: "#fbe9d0", padding: "3px 0", border: "1px solid #c9a050" }}>
            கிரக பார்வை கட்டம் (Aspect Chart)
          </div>
          {renderAspectChart()}
          </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textAlign: "center", background: "#fbe9d0", padding: "3px 0", border: "1px solid #c9a050" }}>
            பார்வை பட்டியல் (Parvai Table)
          </div>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", border: "1px solid #c9a050" }}>
            <thead>
              <tr style={{ background: "#fff8ee" }}>
                <th style={{ border: "1px solid #c9a050", padding: 2 }}>கிரகம்</th>
                <th style={{ border: "1px solid #c9a050", padding: 2 }}>நிலை</th>
                <th style={{ border: "1px solid #c9a050", padding: 2 }}>வீடு</th>
                <th style={{ border: "1px solid #c9a050", padding: 2 }}>பார்க்கும் ராசி</th>
              </tr>
            </thead>
            <tbody>
              {PLANET_ORDER.map((k) => {
                const p = planetInfo.find((x) => x.key === k);
                if (!p) return null;
                const houses = ASPECT_HOUSES[k] || [];
                const targets = houses.map((h) => {
                  const off = h - 1;
                  const t = p.retro ? ((p.rasi - off) % 12 + 12) % 12 : (p.rasi + off) % 12;
                  return { h, t };
                });
                return (
                  <tr key={k}>
                    <td style={{ border: "1px solid #c9a050", padding: 2, fontWeight: 700 }}>
                      {PLANET_FULL_TA[k]}{p.retro ? " (வ)" : ""}
                    </td>
                    <td style={{ border: "1px solid #c9a050", padding: 2 }}>{RASIS_TAMIL[p.rasi]}</td>
                    <td style={{ border: "1px solid #c9a050", padding: 2, textAlign: "center" }}>
                      {houses.join(",")}{p.retro ? " ↺" : ""}
                    </td>
                    <td style={{ border: "1px solid #c9a050", padding: 2 }}>
                      {targets.map((x) => `${x.h}→${RASIS_TAMIL[x.t]}`).join(" ; ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ fontSize: 8.5, marginTop: 4, color: "#333", lineHeight: 1.35 }}>
            வக்ர (retrograde) கிரகம் இருந்தால் பார்வை எதிர் திசையில் (↺) கணிக்கப்படுகிறது.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, textAlign: "center", background: "#fbe9d0", padding: "3px 0", border: "1px solid #c9a050" }}>
        108 பாத நிலைப்படம் — 12 ராசி கட்டம் (27 நட்சத்திரம் × 4 பாதம்)
      </div>
      <table
  className="w-full"
  style={{
    borderCollapse: "collapse",
    border: "1px solid #000",
    tableLayout: "fixed",
    height: "150px" // 🔥 overall height
  }}
>
  <tbody>
    {SI_LAYOUT.map((row, r) => (
      <tr key={r} style={{ height: "100px" }}> {/* 🔥 equal row height */}
        {row.map((rasiIdx, c) => {
          if (rasiIdx === null) {
            if (r === 1 && c === 1) {
              return (
                <td
                  key={c}
                  colSpan={2}
                  rowSpan={2}
                  style={{
                    border: "1px solid #000",
                    textAlign: "center",
                    verticalAlign: "middle",
                    background: "#e8f5d8",
                    color: "#0a6b3a",
                    padding: "10px"
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700 }}>27 நட்சத்திரங்கள்</div>
                  <div style={{ fontSize: 12, marginTop: 4, color: "#555" }}>108 பாதங்கள்</div>
                </td>
              );
            }
            return null;
          }

          const isLagna = rasiIdx === result.ascendant.rasiIndex;

          const padamRows: {
            nakIdx: number;
            pada: number;
            occ: { key: string; retro: boolean }[];
          }[] = [];

          for (let p = 0; p < 9; p++) {
            const globalPadam = rasiIdx * 9 + p;
            const nakIdx = Math.floor(globalPadam / 4);
            const pada = (globalPadam % 4) + 1;

            padamRows.push({
              nakIdx,
              pada,
              occ: padamOccupants[`${nakIdx}-${pada}`] || [],
            });
          }

          return (
            <td
              key={c}
              style={{
                position: "relative",
                border: "1px solid #000",
                width: "25%",
                verticalAlign: "top",
                padding: "8px", // 🔥 spacing
                background: "#fffdf5",
                fontSize: "11px",
                lineHeight: 1.4
              }}
            >
              {/* Lagna mark */}
              {isLagna && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    borderTop: "14px solid #7a1a2b",
                    borderRight: "14px solid transparent"
                  }}
                />
              )}

              {/* Group padams */}
              {(() => {
                const groups: Record<number, number[]> = {};

                padamRows.forEach((pr) => {
                  (groups[pr.nakIdx] ||= []).push(pr.pada);
                });

                return Object.keys(groups).map((niStr) => {
                  const ni = Number(niStr);
                  const padas = groups[ni];

                  return (
                    <div
                      key={ni}
                      style={{
                        fontSize: 12,
                        marginBottom: 3
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>
                        {NAKSHATRAS_TAMIL[ni]}
                      </span>{" "}
                      <span style={{ color: "#555" }}>
                        {padas.join(",")}
                      </span>

                      {padas.some(
                        (pd) =>
                          (padamOccupants[`${ni}-${pd}`] || []).length > 0
                      ) && (
                        <span
                          style={{
                            color: "#7a1a2b",
                            fontWeight: 800
                          }}
                        >
                          {" "}
                          {padas.map((pd) => {
                            const occ =
                              padamOccupants[`${ni}-${pd}`] || [];
                            if (!occ.length) return null;

                            return (
                              <span key={pd}>
                                [{pd}:
                                {occ.map((p, i) => (
                                  <span key={i}>
                                    {p.key === "ascendant"
                                      ? "La"
                                      : PLANET_SYMBOL[p.key]}
                                    {p.retro ? "ᴿ" : ""}
                                  </span>
                                ))}
                                ]
                              </span>
                            );
                          })}
                        </span>
                      )}
                    </div>
                  );
                });
              })()}
            </td>
          );
        })}
      </tr>
    ))}
  </tbody>
</table>
      <div style={{ fontSize: 10, marginTop: 3, color: "#333", textAlign: "center" }}>
        ஒவ்வொரு ராசியிலும் 9 பாதங்கள் (2¼ நட்சத்திரம்). கிரக குறியீடு அந்த பாதத்தில் அமையும் கிரகம் காட்டுகிறது. La = லக்னம்.
      </div>

      <div style={{ marginTop: 6, fontSize: 10, textAlign: "center", borderTop: "1px solid #7a1a2b", paddingTop: 4, color: "#555" }}>
        © AMMAN SOFTWARES — Aspect & 108 Padam Location Chart
      </div>
    </div>
    
  );
};


// ---------- Page 3: பரிகார தலங்கள் ----------
const TemplesPage = ({ result }: Props) => {
  const userNak = result.moon.nakshatraIndex;
  const userPada = result.moon.pada;
  const userThithi = result.panchangam.tithiIndex % 15;
  const userYoga = result.panchangam.yogaIndex;
  const userKarana = result.panchangam.karanaIndex;

  const hi = { background: "#fff3cf", fontWeight: 800 as const };
  const cell: React.CSSProperties = { border: "1px solid #c9a050", padding: "2px 5px", verticalAlign: "top" };
  const th: React.CSSProperties = { ...cell, background: "#fbe9d0", textAlign: "center", fontWeight: 700 };

  return (
    <div className="a4-sheet print-area" style={{ width: "210mm", height: "297mm", padding: "8mm 10mm", margin: "auto", background: "white", color: "#000", fontFamily: "'Latha','Tahoma',sans-serif", boxSizing: "border-box", overflow: "hidden", pageBreakBefore: "always", marginTop: "8mm" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #7a1a2b", paddingBottom: 6 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1, color: "#7a1a2b" }}>பரிகார தலங்கள்</div>
          </div>
        <div style={{ textAlign: "right", fontSize: 10, color: "#555" }}>{result.input.name}</div>
      </div>
{/* User-specific summary மட்டும் */}
<div style={{
  marginTop: 6,
  fontSize: 12,
  background: "#fff8ee",
  border: "1px solid #c9a050",
  padding: 6
}}>
  <b>உங்களுக்கான பரிகார தலங்கள்:</b>

  <div style={{ marginTop: 4 }}>
    ⭐ நட்சத்திரம்:
    <b> {NAKSHATRAS_TAMIL[userNak]} - பாதம் {userPada}</b>
    → {padamTemple(userNak, userPada).temple}
  </div>

  <div>
    🌙 திதி ({result.panchangam.tithiTamil}):
    → {thithiTemple(userThithi).temple}
  </div>

  <div>
    🔶 யோகம் ({result.panchangam.yogaTamil}):
    → {yogamTemple(userYoga).temple}
  </div>

  <div>
    🔷 கரணம் ({result.panchangam.karanaTamil}):
    → {karanamTemple(userKarana).temple}
  </div>
</div>
      <div style={{ marginTop: 6, fontSize: 10, color: "#555", lineHeight: 1.35 }}>
        <b>குறிப்பு:</b> நட்சத்திர பாத தலம் — அந்த பாதத்தின் நவாம்ச அதிபதி கிரகத்தின் பரிகார ஸ்தலம். மஞ்சள் நிற வரிசைகள் உங்களுக்கு உரிய தலங்களைக் காட்டுகின்றன. திதி/யோகம்/கரணம் தலங்கள் நித்ய தேவி மற்றும் பாரம்பரிய தமிழ் பரிகார ஸ்தலம் அடிப்படையில்.
      </div>
      <div style={{ marginTop: 4, fontSize: 10, textAlign: "center", borderTop: "1px solid #7a1a2b", paddingTop: 3, color: "#555" }}>
        © AMMAN SOFTWARES — Parihara Sthalam Reference (Page 3/3)
      </div>
    </div>
  );
};
