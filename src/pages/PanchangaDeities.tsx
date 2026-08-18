import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon, Printer, Download } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PLACES } from "@/lib/places";
import { computeJathagam, type JathagamResult } from "@/lib/jathagam";
import { panchaPakshi } from "@/lib/pancha-pakshi";
import { THITHI_TEMPLES, YOGAM_TEMPLES, KARANAM_TEMPLES } from "@/lib/temples";

import imgNaal from "@/assets/deity-naal.jpg";
import imgNak from "@/assets/deity-natchathiram.jpg";
import imgThithi from "@/assets/deity-thithi.jpg";
import imgYogam from "@/assets/deity-yogam.jpg";
import imgKaranam from "@/assets/deity-karanam.jpg";
import imgPakshi from "@/assets/deity-panchapakshi.jpg";

const WEEKDAY_TAMIL = ["ஞாயிற்றுக்கிழமை", "திங்கட்கிழமை", "செவ்வாய்க்கிழமை", "புதன்கிழமை", "வியாழக்கிழமை", "வெள்ளிக்கிழமை", "சனிக்கிழமை"];

const WEEKDAY_DEITY = [
  { deity: "சூரிய பகவான்", temple: "சூரியனார் கோயில் (ஆடுதுறை)", note: "ஆரோக்கியம், அதிகாரம், தந்தை வழி நன்மை." },
  { deity: "சந்திரன் / சிவன்", temple: "திங்களூர் கைலாசநாதர்", note: "மனநிம்மதி, தாய் வழி நன்மை." },
  { deity: "அங்காரகன் / முருகன்", temple: "வைத்தீஸ்வரன் கோயில்", note: "தைரியம், சொத்து, கடன் நிவர்த்தி." },
  { deity: "புதன் / விஷ்ணு", temple: "திருவெண்காடு புதன் கோயில்", note: "கல்வி, வர்த்தகம், பேச்சுத்திறன்." },
  { deity: "குரு பகவான்", temple: "ஆலங்குடி குரு கோயில்", note: "ஞானம், திருமணம், சந்தான பாக்கியம்." },
  { deity: "சுக்ரன் / மகாலட்சுமி", temple: "கஞ்சனூர் சுக்கிரன் கோயில்", note: "செல்வம், கலை, சுகபோகம்." },
  { deity: "சனீஸ்வரன் / ஐயப்பன்", temple: "திருநள்ளாறு சனீஸ்வரன் கோயில்", note: "உழைப்பு பலன், தடை நீக்கம்." },
];

const NAKSHATRA_DEVATA = [
  "அஸ்வினி தேவர்கள்", "யமன்", "அக்னி", "பிரம்மா", "சந்திரன்", "ருத்ரன்", "அதிதி", "பிரகஸ்பதி (குரு)", "நாக தேவதை",
  "பித்ருக்கள்", "பகன்", "அர்யமன்", "சூரியன்", "துவஷ்டா", "வாயு", "இந்திராக்னி", "மித்ரன்", "இந்திரன்",
  "நிருதி", "ஜலம் (அப்பு)", "விஸ்வேதேவர்கள்", "விஷ்ணு", "வசுக்கள்", "வருணன்", "அஜ ஏகபாத்", "அஹிர்புத்னியன்", "பூஷன்",
];

const Section = ({
  title,
  value,
  img,
  deity,
  lines,
}: {
  title: string;
  value: string;
  img: string;
  deity: string;
  lines: string[];
}) => (
  <Card className="border-gold/40 overflow-hidden">
    <div className="bg-maroon-deep/90 text-gold font-tamil text-center py-2 text-lg font-bold">{title}</div>
    <img src={img} alt={`${title} அதிதேவதை ${deity}`} loading="lazy" width={768} height={768} className="w-full aspect-square object-cover" />
    <CardContent className="pt-4 space-y-1 text-center">
      <div className="font-tamil text-xl font-bold text-maroon-deep">{value}</div>
      <div className="font-tamil text-base text-gold-deep font-semibold">அதிதேவதை: {deity}</div>
      {lines.map((l, i) => (
        <p key={i} className="font-tamil text-sm text-muted-foreground">{l}</p>
      ))}
    </CardContent>
  </Card>
);

