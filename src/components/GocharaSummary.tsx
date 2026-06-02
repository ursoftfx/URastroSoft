import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Sparkles, ArrowRight, Sun, Moon } from "lucide-react";
import { PLACES } from "@/lib/places";
import { computeJathagam, RASIS_TAMIL, type JathagamResult } from "@/lib/jathagam";

const PLANET_SHORT: Record<string, string> = {
  sun: "சூ", moon: "ச", mars: "செ", mercury: "பு", jupiter: "கு",
  venus: "சு", saturn: "சனி", rahu: "ரா", ketu: "கே", ascendant: "லக்",
};
const LAYOUT: (number | null)[][] = [
  [11, 0, 1, 2], [10, null, null, 3], [9, null, null, 4], [8, 7, 6, 5],
];

const HORA_ORDER = ["சூரியன்", "சுக்ரன்", "புதன்", "சந்திரன்", "சனி", "குரு", "செவ்வாய்"];
const WEEKDAY_LORD_IDX: Record<number, number> = { 0: 0, 1: 3, 2: 6, 3: 2, 4: 5, 5: 1, 6: 4 };
const RAHU_SEG = [8, 2, 7, 5, 6, 4, 3];

const PLANETS_ORDER = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"];

export const GocharaSummary = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const result: JathagamResult | null = useMemo(() => {
    try {
      const p = PLACES[0];
      return computeJathagam({
        name: "Gochara",
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

  const sunrise = result.panchangam.sunriseLocal;
  const sunset = result.panchangam.sunsetLocal;
  const weekday = sunrise.getUTCDay();

  // current hora
  const dayMs = sunset.getTime() - sunrise.getTime();
  const nightMs = 24 * 3600_000 - dayMs;
  const t = now.getTime();
  const isDay = t >= sunrise.getTime() && t < sunset.getTime();
  const horaLen = isDay ? dayMs / 12 : nightMs / 12;
  const sinceStart = isDay ? t - sunrise.getTime() : t - sunset.getTime();
  const horaIdx = Math.max(0, Math.min(11, Math.floor(sinceStart / horaLen)));
  const startIdx = WEEKDAY_LORD_IDX[weekday];
  const currentHora = HORA_ORDER[(startIdx + (isDay ? 0 : 12) + horaIdx) % 7];

  // rahu kalam
  const seg = RAHU_SEG[weekday];
  const part = dayMs / 8;
  const rahuStart = new Date(sunrise.getTime() + (seg - 1) * part);
  const rahuEnd = new Date(sunrise.getTime() + seg * part);
  const fmt = (d: Date) => format(d, "hh:mm a");

  return (
    <section className="max-w-5xl mx-auto mb-8 animate-fade-up">
      <div className="parchment rounded-2xl p-5 md:p-7 border border-gold/30 shadow-gold/10">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <h2 className="font-tamil text-lg md:text-xl font-bold text-maroon-deep">
              இன்றைய கோசாரம் & பஞ்சாங்கம்
            </h2>
          </div>
          <Link
            to="/gochara"
            className="inline-flex items-center gap-1 text-xs md:text-sm font-tamil text-maroon-deep hover:text-gold underline-offset-4 hover:underline"
          >
            முழு விவரம் <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Mini gochara chart */}
          <div className="grid grid-cols-4 gap-1 aspect-square max-w-xs mx-auto w-full">
            {LAYOUT.flat().map((rasiIdx, i) => {
              if (rasiIdx === null) {
                const row = Math.floor(i / 4), col = i % 4;
                if (row === 1 && col === 1) {
                  return (
                    <div
                      key={i}
                      className="col-span-2 row-span-2 flex flex-col items-center justify-center bg-gradient-royal text-primary-foreground rounded-lg p-2 text-center"
                    >
                      <div className="font-tamil text-base font-bold text-gold-bright">கோசாரம்</div>
                      <div className="font-tamil text-[10px] mt-1">{format(now, "PP")}</div>
                      <div className="font-tamil text-[10px] opacity-80">{format(now, "p")}</div>
                    </div>
                  );
                }
                return null;
              }
              const planets = (result.rasiChart[rasiIdx] || []).filter((p) => p !== "mandi" && p !== "ascendant");
              return (
                <div key={i} className="relative aspect-square border border-gold/40 bg-cream/60 rounded p-1 flex flex-col text-[9px]">
                  <div className="font-tamil text-[8px] text-maroon font-semibold leading-tight truncate">
                    {RASIS_TAMIL[rasiIdx]}
                  </div>
                  <div className="flex flex-wrap gap-0.5 mt-0.5 font-tamil">
                    {planets.map((p, idx) => (
                      <span
                        key={idx}
                        className={p === "sun" || p === "moon" ? "text-maroon-deep font-bold" : "text-ink"}
                      >
                        {PLANET_SHORT[p]}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panchangam quick facts */}
          <div className="font-tamil text-sm space-y-2">
            <Row k="நட்சத்திரம்" v={`${result.moon.nakshatraTamil} (${result.moon.pada} பாதம்)`} />
            <Row k="திதி" v={`${result.panchangam.tithiTamil} • ${result.panchangam.paksha} பக்ஷம்`} />
            <Row k="யோகம் / கரணம்" v={`${result.panchangam.yogaTamil} / ${result.panchangam.karanaTamil}`} />
            <Row k="சந்திர ராசி" v={result.moon.rasiTamil} />
            <Row k="லக்னம் (இப்போது)" v={result.ascendant.rasiTamil} />
            <Row k="தற்போதைய ஹோரை" v={`${currentHora} ஹோரை`} highlight />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-cream/60 rounded px-2 py-1.5 border border-gold/20 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-gold-deep" />
                <span className="text-[11px] text-muted-foreground">உதயம்</span>
                <span className="ml-auto text-maroon-deep font-semibold text-xs">{fmt(sunrise)}</span>
              </div>
              <div className="bg-cream/60 rounded px-2 py-1.5 border border-gold/20 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-gold-deep" />
                <span className="text-[11px] text-muted-foreground">அஸ்தமனம்</span>
                <span className="ml-auto text-maroon-deep font-semibold text-xs">{fmt(sunset)}</span>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded px-3 py-2 flex items-center justify-between text-red-800">
              <span className="font-bold text-xs">ராகு காலம்</span>
              <span className="text-xs">{fmt(rahuStart)} – {fmt(rahuEnd)}</span>
            </div>

            {/* Planet positions */}
            <div className="grid grid-cols-3 gap-1 pt-1">
              {PLANETS_ORDER.map((k) => {
                const p = result.planets.find((x) => x.key === k)!;
                return (
                  <div key={k} className="text-[10px] bg-cream/50 rounded px-1.5 py-1 border border-gold/15 flex justify-between">
                    <span className="text-maroon-deep font-semibold">{p.nameTamil}</span>
                    <span className="text-foreground/70 truncate ml-1">{p.rasiTamil}{p.retrograde ? "ⓡ" : ""}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Row = ({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) => (
  <div className={`flex items-center justify-between border-b border-gold/15 pb-1.5 ${highlight ? "text-gold-deep" : ""}`}>
    <span className="text-muted-foreground text-xs">{k}</span>
    <span className={`font-semibold ${highlight ? "text-gold-deep" : "text-maroon-deep"}`}>{v}</span>
  </div>
);
