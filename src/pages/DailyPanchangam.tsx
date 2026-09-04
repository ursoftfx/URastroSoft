import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";
import { SiteFooter } from "@/components/SiteFooter";
import { DownloadReport } from "@/components/DownloadReport";
import { PanchangamShare } from "@/components/PanchangamShare";
import { PLACES } from "@/lib/places";
import {
  computeJathagam,
  NAKSHATRAS_TAMIL,
  NAKSHATRA_LORDS_TAMIL,
  RASIS_TAMIL,
  formatDegree,
  type JathagamResult,
} from "@/lib/jathagam";
import {
  tamilYearName,
  tamilMonthDay,
  planetColor,
  toNaazhigai,
  nallaNeramSegs,
  chandrashtamaFor,
  LIMB_GRADIENTS,
} from "@/lib/panchangam-extra";

const HORA_ORDER = ["சூரியன்", "சுக்ரன்", "புதன்", "சந்திரன்", "சனி", "குரு", "செவ்வாய்"];
const WEEKDAY_LORD_IDX: Record<number, number> = { 0: 0, 1: 3, 2: 6, 3: 2, 4: 5, 5: 1, 6: 4 };
const RAHU_SEG = [8, 2, 7, 5, 6, 4, 3];
const YAMA_SEG = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_SEG = [7, 6, 5, 4, 3, 2, 1];
const WEEKDAY_TAMIL = ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"];

const TAMIL_MONTHS = [
  "சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி",
  "ஐப்பசி", "கார்த்திகை", "மார்கழி", "தை", "மாசி", "பங்குனி",
];

