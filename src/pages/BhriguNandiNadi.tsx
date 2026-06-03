import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles, Star, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { BirthForm } from "@/components/BirthForm";
import {
  BirthInput,
  JathagamResult,
  PLANETS_TAMIL,
  RASIS_TAMIL,
  computeJathagam,
} from "@/lib/jathagam";
import { toast } from "sonner";

// Exaltation (உச்சம்) and Debilitation (நீச்சம்) reference — rasi index 0..11 (மேஷம்..மீனம்)
const UCHAM_NEECHAM: { key: string; tamil: string; uchamIdx: number; uchamDeg: number; neechamIdx: number; neechamDeg: number; ownIdx: number[] }[] = [
  { key: "sun",     tamil: "சூரியன்",  uchamIdx: 0,  uchamDeg: 10, neechamIdx: 6,  neechamDeg: 10, ownIdx: [4] },
  { key: "moon",    tamil: "சந்திரன்", uchamIdx: 1,  uchamDeg: 3,  neechamIdx: 7,  neechamDeg: 3,  ownIdx: [3] },
  { key: "mars",    tamil: "செவ்வாய்", uchamIdx: 9,  uchamDeg: 28, neechamIdx: 3,  neechamDeg: 28, ownIdx: [0, 7] },
  { key: "mercury", tamil: "புதன்",    uchamIdx: 5,  uchamDeg: 15, neechamIdx: 11, neechamDeg: 15, ownIdx: [2, 5] },
  { key: "jupiter", tamil: "குரு",     uchamIdx: 3,  uchamDeg: 5,  neechamIdx: 9,  neechamDeg: 5,  ownIdx: [8, 11] },
  { key: "venus",   tamil: "சுக்ரன்",  uchamIdx: 11, uchamDeg: 27, neechamIdx: 5,  neechamDeg: 27, ownIdx: [1, 6] },
  { key: "saturn",  tamil: "சனி",      uchamIdx: 6,  uchamDeg: 20, neechamIdx: 0,  neechamDeg: 20, ownIdx: [9, 10] },
  { key: "rahu",    tamil: "ராகு",     uchamIdx: 1,  uchamDeg: 20, neechamIdx: 7,  neechamDeg: 20, ownIdx: [] },
  { key: "ketu",    tamil: "கேது",     uchamIdx: 7,  uchamDeg: 20, neechamIdx: 1,  neechamDeg: 20, ownIdx: [] },
];

