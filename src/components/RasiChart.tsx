import { JathagamResult, RASIS_TAMIL, PLANETS_TAMIL } from "@/lib/jathagam";

interface Props {
  result: JathagamResult;
}

const PLANET_SHORT: Record<string, string> = {
  sun: "சூ",
  moon: "ச",
  mars: "செ",
  mercury: "பு",
  jupiter: "கு",
  venus: "சு",
  saturn: "சனி",
  rahu: "ரா",
  ketu: "கே",
  ascendant: "லக்",
  mandi: "மாந்",
};

// South Indian style chart layout - fixed 12 houses around outside
// Order around the square (starting from top-left going clockwise):
// Row 0: [Pisces=11, Aries=0,    Taurus=1,  Gemini=2 ]
// Row 1: [Aquarius=10, center,   center,    Cancer=3 ]
// Row 2: [Capricorn=9, center,   center,    Leo=4 ]
// Row 3: [Sagittarius=8, Scorpio=7, Libra=6, Virgo=5 ]

const SOUTH_INDIAN_LAYOUT: (number | null)[][] = [
  [11, 0, 1, 2],
  [10, null, null, 3],
  [9, null, null, 4],
  [8, 7, 6, 5],
];

export const RasiChart = ({ result }: Props) => {
  return (
    <div className="parchment p-4 md:p-6 rounded-xl">
      <div className="grid grid-cols-4 gap-1 aspect-square max-w-md mx-auto">
        {SOUTH_INDIAN_LAYOUT.flat().map((rasiIdx, i) => {
          if (rasiIdx === null) {
            // Center cell
            const row = Math.floor(i / 4);
            const col = i % 4;
            // Only show "center" once - we'll render center label spanning
            if (row === 1 && col === 1) {
              return (
                <div
                  key={i}
                  className="col-span-2 row-span-2 flex flex-col items-center justify-center bg-gradient-royal text-primary-foreground rounded-lg p-3 text-center"
                >
                  <div className="font-display text-xs tracking-widest text-gold-bright/90 mb-1">RASI</div>
                  <div className="font-tamil text-2xl md:text-3xl font-bold text-gold-bright">ராசி</div>
                  <div className="temple-divider w-16 my-2 opacity-60" />
                  <div className="font-tamil text-sm md:text-base">{result.input.name}</div>
                </div>
              );
            }
            return null;
          }

          const planets = result.rasiChart[rasiIdx] || [];
          const isLagna = planets.includes("ascendant");

          return (
            <div
              key={i}
              className={`relative aspect-square border border-gold/40 bg-cream/50 rounded p-1.5 flex flex-col text-[10px] md:text-xs ${
                isLagna ? "ring-2 ring-accent shadow-gold" : ""
              }`}
            >
              <div className="font-tamil text-[9px] md:text-[10px] text-maroon font-semibold leading-tight">
                {RASIS_TAMIL[rasiIdx]}
              </div>
              <div className="flex flex-wrap gap-1 mt-1 font-tamil">
                {planets.map((p, idx) => (
                  <span
                    key={idx}
                    className={`${
                      p === "ascendant"
                        ? "text-accent font-bold"
                        : p === "sun" || p === "moon"
                        ? "text-maroon-deep font-bold"
                        : "text-ink"
                    }`}
                  >
                    {PLANET_SHORT[p]}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="temple-divider my-6" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-tamil">
        {Object.entries(PLANET_SHORT).map(([k, short]) => (
          <div key={k} className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-maroon text-gold-bright text-[10px] font-bold">
              {short}
            </span>
            <span className="text-foreground/80">{PLANETS_TAMIL[k as keyof typeof PLANETS_TAMIL]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
