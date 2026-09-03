import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Printer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DownloadReport } from "@/components/DownloadReport";
import { PLACES } from "@/lib/places";
import { computeJathagam, NAKSHATRAS_TAMIL, RASIS_TAMIL, type JathagamResult } from "@/lib/jathagam";

const HORA_ORDER = ["சூரியன்", "சுக்ரன்", "புதன்", "சந்திரன்", "சனி", "குரு", "செவ்வாய்"];
const WEEKDAY_LORD_IDX: Record<number, number> = { 0: 0, 1: 3, 2: 6, 3: 2, 4: 5, 5: 1, 6: 4 };
const RAHU_SEG = [8, 2, 7, 5, 6, 4, 3];
const YAMAGANDAM_SEG = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_SEG = [7, 6, 5, 4, 3, 2, 1];

const fmtTime = (d: Date) => {
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const cell: React.CSSProperties = { border: "1px solid #c9a050", padding: "4px 8px", fontSize: 13, fontWeight: 700 };
const th: React.CSSProperties = { ...cell, background: "#fbe9d0" };

export const TodayPanchangam = () => {
  const [now, setNow] = useState(new Date());

  const result: JathagamResult | null = useMemo(() => {
    try {
      const p = PLACES[0];
      return computeJathagam({
        name: "Today",
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        latitude: p.lat,
        longitude: p.lon,
        tzOffsetHours: p.tz,
        placeName: p.name,
      });
    } catch {
      return null;
    }
  }, [now]);

  if (!result) return null;

  const { panchangam: pg } = result;
  const sunrise = pg.sunriseLocal;
  const sunset = pg.sunsetLocal;
  const weekday = sunrise.getUTCDay();
  const dayMs = sunset.getTime() - sunrise.getTime();
  const segMs = dayMs / 8;

  const segRange = (seg: number) => {
    const s = new Date(sunrise.getTime() + (seg - 1) * segMs);
    const e = new Date(sunrise.getTime() + seg * segMs);
    return `${fmtTime(s)} – ${fmtTime(e)}`;
  };

  const t = now.getTime();
  const isDay = t >= sunrise.getTime() && t < sunset.getTime();
  const horaLen = isDay ? dayMs / 12 : (24 * 3600_000 - dayMs) / 12;
  const horaBase = isDay ? sunrise.getTime() : sunset.getTime();
  const horaIdx = Math.min(11, Math.max(0, Math.floor((t - horaBase) / horaLen)));
  const startLord = isDay ? WEEKDAY_LORD_IDX[weekday] : WEEKDAY_LORD_IDX[(weekday + 1) % 7];
  const hora = HORA_ORDER[(startLord + horaIdx) % 7];

  const rows: [string, string][] = [
    ["திகதி", format(now, "dd/MM/yyyy")],
    ["நாள் (வாரம்)", pg.vaaraTamil],
    ["திதி", `${pg.paksha} பக்ஷம் — ${pg.tithiTamil}`],
    ["நட்சத்திரம்", `${NAKSHATRAS_TAMIL[result.moon.nakshatraIndex]} (${result.pada}ஆம் பாதம்)`],
    ["சந்திர ராசி", RASIS_TAMIL[result.moon.rasiIndex]],
    ["யோகம்", pg.yogaTamil],
    ["கரணம்", pg.karanaTamil],
    ["சூரியோதயம்", fmtTime(sunrise)],
    ["சூரியாஸ்தமனம்", fmtTime(sunset)],
    ["ராகு காலம்", segRange(RAHU_SEG[weekday])],
    ["யமகண்டம்", segRange(YAMAGANDAM_SEG[weekday])],
    ["குளிகை", segRange(GULIKA_SEG[weekday])],
    ["தற்போதைய ஹோரை", `${hora} ஹோரை (${isDay ? "பகல்" : "இரவு"})`],
  ];

  return (
    <div className="parchment rounded-xl border-2 border-gold-deep/50 p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3 no-print">
        <div className="flex items-center gap-2 font-tamil text-lg font-bold text-maroon-deep">
          <CalendarDays className="w-5 h-5 text-gold-deep" /> இன்றைய பஞ்சாங்கம்
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="font-tamil text-maroon-deep border-gold/40" onClick={() => setNow(new Date())}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> புதுப்பி
          </Button>
          <Button size="sm" variant="outline" className="font-tamil text-maroon-deep border-gold/40" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5 mr-1" /> அச்சிடு
          </Button>
          <DownloadReport
            targetId="today-panchangam-root"
            fileName={`panchangam-${format(now, "yyyy-MM-dd")}.pdf`}
            paperSize="a4"
            orientation="p"
            productLabel="Today Panchangam"
          />
        </div>
      </div>

      <div id="today-panchangam-root" className="a4-sheet print-area bg-white rounded-lg p-4 border border-gold/30" style={{ fontFamily: "'Latha','Tahoma',sans-serif" }}>
        <div style={{ borderBottom: "2px solid #7a1a2b", paddingBottom: 5, marginBottom: 8, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#7a1a2b" }}>இன்றைய பஞ்சாங்கம் — AMMAN SOFTWARES</div>
          <div style={{ fontSize: 12, color: "#555", fontWeight: 700 }}>
            {format(now, "EEEE, dd MMMM yyyy")} • {PLACES[0].name}
          </div>
        </div>
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
        <div style={{ marginTop: 8, fontSize: 10, textAlign: "center", borderTop: "1px solid #7a1a2b", paddingTop: 3, color: "#555", fontWeight: 700 }}>
          தினசரி பஞ்சாங்கம் • © AMMAN SOFTWARES
        </div>
      </div>
    </div>
  );
};
