import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { SiteFooter } from "@/components/SiteFooter";
import { NAKSHATRAS_TAMIL } from "@/lib/jathagam";

const PANCHAMI_NAKS = [22, 23, 24, 25, 26];

const PANCHAMI_DETAIL: Record<number, { palan: string; theevu: string; parikaram: string }> = {
  22: { palan: "அவிட்டம் — தனிஷ்ட பஞ்சமியின் தலைமை நட்சத்திரம். சொத்து, குடும்ப ஒற்றுமையில் இடையூறு; திருமணம் தாமதம் ஏற்படலாம்.", theevu: "அதிக தோஷம்", parikaram: "வசு தேவதைகளுக்கு தர்ப்பணம், 5 சனிக்கிழமை எள் தீபம், திருநள்ளாறு / திருவெண்காடு தரிசனம்." },
  23: { palan: "சதயம் — உடல்நலம், மனஅழுத்தம் சார்ந்த சிரமங்கள்; உறவுகளில் பிரிவு ஏற்படலாம்.", theevu: "நடுத்தர தோஷம்", parikaram: "வருண ஜபம், நீர்நிலைக் கரையில் தீப ஆராதனை, வைத்தீஸ்வரன் கோயில் வழிபாடு." },
  24: { palan: "பூரட்டாதி — சொந்த ஊர் விட்டு விலகுதல், பொருள் இழப்பு சாத்தியம்.", theevu: "நடுத்தர தோஷம்", parikaram: "அஜ ஏகபாத வழிபாடு, ருத்ர ஜபம், சிவாலயத்தில் 5 திங்கள் அபிஷேகம்." },
  25: { palan: "உத்திரட்டாதி — பெரும்பாலும் சுபம்; பஞ்சமி தோஷ தொடர்பு லேசானது.", theevu: "லேசான தோஷம்", parikaram: "அஹிர்புத்னிய வழிபாடு, நாக பிரதிஷ்டைக்கு பால் அபிஷேகம்." },
  26: { palan: "ரேவதி — தோஷ முடிவு நட்சத்திரம். பயணம், வெளிநாட்டு தொடர்பில் தடைகள் நீங்கும்.", theevu: "மிகக் குறைவு", parikaram: "பூஷா தேவதை வழிபாடு, பசுவுக்கு அகத்திக்கீரை தானம்." },
};

export default function DhanishtaPanchami() {
  const [nak, setNak] = useState(22);
  const [pada, setPada] = useState(1);

  const affected = PANCHAMI_NAKS.includes(nak);
  const detail = PANCHAMI_DETAIL[nak];
  const severity = !affected
    ? "தோஷம் இல்லை"
    : nak === 22 && pada >= 3
      ? "முழு (பூரண) தனிஷ்ட பஞ்சமி தோஷம்"
      : detail.theevu;

  return (
    <div className="min-h-screen bg-gradient-temple">
      <SEO
        title="தனிஷ்ட பஞ்சமி தோஷம் — விவரம் & பரிகாரம் | ASTRO UR"
        description="அவிட்டம் முதல் ரேவதி வரையுள்ள ஐந்து நட்சத்திரங்களுக்கான தனிஷ்ட பஞ்சமி தோஷ தீவிரம், பலன் மற்றும் பரிகாரங்கள்."
      />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/" className="font-tamil text-sm text-maroon-deep hover:text-gold">← முதன்மை பட்டி</Link>
        <h1 className="font-tamil text-3xl md:text-4xl font-bold text-maroon-deep text-center mt-4 mb-6">தனிஷ்ட பஞ்சமி</h1>

        <div className="parchment rounded-xl border-2 border-gold-deep/50 p-4 mb-6 grid gap-4 sm:grid-cols-2">
          <label className="font-tamil text-sm font-bold text-maroon-deep">
            ஜென்ம நட்சத்திரம்
            <select value={nak} onChange={(e) => setNak(Number(e.target.value))} className="mt-1 w-full rounded-md border border-gold-deep/50 bg-background p-2 font-tamil text-base">
              {NAKSHATRAS_TAMIL.map((n, i) => (
                <option key={n} value={i}>{i + 1}. {n}</option>
              ))}
            </select>
          </label>
          <label className="font-tamil text-sm font-bold text-maroon-deep">
            பாதம்
            <select value={pada} onChange={(e) => setPada(Number(e.target.value))} className="mt-1 w-full rounded-md border border-gold-deep/50 bg-background p-2 font-tamil text-base">
              {[1, 2, 3, 4].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>

        <div className={`rounded-xl border-2 p-5 mb-6 ${affected ? "border-destructive/60 bg-destructive/5" : "border-gold-deep/50 parchment"}`}>
          <div className="font-tamil text-2xl font-bold text-maroon-deep">{severity}</div>
          <div className="font-tamil text-sm text-muted-foreground mt-1">
            {NAKSHATRAS_TAMIL[nak]} — {pada}ஆம் பாதம்
          </div>
          <p className="font-tamil text-base mt-3">
            {affected ? detail.palan : "இந்த நட்சத்திரம் தனிஷ்ட பஞ்சமி வரம்பில் (அவிட்டம் – ரேவதி) வரவில்லை. தனிஷ்ட பஞ்சமி தோஷம் கிடையாது."}
          </p>
          {affected && <p className="font-tamil text-base mt-2"><strong>பரிகாரம்:</strong> {detail.parikaram}</p>}
        </div>

        <div className="parchment rounded-xl border-2 border-gold-deep/50 p-4 overflow-x-auto">
          <div className="font-tamil text-lg font-bold text-maroon-deep mb-2">ஐந்து நட்சத்திரங்கள் — தோஷ அட்டவணை</div>
          <table className="w-full text-sm font-tamil border-collapse">
            <thead>
              <tr className="bg-gold/20">
                <th className="border border-gold-deep/40 p-2 text-left">நட்சத்திரம்</th>
                <th className="border border-gold-deep/40 p-2 text-left">தீவிரம்</th>
                <th className="border border-gold-deep/40 p-2 text-left">பலன்</th>
                <th className="border border-gold-deep/40 p-2 text-left">பரிகாரம்</th>
              </tr>
            </thead>
            <tbody>
              {PANCHAMI_NAKS.map((i) => (
                <tr key={i} className={i === nak ? "bg-gold/10" : undefined}>
                  <td className="border border-gold-deep/40 p-2 font-bold">{NAKSHATRAS_TAMIL[i]}</td>
                  <td className="border border-gold-deep/40 p-2">{PANCHAMI_DETAIL[i].theevu}</td>
                  <td className="border border-gold-deep/40 p-2">{PANCHAMI_DETAIL[i].palan}</td>
                  <td className="border border-gold-deep/40 p-2">{PANCHAMI_DETAIL[i].parikaram}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
