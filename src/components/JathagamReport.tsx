import { JathagamResult, formatDegree, RASIS_TAMIL, PLANETS_TAMIL } from "@/lib/jathagam";
import { RasiChart } from "./RasiChart";
import { NavamsaChart } from "./NavamsaChart";
import { VargaChart } from "./VargaChart";
import { DashaA4Pages } from "./DashaA4Pages";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Star, Sun, Moon, Heart, Award, AlertTriangle, Hash, Bird } from "lucide-react";
import { detectDoshams } from "@/lib/dosham";
import { computeNumerology, nameSuggestions } from "@/lib/numerology";
import { panchaPakshi } from "@/lib/pancha-pakshi";
import { LAGNA_PALAN, NAKSHATRA_PALAN, bhavaPalans, guruBalamToday } from "@/lib/predictions";

interface Props {
  result: JathagamResult;
  interpretation?: string;
  interpretationLoading?: boolean;
}

const formatDate = (d: Date) =>
  d.toLocaleDateString("ta-IN", { year: "numeric", month: "long", day: "numeric" });

export const JathagamReport = ({ result, interpretation, interpretationLoading }: Props) => {
  const planetRows = [
    result.ascendant,
    ...result.planets,
    {
      key: "mandi",
      nameTamil: "மாந்தி",
      rasiTamil: result.mandi.rasiTamil,
      degreeInRasi: result.mandi.degreeInRasi,
      nakshatraTamil: result.mandi.nakshatraTamil,
      pada: result.mandi.pada,
      retrograde: false,
    },
  ];
  const birthMs = new Date(Date.UTC(result.input.year, result.input.month - 1, result.input.day, result.input.hour, result.input.minute) - result.input.tzOffsetHours * 3600 * 1000).getTime();
  const firstDasha = result.dashaSequence[0];
  const jananaIruppuThisai = firstDasha
    ? (() => {
        const remMs = firstDasha.endDate.getTime() - birthMs;
        if (remMs <= 0) return `${firstDasha.lord} திசை`;
        const yrs = remMs / (1000 * 60 * 60 * 24 * 365.25);
        const y = Math.floor(yrs);
        const m = Math.floor((yrs - y) * 12);
        const d = Math.floor(((yrs - y) * 12 - m) * 30.4375);
        return `${firstDasha.lord} திசை — ${y} வருடம் ${m} மாதம் ${d} நாள்`;
      })()
    : "—";

  const sheetStyle: React.CSSProperties = { width: "148mm", minHeight: "210mm", margin: "0 auto 6mm", background: "#fff", padding: "7mm 8mm", boxSizing: "border-box", fontSize: 9, pageBreakAfter: "always", boxShadow: "0 4px 16px rgba(122,26,43,0.12)" };
  return (
    <>
    <style>{`@media print { @page { size: A5 portrait; margin: 0; } .a5-sheet { box-shadow: none !important; margin: 0 !important; } }`}</style>
    <div className="space-y-4 animate-fade-up a5-sheet print-area" style={sheetStyle}>
      {/* Header */}
      <div className="parchment rounded-2xl p-6 md:p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gradient-gold blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-gradient-gold blur-3xl" />
        </div>
        <div className="relative">
          <div className="font-display text-xs tracking-[0.4em] text-gold-deep mb-2">
            ✦ JATHAGAM ✦
          </div>
          <h2 className="font-tamil text-3xl md:text-4xl font-bold text-maroon-deep">
            {result.input.name} <span className="text-base text-muted-foreground">({result.input.gender})</span>
          </h2>
          <div className="temple-divider my-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 font-tamil text-sm">
            <div>
              <div className="text-muted-foreground">பிறந்த தேதி</div>
              <div className="font-semibold text-foreground">
                {result.input.day}/{result.input.month}/{result.input.year}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">பிறந்த நேரம்</div>
              <div className="font-semibold text-foreground">
                {String(result.input.hour).padStart(2, "0")}:{String(result.input.minute).padStart(2, "0")}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">பிறந்த ஊர்</div>
              <div className="font-semibold text-foreground">{result.input.placeName}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key facts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FactCard icon={<Star className="w-5 h-5" />} label="ராசி (சந்திரன்)" value={result.rasiTamil} sub={`${formatDegree(result.moon.degreeInRasi)}`} />
        <FactCard icon={<Sparkles className="w-5 h-5" />} label="நட்சத்திரம்" value={result.nakshatraTamil} sub={`${result.pada}-ம் பாதம் • ${result.nakshatraLordTamil}`} />
        <FactCard icon={<Sun className="w-5 h-5" />} label="லக்னம்" value={result.lagnaTamil} sub={formatDegree(result.ascendant.degreeInRasi)} />
      </div>

      {/* Chart + Planets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHeading>ராசி சக்கரம்</SectionHeading>
          <RasiChart result={result} />
        </div>
        <div>
          <SectionHeading>கிரக நிலைகள்</SectionHeading>
          <div className="parchment rounded-xl overflow-hidden">
            <table className="w-full text-sm font-tamil">
              <thead className="bg-gradient-royal text-primary-foreground">
                <tr>
                  <th className="text-left p-3">கிரகம்</th>
                  <th className="text-left p-3">ராசி</th>
                  <th className="text-left p-3">பாகை</th>
                  <th className="text-left p-3">நட்சத்திரம்</th>
                </tr>
              </thead>
              <tbody>
                {planetRows.map((p) => (
                  <tr key={p.key} className="border-t border-gold/20 hover:bg-gold/5">
                    <td className="p-3 font-semibold text-maroon-deep">
                      {p.nameTamil}
                      {p.retrograde && p.key !== "rahu" && p.key !== "ketu" && <span className="text-xs text-accent ml-1">℞</span>}
                    </td>
                    <td className="p-3">{p.rasiTamil}</td>
                    <td className="p-3 text-xs text-muted-foreground">{formatDegree(p.degreeInRasi)}</td>
                    <td className="p-3 text-xs">{p.nakshatraTamil} {p.pada}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Panchangam */}
      <div>
        <SectionHeading>பஞ்சாங்கம்</SectionHeading>
        <div className="parchment rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 font-tamil text-sm">
          <PanchaItem label="வாரம்" value={result.panchangam.vaaraTamil} />
          <PanchaItem label="திதி" value={`${result.panchangam.tithiTamil} (${result.panchangam.paksha})`} />
          <PanchaItem label="யோகம்" value={result.panchangam.yogaTamil} />
          <PanchaItem label="கரணம்" value={result.panchangam.karanaTamil} />
          <PanchaItem label="சூரிய உதயம்" value={fmtTime(result.panchangam.sunriseLocal, result.input.tzOffsetHours)} />
          <PanchaItem label="சூரிய அஸ்தமனம்" value={fmtTime(result.panchangam.sunsetLocal, result.input.tzOffsetHours)} />
          <PanchaItem label="ராசி" value={result.rasiTamil} />
          <PanchaItem label="நட்சத்திரம்" value={`${result.nakshatraTamil} ${result.pada}-ம் பாதம்`} />
        </div>
      </div>

      {/* Navamsa + Mandi/Gulika + Current Dasha */}
    </div>
    <div className="space-y-4 a5-sheet print-area" style={sheetStyle}>
      {/* Navamsa + Mandi/Gulika + Current Dasha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHeading>நவாம்ச சக்கரம் (D9)</SectionHeading>
          <NavamsaChart result={result} />
        </div>
        <div className="space-y-4">
          <div>
            <SectionHeading>மாந்தி & குளிகை</SectionHeading>
            <div className="parchment rounded-xl p-5 font-tamil text-sm space-y-3">
              <UpaRow label="மாந்தி" data={result.mandi} />
              <UpaRow label="குளிகை" data={result.gulika} />
            </div>
          </div>
          <div>
            <SectionHeading>தற்போதைய தசை</SectionHeading>
            <div className="parchment rounded-xl p-5 font-tamil text-sm grid grid-cols-2 gap-3">
              <div className="col-span-2 rounded-lg bg-gold/10 p-3">
                <PanchaItem label="ஜனன கால இருப்பு திசை" value={jananaIruppuThisai} />
              </div>
              <PanchaItem label="மகா" value={result.currentDashaPath.maha} />
              <PanchaItem label="புத்தி" value={result.currentDashaPath.bhukti} />
              <PanchaItem label="அந்தரம்" value={result.currentDashaPath.antara} />
              <PanchaItem label="சூட்சமம்" value={result.currentDashaPath.sookshma} />
              <PanchaItem label="அதி சூட்சமம்" value={result.currentDashaPath.athiSookshma} />
            </div>
          </div>
        </div>
      </div>

      {/* Ashtakavarga */}
      <div>
        <SectionHeading>அஷ்டகவர்க்கம்</SectionHeading>
        <div className="parchment rounded-xl p-4 overflow-x-auto">
          <table className="w-full text-xs font-tamil min-w-[640px]">
            <thead className="bg-gradient-royal text-primary-foreground">
              <tr>
                <th className="text-left p-2">கிரகம்</th>
                {RASIS_TAMIL.map((r) => <th key={r} className="p-2 text-center">{r}</th>)}
                <th className="p-2 text-center">மொத்தம்</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result.ashtakavarga.bhinna).map(([planet, bindus]) => (
                <tr key={planet} className="border-t border-gold/20">
                  <td className="p-2 font-semibold text-maroon-deep capitalize">{planet}</td>
                  {bindus.map((b, i) => <td key={i} className="p-2 text-center">{b}</td>)}
                  <td className="p-2 text-center font-bold">{bindus.reduce((a, b) => a + b, 0)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gold/60 bg-gold/10">
                <td className="p-2 font-bold text-maroon-deep">சர்வாஷ்டகவர்க்கம்</td>
                {result.ashtakavarga.sarva.map((b, i) => <td key={i} className="p-2 text-center font-bold">{b}</td>)}
                <td className="p-2 text-center font-bold">{result.ashtakavarga.sarva.reduce((a, b) => a + b, 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
    <div className="space-y-4 a5-sheet print-area" style={sheetStyle}>
      {/* Dasha */}
      <div>
        <SectionHeading>விம்சோத்தரி தசை</SectionHeading>
        <div className="parchment rounded-xl p-5">
          <div className="bg-gradient-royal text-primary-foreground rounded-lg p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs text-gold-bright/80 font-display tracking-widest">CURRENT DASHA</div>
              <div className="font-tamil text-2xl font-bold mt-1">{result.currentDasha.lord} தசை</div>
            </div>
            <div className="text-right font-tamil text-sm">
              <div>{formatDate(result.currentDasha.startDate)}</div>
              <div className="text-gold-bright">↓</div>
              <div>{formatDate(result.currentDasha.endDate)}</div>
            </div>
          </div>
          <ScrollArea className="h-56">
            <div className="space-y-2">
              {result.dashaSequence.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gold/10 font-tamil text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-maroon text-gold-bright flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-maroon-deep">{d.lord}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(d.startDate)} → {formatDate(d.endDate)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* === Lagna Palan === */}
      {(() => {
        const lp = LAGNA_PALAN[result.ascendant.rasiIndex];
        return (
          <div>
            <SectionHeading>லக்ன பலன் & குணாதிசயம்</SectionHeading>
            <div className="parchment rounded-xl p-5 md:p-6 font-tamil space-y-3">
              <div className="bg-gradient-royal text-primary-foreground rounded-lg p-4">
                <div className="text-xs text-gold-bright/80 font-display tracking-widest">LAGNA</div>
                <div className="text-2xl font-bold mt-1">{result.lagnaTamil} லக்னம்</div>
                <div className="text-sm mt-2 opacity-90">{lp.nature}</div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-bold text-maroon-deep">குணாதிசயம்: </span>{lp.character}</div>
                <div><span className="font-bold text-maroon-deep">தோற்றம்: </span>{lp.appearance}</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* === Bhava lord palans === */}
      {(() => {
        const planetRasis: Record<string, number> = {};
        result.planets.forEach(p => { planetRasis[p.key] = p.rasiIndex; });
        const palans = bhavaPalans(result.ascendant.rasiIndex, planetRasis, RASIS_TAMIL);
        return (
          <div>
            <SectionHeading>பாவாதிபதி பலன்கள் (12 வீடுகள்)</SectionHeading>
            <div className="parchment rounded-xl overflow-x-auto">
              <table className="w-full text-sm font-tamil min-w-[600px]">
                <thead className="bg-gradient-royal text-primary-foreground">
                  <tr>
                    <th className="text-left p-3">பாவம்</th><th className="text-left p-3">ராசி</th>
                    <th className="text-left p-3">அதிபதி</th><th className="text-left p-3">இடம்</th>
                    <th className="text-left p-3">பலன்</th>
                  </tr>
                </thead>
                <tbody>
                  {palans.map((b, i) => (
                    <tr key={i} className="border-t border-gold/20">
                      <td className="p-2 font-semibold text-maroon-deep">{b.bhavaIdx}. {b.bhavaName}</td>
                      <td className="p-2">{b.rasi}</td><td className="p-2">{b.lord}</td>
                      <td className="p-2">{b.lordHouse}</td>
                      <td className="p-2 text-xs text-muted-foreground">{b.palan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

    </div>
    <div className="space-y-4 a5-sheet print-area" style={sheetStyle}>
      {/* === Nakshatra Palan === */}
      <div>
        <SectionHeading>பிறந்த நட்சத்திர பலன்</SectionHeading>
        <div className="parchment rounded-xl p-5 font-tamil">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-royal text-gold-bright flex items-center justify-center"><Sparkles className="w-6 h-6" /></div>
            <div>
              <div className="text-xs text-muted-foreground">நட்சத்திரம்</div>
              <div className="text-2xl font-bold text-maroon-deep">{result.nakshatraTamil} <span className="text-sm">{result.pada}-ம் பாதம்</span></div>
              <div className="text-xs text-gold-deep">அதிபதி: {result.nakshatraLordTamil}</div>
            </div>
          </div>
          <div className="text-sm text-foreground/85 leading-relaxed">{NAKSHATRA_PALAN[result.moon.nakshatraIndex]}</div>
        </div>
      </div>

      {/* === Name Suggestions === */}
      {(() => {
        const ns = nameSuggestions(result.moon.nakshatraIndex, result.pada);
        return (
          <div>
            <SectionHeading>என்ன பெயர் வைக்கலாம்?</SectionHeading>
            <div className="parchment rounded-xl p-5 font-tamil">
              <div className="text-center mb-4">
                <div className="text-xs text-muted-foreground">உங்கள் பாதத்திற்கு உகந்த எழுத்து</div>
                <div className="text-5xl font-bold text-gold-deep mt-2">{ns.primary}</div>
                <div className="text-sm text-muted-foreground">({ns.latin})</div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                {ns.allPadas.map((p) => (
                  <div key={p.pada} className={`p-2 rounded ${p.pada === result.pada ? "bg-gold/20 ring-2 ring-gold" : "bg-cream"}`}>
                    <div className="text-xs text-muted-foreground">{p.pada}-ம் பாதம்</div>
                    <div className="font-bold text-maroon-deep text-lg">{p.tamil}</div>
                    <div className="text-xs">{p.latin}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* === Doshams === */}
      {(() => {
        const doshams = detectDoshams(result);
        return (
          <div>
            <SectionHeading>தோஷங்கள் & பரிகாரம்</SectionHeading>
            <div className="grid md:grid-cols-2 gap-3">
              {doshams.map((d, i) => (
                <div key={i} className={`parchment rounded-xl p-4 font-tamil ${d.present ? "ring-2 ring-destructive/40" : ""}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${d.present ? "text-destructive" : "text-green-700"}`} />
                    <div className="flex-1">
                      <div className="font-bold text-maroon-deep">{d.name}</div>
                      <div className={`text-xs font-semibold mt-1 ${d.present ? "text-destructive" : "text-green-700"}`}>
                        {d.present ? `உள்ளது (${d.severity})` : "இல்லை ✓"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">{d.description}</div>
                      {d.remedy && <div className="text-xs text-gold-deep mt-2"><b>பரிகாரம்:</b> {d.remedy}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

    </div>
    <div className="space-y-4 a5-sheet print-area" style={sheetStyle}>
      {/* === Guru Balam === */}
      {(() => {
        const j = result.planets.find(p => p.key === "jupiter")!;
        const gb = guruBalamToday(j.rasiIndex, result.ascendant.rasiIndex);
        return (
          <div>
            <SectionHeading>இன்றைய குரு (வியாழன்) பலம்</SectionHeading>
            <div className="parchment rounded-xl p-5 font-tamil">
              <div className="flex items-center gap-4">
                <Award className="w-12 h-12 text-gold-deep" />
                <div className="flex-1">
                  <div className="text-3xl font-bold text-maroon-deep">{gb.score}<span className="text-sm text-muted-foreground">/100</span></div>
                  <div className="text-gold-deep font-semibold">{gb.verdict}</div>
                </div>
              </div>
              <div className="w-full bg-cream rounded-full h-2 mt-3 overflow-hidden">
                <div className="h-full bg-gradient-royal" style={{ width: `${gb.score}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-3">{gb.advice}</div>
            </div>
          </div>
        );
      })()}

      {/* === Numerology === */}
      {(() => {
        const num = computeNumerology(result.input.day, result.input.month, result.input.year);
        return (
          <div>
            <SectionHeading>எண் கணிதம்</SectionHeading>
            <div className="parchment rounded-xl p-5 font-tamil">
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="text-center bg-gradient-royal text-primary-foreground rounded-lg p-3">
                  <Hash className="w-5 h-5 mx-auto text-gold-bright" />
                  <div className="text-xs mt-1">பிறப்பு எண்</div>
                  <div className="text-3xl font-bold text-gold-bright">{num.birthNumber}</div>
                </div>
                <div className="text-center bg-gradient-royal text-primary-foreground rounded-lg p-3">
                  <Hash className="w-5 h-5 mx-auto text-gold-bright" />
                  <div className="text-xs mt-1">வாழ்க்கை பாதை</div>
                  <div className="text-3xl font-bold text-gold-bright">{num.lifePath}</div>
                </div>
                <div className="text-center bg-cream rounded-lg p-3">
                  <div className="text-xs">ஆதிக்க கிரகம்</div>
                  <div className="text-xl font-bold text-maroon-deep mt-1">{num.rulingPlanet}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div><b className="text-maroon-deep">அதிர்ஷ்ட நாட்கள்:</b> {num.luckyDays.join(", ")}</div>
                <div><b className="text-maroon-deep">அதிர்ஷ்ட நிறங்கள்:</b> {num.luckyColors.join(", ")}</div>
                <div><b className="text-maroon-deep">அதிர்ஷ்ட எண்கள்:</b> {num.luckyNumbers.join(", ")}</div>
              </div>
              <div className="text-sm text-foreground/85 mt-3 italic">{num.description}</div>
            </div>
          </div>
        );
      })()}

      {/* === Pancha Pakshi === */}
      {(() => {
        const pp = panchaPakshi(result.moon.nakshatraIndex);
        return (
          <div>
            <SectionHeading>பஞ்சபட்சி (ஐம்பறவை)</SectionHeading>
            <div className="parchment rounded-xl p-5 font-tamil">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-full bg-gradient-royal flex items-center justify-center"><Bird className="w-7 h-7 text-gold-bright" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">உங்கள் பறவை</div>
                  <div className="text-2xl font-bold text-maroon-deep">{pp.bird}</div>
                </div>
              </div>
              <div className="text-sm text-foreground/85 mb-3">{pp.nature}</div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-green-50 p-2 rounded"><b className="text-green-700">நண்பர்கள்:</b> {pp.friends.join(", ") || "—"}</div>
                <div className="bg-red-50 p-2 rounded"><b className="text-destructive">பகைவர்:</b> {pp.enemies.join(", ") || "—"}</div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
    <div className="space-y-4 a5-sheet print-area" style={sheetStyle}>
      {/* === Upagrahas === */}
      <div>
        <SectionHeading>உப கிரகங்கள் (அபக்ரஷ் & உப கிரகங்கள்)</SectionHeading>
        <div className="parchment rounded-xl overflow-x-auto">
          <table className="w-full text-sm font-tamil">
            <thead className="bg-gradient-royal text-primary-foreground">
              <tr><th className="text-left p-3">உப கிரகம்</th><th className="text-left p-3">ராசி</th><th className="text-left p-3">பாகை</th></tr>
            </thead>
            <tbody>
              {[
                { name: "மாந்தி", rasi: result.mandi.rasiTamil, deg: result.mandi.degreeInRasi },
                { name: "குளிகை", rasi: result.gulika.rasiTamil, deg: result.gulika.degreeInRasi },
                ...result.upagrahas.map(u => ({ name: u.name, rasi: u.rasiTamil, deg: u.longitude - u.rasiIndex * 30 })),
              ].map((u, i) => (
                <tr key={i} className="border-t border-gold/20">
                  <td className="p-3 font-semibold text-maroon-deep">{u.name}</td>
                  <td className="p-3">{u.rasi}</td>
                  <td className="p-3 text-xs text-muted-foreground">{formatDegree(u.deg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
    <div className="space-y-4 a5-sheet print-area" style={sheetStyle}>
      {/* === 16 Varga Charts === */}
      <div>
        <SectionHeading>16 வகை வர்க்க குண்டலி</SectionHeading>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {result.vargaCharts.map((v) => (
            <VargaChart key={v.key} chart={v.chart} label={v.label} tamilLabel={v.tamilLabel} vargaKey={v.key} />
          ))}
        </div>
      </div>

    </div>
    <div className="space-y-4 a5-sheet print-area" style={sheetStyle}>
      {/* === 120-year Dasha-Bhukti Tree === */}
      <div>
        <SectionHeading>120 ஆண்டு தசா புத்தி</SectionHeading>
        <div className="parchment rounded-xl p-4">
          <ScrollArea className="h-96">
            <div className="space-y-3 font-tamil text-sm">
              {result.dashaTree.map((maha, i) => (
                <details key={i} className="border border-gold/20 rounded-lg" open={i < 2}>
                  <summary className="cursor-pointer p-3 bg-gradient-royal text-primary-foreground rounded-t-lg flex justify-between items-center font-bold">
                    <span>{i + 1}. {maha.lord} மகா தசை</span>
                    <span className="text-xs font-normal">{formatDate(maha.startDate)} → {formatDate(maha.endDate)}</span>
                  </summary>
                  <div className="p-2 space-y-1">
                    {maha.children?.map((bhukti, j) => (
                      <div key={j} className="pl-3 border-l-2 border-gold/30 ml-2 py-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-maroon-deep">{maha.lord} / {bhukti.lord} புத்தி</span>
                          <span className="text-muted-foreground">{formatDate(bhukti.startDate)} → {formatDate(bhukti.endDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

    </div>
    <div className="space-y-4 a5-sheet print-area" style={sheetStyle}>
      <div>
        <div className="parchment rounded-xl p-6 md:p-8">
          {interpretationLoading && !interpretation && (
            <div className="text-center py-8 font-tamil text-muted-foreground">
              <Moon className="w-8 h-8 mx-auto mb-3 text-accent animate-shimmer" />
              ஜாதகம் பகுப்பாய்வு செய்யப்படுகிறது...
            </div>
          )}
          {interpretation && (
            <div className="font-tamil text-foreground/90 leading-relaxed whitespace-pre-wrap text-[15px] md:text-base">
              {interpretation}
              {interpretationLoading && <span className="inline-block w-2 h-5 bg-accent ml-1 animate-pulse" />}
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground font-tamil pt-4">
        ✦ இது AI மூலம் கணிக்கப்பட்ட ஜாதகம். துல்லியமான பலன்களுக்கு அனுபவம் வாய்ந்த ஜோதிடரை அணுகவும். ✦
      </div>
    </div>
    <DashaA4Pages result={result} />
    </>
  );
};

const FactCard = ({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) => (
  <div className="parchment rounded-xl p-5 text-center relative overflow-hidden group hover:shadow-gold transition-all">
    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-royal text-gold-bright mb-2">
      {icon}
    </div>
    <div className="text-xs text-muted-foreground font-tamil tracking-wide uppercase">{label}</div>
    <div className="font-tamil text-2xl font-bold text-maroon-deep mt-1">{value}</div>
    {sub && <div className="text-xs text-muted-foreground mt-1 font-tamil">{sub}</div>}
  </div>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 mb-3">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
    <h3 className="font-tamil text-xl font-bold text-maroon-deep px-3">{children}</h3>
    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
  </div>
);

const PanchaItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="font-semibold text-maroon-deep">{value || "—"}</div>
  </div>
);

const UpaRow = ({ label, data }: { label: string; data: { rasiTamil: string; degreeInRasi: number; nakshatraTamil: string; pada: number } }) => (
  <div className="flex items-center justify-between border-b border-gold/20 pb-2 last:border-0">
    <div className="font-semibold text-maroon-deep">{label}</div>
    <div className="text-right text-xs">
      <div>{data.rasiTamil} • {formatDegree(data.degreeInRasi)}</div>
      <div className="text-muted-foreground">{data.nakshatraTamil} {data.pada}-ம் பாதம்</div>
    </div>
  </div>
);

const fmtTime = (d: Date, tzHours: number) => {
  const local = new Date(d.getTime() + tzHours * 3600 * 1000);
  const hh = String(local.getUTCHours()).padStart(2, "0");
  const mm = String(local.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};
