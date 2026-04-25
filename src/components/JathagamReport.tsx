import { JathagamResult, formatDegree } from "@/lib/jathagam";
import { RasiChart } from "./RasiChart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Star, Sun, Moon } from "lucide-react";

interface Props {
  result: JathagamResult;
  interpretation?: string;
  interpretationLoading?: boolean;
}

const formatDate = (d: Date) =>
  d.toLocaleDateString("ta-IN", { year: "numeric", month: "long", day: "numeric" });

export const JathagamReport = ({ result, interpretation, interpretationLoading }: Props) => {
  return (
    <div className="space-y-6 animate-fade-up">
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
                {[result.ascendant, ...result.planets].map((p) => (
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

      {/* AI Interpretation */}
      <div>
        <SectionHeading>பலன் (AI பகுப்பாய்வு)</SectionHeading>
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
