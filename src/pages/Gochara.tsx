import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon, Sun, Moon, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PLACES } from "@/lib/places";
import {
  computeJathagam,
  PLANETS_TAMIL,
  RASIS_TAMIL,
  formatDegree,
  type JathagamResult,
} from "@/lib/jathagam";

// ---------- helpers ----------

const WEEKDAY_TAMIL = ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"];

// Chaldean order used for kala horai (planetary hours).
// Day starts with weekday lord; then next horai = 3 positions ahead in Sun→Saturn order:
// Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars (repeat)
const HORA_ORDER_TAMIL = ["சூரியன்", "சுக்ரன்", "புதன்", "சந்திரன்", "சனி", "குரு", "செவ்வாய்"];
const WEEKDAY_LORD_INDEX_IN_HORA: Record<number, number> = {
  0: 0, // Sun
  1: 3, // Moon
  2: 6, // Mars
  3: 2, // Mercury
  4: 5, // Jupiter
  5: 1, // Venus
  6: 4, // Saturn
};

const HORA_QUALITY: Record<string, { tone: string; cls: string }> = {
  "சூரியன்": { tone: "ஆற்றல், அதிகாரம்", cls: "text-amber-700" },
  "சந்திரன்": { tone: "மனம், பயணம், நீர்", cls: "text-sky-700" },
  "செவ்வாய்": { tone: "தைரியம், போட்டி", cls: "text-red-700" },
  "புதன்": { tone: "கல்வி, வர்த்தகம்", cls: "text-emerald-700" },
  "குரு": { tone: "ஞானம், மங்களம்", cls: "text-yellow-700" },
  "சுக்ரன்": { tone: "காதல், கலை, செல்வம்", cls: "text-pink-700" },
  "சனி": { tone: "உழைப்பு, பொறுமை", cls: "text-slate-700" },
};

// Rahu / Yamagandam / Gulika kalam segment indices (1-8) for each weekday (Sun..Sat)
const RAHU_SEG = [8, 2, 7, 5, 6, 4, 3];
const YAMA_SEG = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_SEG = [7, 6, 5, 4, 3, 2, 1];

function fmtTime(d: Date) {
  return format(d, "hh:mm a");
}

function addMs(d: Date, ms: number) {
  return new Date(d.getTime() + ms);
}

function buildHoras(sunrise: Date, sunset: Date, weekday: number) {
  const dayMs = sunset.getTime() - sunrise.getTime();
  const nightMs = 24 * 60 * 60 * 1000 - dayMs;
  const dayHora = dayMs / 12;
  const nightHora = nightMs / 12;
  const startIdx = WEEKDAY_LORD_INDEX_IN_HORA[weekday];

  const horas: { start: Date; end: Date; lord: string; phase: "day" | "night" }[] = [];
  for (let i = 0; i < 12; i++) {
    horas.push({
      start: addMs(sunrise, i * dayHora),
      end: addMs(sunrise, (i + 1) * dayHora),
      lord: HORA_ORDER_TAMIL[(startIdx + i) % 7],
      phase: "day",
    });
  }
  for (let i = 0; i < 12; i++) {
    horas.push({
      start: addMs(sunset, i * nightHora),
      end: addMs(sunset, (i + 1) * nightHora),
      lord: HORA_ORDER_TAMIL[(startIdx + 12 + i) % 7],
      phase: "night",
    });
  }
  return horas;
}

function segmentRange(sunrise: Date, sunset: Date, seg: number) {
  const dayMs = sunset.getTime() - sunrise.getTime();
  const part = dayMs / 8;
  return {
    start: addMs(sunrise, (seg - 1) * part),
    end: addMs(sunrise, seg * part),
  };
}

// ---------- component ----------

const PLANET_KEYS = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"] as const;

