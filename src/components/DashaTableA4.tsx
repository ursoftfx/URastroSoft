import { JathagamResult } from "@/lib/jathagam";

interface Props {
  result: JathagamResult;
}

const fmtDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
};

const planetTone: Record<string, { bg: string; text: string; border: string; light: string }> = {
  சூரியன்: { bg: "#7a1a2b", text: "#fff8ee", border: "#c9a050", light: "#fbe9d0" },
  சந்திரன்: { bg: "#0f4c75", text: "#ffffff", border: "#6fa3c9", light: "#e0efff" },
  செவ்வாய்: { bg: "#c0392b", text: "#ffffff", border: "#e6b0aa", light: "#f5d6d3" },
  புதன்: { bg: "#1e8449", text: "#ffffff", border: "#a9dfbf", light: "#e9f7ef" },
  குரு: { bg: "#9a7d0a", text: "#fffbe6", border: "#f7dc6f", light: "#fcf3cf" },
  சுக்கிரன்: { bg: "#6c3483", text: "#f5eef8", border: "#d7bde2", light: "#f4ecf7" },
  சனி: { bg: "#21618c", text: "#ebf5fb", border: "#85c1e9", light: "#d6eaf8" },
  ராகு: { bg: "#4a4a4a", text: "#f2f2f2", border: "#b3b3b3", light: "#e8e8e8" },
  கேது: { bg: "#7e5109", text: "#fef9e7", border: "#f0b27a", light: "#fdebd0" },
};

const toneFor = (lord: string) =>
  planetTone[lord] || { bg: "#7a1a2b", text: "#fff8ee", border: "#c9a050", light: "#fbe9d0" };

const baseCell: React.CSSProperties = {
  border: "1px solid #c9a050",
  padding: "2px 3px",
  fontSize: 8.5,
};

const ageAt = (birth: Date, d: Date) => {
  const yrs = (d.getTime() - birth.getTime()) / (365.2425 * 24 * 3600 * 1000);
  return yrs < 0 ? "-" : yrs.toFixed(1);
};

export const DashaTableA4 = ({ result }: Props) => {
  const i = result.input;
  const birth = new Date(i.year, i.month - 1, i.day, i.hour, i.minute);
  const tree = result.dashaTree || [];

  // 3 mahadashas per A4 page
  const pages: typeof tree[] = [];
  for (let k = 0; k < tree.length; k += 3) pages.push(tree.slice(k, k + 3));

  return (
    <>
      {pages.map((group, pi) => (
        <div
          key={pi}
          className="a4-sheet print-area"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "8mm 10mm",
            margin: "auto",
            background: "white",
            color: "#000",
            fontFamily: "'Latha','Tahoma',sans-serif",
            boxSizing: "border-box",
            pageBreakBefore: "always",
            marginTop: "8mm",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px solid #7a1a2b",
              paddingBottom: 5,
              marginBottom: 6,
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#7a1a2b" }}>
                தசா – புத்தி – அந்தர கால அட்டவணை
              </div>
              <div style={{ fontSize: 10, color: "#555" }}>
                {i.name || "ஜாதகர்"} • ஜனன தேதி {fmtDate(birth)}
              </div>
            </div>
            <div style={{ fontSize: 9, color: "#555" }}>
              பக்கம் {pi + 1} / {pages.length}
            </div>
          </div>

          {group.map((maha, mi) => {
            const mTone = toneFor(maha.lord);
            return (
              <div key={mi} style={{ marginBottom: 10 }}>
                <div
                  style={{
                    background: mTone.bg,
                    color: mTone.text,
                    padding: "4px 8px",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: "4px 4px 0 0",
                    border: `1px solid ${mTone.border}`,
                    borderBottom: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    {maha.lord} மகா தசை
                  </span>
                  <span>
                    {fmtDate(maha.startDate)} → {fmtDate(maha.endDate)} • வயது{" "}
                    {ageAt(birth, maha.startDate)} – {ageAt(birth, maha.endDate)}
                  </span>
                </div>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: `1px solid ${mTone.border}`,
                    borderRadius: "0 0 4px 4px",
                    overflow: "hidden",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#fbe9d0" }}>
                      <th style={{ ...baseCell, background: "#fbe9d0", fontWeight: 700, width: "16%" }}>புத்தி</th>
                      <th style={{ ...baseCell, background: "#fbe9d0", fontWeight: 700, width: "17%" }}>தொடக்கம்</th>
                      <th style={{ ...baseCell, background: "#fbe9d0", fontWeight: 700, width: "17%" }}>முடிவு</th>
                      <th style={{ ...baseCell, background: "#fbe9d0", fontWeight: 700, width: "10%" }}>வயது</th>
                      <th style={{ ...baseCell, background: "#fbe9d0", fontWeight: 700 }}>அந்தரம் (தொடக்கம் – முடிவு)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(maha.children || []).map((bh, bi) => {
                      const bTone = toneFor(bh.lord);
                      return (
                        <tr key={bi} style={{ background: bi % 2 === 0 ? "#fff" : "#fffbf5" }}>
                          <td
                            style={{
                              ...baseCell,
                              fontWeight: 700,
                              background: bTone.light,
                              color: bTone.bg,
                              whiteSpace: "nowrap",
                              borderLeft: `3px solid ${bTone.bg}`,
                            }}
                          >
                            {maha.lord}/{bh.lord}
                          </td>
                          <td style={{ ...baseCell, whiteSpace: "nowrap" }}>{fmtDate(bh.startDate)}</td>
                          <td style={{ ...baseCell, whiteSpace: "nowrap" }}>{fmtDate(bh.endDate)}</td>
                          <td style={{ ...baseCell, whiteSpace: "nowrap", textAlign: "center", fontWeight: 700 }}>
                            {ageAt(birth, bh.startDate)}
                          </td>
                          <td style={{ ...baseCell, lineHeight: 1.55, padding: "4px 6px" }}>
                            {(bh.children || []).map((an, ai) => {
                              const aTone = toneFor(an.lord);
                              return (
                                <span
                                  key={ai}
                                  style={{
                                    display: "inline-block",
                                    marginRight: 6,
                                    marginBottom: 3,
                                    whiteSpace: "nowrap",
                                    background: aTone.light,
                                    color: aTone.bg,
                                    border: `1px solid ${aTone.border}`,
                                    borderRadius: 3,
                                    padding: "1px 5px",
                                    fontSize: 8,
                                    fontWeight: 700,
                                  }}
                                >
                                  {an.lord} {fmtDate(an.startDate)}–{fmtDate(an.endDate)}
                                </span>
                              );
                            })}
                            {(bh.children || []).length === 0 ? "—" : ""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}

          <div
            style={{
              marginTop: 4,
              fontSize: 9,
              textAlign: "center",
              borderTop: "1px solid #7a1a2b",
              paddingTop: 3,
              color: "#555",
            }}
          >
            விம்சோத்தரி தசா – புத்தி – அந்தரம் • © ASTRO UR
          </div>
        </div>
      ))}
    </>
  );
};

