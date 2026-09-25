import { useState } from "react";
import { NAKSHATRAS_TAMIL } from "@/lib/jathagam";
import { TARAS } from "@/lib/tara";

export const TharaQuickTable = () => {
  const [janma, setJanma] = useState(0);
  return (
    <div className="parchment rounded-xl p-4 border border-gold/40">
      <h3 className="font-tamil text-lg font-bold text-maroon-deep text-center">தாரா அட்டவணை</h3>
      <label className="font-tamil text-sm font-semibold flex flex-wrap items-center justify-center gap-2 my-3">
        ஜென்ம நட்சத்திரம்:
        <select
          value={janma}
          onChange={(e) => setJanma(Number(e.target.value))}
          className="border border-gold/60 rounded px-2 py-1 bg-background"
        >
          {NAKSHATRAS_TAMIL.map((n, i) => <option key={i} value={i}>{n}</option>)}
        </select>
      </label>
      <div className="overflow-x-auto">
        <table className="w-full font-tamil text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-secondary">
              <th className="border border-gold/40 p-1.5">தாரை</th>
              <th className="border border-gold/40 p-1.5">நட்சத்திரங்கள்</th>
              <th className="border border-gold/40 p-1.5">பலன்</th>
            </tr>
          </thead>
          <tbody>
            {TARAS.map((t, k) => (
              <tr key={k} style={{ background: t.light, color: "#1a1a1a" }}>
                <td className="border border-gold/40 p-1.5 font-bold" style={{ color: t.tone }}>{t.name}<div className="text-[11px]">{t.nature}</div></td>
                <td className="border border-gold/40 p-1.5 font-semibold">{[0, 9, 18].map((o) => NAKSHATRAS_TAMIL[(janma + k + o) % 27]).join(", ")}</td>
                <td className="border border-gold/40 p-1.5">{t.palan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
