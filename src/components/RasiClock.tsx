import { useEffect, useState } from "react";
import { RASIS_TAMIL } from "@/lib/jathagam";
import { planetColor } from "@/lib/panchangam-extra";

/** Analog clock: 12 hour marks labelled with rasi names (1=மேஷம் … 12=மீனம்), current hora highlighted as an arc. */
export const RasiClock = ({ tz, horaStart, horaEnd, horaLord }: { tz: number; horaStart: number; horaEnd: number; horaLord: string }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);

  const local = (ms: number) => new Date(ms + tz * 3600_000);
  const d = local(now);
  const h = d.getUTCHours(), m = d.getUTCMinutes(), s = d.getUTCSeconds();
  const toAng = (ms: number) => { const x = local(ms); return ((x.getUTCHours() % 12) + x.getUTCMinutes() / 60) * 30; };

  const C = 150, R = 130;
  const pt = (ang: number, r: number) => [C + r * Math.sin((ang * Math.PI) / 180), C - r * Math.cos((ang * Math.PI) / 180)];
  const a1 = toAng(horaStart);
  let a2 = toAng(horaEnd); if (a2 <= a1) a2 += 360;
  const [x1, y1] = pt(a1, R - 6), [x2, y2] = pt(a2, R - 6);
  const arc = `M ${C} ${C} L ${x1} ${y1} A ${R - 6} ${R - 6} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
  const col = planetColor(horaLord);
  const hand = (ang: number, len: number, w: number, c: string) => { const [x, y] = pt(ang, len); return <line x1={C} y1={C} x2={x} y2={y} stroke={c} strokeWidth={w} strokeLinecap="round" />; };
  const t = (ms: number) => { const x = local(ms); return `${String(x.getUTCHours()).padStart(2, "0")}:${String(x.getUTCMinutes()).padStart(2, "0")}`; };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "6px 0 10px" }}>
      <svg viewBox="0 0 300 300" style={{ width: 280, maxWidth: "100%" }}>
        <circle cx={C} cy={C} r={R + 12} fill="#7a1a2b" />
        <circle cx={C} cy={C} r={R + 6} fill="#fffaf0" stroke="#c9a050" strokeWidth={3} />
        <path d={arc} fill={col} opacity={0.28} />
        <path d={arc} fill="none" stroke={col} strokeWidth={2} />
        {Array.from({ length: 60 }, (_, i) => { const [a, b] = pt(i * 6, R); const [c, e] = pt(i * 6, i % 5 ? R - 5 : R - 11); return <line key={i} x1={a} y1={b} x2={c} y2={e} stroke="#7a1a2b" strokeWidth={i % 5 ? 1 : 2.5} />; })}
        {RASIS_TAMIL.map((r, i) => { const [x, y] = pt((i + 1) * 30, R - 28); return <text key={r} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight={800} fill="#7a1a2b" fontFamily="Latha,Tahoma,sans-serif">{r}</text>; })}
        <text x={C} y={C - 38} textAnchor="middle" fontSize={11} fontWeight={800} fill={col} fontFamily="Latha,Tahoma,sans-serif">{horaLord} ஹோரை</text>
        <text x={C} y={C + 46} textAnchor="middle" fontSize={10} fontWeight={700} fill="#555">{t(horaStart)} – {t(horaEnd)}</text>
        {hand(((h % 12) + m / 60) * 30, 62, 6, "#7a1a2b")}
        {hand((m + s / 60) * 6, 92, 4, "#b8860b")}
        {hand(s * 6, 100, 1.5, "#d62828")}
        <circle cx={C} cy={C} r={6} fill="#7a1a2b" stroke="#c9a050" strokeWidth={2} />
      </svg>
      <div style={{ fontSize: 13, fontWeight: 800, color: col }}>தற்போதைய ஹோரை: {horaLord} ({t(horaStart)} – {t(horaEnd)})</div>
    </div>
  );
};