function planetStrength(key: string, rasiIndex: number): { label: string; cls: string } | null {
  const row = UCHAM_NEECHAM.find((r) => r.key === key);
  if (!row) return null;
  if (rasiIndex === row.uchamIdx) return { label: "உச்சம்", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  if (rasiIndex === row.neechamIdx) return { label: "நீச்சம்", cls: "text-red-700 bg-red-50 border-red-200" };
  if (row.ownIdx.includes(rasiIndex)) return { label: "சுய ஸ்தானம்", cls: "text-amber-800 bg-amber-50 border-amber-200" };
  return null;
}

/* ---------------- Bhrigu Nandi Nadi (BNN) core helpers ----------------
 * BNN is a karaka + conjunction based predictive system. We compute simple,
 * rule-based readings from the natal chart for educational purposes only.
 * The deeper interpretive nuance still requires a qualified astrologer.
 */

const BNN_KARAKAS: { key: string; tamil: string; signifies: string }[] = [
  { key: "sun", tamil: "சூரியன்", signifies: "தந்தை, ஆத்மா, அரசு வேலை, அதிகாரம், ஆரோக்கியம்" },
  { key: "moon", tamil: "சந்திரன்", signifies: "தாய், மனம், திரவம், பயணம், பொது மக்கள்" },
  { key: "mars", tamil: "செவ்வாய்", signifies: "சகோதரர், நிலம், கட்டிடம், தைரியம், போட்டி, வழக்கு" },
  { key: "mercury", tamil: "புதன்", signifies: "கல்வி, வர்த்தகம், எழுத்து, பேச்சு, உறவினர்" },
  { key: "jupiter", tamil: "குரு", signifies: "குழந்தை, ஞானம், செல்வம், கணவன், குரு, மங்களம்" },
  { key: "venus", tamil: "சுக்ரன்", signifies: "மனைவி, காதல், கலை, வாகனம், ஆடம்பரம்" },
  { key: "saturn", tamil: "சனி", signifies: "வேலை, கர்மா, தாமதம், சேவை, தொழிலாளி, விவசாயம்" },
  { key: "rahu", tamil: "ராகு", signifies: "வெளிநாடு, மாயை, அசாதாரண ஆதாயம், தொழில்நுட்பம்" },
  { key: "ketu", tamil: "கேது", signifies: "மோட்சம், ஆன்மீகம், விடுதலை, மருத்துவம், ரகசியம்" },
];

const HOUSE_MEANINGS_TAMIL = [
  "1 — தனு (உடல், தோற்றம், ஆரம்பம்)",
  "2 — தனம் (குடும்பம், செல்வம், பேச்சு)",
  "3 — சகோதரர் (தைரியம், முயற்சி, குறுகிய பயணம்)",
  "4 — தாய் (வீடு, வாகனம், மனநிறைவு)",
  "5 — குழந்தை (கல்வி, மந்திரம், பூர்வ புண்ணியம்)",
  "6 — எதிரி (கடன், நோய், போட்டி, வேலை)",
  "7 — மணம் (மனைவி/கணவன், கூட்டாளி)",
  "8 — ஆயுள் (மாற்றம், ரகசியம், திடீர் நிகழ்வு)",
  "9 — தந்தை (பாக்கியம், தர்மம், நெடும் பயணம்)",
  "10 — தொழில் (கீர்த்தி, அதிகாரம், கர்மா)",
  "11 — லாபம் (வருமானம், விருப்பம் நிறைவு)",
  "12 — விரயம் (செலவு, வெளிநாடு, மோட்சம்)",
];

const BNN_RULES: { step: number; title: string; body: string }[] = [
  {
    step: 1,
    title: "லக்னத்தை அடிப்படையாக கொள்ளுங்கள்",
    body:
      "பிருகு நந்தி நாடி சாஸ்திரத்தில் அனைத்து வீடுகளும் லக்னத்திலிருந்து எண்ணப்படும். சந்திர லக்னம் / சூரிய லக்னம் என்று மாற்றி பார்க்க வேண்டிய அவசியம் இல்லை.",
  },
  {
    step: 2,
    title: "காரகனை அறியுங்கள்",
    body:
      "ஒவ்வொரு கிரகமும் ஒரு உறவை / விஷயத்தை குறிக்கும் (காரகன்). எ.கா: சூரியன் = தந்தை, சந்திரன் = தாய், குரு = குழந்தை/கணவன், சுக்ரன் = மனைவி, செவ்வாய் = சகோதரர், சனி = வேலை.",
  },
  {
    step: 3,
    title: "காரகன் அமர்ந்த வீட்டின் பலனை எடுக்கவும்",
    body:
      "காரகன் எந்த வீட்டில் அமர்ந்துள்ளாரோ அந்த வீட்டின் பலனை அந்த நபருக்கு (காரகனுக்கு) கொடுப்பார். எ.கா: சூரியன் 10ல் இருந்தால் தந்தை அரசு / உயர் பதவியில் இருப்பார்.",
  },
  {
    step: 4,
    title: "சேர்க்கையை (Conjunction) மட்டுமே பாருங்கள்",
    body:
      "BNNஇல் பார்வை (drishti) கணக்கில் கொள்ளப்படாது. ஒரே வீட்டில் இருக்கும் கிரகங்கள் மட்டுமே ஒன்றோடு ஒன்று பலன் தருகின்றன. குரு + சுக்ரன் ஒரே வீட்டில் = திருமணம் / குழந்தை யோகம்.",
  },
  {
    step: 5,
    title: "12ம் வீடு என்பது 'இழப்பு'",
    body:
      "ஒரு காரகனிலிருந்து 12ம் வீட்டில் இருக்கும் கிரகம் அந்த விஷயத்தில் இழப்பை குறிக்கும். சூரியனிலிருந்து 12ல் சனி இருந்தால் தந்தைக்கு கஷ்டம் / பிரிவு.",
  },
  {
    step: 6,
    title: "2ம் வீடு என்பது 'கூடுதல்/போஷணை'",
    body:
      "காரகனிலிருந்து 2ல் உள்ள கிரகம் அந்த விஷயத்தை வளர்க்கும். குருவிலிருந்து 2ல் சந்திரன் இருந்தால் குழந்தை யோகம் / குடும்பம் வளரும்.",
  },
  {
    step: 7,
    title: "ராகு = அதிகப்படுத்தல், கேது = குறைப்பு",
    body:
      "ராகு சேர்ந்தால் அந்த காரகம்/வீடு பல மடங்காகும் (ஆனால் மாயை கலந்து). கேது சேர்ந்தால் அந்த விஷயத்தில் துறவு / குறைபாடு / ஆன்மீக திருப்பம்.",
  },
  {
    step: 8,
    title: "குருவின் கோசாரம் (Jupiter Transit) தான் நிகழ்வுக்கான டிரிக்கர்",
    body:
      "ஒரு நிகழ்வு நடைபெறும் நேரத்தை குருவின் கோசாரம் தீர்மானிக்கிறது. குரு காரகனை அல்லது அதன் 5/9/12ம் வீட்டை கடக்கும்போது அந்த நிகழ்வு வெளிப்படும்.",
  },
  {
    step: 9,
    title: "சனி = கர்ம காரகன், நிரந்தர பலன்",
    body:
      "சனி எங்கு அமர்ந்தாரோ அந்த வீட்டின் கர்மாவை நீங்கள் முடிக்க வேண்டும். சனியின் கோசாரம் தாமதம் / கடினம் ஆனால் நிரந்தர பலனை தரும்.",
  },
  {
    step: 10,
    title: "கடைசியாக — Dharma / Karma / Kama / Moksha வீடுகள்",
    body:
      "1/5/9 = தர்மம் (குடும்பம், ஞானம்). 2/6/10 = அர்த்தம் (செல்வம், வேலை). 3/7/11 = காமம் (ஆசை, கூட்டாளி, லாபம்). 4/8/12 = மோட்சம் (உணர்வு, மாற்றம், விடுதலை). காரகனின் வீடு எந்த குழுவில் வருகிறது என்பதே வாழ்க்கையின் திசையை சொல்லும்.",
  },
];

function houseFrom(lagnaIdx: number, planetIdx: number): number {
  return ((planetIdx - lagnaIdx + 12) % 12) + 1; // 1..12
}

function planetsInSameRasi(result: JathagamResult, rasiIdx: number, exceptKey?: string) {
  return result.planets.filter((p) => p.rasiIndex === rasiIdx && p.key !== exceptKey);
}

function rasiAtHouseFromPlanet(planetRasi: number, offset: number) {
  return (planetRasi + offset - 1 + 12) % 12;
}

// ---------- North Indian (+) diamond chart with BNN placement ----------
const PLANET_SHORT: Record<string, string> = {
  sun: "சூ", moon: "சந்", mars: "செ", mercury: "பு", jupiter: "கு",
  venus: "சுக்", saturn: "சனி", rahu: "ரா", ketu: "கே",
};
// House center positions for a 300x300 + diamond chart (house 1 at top)
const HOUSE_POS: { x: number; y: number }[] = [
  { x: 150, y: 75 },   // 1
  { x: 75,  y: 37 },   // 2
  { x: 37,  y: 75 },   // 3
  { x: 75,  y: 150 },  // 4
  { x: 37,  y: 225 },  // 5
  { x: 75,  y: 263 },  // 6
  { x: 150, y: 225 },  // 7
  { x: 225, y: 263 },  // 8
  { x: 263, y: 225 },  // 9
  { x: 225, y: 150 },  // 10
  { x: 263, y: 75 },   // 11
  { x: 225, y: 37 },   // 12
];

function NorthIndianChart({ result }: { result: JathagamResult }) {
  const lagnaIdx = result.ascendant.rasiIndex;
  const houses = Array.from({ length: 12 }, (_, h) => {
    const rasiIdx = (lagnaIdx + h) % 12;
    const planets = result.planets.filter((p) => p.rasiIndex === rasiIdx);
    return { house: h + 1, rasiIdx, planets };
  });
  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[340px] mx-auto block">
      <rect x="2" y="2" width="296" height="296" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" />
      <line x1="2" y1="2" x2="298" y2="298" stroke="hsl(var(--primary))" strokeWidth="1.5" />
      <line x1="298" y1="2" x2="2" y2="298" stroke="hsl(var(--primary))" strokeWidth="1.5" />
      <polygon points="150,2 298,150 150,298 2,150" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
      {houses.map((h, i) => {
        const pos = HOUSE_POS[i];
        return (
          <g key={h.house}>
            <text x={pos.x} y={pos.y - 14} textAnchor="middle" className="fill-[hsl(var(--muted-foreground))]" style={{ fontSize: 9 }}>
              {h.house}・{RASIS_TAMIL[h.rasiIdx]}
            </text>
            {h.house === 1 && (
              <text x={pos.x} y={pos.y - 2} textAnchor="middle" className="fill-[hsl(var(--primary))] font-bold" style={{ fontSize: 11 }}>
                ல
              </text>
            )}
            {h.planets.map((p, idx) => (
              <text
                key={p.key}
                x={pos.x}
                y={pos.y + 10 + idx * 11}
                textAnchor="middle"
                className="fill-[hsl(var(--foreground))] font-semibold"
                style={{ fontSize: 11 }}
              >
                {PLANET_SHORT[p.key] || p.nameTamil.slice(0, 2)}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

const BhriguNandiNadi = () => {
  const [result, setResult] = useState<JathagamResult | null>(null);

  // Auto-load last computed jathagam from Index/Gochara so user doesn't re-enter
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lastJathagamResult");
      if (raw) setResult(JSON.parse(raw));
    } catch {}
  }, []);

  const onSubmit = (input: BirthInput) => {
    try {
      const r = computeJathagam(input);
      setResult(r);
      try {
        sessionStorage.setItem("lastBirthInput", JSON.stringify(input));
        sessionStorage.setItem("lastJathagamResult", JSON.stringify(r));
      } catch {}
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error(e);
      toast.error("ஜாதகம் கணக்கிட முடியவில்லை");
    }
  };

  const readings = useMemo(() => {
    if (!result) return [];
    const lagnaIdx = result.ascendant.rasiIndex;

    return BNN_KARAKAS.map((k) => {
      const planet = result.planets.find((p) => p.key === k.key);
      if (!planet) return null;
      const house = houseFrom(lagnaIdx, planet.rasiIndex);

      // 12th from karaka (loss) & 2nd from karaka (nourishment)
      const loss12 = rasiAtHouseFromPlanet(planet.rasiIndex, 12);
      const gain2 = rasiAtHouseFromPlanet(planet.rasiIndex, 2);

      const conj = planetsInSameRasi(result, planet.rasiIndex, planet.key)
        .map((p) => p.nameTamil);
      const lossPlanets = planetsInSameRasi(result, loss12).map((p) => p.nameTamil);
      const gainPlanets = planetsInSameRasi(result, gain2).map((p) => p.nameTamil);

      // Build prediction lines
      const lines: string[] = [];
      lines.push(
        `${k.tamil} ${planet.rasiTamil} ராசியில், லக்னத்திலிருந்து ${house}ம் இடத்தில் — ${HOUSE_MEANINGS_TAMIL[house - 1]} விஷயத்தில் முக்கியத்துவம்.`
      );
      if (conj.length > 0) {
        lines.push(
          `சேர்க்கை: ${conj.join(", ")} — ${k.signifies.split(",")[0]} விஷயத்தில் இந்த கிரகங்களின் இயல்பு கலந்து பலன் தரும்.`
        );
      } else {
        lines.push("எந்த கிரகமும் சேராமல் தனியாக — பலன் தூய்மையாக ஆனால் வலிமை குறைவாக இருக்கும்.");
      }
      if (gainPlanets.length > 0) {
        lines.push(
          `2ல் (${RASIS_TAMIL[gain2]}): ${gainPlanets.join(", ")} — ${k.signifies.split(",")[0]} விஷயம் வளர்ச்சி பெறும் / போஷிக்கப்படும்.`
        );
      }
      if (lossPlanets.length > 0) {
        lines.push(
          `12ல் (${RASIS_TAMIL[loss12]}): ${lossPlanets.join(", ")} — ${k.signifies.split(",")[0]} விஷயத்தில் இழப்பு / தாமதம் / பிரிவு.`
        );
      }

      // Karaka-specific BNN cues
      if (k.key === "sun" && conj.includes("சனி")) {
        lines.push("சூரியன் + சனி — தந்தையுடன் கருத்து வேறுபாடு / தந்தைக்கு உடல் கஷ்டம்.");
      }
      if (k.key === "moon" && conj.includes("செவ்வாய்")) {
        lines.push("சந்திரன் + செவ்வாய் (சந்திர மங்கள யோகம்) — பணம் சம்பாதிக்கும் திறன், ரியல் எஸ்டேட்.");
      }
      if (k.key === "jupiter" && (conj.includes("ராகு") || gainPlanets.includes("ராகு"))) {
        lines.push("குரு + ராகு (குரு சண்டாள யோகம்) — குருவின் காரகங்களில் (குழந்தை/கல்வி) தாமதம் / மாயை.");
      }
      if (k.key === "venus" && conj.includes("சனி")) {
        lines.push("சுக்ரன் + சனி — தாமதமான திருமணம் / துறை சார்ந்த வாழ்க்கை துணை.");
      }
      if (k.key === "saturn" && conj.includes("செவ்வாய்")) {
        lines.push("சனி + செவ்வாய் — கடின உழைப்பு, பொறியியல் / ராணுவம் / பாதுகாப்பு துறை.");
      }

      return { karaka: k, planet, house, lines };
    }).filter(Boolean) as {
      karaka: typeof BNN_KARAKAS[number];
      planet: any;
      house: number;
      lines: string[];
    }[];
  }, [result]);

  return (
    <>
      <main className="min-h-screen relative">
        <SEO
          title="பிருகு நந்தி நாடி பலன் | Bhrigu Nandi Nadi Predictions Tamil"
          description="பிருகு நந்தி நாடி ஜோதிட விதிகள் — 10 படிகள், காரகன், 2/12 விதி, குரு கோசாரம். உங்கள் பிறப்பு விவரத்தில் இலவச BNN பலன்."
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Bhrigu Nandi Nadi step-by-step rules and predictions in Tamil",
            inLanguage: "ta",
            author: { "@type": "Organization", name: "UR ASTRO SOFT" },
          }}
        />

        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-gold opacity-[0.04] blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-10 md:py-14">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center text-sm text-maroon-deep hover:text-gold font-tamil">
              <ArrowLeft className="w-4 h-4 mr-1" /> முகப்பு
            </Link>
          </div>

          <header className="text-center mb-10 animate-fade-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-royal shadow-royal mb-4">
              <Star className="w-7 h-7 text-gold-bright" />
            </div>
            <div className="font-display text-xs tracking-[0.4em] text-gold-deep mb-2">
              ✦ BHRIGU NANDI NADI ✦
            </div>
            <h1 className="font-tamil text-3xl md:text-5xl font-bold text-maroon-deep leading-tight">
              பிருகு நந்தி நாடி பலன்
            </h1>
            <p className="font-tamil text-base md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
              மகரிஷி பிருகு வழியிலான எளிய, சேர்க்கை அடிப்படையிலான பலன் முறை —
              10 படி விதிகளுடன், உங்கள் ஜாதகத்திற்கான இலவச BNN வாசிப்பு.
            </p>
            <div className="temple-divider mt-6 max-w-md mx-auto" />
          </header>

          {/* ---------- Rules section ---------- */}
          <section aria-labelledby="bnn-rules" className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-maroon-deep" />
              <h2 id="bnn-rules" className="font-tamil text-2xl font-bold text-maroon-deep">
                பிருகு நந்தி நாடி — 10 படி விதிகள்
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {BNN_RULES.map((r) => (
                <Card key={r.step} className="parchment border-gold/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-tamil text-lg text-maroon-deep flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-royal text-primary-foreground text-sm shrink-0">
                        {r.step}
                      </span>
                      <span>{r.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-tamil text-sm text-foreground/85 leading-relaxed">{r.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ---------- 9 Karakas reference ---------- */}
          <section aria-labelledby="bnn-karakas" className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-maroon-deep" />
              <h2 id="bnn-karakas" className="font-tamil text-2xl font-bold text-maroon-deep">
                9 கிரக காரகங்கள் — யார் எதை குறிக்கிறார்?
              </h2>
            </div>
            <div className="parchment border border-gold/30 rounded-xl overflow-hidden">
              <table className="w-full text-sm font-tamil">
                <thead className="bg-gradient-royal text-primary-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">கிரகம்</th>
                    <th className="px-3 py-2 text-left">குறிக்கும் விஷயம்</th>
                  </tr>
                </thead>
                <tbody>
                  {BNN_KARAKAS.map((k) => (
                    <tr key={k.key} className="border-t border-gold/20">
                      <td className="px-3 py-2 font-bold text-maroon-deep">{k.tamil}</td>
                      <td className="px-3 py-2 text-foreground/80">{k.signifies}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ---------- Form & personalized reading ---------- */}
          <section aria-labelledby="bnn-reading" className="mb-10">
            <h2 id="bnn-reading" className="font-tamil text-2xl font-bold text-maroon-deep text-center mb-6">
              உங்கள் பிருகு நந்தி நாடி பலன்
            </h2>

            {!result ? (
              <div className="max-w-xl mx-auto">
                <BirthForm onSubmit={onSubmit} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setResult(null)} className="font-tamil">
                    புதிய ஜாதகம்
                  </Button>
                </div>

                <Card className="parchment border-gold/40">
                  <CardHeader>
                    <CardTitle className="font-tamil text-maroon-deep">
                      {result.input.name} — லக்னம்: {result.ascendant.rasiTamil}
                      , சந்திர ராசி: {result.planets.find((p) => p.key === "moon")?.rasiTamil}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                  {readings.map(({ karaka, planet, house, lines }) => (
                    <Card key={karaka.key} className="parchment border-gold/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="font-tamil text-lg text-maroon-deep">
                          {karaka.tamil}{" "}
                          <span className="text-sm font-normal text-muted-foreground">
                            ({karaka.signifies.split(",")[0]})
                          </span>
                        </CardTitle>
                        <div className="text-xs font-tamil text-gold-deep">
                          {planet.rasiTamil} • {house}ம் இடம்
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 font-tamil text-sm text-foreground/85 leading-relaxed list-disc pl-5">
                          {lines.map((l, i) => (
                            <li key={i}>{l}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="parchment border border-gold/30 rounded-xl p-4 mt-4">
                  <h3 className="font-tamil font-bold text-maroon-deep mb-2">அடுத்த படி — குரு கோசாரம்</h3>
                  <p className="font-tamil text-sm text-foreground/85 leading-relaxed">
                    மேற்கண்ட பலன்கள் ஜாதகத்தில் உள்ள உள்ளார்ந்த வாக்கு. அவை எப்போது வெளிப்படும் என்பதை
                    குரு கோசாரம் தீர்மானிக்கிறது. தினசரி கிரக நிலையை{" "}
                    <Link to="/gochara" className="text-maroon-deep underline hover:text-gold">
                      தினசரி கோசாரம்
                    </Link>{" "}
                    பக்கத்தில் பாருங்கள், அல்லது விரிவான ஆலோசனைக்கு{" "}
                    <Link to="/astrology-consultation" className="text-maroon-deep underline hover:text-gold">
                      நிபுணரை அணுகவும்
                    </Link>.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* ---------- Educational footer notes ---------- */}
          <section className="parchment border border-gold/30 rounded-xl p-5 mt-10">
            <h2 className="font-tamil text-xl font-bold text-maroon-deep mb-3">
              பிருகு நந்தி நாடி பற்றி
            </h2>
            <p className="font-tamil text-sm text-foreground/85 leading-relaxed mb-2">
              பிருகு நந்தி நாடி (BNN) என்பது மகரிஷி பிருகு வழியில் வந்த, மிக எளிதான கிரக சேர்க்கை
              அடிப்படையிலான கணிப்பு முறை. பாரம்பரிய பராசர முறையில் உள்ள பல சிக்கலான பார்வை,
              நீச்ச-உச்ச கணக்குகளை தவிர்த்து — கிரகம் எங்கு இருக்கிறது, அதனோடு யார் சேர்ந்துள்ளது,
              அதனுள் இருந்து 2/12 எது என்பதை மட்டுமே பார்க்கிறோம்.
            </p>
            <p className="font-tamil text-sm text-foreground/85 leading-relaxed mb-2">
              பிற்கால ஆச்சார்யர்களான ஆர். ஜி. ராவ் (R.G. Rao) BNN முறையை மறு வடிவம் தந்து உலக
              ஜோதிட சமூகத்திற்கு கொண்டு வந்தார். இன்று பல நாடி ஜோதிடர்கள் இந்த அடிப்படை விதிகளை
              பயன்படுத்தி நிகழ்வுகளை துல்லியமாக கணிக்கிறார்கள்.
            </p>
            <p className="font-tamil text-xs text-muted-foreground leading-relaxed">
              குறிப்பு: இந்த பக்கத்தில் காட்டப்படும் தானியங்கி பலன் கல்வி நோக்கத்திற்காக மட்டுமே.
              முக்கியமான முடிவுகள் / தீர்ப்புகளுக்கு தகுந்த ஜோதிட நிபுணரை அணுகவும்.
            </p>
          </section>
        </div>

        <WhatsAppButton message="வணக்கம்! எனக்கு பிருகு நந்தி நாடி பலன் வேண்டும்." />
      </main>
      <SiteFooter />
    </>
  );
};

export default BhriguNandiNadi;