const PanchangaDeities = () => {
  const now = new Date();
  const [date, setDate] = useState<Date>(now);
  const [time, setTime] = useState<string>(format(now, "HH:mm"));
  const [placeIdx, setPlaceIdx] = useState<number>(0);

  const result: JathagamResult | null = useMemo(() => {
    try {
      const place = PLACES[placeIdx] ?? PLACES[0];
      const [h, m] = time.split(":").map(Number);
      return computeJathagam({
        name: "பஞ்சாங்க தேவதைகள்",
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

  const weekday = date.getDay();
  const wd = WEEKDAY_DEITY[weekday];
  const p = result?.panchangam;
  const nakIdx = result?.moon.nakshatraIndex ?? 0;
  const bird = panchaPakshi(nakIdx);
  const thithi = p ? THITHI_TEMPLES[p.tithiIndex % 15] : null;
  const yogam = p ? YOGAM_TEMPLES[p.yogaIndex % 27] : null;
  const karanam = p ? KARANAM_TEMPLES[p.karanaIndex % 11] : null;

  const downloadSheet = async () => {
    // 16in x 20in @ 150 DPI
    const W = 2400, H = 3000;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    const cw = W / 2, ch = H / 3;
    const load = (src: string) =>
      new Promise<HTMLImageElement>((res, rej) => {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.onload = () => res(im);
        im.onerror = rej;
        im.src = src;
      });
    const imgs = await Promise.all(SHEET_IMAGES.map(load));
    imgs.forEach((im, i) => {
      const dx = (i % 2) * cw, dy = Math.floor(i / 2) * ch;
      const scale = Math.max(cw / im.width, ch / im.height);
      const sw = cw / scale, sh = ch / scale;
      ctx.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, dx, dy, cw, ch);
    });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.95);
    a.download = "panchanga-deities-16x20.jpg";
    a.click();
  };


  return (
    <>
      <main className="min-h-screen">
        <SEO
          title="பஞ்சாங்க அதிதேவதைகள் — நாள், நட்சத்திரம், திதி, யோகம், கரணம் | ASTRO UR"
          description="இன்றைய நாள், நட்சத்திரம், திதி, யோகம், கரணம் மற்றும் பஞ்ச பட்சி அதிதேவதைகள் படங்களுடன் — தேதி தேர்ந்தெடுத்து பாருங்கள்."
        />
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <Link to="/" className="inline-flex items-center text-maroon-deep hover:text-gold font-tamil text-sm mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> முகப்பு
          </Link>

          <header className="text-center mb-8">
            <div className="font-display text-xs tracking-[0.4em] text-gold-deep mb-2">✦ PANCHANGA DEITIES ✦</div>
            <h1 className="font-tamil text-3xl md:text-5xl font-bold text-maroon-deep">
              பஞ்சாங்க <span className="text-gold">அதிதேவதைகள்</span>
            </h1>
            <p className="font-tamil text-sm md:text-base text-muted-foreground mt-3 max-w-2xl mx-auto">
              நாள், நட்சத்திரம், திதி, யோகம், கரணம் மற்றும் பஞ்ச பட்சி — ஒவ்வொன்றுக்கும் உரிய அதிதேவதை, பரிகார தலம் மற்றும் வழிபாட்டு பலன்.
            </p>
          </header>

          <Card className="mb-8 border-gold/40">
            <CardContent className="pt-6 grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="font-tamil text-maroon-deep">தேதி</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start font-tamil")}>
                      <CalendarIcon className="w-4 h-4 mr-2" /> {format(date, "dd/MM/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className="pointer-events-auto" />
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
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-tamil"
                  value={placeIdx}
                  onChange={(e) => setPlaceIdx(Number(e.target.value))}
                >
                  {PLACES.map((pl, i) => (
                    <option key={pl.name} value={i}>{pl.name}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-6">
            <Section
              title="நாள்"
              value={WEEKDAY_TAMIL[weekday]}
              img={imgNaal}
              deity={wd.deity}
              lines={[`பரிகார தலம்: ${wd.temple}`, wd.note]}
            />
            <Section
              title="நட்சத்திரம்"
              value={`${result?.nakshatraTamil ?? "—"} (பாதம் ${result?.pada ?? "—"})`}
              img={imgNak}
              deity={NAKSHATRA_DEVATA[nakIdx]}
              lines={[`நட்சத்திர அதிபதி: ${result?.nakshatraLordTamil ?? "—"}`, "நட்சத்திர நாளில் அதிதேவதைக்கு தீபம் ஏற்றி வழிபடவும்."]}
            />
            <Section
              title="திதி"
              value={p ? `${p.paksha} — ${p.tithiTamil}` : "—"}
              img={imgThithi}
              deity={thithi?.deity ?? "—"}
              lines={[`பரிகார தலம்: ${thithi?.temple ?? "—"}`, "திதி தேவதைக்கு நெய் தீபம் — மனநிம்மதி."]}
            />
            <Section
              title="யோகம்"
              value={p?.yogaTamil ?? "—"}
              img={imgYogam}
              deity={yogam?.deity ?? "—"}
              lines={[`பரிகார தலம்: ${yogam?.temple ?? "—"}`, "யோக தேவதை வழிபாடு — காரிய சித்தி."]}
            />
            <Section
              title="கரணம்"
              value={p?.karanaTamil ?? "—"}
              img={imgKaranam}
              deity={karanam?.deity ?? "—"}
              lines={[`பரிகார தலம்: ${karanam?.temple ?? "—"}`, "கரண தேவதை வழிபாடு — செயல் வெற்றி."]}
            />
            <Section
              title="பஞ்ச பட்சி"
              value={bird.bird}
              img={imgPakshi}
              deity={`${bird.bird} பட்சி`}
              lines={[bird.nature, `நண்பர்: ${bird.friends.join(", ") || "—"}`, `எதிரி: ${bird.enemies.join(", ") || "—"}`]}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-8 no-print">
            <Button onClick={() => window.print()} className="font-tamil">
              <Printer className="w-4 h-4 mr-2" /> 16 × 20 அச்சிடு (படங்கள் மட்டும்)
            </Button>
            <Button variant="outline" onClick={downloadSheet} className="font-tamil">
              <Download className="w-4 h-4 mr-2" /> 16 × 20 பதிவிறக்கம்
            </Button>
          </div>
        </div>
        <SiteFooter />
      </main>

      {/* 16in x 20in image-only print sheet */}
      <div className="print-sheet-1620">
        <div className="sheet-grid">
          {SHEET_IMAGES.map((src, i) => (
            <img key={i} src={src} alt="" />
          ))}
        </div>
      </div>

      <style>{`
        .print-sheet-1620 { display: none; }
        .sheet-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(3, 1fr); width: 100%; height: 100%; gap: 0; }
        .sheet-grid img { width: 100%; height: 100%; object-fit: cover; display: block; }
        @media print {
          @page { size: 16in 20in; margin: 0; }
          body * { visibility: hidden !important; }
          .print-sheet-1620, .print-sheet-1620 * { visibility: visible !important; }
          .print-sheet-1620 { display: block !important; position: absolute; inset: 0; width: 16in; height: 20in; }
        }
      `}</style>
      <WhatsAppButton />
    </>
  );
};


export default PanchangaDeities;