const Gochara = () => {
  const now = new Date();
  const [date, setDate] = useState<Date>(now);
  const [time, setTime] = useState<string>(format(now, "HH:mm"));
  const [placeIdx, setPlaceIdx] = useState<number>(0);

  const result: JathagamResult | null = useMemo(() => {
    try {
      const place = PLACES[placeIdx] ?? PLACES[0];
      const [h, m] = time.split(":").map(Number);
      return computeJathagam({
        name: "கோசார பலன்",
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: h || 0,
        minute: m || 0,
        latitude: place.lat,
        longitude: place.lon,
        tzOffsetHours: place.tz,
        placeName: place.name,
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [date, time, placeIdx]);

  const horas = useMemo(() => {
    if (!result) return [];
    return buildHoras(result.panchangam.sunriseLocal, result.panchangam.sunsetLocal, result.panchangam.sunriseLocal.getUTCDay());
  }, [result]);

  const weekday = result ? result.panchangam.sunriseLocal.getUTCDay() : 0;
  const rahu = result ? segmentRange(result.panchangam.sunriseLocal, result.panchangam.sunsetLocal, RAHU_SEG[weekday]) : null;
  const yama = result ? segmentRange(result.panchangam.sunriseLocal, result.panchangam.sunsetLocal, YAMA_SEG[weekday]) : null;
  const gulika = result ? segmentRange(result.panchangam.sunriseLocal, result.panchangam.sunsetLocal, GULIKA_SEG[weekday]) : null;

  const nowMs = Date.now();
  const currentHora = horas.find((h) => nowMs >= h.start.getTime() && nowMs < h.end.getTime());

  return (
    <>
      <main className="min-h-screen">
        <SEO
          title="தினசரி கோசார பலன் & கால ஹோரை | UR ASTRO SOFT"
          description="இன்றைய கோசார ராசி கட்டம், கால ஹோரை, பஞ்சாங்கம், ராகு காலம், எமகண்டம், குளிகை — தேதி தேர்ந்தெடுத்து பாருங்கள்."
        />

        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <Link to="/" className="inline-flex items-center text-maroon-deep hover:text-gold font-tamil text-sm mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> முகப்பு
          </Link>

          <header className="text-center mb-8 animate-fade-up">
            <div className="font-display text-xs tracking-[0.4em] text-gold-deep mb-2">
              ✦ DAILY GOCHARA & PANCHANGAM ✦
            </div>
            <h1 className="font-tamil text-3xl md:text-5xl font-bold text-maroon-deep">
              தினசரி <span className="text-gold">கோசார பலன்</span>
            </h1>
            <p className="font-tamil text-sm md:text-base text-muted-foreground mt-3 max-w-2xl mx-auto">
              கிரகங்களின் தற்போதைய ராசி நிலையை கோசார கட்டத்தில் காண்க. கால ஹோரை, பஞ்சாங்கம், ராகு-எம-குளிகை காலங்கள் உட்பட.
            </p>
          </header>

          {/* Controls */}
          <Card className="mb-6 border-gold/40">
            <CardContent className="pt-6 grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="font-tamil text-maroon-deep">தேதி</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "தேதி தேர்ந்தெடுக்கவும்"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="font-tamil text-maroon-deep">நேரம்</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="font-tamil text-maroon-deep">இடம்</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={placeIdx}
                  onChange={(e) => setPlaceIdx(Number(e.target.value))}
                >
                  {PLACES.map((p, i) => (
                    <option key={i} value={i}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {!result ? (
            <p className="text-center font-tamil text-muted-foreground">கணக்கிட முடியவில்லை</p>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Gochara Chart */}
              <Card className="border-gold/40">
                <CardHeader>
                  <CardTitle className="font-tamil text-maroon-deep flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-gold" /> கோசார ராசி கட்டம்
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GocharaChart result={result} />
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-tamil">
                    {PLANET_KEYS.map((k) => {
                      const p = result.planets.find((x) => x.key === k)!;
                      return (
                        <div key={k} className="flex items-center justify-between bg-cream/40 rounded px-2 py-1 border border-gold/20">
                          <span className="text-maroon-deep font-semibold">{p.nameTamil}</span>
                          <span className="text-foreground/80">
                            {p.rasiTamil}
                            {p.retrograde ? " (வ)" : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Panchangam */}
              <Card className="border-gold/40">
                <CardHeader>
                  <CardTitle className="font-tamil text-maroon-deep flex items-center gap-2">
                    <Sun className="w-5 h-5 text-gold" /> தினசரி பஞ்சாங்கம்
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-tamil grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <PRow k="வாரம்" v={WEEKDAY_TAMIL[weekday]} />
                    <PRow k="திதி" v={`${result.panchangam.tithiTamil} (${result.panchangam.paksha} பக்ஷம்)`} />
                    <PRow k="நட்சத்திரம்" v={`${result.moon.nakshatraTamil} ${result.moon.pada}-வது பாதம்`} />
                    <PRow k="யோகம்" v={result.panchangam.yogaTamil} />
                    <PRow k="கரணம்" v={result.panchangam.karanaTamil} />
                    <PRow k="சந்திர ராசி" v={result.moon.rasiTamil} />
                    <PRow k="சூரிய ராசி" v={result.sun.rasiTamil} />
                    <PRow k="லக்னம்" v={result.ascendant.rasiTamil} />
                    <PRow k="சூரிய உதயம்" v={fmtTime(result.panchangam.sunriseLocal)} icon={<Sun className="w-3 h-3 inline" />} />
                    <PRow k="சூரிய அஸ்தமனம்" v={fmtTime(result.panchangam.sunsetLocal)} icon={<Moon className="w-3 h-3 inline" />} />
                  </div>

                  <div className="temple-divider my-4" />

                  <h3 className="font-tamil font-bold text-maroon-deep mb-2 text-sm">முக்கிய காலங்கள்</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm font-tamil">
                    {rahu && (
                      <KalRow label="ராகு காலம்" cls="bg-red-50 border-red-200 text-red-800" start={rahu.start} end={rahu.end} />
                    )}
                    {yama && (
                      <KalRow label="எமகண்டம்" cls="bg-amber-50 border-amber-200 text-amber-800" start={yama.start} end={yama.end} />
                    )}
                    {gulika && (
                      <KalRow label="குளிகை காலம்" cls="bg-slate-50 border-slate-200 text-slate-800" start={gulika.start} end={gulika.end} />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Kala Horai */}
              <Card className="border-gold/40 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="font-tamil text-maroon-deep flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Moon className="w-5 h-5 text-gold" /> கால ஹோரை (24 ஹோரை)
                    </span>
                    {currentHora && (
                      <span className="text-xs font-normal text-gold-deep">
                        தற்போது: <b className="text-maroon-deep">{currentHora.lord}</b> ஹோரை
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-x-6 gap-y-1">
                    <div>
                      <div className="font-tamil text-xs font-bold text-gold-deep mb-1">பகல் ஹோரை</div>
                      <HoraList horas={horas.slice(0, 12)} nowMs={nowMs} />
                    </div>
                    <div>
                      <div className="font-tamil text-xs font-bold text-gold-deep mb-1">இரவு ஹோரை</div>
                      <HoraList horas={horas.slice(12)} nowMs={nowMs} />
                    </div>
                  </div>
                  <p className="font-tamil text-xs text-muted-foreground mt-4">
                    குறிப்பு: ஒவ்வொரு ஹோரையும் அந்த கிரகத்தின் ஆற்றலைக் கொண்டது. சுபமான காரியங்களுக்கு குரு, சுக்ரன், புதன், சந்திரன் ஹோரை சிறந்தது. ராகு / எம / குளிகை காலங்களைத் தவிர்க்கவும்.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Editorial copy for AdSense */}
          <section className="mt-10 prose max-w-none font-tamil">
            <h2 className="text-maroon-deep">கோசார பலன் என்றால் என்ன?</h2>
            <p>
              கோசாரம் என்பது கிரகங்கள் தற்போது 12 ராசிகளில் எவ்வாறு பயணிக்கின்றன என்பதைக் குறிக்கிறது. உங்கள் ஜென்ம ராசி அல்லது சந்திர ராசியில் இருந்து கணக்கிட்டு, ஒவ்வொரு கிரகமும் தற்போது எத்தனையாவது இடத்தில் உள்ளது என்பதன் அடிப்படையில் தினசரி, மாதாந்திர பலன்கள் கூறப்படுகின்றன. குருவின் கோசாரம், சனியின் கோசாரம் (சாடே சாதி / அஷ்டம சனி), ராகு-கேது பெயர்ச்சி ஆகியவை வாழ்க்கையின் முக்கிய திருப்புமுனைகளை குறிக்கின்றன.
            </p>
            <h2 className="text-maroon-deep">கால ஹோரை பயன்பாடு</h2>
            <p>
              ஒரு நாள் 24 ஹோரைகளாக பிரிக்கப்படுகிறது — 12 பகல், 12 இரவு. ஒவ்வொரு ஹோரையும் ஒரு கிரகத்தால் ஆளப்படுகிறது. முதல் ஹோரை எப்போதும் அந்த நாளின் அதிபதியால் (ஞாயிறு → சூரியன், திங்கள் → சந்திரன்...) தொடங்கும். புதிய காரியம் தொடங்க, பயணம் புறப்பட, ஒப்பந்தம் கையெழுத்திட சரியான ஹோரையை தேர்ந்தெடுப்பது வெற்றியைத் தரும்.
            </p>
            <h2 className="text-maroon-deep">ராகு காலம், எமகண்டம், குளிகை</h2>
            <p>
              இவை சூரிய உதயம் முதல் அஸ்தமனம் வரை உள்ள பகல் நேரத்தை 8 சம பாகமாக பிரித்து, ஒவ்வொரு வாரத்துக்கும் குறிப்பிட்ட பாகத்தைக் கணக்கிடப்படுகின்றன. சுபமான காரியங்களை ராகு காலம் மற்றும் எமகண்ட நேரத்தில் தவிர்க்கவும். குளிகை காலத்தில் தொடங்கும் காரியங்கள் தொடர்ந்து நடைபெறும் என்பதால் வழக்கு, கடன், வம்சாவளி தொடர்பான விஷயங்களைத் தவிர்க்கவும்.
            </p>
          </section>
        </div>
        <WhatsAppButton message="இன்றைய கோசார பலன் / முகூர்த்த ஆலோசனை வேண்டும்." />
      </main>
      <SiteFooter />
    </>
  );
};

// ---------- subcomponents ----------

const PRow = ({ k, v, icon }: { k: string; v: string; icon?: React.ReactNode }) => (
  <>
    <div className="text-muted-foreground">{k}</div>
    <div className="text-maroon-deep font-semibold">
      {icon} {v}
    </div>
  </>
);

const KalRow = ({ label, start, end, cls }: { label: string; start: Date; end: Date; cls: string }) => (
  <div className={`flex items-center justify-between border rounded px-3 py-2 ${cls}`}>
    <span className="font-bold">{label}</span>
    <span>
      {fmtTime(start)} – {fmtTime(end)}
    </span>
  </div>
);

const HoraList = ({ horas, nowMs }: { horas: { start: Date; end: Date; lord: string; phase: string }[]; nowMs: number }) => (
  <div className="divide-y divide-gold/20">
    {horas.map((h, i) => {
      const active = nowMs >= h.start.getTime() && nowMs < h.end.getTime();
      const q = HORA_QUALITY[h.lord];
      return (
        <div
          key={i}
          className={`flex items-center justify-between py-1.5 text-xs font-tamil ${
            active ? "bg-gold/15 px-2 -mx-2 rounded font-bold" : ""
          }`}
        >
          <span className="text-muted-foreground tabular-nums w-28">
            {fmtTime(h.start)}–{fmtTime(h.end)}
          </span>
          <span className={`w-20 text-center font-semibold ${q?.cls ?? "text-maroon-deep"}`}>{h.lord}</span>
          <span className="text-muted-foreground hidden sm:block text-[10px] flex-1 text-right">{q?.tone}</span>
        </div>
      );
    })}
  </div>
);

// Mini South-Indian gochara chart
const GOCHARA_LAYOUT: (number | null)[][] = [
  [11, 0, 1, 2],
  [10, null, null, 3],
  [9, null, null, 4],
  [8, 7, 6, 5],
];
const PLANET_SHORT: Record<string, string> = {
  sun: "சூ", moon: "ச", mars: "செ", mercury: "பு", jupiter: "கு",
  venus: "சு", saturn: "சனி", rahu: "ரா", ketu: "கே", ascendant: "லக்",
};

const GocharaChart = ({ result }: { result: JathagamResult }) => (
  <div className="grid grid-cols-4 gap-1 aspect-square max-w-md mx-auto">
    {GOCHARA_LAYOUT.flat().map((rasiIdx, i) => {
      if (rasiIdx === null) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        if (row === 1 && col === 1) {
          return (
            <div
              key={i}
              className="col-span-2 row-span-2 flex flex-col items-center justify-center bg-gradient-royal text-primary-foreground rounded-lg p-3 text-center"
            >
              <div className="font-display text-[10px] tracking-widest text-gold-bright/90">GOCHARA</div>
              <div className="font-tamil text-xl font-bold text-gold-bright">கோசாரம்</div>
              <div className="temple-divider w-12 my-1 opacity-60" />
              <div className="font-tamil text-xs">{format(new Date(), "PP")}</div>
            </div>
          );
        }
        return null;
      }
      const planets = (result.rasiChart[rasiIdx] || []).filter((p) => p !== "mandi");
      return (
        <div
          key={i}
          className="relative aspect-square border border-gold/40 bg-cream/50 rounded p-1.5 flex flex-col text-[10px]"
        >
          <div className="font-tamil text-[9px] text-maroon font-semibold leading-tight">{RASIS_TAMIL[rasiIdx]}</div>
          <div className="flex flex-wrap gap-1 mt-1 font-tamil">
            {planets.map((p, idx) => (
              <span
                key={idx}
                className={`${p === "ascendant" ? "text-accent font-bold" : p === "sun" || p === "moon" ? "text-maroon-deep font-bold" : "text-ink"}`}
              >
                {PLANET_SHORT[p]}
              </span>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

export default Gochara;