const fmt = (d: Date) => {
  const hh = d.getUTCHours();
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ap = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${String(h12).padStart(2, "0")}:${mm} ${ap}`;
};

const cell: React.CSSProperties = { border: "1px solid #c9a050", padding: "4px 8px", fontSize: 13, fontWeight: 700 };
const th: React.CSSProperties = { ...cell, background: "#fbe9d0" };

const DailyPanchangam = () => {
  const today = new Date();
  const [date, setDate] = useState(format(today, "yyyy-MM-dd"));
  const [placeIdx, setPlaceIdx] = useState(0);

  const result: JathagamResult | null = useMemo(() => {
    try {
      const p = PLACES[placeIdx];
      const [y, m, d] = date.split("-").map(Number);
      return computeJathagam({
        name: "Panchangam",
        year: y,
        month: m,
        day: d,
        hour: 6,
        minute: 0,
        latitude: p.lat,
        longitude: p.lon,
        tzOffsetHours: p.tz,
        placeName: p.name,
      });
    } catch {
      return null;
    }
  }, [date, placeIdx]);

  const sel = new Date(`${date}T06:00:00`);

  return (
    <>
      <SEO
        title="தினசரி பஞ்சாங்கம் | AMMAN SOFTWARES"
        description="இன்றைய மற்றும் எந்த நாளுக்கும் முழு தமிழ் பஞ்சாங்கம் — திதி, நட்சத்திரம், யோகம், கரணம், ராகு காலம், ஹோரை மற்றும் PDF பதிவிறக்கம்."
        keywords="தினசரி பஞ்சாங்கம், tamil panchangam, ராகு காலம், horai, tithi, nakshatra"
      />
      <main className="min-h-screen bg-parchment">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="no-print mb-4">
            <Link to="/" className="font-tamil text-sm text-maroon-deep hover:text-gold">
              <ArrowLeft className="inline w-4 h-4 mr-1" /> முதன்மை பட்டி
            </Link>
          </div>

          <h1 className="font-tamil text-3xl font-bold text-maroon-deep text-center mb-4">
            தினசரி பஞ்சாங்கம்
          </h1>

          <div className="parchment rounded-xl border-2 border-gold-deep/50 p-4 no-print mb-4 grid gap-3 sm:grid-cols-3 items-end">
            <div>
              <Label className="font-tamil text-maroon-deep">தேதி</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label className="font-tamil text-maroon-deep">இடம்</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={placeIdx}
                onChange={(e) => setPlaceIdx(Number(e.target.value))}
              >
                {PLACES.map((p, i) => (
                  <option key={p.name} value={i}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="font-tamil border-gold/40 text-maroon-deep" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1" /> அச்சிடு
              </Button>
              <DownloadReport
                targetId="daily-panchangam-root"
                fileName={`panchangam-${date}.pdf`}
                paperSize="a4"
                orientation="p"
                productLabel="Daily Panchangam"
              />
            </div>
            <div className="sm:col-span-3">
              <PanchangamShare
                message={
                  result
                    ? `தினசரி பஞ்சாங்கம் — ${format(new Date(`${date}T06:00:00`), "dd/MM/yyyy")} • ${PLACES[placeIdx].name}\nதிதி: ${result.panchangam.tithiTamil} • நட்சத்திரம்: ${NAKSHATRAS_TAMIL[result.moon.nakshatraIndex]} • யோகம்: ${result.panchangam.yogaTamil}`
                    : "தினசரி பஞ்சாங்கம் — AMMAN SOFTWARES"
                }
              />
            </div>
          </div>

          {result && <PanchangamSheet result={result} date={sel} place={PLACES[placeIdx].name} />}
        </div>
        <SiteFooter />
      </main>
    </>
  );
};

const PanchangamSheet = ({ result, date, place }: { result: JathagamResult; date: Date; place: string }) => {
  const pg = result.panchangam;
  const sunrise = pg.sunriseLocal;
  const sunset = pg.sunsetLocal;
  const weekday = date.getDay();
  const dayMs = sunset.getTime() - sunrise.getTime();
  const segMs = dayMs / 8;
  const nightMs = 24 * 3600_000 - dayMs;

  const segRange = (seg: number) => {
    const s = new Date(sunrise.getTime() + (seg - 1) * segMs);
    const e = new Date(sunrise.getTime() + seg * segMs);
    return `${fmt(s)} – ${fmt(e)}`;
  };

  const dayHoras = Array.from({ length: 12 }, (_, i) => {
    const s = new Date(sunrise.getTime() + i * (dayMs / 12));
    const e = new Date(sunrise.getTime() + (i + 1) * (dayMs / 12));
    return { lord: HORA_ORDER[(WEEKDAY_LORD_IDX[weekday] + i) % 7], range: `${fmt(s)} – ${fmt(e)}` };
  });
  const nightHoras = Array.from({ length: 12 }, (_, i) => {
    const s = new Date(sunset.getTime() + i * (nightMs / 12));
    const e = new Date(sunset.getTime() + (i + 1) * (nightMs / 12));
    return { lord: HORA_ORDER[(WEEKDAY_LORD_IDX[(weekday + 1) % 7] + i) % 7], range: `${fmt(s)} – ${fmt(e)}` };
  });

  const abhijit = () => {
    const mid = sunrise.getTime() + dayMs / 2;
    return `${fmt(new Date(mid - dayMs / 30))} – ${fmt(new Date(mid + dayMs / 30))}`;
  };

  const tamilMonth = TAMIL_MONTHS[result.sun.rasiIndex];
  const nakIdx = result.moon.nakshatraIndex;
  const limbs: [string, string][] = [
    ["திதி", pg.tithiTamil],
    ["வாரம்", WEEKDAY_TAMIL[weekday]],
    ["நட்சத்திரம்", NAKSHATRAS_TAMIL[nakIdx]],
    ["யோகம்", pg.yogaTamil],
    ["கரணம்", pg.karanaTamil],
  ];
  const nallaSegs = nallaSegs(weekday);
  const chandraStar = NAKSHATRAS_TAMIL[chandrashtamaFor(nakIdx)];

  const main: [string, string][] = [
    ["திகதி (ஆங்கிலம்)", format(date, "dd/MM/yyyy")],
    ["தமிழ் வருடம்", tamilYearName(date.getFullYear(), result.sun.rasiIndex)],
    ["தமிழ் மாதம்", `${tamilMonth} மாதம் — ${tamilMonthDay(result.sun.degreeInRasi)}ஆம் திகதி`],
    ["வாரம்", `${WEEKDAY_TAMIL[weekday]} (வார அதிபதி: ${HORA_ORDER[WEEKDAY_LORD_IDX[weekday]]})`],
    ["இடம்", place],
    ["பட்சம்", `${pg.paksha} பக்ஷம்`],
    ["திதி", pg.tithiTamil],
    ["நட்சத்திரம்", `${NAKSHATRAS_TAMIL[nakIdx]} (${result.pada}ஆம் பாதம்)`],
    ["நட்சத்திர அதிபதி", NAKSHATRA_LORDS_TAMIL[nakIdx]],
    ["யோகம்", pg.yogaTamil],
    ["கரணம்", pg.karanaTamil],
    ["சந்திர ராசி", RASIS_TAMIL[result.moon.rasiIndex]],
    ["சூரிய ராசி", RASIS_TAMIL[result.sun.rasiIndex]],
    ["அயனாம்சம்", formatDegree(result.ayanamsa)],
  ];

  const times: [string, string][] = [
    ["சூரிய உதயம்", fmt(sunrise)],
    ["சூரிய அஸ்தமனம்", fmt(sunset)],
    ["பகல் அளவு", `${Math.floor(dayMs / 3600000)} மணி ${Math.round((dayMs % 3600000) / 60000)} நிமிடம்`],
    ["சூரிய உதய நாழிகை", toNaazhigai(0) + " (சூரிய உதயத்திலிருந்து கணக்கு)"],
    ["நல்ல நேரம் (காலை)", segRange(nallaSegs[0])],
    ["நல்ல நேரம் (மாலை)", segRange(nallaSegs[1])],
    ["ராகு காலம்", segRange(RAHU_SEG[weekday])],
    ["யமகண்டம்", segRange(YAMA_SEG[weekday])],
    ["குளிகை காலம்", segRange(GULIKA_SEG[weekday])],
    ["அபிஜித் முகூர்த்தம்", abhijit()],
    ["சந்திராஷ்டமம்", `${chandraStar} நட்சத்திரக்காரர்களுக்கு இன்று சந்திராஷ்டமம்`],
  ];

  return (
    <div
      id="daily-panchangam-root"
      className="a4-sheet print-area bg-white rounded-lg p-5 border border-gold/30 mx-auto"
      style={{ fontFamily: "'Latha','Tahoma',sans-serif", color: "#000" }}
    >
      <div style={{ borderBottom: "2px solid #7a1a2b", paddingBottom: 6, marginBottom: 10, textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#7a1a2b" }}>தினசரி பஞ்சாங்கம்</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>
          {format(date, "EEEE, dd MMMM yyyy")} • {place} • AMMAN SOFTWARES
        </div>
      </div>

      <SectionTable title="பஞ்சாங்க விவரங்கள்" rows={main} />
      <SectionTable title="நேர விவரங்கள்" rows={times} />

      <div style={{ fontSize: 14, fontWeight: 800, color: "#7a1a2b", margin: "10px 0 4px" }}>
        <CalendarDays className="inline w-4 h-4 mr-1" /> கால ஹோரை
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>பகல் ஹோரை</th>
            <th style={th}>நேரம்</th>
            <th style={th}>இரவு ஹோரை</th>
            <th style={th}>நேரம்</th>
          </tr>
        </thead>
        <tbody>
          {dayHoras.map((h, i) => (
            <tr key={i} style={{ background: i % 2 ? "#fdf6ec" : "white" }}>
              <td style={cell}>{h.lord}</td>
              <td style={cell}>{h.range}</td>
              <td style={cell}>{nightHoras[i].lord}</td>
              <td style={cell}>{nightHoras[i].range}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ fontSize: 14, fontWeight: 800, color: "#7a1a2b", margin: "10px 0 4px" }}>கிரக நிலைகள்</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>கிரகம்</th>
            <th style={th}>ராசி</th>
            <th style={th}>பாகை</th>
            <th style={th}>நட்சத்திரம்</th>
          </tr>
        </thead>
        <tbody>
          {result.planets.map((p, i) => (
            <tr key={p.key} style={{ background: i % 2 ? "#fdf6ec" : "white" }}>
              <td style={cell}>{p.nameTamil}{p.retrograde ? " (வ)" : ""}</td>
              <td style={cell}>{p.rasiTamil}</td>
              <td style={cell}>{formatDegree(p.degreeInRasi)}</td>
              <td style={cell}>{p.nakshatraTamil}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 10, fontSize: 10, textAlign: "center", borderTop: "1px solid #7a1a2b", paddingTop: 4, color: "#555", fontWeight: 700 }}>
        தினசரி பஞ்சாங்கம் • © AMMAN SOFTWARES
      </div>
    </div>
  );
};

const SectionTable = ({ title, rows }: { title: string; rows: [string, string][] }) => (
  <>
    <div style={{ fontSize: 14, fontWeight: 800, color: "#7a1a2b", margin: "10px 0 4px" }}>{title}</div>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        {rows.map(([k, v], i) => (
          <tr key={k} style={{ background: i % 2 ? "#fdf6ec" : "white" }}>
            <td style={{ ...th, width: "38%" }}>{k}</td>
            <td style={cell}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);

export default DailyPanchangam;
