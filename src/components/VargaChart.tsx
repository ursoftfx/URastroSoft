import { RASIS_TAMIL } from "@/lib/jathagam";

const PLANET_SHORT: Record<string, string> = {
  sun: "சூ", moon: "ச", mars: "செ", mercury: "பு",
  jupiter: "கு", venus: "சு", saturn: "சனி", rahu: "ரா", ketu: "கே", ascendant: "லக்",
};

const SOUTH_INDIAN_LAYOUT: (number | null)[][] = [
  [11, 0, 1, 2],
  [10, null, null, 3],
  [9, null, null, 4],
  [8, 7, 6, 5],
];

interface Props {
  chart: string[][];
  label: string;
  tamilLabel: string;
  vargaKey: string;
}

export const VargaChart = ({ chart, label, tamilLabel, vargaKey }: Props) => {
  return (
    <div className="parchment p-3 rounded-lg">
      <div className="text-center mb-2">
        <div className="font-display text-[10px] tracking-widest text-gold-deep">{vargaKey}</div>
        <div className="font-tamil text-sm font-bold text-maroon-deep">{tamilLabel}</div>
        <div className="text-[9px] text-muted-foreground">{label}</div>
      </div>
      <div className="grid grid-cols-4 gap-0.5 aspect-square">
        {SOUTH_INDIAN_LAYOUT.flat().map((rasiIdx, i) => {
          if (rasiIdx === null) {
            const row = Math.floor(i / 4);
            const col = i % 4;
            if (row === 1 && col === 1) {
              return (
                <div key={i} className="col-span-2 row-span-2 flex items-center justify-center bg-maroon/90 text-gold-bright rounded text-[10px] font-display tracking-widest">
                  {vargaKey}
                </div>
              );
            }
            return null;
          }
          const planets = chart[rasiIdx] || [];
          const isLagna = planets.includes("ascendant");
          return (
            <div key={i} className={`relative aspect-square border border-gold/30 bg-cream/40 rounded-sm p-0.5 flex flex-col text-[8px] ${isLagna ? "ring-1 ring-accent" : ""}`}>
              <div className="font-tamil text-[7px] text-maroon font-semibold leading-none">{RASIS_TAMIL[rasiIdx]}</div>
              <div className="flex flex-wrap gap-0.5 mt-0.5 font-tamil leading-none">
                {planets.map((p, idx) => (
                  <span key={idx} className={p === "ascendant" ? "text-accent font-bold" : "text-ink"}>
                    {PLANET_SHORT[p]}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
