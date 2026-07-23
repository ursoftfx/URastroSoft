import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ArrowLeft, Heart, Printer } from "lucide-react";
import {
  NAKSHATRAS, RASIS, compute10Porutham, PoruthamResult,
} from "@/lib/porutham";
import { computeJathagam, JathagamResult, BirthInput } from "@/lib/jathagam";
import { detectDoshams, Dosham } from "@/lib/dosham";
import { RasiChart } from "@/components/RasiChart";
import { PLACES } from "@/lib/places";
import { SiteFooter } from "@/components/SiteFooter";
import { PoruthamPublisherContent } from "@/components/AdSenseContentBlocks";
import { cn } from "@/lib/utils";

interface PersonForm {
  name: string;
  father: string;
  mother: string;
  address: string;
  nak: string;
  rasi: string;
  date: string; // dd/mm/yyyy
  time: string; // HH:MM
  place: string;
}

const empty: PersonForm = { name: "", father: "", mother: "", address: "", nak: "", rasi: "", date: "", time: "", place: "" };

function parseDate(dd: string) {
  const m = dd.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = +m[1], mo = +m[2], y = +m[3];
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return { d, mo, y };
}

function formatDate(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function tryCompute(p: PersonForm, gender: string): JathagamResult | null {
  const d = parseDate(p.date);
  const place = PLACES.find((x) => x.name === p.place);
  if (!d || !p.time || !place) return null;
  const [hh, mm] = p.time.split(":").map(Number);
  if (isNaN(hh) || isNaN(mm)) return null;
  const input: BirthInput = {
    year: d.y, month: d.mo, day: d.d, hour: hh, minute: mm,
    tzOffsetHours: place.tz, latitude: place.lat, longitude: place.lon,
    placeName: place.name, name: p.name || "-", gender,
  };
  try { return computeJathagam(input); } catch { return null; }
}

// Match prediction based on porutham score + dosham compatibility
function buildMatchPrediction(
  result: PoruthamResult,
  boyDosh: Dosham[] | null,
  girlDosh: Dosham[] | null,
) {
  const pct = (result.total / result.max) * 100;
  const paras: string[] = [];

  if (pct >= 75) {
    paras.push("இந்த ஜோடி பொருத்தத்தில் மிக உயர்ந்த மதிப்பெண் பெற்றுள்ளது. திருமண வாழ்க்கை நீண்ட, மகிழ்ச்சிகரமான, செல்வம் நிறைந்ததாக அமையும். மனஒற்றுமை, சந்ததி பாக்கியம், குடும்ப முன்னேற்றம் இயற்கையாக அமையும்.");
  } else if (pct >= 60) {
    paras.push("இந்த ஜோடி நல்ல பொருத்தம் கொண்டுள்ளது. சில சிறு வேறுபாடுகள் இருந்தாலும் புரிதலுடன் பழகினால் திருமண வாழ்க்கை நன்றாக அமையும். பொருளாதாரம் மற்றும் குழந்தை பாக்கியத்தில் நேர்மறை பலன்கள் உள்ளன.");
  } else if (pct >= 40) {
    paras.push("சாதாரண பொருத்தம். சில முக்கிய பொருத்தங்கள் குறைவாக உள்ளன. நிபுணரின் ஆலோசனை மற்றும் பரிகாரங்கள் மூலம் திருமணம் செய்யலாம். பொறுமையும் புரிதலும் அவசியம்.");
  } else {
    paras.push("பொருத்தம் குறைவு. முக்கிய பொருத்தங்களில் தோஷம் தென்படுகிறது. அனுபவம் வாய்ந்த ஜோதிடரை அணுகி ஆழ்ந்த ஆய்வு, தேவையான பரிகாரங்கள் செய்த பின்பே திருமண முடிவை எடுக்கவும்.");
  }

  // dosham-specific commentary
  if (boyDosh && girlDosh) {
    const boyMars = boyDosh.find((d) => d.name.includes("செவ்வாய்"))?.present;
    const girlMars = girlDosh.find((d) => d.name.includes("செவ்வாய்"))?.present;
    if (boyMars && girlMars) {
      paras.push("இருவருக்கும் செவ்வாய் தோஷம் உள்ளது — இரு தோஷங்களும் ஒன்றை ஒன்று ரத்து செய்கின்றன (பரிஹாரம் ஆகின்றது). இந்த சேர்க்கை பாதுகாப்பானது.");
    } else if (boyMars || girlMars) {
      paras.push(`${boyMars ? "மணமகனுக்கு" : "மணமகளுக்கு"} செவ்வாய் தோஷம் உள்ளது, மற்றவர் தோஷமற்றவர். திருமண தாமதம் அல்லது ஆரோக்கிய கவனம் தேவை. செவ்வாய் சாந்தி பரிகாரம் செய்ய பரிந்துரைக்கிறோம்.`);
    } else {
      paras.push("இருவருக்கும் செவ்வாய் தோஷம் இல்லை — திருமண வாழ்வில் அமைதி நிலவும்.");
    }

    const anyKala = [boyDosh, girlDosh].some((ds) => ds.find((d) => d.name.includes("சர்ப்ப"))?.present);
    if (anyKala) paras.push("ஒருவருக்கு கால சர்ப்ப தோஷம் தென்படுகிறது — நாக பிரதிஷ்டை, ராகு-கேது பரிகாரம் திருமணத்திற்கு முன் செய்யவும்.");

    const anySade = [boyDosh, girlDosh].some((ds) => ds.find((d) => d.name.includes("ஏழரை"))?.present);
    if (anySade) paras.push("தற்போது ஏழரை சனி காலம் ஒருவருக்கு இயங்குகிறது — திருமண தேதி தேர்வில் ஜோதிடரின் ஆலோசனை அவசியம்.");
  }

  // life-area guidance
  const items = result.items;
  const rajju = items.find((i) => i.name.includes("ரஜ்ஜு"));
  const vedha = items.find((i) => i.name.includes("வேத"));
  const gana = items.find((i) => i.name.includes("கண"));
  const yoni = items.find((i) => i.name.includes("யோனி"));
  if (rajju?.score === 0) paras.push("ரஜ்ஜு தோஷம் — ஆயுள் மற்றும் குடும்ப நலனுக்கு பரிகாரம் அவசியம். மிருத்யுஞ்சய ஜபம், கால பைரவர் வழிபாடு நல்லது.");
  if (vedha?.score === 0) paras.push("வேத தோஷம் — தம்பதிகளுக்கிடையே கருத்து வேறுபாடு ஏற்படலாம். இரு நட்சத்திரங்களின் தேவதைகளை வழிபடுவது தீர்வாகும்.");
  if (gana && gana.score < gana.max) paras.push("கண பொருத்தத்தில் சிறு குறை — சுபாவத்தில் வேறுபாடு இருக்கலாம், புரிதல் அவசியம்.");
  if (yoni && yoni.score < 0.75) paras.push("யோனி பொருத்தம் மிதமானது — உடல் ஈர்ப்பில் பொருந்துதலை மேம்படுத்த சுக்ர பரிகாரம் நல்லது.");

  return paras;
}

const PersonSection = ({
  title, p, setP,
}: { title: string; p: PersonForm; setP: (u: PersonForm) => void }) => {
  const [placeOpen, setPlaceOpen] = useState(false);
  return (
    <div className="space-y-3">
      <h2 className="font-tamil text-xl font-bold text-maroon-deep border-b border-gold/30 pb-2">{title}</h2>
      <div>
        <Label className="font-tamil">பெயர்</Label>
        <Input className="font-tamil" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="font-tamil">தந்தை</Label>
          <Input className="font-tamil" value={p.father} onChange={(e) => setP({ ...p, father: e.target.value })} />
        </div>
        <div>
          <Label className="font-tamil">தாய்</Label>
          <Input className="font-tamil" value={p.mother} onChange={(e) => setP({ ...p, mother: e.target.value })} />
        </div>
      </div>
      <div>
        <Label className="font-tamil">முகவரி</Label>
        <Textarea className="font-tamil" value={p.address} onChange={(e) => setP({ ...p, address: e.target.value })} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="font-tamil">பிறந்த தேதி (dd/mm/yyyy)</Label>
          <Input value={p.date} onChange={(e) => setP({ ...p, date: formatDate(e.target.value) })} placeholder="dd/mm/yyyy" maxLength={10} />
        </div>
        <div>
          <Label className="font-tamil">பிறந்த நேரம்</Label>
          <Input type="time" value={p.time} onChange={(e) => setP({ ...p, time: e.target.value })} />
        </div>
      </div>
      <div>
        <Label className="font-tamil">பிறந்த ஊர்</Label>
        <Popover open={placeOpen} onOpenChange={setPlaceOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className={cn("w-full justify-between font-normal", !p.place && "text-muted-foreground")}>
              {p.place || "ஊரை தேர்ந்தெடுக்கவும்..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover z-50">
            <Command>
              <CommandInput placeholder="ஊரை தேடவும்..." />
              <CommandList>
                <CommandEmpty>ஊர் கிடைக்கவில்லை</CommandEmpty>
                <CommandGroup>
                  {PLACES.map((pl) => (
                    <CommandItem key={pl.name} value={pl.name} onSelect={() => { setP({ ...p, place: pl.name }); setPlaceOpen(false); }}>
                      {pl.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="font-tamil">நட்சத்திரம் (கைமுறை)</Label>
          <Select value={p.nak} onValueChange={(v) => setP({ ...p, nak: v })}>
            <SelectTrigger className="font-tamil"><SelectValue placeholder="தேர்வு" /></SelectTrigger>
            <SelectContent className="font-tamil max-h-72">
              {NAKSHATRAS.map((n, i) => <SelectItem key={i} value={String(i)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="font-tamil">ராசி (கைமுறை)</Label>
          <Select value={p.rasi} onValueChange={(v) => setP({ ...p, rasi: v })}>
            <SelectTrigger className="font-tamil"><SelectValue placeholder="தேர்வு" /></SelectTrigger>
            <SelectContent className="font-tamil">
              {RASIS.map((r, i) => <SelectItem key={i} value={String(i)}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-xs text-muted-foreground font-tamil">பிறப்பு விவரங்கள் கொடுத்தால் ஜாதகம் + தோஷம் தானாக உருவாகும். இல்லையேல் நட்சத்திரம்/ராசி மட்டும் தேர்வு செய்யவும்.</p>
    </div>
  );
};

const severityColor = (s: Dosham["severity"]) =>
  s === "severe" ? "text-destructive" : s === "moderate" ? "text-gold-deep" : s === "mild" ? "text-amber-600" : "text-green-700";

const DoshamCard = ({ title, list }: { title: string; list: Dosham[] }) => (
  <div className="border border-gold/30 rounded-lg p-3 bg-gold/5">
    <div className="font-tamil font-bold text-maroon-deep mb-2">{title}</div>
    <div className="space-y-2">
      {list.map((d, i) => (
        <div key={i} className="text-xs font-tamil border-b border-gold/10 pb-1 last:border-0">
          <div className="flex justify-between gap-2">
            <span className="font-semibold">{d.name}</span>
            <span className={cn("font-bold", severityColor(d.severity))}>
              {d.present ? (d.severity === "severe" ? "தீவிரம்" : d.severity === "moderate" ? "மிதம்" : "உள்ளது") : "இல்லை"}
            </span>
          </div>
          <div className="text-muted-foreground mt-0.5">{d.description}</div>
          {d.remedy && <div className="text-maroon-deep mt-0.5">பரிகாரம்: {d.remedy}</div>}
        </div>
      ))}
    </div>
  </div>
);

const Porutham = () => {
  const [boy, setBoy] = useState<PersonForm>({ ...empty });
  const [girl, setGirl] = useState<PersonForm>({ ...empty });
  const [result, setResult] = useState<PoruthamResult | null>(null);
  const [boyJ, setBoyJ] = useState<JathagamResult | null>(null);
  const [girlJ, setGirlJ] = useState<JathagamResult | null>(null);
  const [predictions, setPredictions] = useState<string[]>([]);

  const boyDosh = useMemo(() => (boyJ ? detectDoshams(boyJ) : null), [boyJ]);
  const girlDosh = useMemo(() => (girlJ ? detectDoshams(girlJ) : null), [girlJ]);

  const derived = (p: PersonForm, gender: string) => {
    const j = tryCompute(p, gender);
    const nak = j ? j.moon.nakshatraIndex : (p.nak ? +p.nak : NaN);
    const rasi = j ? j.moon.rasiIndex : (p.rasi ? +p.rasi : NaN);
    return { j, nak, rasi };
  };

  const canSubmit = (boy.nak && boy.rasi || (parseDate(boy.date) && boy.time && boy.place))
    && (girl.nak && girl.rasi || (parseDate(girl.date) && girl.time && girl.place));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const b = derived(boy, "ஆண்");
    const g = derived(girl, "பெண்");
    if (isNaN(b.nak) || isNaN(b.rasi) || isNaN(g.nak) || isNaN(g.rasi)) return;
    const r = compute10Porutham(b.nak, b.rasi, g.nak, g.rasi);
    setResult(r);
    setBoyJ(b.j);
    setGirlJ(g.j);
    const bDosh = b.j ? detectDoshams(b.j) : null;
    const gDosh = g.j ? detectDoshams(g.j) : null;
    setPredictions(buildMatchPrediction(r, bDosh, gDosh));
    setTimeout(() => document.getElementById("porutham-result")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handlePrint = () => window.print();

  const bDerived = derived(boy, "ஆண்");
  const gDerived = derived(girl, "பெண்");

  return (
    <>
      <main className="min-h-screen relative">
        <SEO
          title="திருமண பொருத்தம் — ஜாதகம் + தோஷம் + பலன் | Marriage Matching"
          description="இலவச திருமண பொருத்தம் — ராசி நட்சத்திரம், ஜாதகம், தோஷம், பொருத்த பலன் மற்றும் பரிகாரங்கள் ஒரே இடத்தில்."
          canonical="/porutham"
        />
        <style>{`
          @media print {
            @page { size: A4; margin: 12mm; }
            body { background: white !important; }
            .no-print { display: none !important; }
            .print-area { box-shadow: none !important; }
          }
        `}</style>

        <div className="fixed inset-0 pointer-events-none overflow-hidden no-print">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-gold opacity-[0.04] blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-10 md:py-16">
          <Link to="/" className="inline-flex items-center text-maroon-deep hover:text-gold font-tamil mb-6 no-print">
            <ArrowLeft className="w-4 h-4 mr-2" /> முகப்பு
          </Link>

          <header className="text-center mb-10 animate-fade-up no-print">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-royal shadow-royal mb-4">
              <Heart className="w-8 h-8 text-gold-bright" />
            </div>
            <div className="font-display text-xs tracking-[0.5em] text-gold-deep mb-2">✦ THIRUMANA PORUTHAM ✦</div>
            <h1 className="font-tamil text-4xl md:text-6xl font-bold text-maroon-deep">
              திருமண <span className="text-gold">பொருத்தம்</span>
            </h1>
            <p className="font-tamil text-base md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
              பிறந்த தேதி + நேரம் + ஊர் கொடுத்தால் இரு ஜாதகங்கள், தோஷம், 10 பொருத்தம், விரிவான பலன் — அனைத்தும் தானாக!
            </p>
            <div className="temple-divider mt-6 max-w-md mx-auto" />
          </header>

          <form onSubmit={handleSubmit} className="parchment rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
            <PersonSection title="பெண் (மணமகள்)" p={girl} setP={setGirl} />
            <PersonSection title="ஆண் (மணமகன்)" p={boy} setP={setBoy} />
            <div className="md:col-span-2">
              <Button type="submit" disabled={!canSubmit} className="w-full bg-gradient-royal text-primary-foreground font-tamil text-lg py-6">
                ஜாதகம் + பொருத்தம் பார்க்க
              </Button>
            </div>
          </form>

          {result && (
            <section id="porutham-result" className="mt-10 animate-fade-up print-area space-y-6">
              <div className="parchment rounded-2xl p-6 md:p-8">
                <div className="text-center mb-6">
                  <div className="font-display text-xs tracking-[0.4em] text-gold-deep">THIRUMANA PORUTHAM</div>
                  <h2 className="font-tamil text-2xl md:text-3xl font-bold text-maroon-deep mt-1">திருமண பொருத்தம் அறிக்கை</h2>
                  <div className="temple-divider my-3" />
                </div>

                {/* Names & Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 font-tamil text-sm">
                  {[{ p: girl, d: gDerived, title: "பெண் (மணமகள்)" }, { p: boy, d: bDerived, title: "ஆண் (மணமகன்)" }].map((s, i) => (
                    <div key={i} className="border border-gold/30 rounded-lg p-4 bg-gold/5">
                      <div className="font-bold text-maroon-deep mb-2">{s.title}</div>
                      {s.p.name && <div><span className="text-muted-foreground">பெயர்:</span> <b>{s.p.name}</b></div>}
                      {s.p.father && <div><span className="text-muted-foreground">தந்தை:</span> {s.p.father}</div>}
                      {s.p.mother && <div><span className="text-muted-foreground">தாய்:</span> {s.p.mother}</div>}
                      {s.p.address && <div><span className="text-muted-foreground">முகவரி:</span> {s.p.address}</div>}
                      {s.p.date && <div><span className="text-muted-foreground">பிறந்த தேதி:</span> {s.p.date} {s.p.time}</div>}
                      {s.p.place && <div><span className="text-muted-foreground">ஊர்:</span> {s.p.place}</div>}
                      <div><span className="text-muted-foreground">நட்சத்திரம்:</span> {NAKSHATRAS[s.d.nak]}</div>
                      <div><span className="text-muted-foreground">ராசி:</span> {RASIS[s.d.rasi]}</div>
                      {s.d.j && <div><span className="text-muted-foreground">லக்னம்:</span> {s.d.j.ascendant.rasiTamil}</div>}
                    </div>
                  ))}
                </div>

                <div className="text-center mb-6">
                  <div className="font-tamil text-5xl font-bold text-maroon-deep">
                    {result.total.toFixed(2)}<span className="text-2xl text-muted-foreground"> / {result.max}</span>
                  </div>
                  <div className="font-tamil text-lg text-gold-deep mt-2">{result.verdict}</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full font-tamil text-sm">
                    <thead className="bg-gradient-royal text-primary-foreground">
                      <tr>
                        <th className="text-left p-3">பொருத்தம்</th>
                        <th className="text-center p-3">மதிப்பு</th>
                        <th className="text-left p-3">விளக்கம்</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.items.map((it, i) => (
                        <tr key={i} className="border-t border-gold/20 hover:bg-gold/5">
                          <td className="p-3 font-semibold text-maroon-deep">{it.name}</td>
                          <td className="p-3 text-center">
                            <span className={`font-bold ${it.score === it.max ? "text-green-700" : it.score === 0 ? "text-destructive" : "text-gold-deep"}`}>
                              {it.score}/{it.max}
                            </span>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground">{it.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Horoscopes */}
              {(boyJ || girlJ) && (
                <div className="parchment rounded-2xl p-6 md:p-8">
                  <h3 className="font-tamil text-2xl font-bold text-maroon-deep text-center mb-4">இரு ஜாதகங்கள் — ராசி சக்கரம்</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {boyJ && (
                      <div>
                        <div className="font-tamil font-bold text-center text-maroon-deep mb-2">ஆண் — {boy.name || "மணமகன்"}</div>
                        <RasiChart result={boyJ} />
                      </div>
                    )}
                    {girlJ && (
                      <div>
                        <div className="font-tamil font-bold text-center text-maroon-deep mb-2">பெண் — {girl.name || "மணமகள்"}</div>
                        <RasiChart result={girlJ} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Doshams */}
              {(boyDosh || girlDosh) && (
                <div className="parchment rounded-2xl p-6 md:p-8">
                  <h3 className="font-tamil text-2xl font-bold text-maroon-deep text-center mb-4">தோஷ விவரம்</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {boyDosh && <DoshamCard title={`ஆண் — ${boy.name || "மணமகன்"}`} list={boyDosh} />}
                    {girlDosh && <DoshamCard title={`பெண் — ${girl.name || "மணமகள்"}`} list={girlDosh} />}
                  </div>
                </div>
              )}

              {/* Predictions */}
              {predictions.length > 0 && (
                <div className="parchment rounded-2xl p-6 md:p-8">
                  <h3 className="font-tamil text-2xl font-bold text-maroon-deep text-center mb-4">பொருத்த பலன் — Match Predictions</h3>
                  <div className="space-y-3 font-tamil text-sm md:text-base leading-relaxed">
                    {predictions.map((para, i) => (
                      <p key={i} className="text-foreground/90">{para}</p>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground font-tamil text-center mt-6">
                    ✦ இது கணிணி பொருத்தம். இறுதி முடிவுக்கு அனுபவம் வாய்ந்த ஜோதிடரை அணுகவும். WhatsApp: 9600543617 ✦
                  </p>
                </div>
              )}

              <div className="flex justify-center no-print">
                <Button onClick={handlePrint} className="bg-gradient-royal text-primary-foreground font-tamil">
                  <Printer className="w-4 h-4 mr-2" /> அச்சிடு / Print
                </Button>
              </div>
            </section>
          )}

          <PoruthamPublisherContent />
        </div>

        <div className="no-print">
          <WhatsAppButton message="வணக்கம்! எனக்கு திருமண பொருத்தம் ஆலோசனை வேண்டும்." />
        </div>
      </main>
      <SiteFooter />
    </>
  );
};

export default Porutham;
