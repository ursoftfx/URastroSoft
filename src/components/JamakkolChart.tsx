import { useEffect, useMemo, useState } from "react";
import { RASIS_TAMIL, NAKSHATRAS_TAMIL } from "@/lib/jathagam";
import { PLACES } from "@/lib/places";
import { computeJamakkol } from "@/lib/jamakkol";

const LAYOUT: (number | null)[][] = [
  [11, 0, 1, 2],
  [10, null, null, 3],
  [9, null, null, 4],
  [8, 7, 6, 5],
];
const PNAME: Record<string, string> = {
  sun: "சூரியன்", moon: "சந்திரன்", mars: "செவ்வாய்", mercury: "புதன்", jupiter: "குரு",
  venus: "சுக்கிரன்", saturn: "சனி", rahu: "ராகு", ketu: "கேது",
};
const dm = (lon: number) => {
  const d = lon % 30;
  let deg = Math.floor(d), min = Math.round((d - deg) * 60);
  if (min === 60) { deg += 1; min = 0; }
  return `${deg}° ${String(min).padStart(2, "0")}'`;
};
const nak = (lon: number) => {
  const i = Math.floor(lon / (360 / 27));
  const pada = Math.floor((lon % (360 / 27)) / (360 / 108)) + 1;
  return `${NAKSHATRAS_TAMIL[i]} - ${pada}`;
};
const toLocalInput = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

/** Outer border position (percent) for a longitude, following the South-Indian square. */
const outerPos = (lon: number) => {
  const cp = (lon / 30 + 1) % 12;
  if (cp < 4) return { left: `${(cp / 4) * 100}%`, top: "0%", side: "top" };
  if (cp < 6) return { left: "100%", top: `${((cp - 3) / 4) * 100}%`, side: "right" };
  if (cp < 10) return { left: `${(1 - (cp - 6) / 4) * 100}%`, top: "100%", side: "bottom" };
  return { left: "0%", top: `${(1 - (cp - 9) / 4) * 100}%`, side: "left" };
};

