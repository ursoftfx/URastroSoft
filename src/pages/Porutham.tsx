import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Heart } from "lucide-react";
import {
  NAKSHATRAS, RASIS, compute10Porutham, PoruthamResult,
} from "@/lib/porutham";

const Porutham = () => {
  const [boyNak, setBoyNak] = useState<string>("");
  const [boyRasi, setBoyRasi] = useState<string>("");
  const [girlNak, setGirlNak] = useState<string>("");
  const [girlRasi, setGirlRasi] = useState<string>("");
  const [result, setResult] = useState<PoruthamResult | null>(null);

  const canSubmit = boyNak && boyRasi && girlNak && girlRasi;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const r = compute10Porutham(+boyNak, +boyRasi, +girlNak, +girlRasi);
    setResult(r);
    setTimeout(() => window.scrollTo({ top: 400, behavior: "smooth" }), 100);
  };

  return (
    <main className="min-h-screen relative">
      <SEO
        title="திருமண பொருத்தம் — 10 Porutham Calculator | Free Marriage Matching"
        description="இலவச திருமண பொருத்தம் — ராசி, நட்சத்திரம் கொண்டு 10 பொருத்தம் (தின, கண, மகேந்திர, யோனி, ரஜ்ஜு, வேத) கணக்கிடுங்கள்."
        canonical="/porutham"
      />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-gold opacity-[0.04] blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-10 md:py-16">
        <Link to="/" className="inline-flex items-center text-maroon-deep hover:text-gold font-tamil mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> முகப்பு
        </Link>

        <header className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-royal shadow-royal mb-4">
            <Heart className="w-8 h-8 text-gold-bright" />
          </div>
          <div className="font-display text-xs tracking-[0.5em] text-gold-deep mb-2">
            ✦ THIRUMANA PORUTHAM ✦
          </div>
          <h1 className="font-tamil text-4xl md:text-6xl font-bold text-maroon-deep">
            திருமண <span className="text-gold">பொருத்தம்</span>
          </h1>
          <p className="font-tamil text-base md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            ராசி & நட்சத்திரம் கொண்டு 10 பொருத்தம் இலவசமாக பாருங்கள்
          </p>
          <div className="temple-divider mt-6 max-w-md mx-auto" />
        </header>

        <form onSubmit={handleSubmit} className="parchment rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Boy */}
          <div className="space-y-4">
            <h2 className="font-tamil text-xl font-bold text-maroon-deep border-b border-gold/30 pb-2">
              ஆண் (மணமகன்)
            </h2>
            <div>
              <Label className="font-tamil">நட்சத்திரம்</Label>
              <Select value={boyNak} onValueChange={setBoyNak}>
                <SelectTrigger className="font-tamil"><SelectValue placeholder="தேர்வு செய்யவும்" /></SelectTrigger>
                <SelectContent className="font-tamil max-h-72">
                  {NAKSHATRAS.map((n, i) => <SelectItem key={i} value={String(i)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-tamil">ராசி</Label>
              <Select value={boyRasi} onValueChange={setBoyRasi}>
                <SelectTrigger className="font-tamil"><SelectValue placeholder="தேர்வு செய்யவும்" /></SelectTrigger>
                <SelectContent className="font-tamil">
                  {RASIS.map((r, i) => <SelectItem key={i} value={String(i)}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Girl */}
          <div className="space-y-4">
            <h2 className="font-tamil text-xl font-bold text-maroon-deep border-b border-gold/30 pb-2">
              பெண் (மணமகள்)
            </h2>
            <div>
              <Label className="font-tamil">நட்சத்திரம்</Label>
              <Select value={girlNak} onValueChange={setGirlNak}>
                <SelectTrigger className="font-tamil"><SelectValue placeholder="தேர்வு செய்யவும்" /></SelectTrigger>
                <SelectContent className="font-tamil max-h-72">
                  {NAKSHATRAS.map((n, i) => <SelectItem key={i} value={String(i)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-tamil">ராசி</Label>
              <Select value={girlRasi} onValueChange={setGirlRasi}>
                <SelectTrigger className="font-tamil"><SelectValue placeholder="தேர்வு செய்யவும்" /></SelectTrigger>
                <SelectContent className="font-tamil">
                  {RASIS.map((r, i) => <SelectItem key={i} value={String(i)}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={!canSubmit} className="w-full bg-gradient-royal text-primary-foreground font-tamil text-lg py-6">
              பொருத்தம் பார்க்க
            </Button>
          </div>
        </form>

        {result && (
          <section className="mt-10 animate-fade-up">
            <div className="parchment rounded-2xl p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="font-display text-xs tracking-[0.4em] text-gold-deep">RESULT</div>
                <div className="font-tamil text-5xl font-bold text-maroon-deep mt-2">
                  {result.total.toFixed(2)}<span className="text-2xl text-muted-foreground"> / {result.max}</span>
                </div>
                <div className="font-tamil text-lg text-gold-deep mt-2">{result.verdict}</div>
                <div className="temple-divider my-4" />
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

              <p className="text-xs text-muted-foreground font-tamil text-center mt-6">
                ✦ துல்லியமான முடிவுக்கு அனுபவம் வாய்ந்த ஜோதிடரை அணுகவும். WhatsApp ஆலோசனை: 9600543617 ✦
              </p>
            </div>
          </section>
        )}
      </div>

      <WhatsAppButton message="வணக்கம்! எனக்கு திருமண பொருத்தம் ஆலோசனை வேண்டும்." />
    </main>
  );
};

export default Porutham;
