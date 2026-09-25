import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DashaNode, JathagamResult } from "@/lib/jathagam";

const SHORT: Record<string, string> = {
  "கேது": "கே", "சுக்ரன்": "சுக்", "சூரியன்": "சூரி", "சந்திரன்": "சந்", "செவ்வாய்": "செ",
  "ராகு": "ரா", "குரு": "குரு", "சனி": "சனி", "புதன்": "புத",
};
const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (d: Date) => `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;

const LEVEL_CLS = [
  "bg-[hsl(290_35%_78%)]",
  "bg-[hsl(300_45%_90%)]",
  "bg-[hsl(230_30%_95%)]",
];

export const DashaTreeList = ({ result }: { result: JathagamResult }) => {
  const birth = result.dashaTree[0]?.startDate ?? new Date();
  const age = (d: Date) => {
    let m = (d.getFullYear() - birth.getFullYear()) * 12 + (d.getMonth() - birth.getMonth());
    if (d.getDate() < birth.getDate()) m -= 1;
    m = Math.max(0, m);
    return `${Math.floor(m / 12)}.${m % 12}`;
  };
  const now = Date.now();
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    result.dashaTree.forEach((m, i) => {
      if (+m.startDate <= now && now < +m.endDate) {
        o[`${i}`] = true;
        m.children?.forEach((b, j) => { if (+b.startDate <= now && now < +b.endDate) o[`${i}-${j}`] = true; });
      }
    });
    return o;
  });

  const Row = ({ node, id, level }: { node: DashaNode; id: string; level: number }) => {
    const hasKids = level < 2 && !!node.children?.length;
    const isOpen = !!open[id];
    const current = +node.startDate <= now && now < +node.endDate;
    return (
      <>
        <button
          type="button"
          onClick={() => hasKids && setOpen((s) => ({ ...s, [id]: !s[id] }))}
          className={`w-full flex items-center gap-2 border-b border-border/60 py-2.5 pr-2 text-left font-tamil text-sm sm:text-base tabular-nums ${LEVEL_CLS[level]} ${current ? "font-bold ring-1 ring-inset ring-accent" : ""}`}
          style={{ paddingLeft: 8 + level * 22 }}
        >
          {hasKids ? (isOpen ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />) : <span className="w-4 shrink-0" />}
          <span className="w-10 shrink-0 font-bold text-maroon-deep">{SHORT[node.lord] ?? node.lord}</span>
          <span className="flex-1 flex flex-wrap gap-x-3">
            <span>{fmt(node.startDate)}</span>
            <span>{fmt(node.endDate)}</span>
            <span className="text-muted-foreground">( {age(node.startDate)}-{age(node.endDate)} )</span>
          </span>
        </button>
        {hasKids && isOpen && node.children!.map((c, k) => <Row key={k} node={c} id={`${id}-${k}`} level={level + 1} />)}
      </>
    );
  };

  const i = result.input;
  return (
    <div className="max-w-2xl mx-auto bg-card rounded-xl border border-gold/40 overflow-hidden shadow">
      <div className="text-center py-4 px-3 font-tamil">
        <div className="text-xl font-bold text-maroon-deep">தசா / புத்தி / அந்தரம்</div>
        <div className="text-sm font-semibold">( திருக்கணிதம் )</div>
        <div className="font-semibold mt-1">{i.name}</div>
        <div className="font-semibold tabular-nums">{pad(i.day)}-{pad(i.month)}-{i.year} / {pad(i.hour)}:{pad(i.minute)}</div>
        <div className="font-semibold">{i.placeName}</div>
        <div className="text-xs text-muted-foreground mt-1">வரிசையைத் தொட்டால் புத்தி / அந்தரம் திறக்கும் · (வயது வருடம்.மாதம்)</div>
      </div>
      {result.dashaTree.map((m, k) => <Row key={k} node={m} id={`${k}`} level={0} />)}
    </div>
  );
};