export const JamakkolChart = () => {
  const [live, setLive] = useState(true);
  const [dt, setDt] = useState(() => toLocalInput(new Date()));
  const [placeIdx, setPlaceIdx] = useState(0);
  const [arudamRasi, setArudamRasi] = useState<number | "">("");
  const [arudamDeg, setArudamDeg] = useState(0);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setDt(toLocalInput(new Date())), 1000);
    return () => clearInterval(id);
  }, [live]);

  const place = PLACES[placeIdx];
  const data = useMemo(() => {
    // Treat entered wall time as the selected place's local time.
    const [d, t] = dt.split("T");
    const [y, m, day] = d.split("-").map(Number);
    const [hh, mm, ss = 0] = t.split(":").map(Number);
    const utc = Date.UTC(y, m - 1, day, hh, mm, ss) - place.tz * 3600_000;
    return computeJamakkol(new Date(utc), place, arudamRasi === "" ? undefined : arudamRasi, arudamDeg);
  }, [dt, place, arudamRasi, arudamDeg]);

  const cells: Record<number, { label: string; deg: string; cls: string }[]> = {};
  const add = (lon: number, label: string, cls: string) => {
    const r = Math.floor(lon / 30);
    (cells[r] ||= []).push({ label, deg: dm(lon), cls });
  };
  data.chart.planets.forEach((p) => add(p.longitude, `${PNAME[p.key] ?? p.key}${p.retrograde && p.key !== "rahu" && p.key !== "ketu" ? " (வ)" : p.key === "rahu" || p.key === "ketu" ? " (வ)" : ""}`, "text-[hsl(140_60%_28%)]"));
  add(data.chart.ascendant.longitude, "லக்", "text-[hsl(230_60%_25%)]");
  add(data.udayam, "உதயம்", "text-[hsl(0_70%_40%)]");
  add(data.arudam, "ஆருடம்", "text-[hsl(0_70%_40%)]");
  add(data.kavippu, "கவிப்பு", "text-[hsl(0_70%_40%)]");

  const houseNo = (r: number) => ((r - Math.floor(data.udayam / 30) + 12) % 12) + 1;
  const dateStr = new Date(dt).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const timeStr = dt.split("T")[1];

  return (
    <div className="parchment rounded-xl p-3 sm:p-4 border border-gold/40">
      <h3 className="font-tamil text-lg font-bold text-maroon-deep text-center">ஜாமக்கோள் பிரசன்னம்</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3 font-tamil text-sm">
        <label className="flex flex-col gap-1">தேதி / நேரம்
          <input type="datetime-local" step={1} value={dt} onChange={(e) => { setLive(false); setDt(e.target.value.length === 16 ? e.target.value + ":00" : e.target.value); }} className="border border-gold/60 rounded px-2 py-1 bg-background" />
        </label>
        <label className="flex flex-col gap-1">இடம்
          <select value={placeIdx} onChange={(e) => setPlaceIdx(Number(e.target.value))} className="border border-gold/60 rounded px-2 py-1 bg-background">
            {PLACES.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">ஆருடம் (கேட்பவர் தேர்வு)
          <select value={arudamRasi} onChange={(e) => setArudamRasi(e.target.value === "" ? "" : Number(e.target.value))} className="border border-gold/60 rounded px-2 py-1 bg-background">
            <option value="">உதய ராசி (இயல்பு)</option>
            {RASIS_TAMIL.map((r, i) => <option key={i} value={i}>{r}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">ஆருட பாகை (0–29.99)
          <input type="number" min={0} max={29.99} step={0.5} value={arudamDeg} onChange={(e) => setArudamDeg(Number(e.target.value) || 0)} className="border border-gold/60 rounded px-2 py-1 bg-background" />
        </label>
        <button type="button" onClick={() => setLive(true)} className={`sm:col-span-2 rounded px-3 py-1.5 font-semibold ${live ? "bg-gradient-royal text-primary-foreground" : "border border-gold/60"}`}>
          {live ? "● நேரலை (தற்போதைய நேரம்)" : "தற்போதைய நேரத்திற்கு மாற்று"}
        </button>
      </div>

      {/* Chart with outer jama grahas */}
      <div className="relative mx-auto w-full max-w-md bg-card rounded-lg border border-border p-8 sm:p-10">
        <div className="relative">
          {data.jama.map((g) => {
            const pos = outerPos(g.lon);
            const off = pos.side === "top" ? "translate(-50%, -140%)" : pos.side === "bottom" ? "translate(-50%, 40%)" : pos.side === "left" ? "translate(-130%, -50%) rotate(180deg)" : "translate(30%, -50%)";
            const vertical = pos.side === "left" || pos.side === "right";
            return (
              <div key={g.key} className="absolute z-10 whitespace-nowrap font-tamil text-[10px] sm:text-xs font-bold text-[hsl(220_60%_45%)]" style={{ left: pos.left, top: pos.top, transform: off, writingMode: vertical ? "vertical-rl" : undefined }}>
                {g.short} <span className="text-foreground/80 font-semibold">{Math.floor(g.lon)}° {String(Math.round((g.lon % 1) * 60) % 60).padStart(2, "0")}'</span>
              </div>
            );
          })}

          <div className="grid grid-cols-4 border-2 border-[hsl(20_60%_25%)]">
            {LAYOUT.flat().map((r, i) => {
              if (r === null) {
                if (i !== 5) return null;
                return (
                  <div key={i} className="col-span-2 row-span-2 border border-[hsl(20_60%_25%)] flex flex-col items-center justify-center text-center p-1 font-tamil bg-background">
                    <div className="text-[hsl(20_85%_45%)] font-bold text-sm sm:text-base leading-tight">ஜாமக்கோள்<br />பிரசன்னம்</div>
                    <div className="text-[hsl(220_60%_45%)] text-[10px] sm:text-xs font-semibold">{dateStr}<br />{timeStr}</div>
                    <div className="text-[hsl(220_60%_45%)] text-[10px] sm:text-xs font-bold mt-1">{data.weekdayEn} Jamam # {data.jamam}</div>
                    {[["உதயம்", data.udayam], ["ஆருடம்", data.arudam], ["கவிப்பு", data.kavippu]].map(([l, v]) => (
                      <div key={l as string} className="mt-1">
                        <div className="text-[hsl(0_70%_40%)] font-bold text-[11px] sm:text-sm">{l}</div>
                        <div className="border border-[hsl(0_70%_85%)] rounded px-1 text-[9px] sm:text-[11px]">★ {nak(v as number)}</div>
                      </div>
                    ))}
                  </div>
                );
              }
              return (
                <div key={i} className="relative aspect-[3/4] border border-[hsl(20_60%_25%)] p-0.5 sm:p-1 font-tamil flex flex-col bg-background overflow-hidden">
                  <div className="text-[9px] sm:text-[11px] text-muted-foreground">{RASIS_TAMIL[r]}</div>
                  <div className="flex-1 flex flex-col items-center justify-center gap-0.5 text-center">
                    {(cells[r] || []).map((c, k) => (
                      <div key={k} className="leading-tight">
                        <div className={`text-[9px] sm:text-xs font-bold ${c.cls}`}>{c.label}</div>
                        <div className="text-[8px] sm:text-[10px] text-muted-foreground">({c.deg})</div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-0.5 right-1 text-[9px] sm:text-xs font-bold text-[hsl(20_85%_50%)]">{houseNo(r)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <p className="font-tamil text-[11px] text-muted-foreground text-center mt-2">
        வெளிப்புறம்: ஜாம கிரகங்கள் · உள்ளே: கோசார கிரகங்கள், லக்னம், உதயம், ஆருடம், கவிப்பு · எண்: உதயத்திலிருந்து பாவம்
      </p>
    </div>
  );
};
