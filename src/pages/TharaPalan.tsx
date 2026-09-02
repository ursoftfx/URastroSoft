import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SEO } from "@/components/SEO";
import { SiteFooter } from "@/components/SiteFooter";
import { NAKSHATRAS_TAMIL } from "@/lib/jathagam";
import { TARAS, taraCycle, taraIndex } from "@/lib/tara";

export default function TharaPalan() {
  const [janma, setJanma] = useState(0);
  const [day, setDay] = useState(0);

  const tIdx = taraIndex(janma, day);
  const tara = TARAS[tIdx];
  const cycle = taraCycle(janma, day);

  const rows = useMemo(
    () =>
      Array.from({ length: 27 }, (_, k) => ({
        idx: (janma + k) % 27,
        tara: TARAS[k % 9],
        cycle: Math.floor(k / 9) + 1,
      })),
    [janma],
  );

  return (
    <div className="min-h-screen bg-gradient-temple">
      <SEO
        title="தாரா பலன் — நட்சத்திர தாரை கணிப்பு | ASTRO UR"
        description="ஜென்ம நட்சத்திரம் மற்றும் நாள் நட்சத்திரம் தேர்ந்தெடுத்து 9 தாரைகளின் பலன், தன்மை மற்றும் பரிகாரங்களை அறியுங்கள்."
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/" className="font-tamil text-sm text-maroon-deep hover:text-gold">← முதன்மை பட்டி</Link>
        <h1 className="font-tamil text-3xl md:text-4xl font-bold text-maroon-deep text-center mt-4 mb-6">தாரா பலன்</h1>

        <div className="parchment rounded-xl border-2 border-gold-deep/50 p-4 mb-6 grid gap-4 sm:grid-cols-2">
          <label className="font-tamil text-sm font-bold text-maroon-deep">
            ஜென்ம நட்சத்திரம்
            <select
              value={janma}
              onChange={(e) => setJanma(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-gold-deep/50 bg-background p-2 font-tamil text-base"
            >
              {NAKSHATRAS_TAMIL.map((n, i) => (
                <option key={n} value={i}>{i + 1}. {n}</option>
              ))}
            </select>
          </label>
          <label className="font-tamil text-sm font-bold text-maroon-deep">
            நாள் நட்சத்திரம்
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-gold-deep/50 bg-background p-2 font-tamil text-base"
            >
              {NAKSHATRAS_TAMIL.map((n, i) => (
                <option key={n} value={i}>{i + 1}. {n}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-xl p-5 mb-6 border-2" style={{ background: tara.light, borderColor: tara.tone }}>
          <div className="font-tamil text-2xl font-bold" style={{ color: tara.tone }}>
            {tIdx + 1}. {tara.name} <span className="text-base">({tara.nature})</span>
          </div>
          <div className="font-tamil text-sm mt-1" style={{ color: tara.tone }}>
            {NAKSHATRAS_TAMIL[janma]} → {NAKSHATRAS_TAMIL[day]} • {cycle}ஆம் சுற்று
          </div>
          <p className="font-tamil text-base mt-3 text-foreground">{tara.palan}</p>
          <p className="font-tamil text-base mt-2 text-foreground"><strong>பரிகாரம்:</strong> {tara.parikaram}</p>
        </div>

        <div className="parchment rounded-xl border-2 border-gold-deep/50 p-4 mb-6 overflow-x-auto">
          <div className="font-tamil text-lg font-bold text-maroon-deep mb-2">9 தாரைகள் — பலன் அட்டவணை</div>
          <table className="w-full text-sm font-tamil border-collapse">
            <thead>
              <tr className="bg-gold/20">
                <th className="border border-gold-deep/40 p-2 text-left">தாரை</th>
                <th className="border border-gold-deep/40 p-2 text-left">தன்மை</th>
                <th className="border border-gold-deep/40 p-2 text-left">பலன்</th>
                <th className="border border-gold-deep/40 p-2 text-left">பரிகாரம்</th>
              </tr>
            </thead>
            <tbody>
              {TARAS.map((t, k) => (
                <tr key={t.name} style={{ background: t.light }}>
                  <td className="border border-gold-deep/40 p-2 font-bold" style={{ color: t.tone }}>{k + 1}. {t.name}</td>
                  <td className="border border-gold-deep/40 p-2 font-bold" style={{ color: t.tone }}>{t.nature}</td>
                  <td className="border border-gold-deep/40 p-2 text-foreground">{t.palan}</td>
                  <td className="border border-gold-deep/40 p-2 text-foreground">{t.parikaram}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="parchment rounded-xl border-2 border-gold-deep/50 p-4 overflow-x-auto">
          <div className="font-tamil text-lg font-bold text-maroon-deep mb-2">
            {NAKSHATRAS_TAMIL[janma]} — 27 நட்சத்திர தாரை வரிசை
          </div>
          <table className="w-full text-sm font-tamil border-collapse">
            <thead>
              <tr className="bg-gold/20">
                <th className="border border-gold-deep/40 p-2 text-left">நட்சத்திரம்</th>
                <th className="border border-gold-deep/40 p-2 text-left">தாரை</th>
                <th className="border border-gold-deep/40 p-2 text-left">சுற்று</th>
                <th className="border border-gold-deep/40 p-2 text-left">தன்மை</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, k) => (
                <tr key={k} style={{ background: r.idx === day ? r.tara.light : undefined }}>
                  <td className="border border-gold-deep/40 p-2">{NAKSHATRAS_TAMIL[r.idx]}</td>
                  <td className="border border-gold-deep/40 p-2 font-bold" style={{ color: r.tara.tone }}>{r.tara.name}</td>
                  <td className="border border-gold-deep/40 p-2">{r.cycle}</td>
                  <td className="border border-gold-deep/40 p-2">{r.tara.nature}</td>
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
