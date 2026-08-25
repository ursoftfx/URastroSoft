import { JathagamResult } from "@/lib/jathagam";

interface Props {
  result: JathagamResult;
}

const fmtDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
};

const th: React.CSSProperties = {
  border: "1px solid #c9a050",
  padding: "2px 3px",
  background: "#fbe9d0",
  fontWeight: 700,
  fontSize: 8.5,
};
const cell: React.CSSProperties = { border: "1px solid #c9a050", padding: "2px 3px", fontSize: 8.5 };

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

          {group.map((maha, mi) => (
            <div key={mi} style={{ marginBottom: 8 }}>
              <div
                style={{
                  background: "#7a1a2b",
                  color: "#fff",
                  padding: "3px 6px",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {maha.lord} மகா தசை • {fmtDate(maha.startDate)} → {fmtDate(maha.endDate)} • வயது{" "}
                {ageAt(birth, maha.startDate)} – {ageAt(birth, maha.endDate)}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #c9a050" }}>
                <thead>
                  <tr>
                    <th style={th}>புத்தி</th>
                    <th style={th}>தொடக்கம்</th>
                    <th style={th}>முடிவு</th>
                    <th style={th}>வயது</th>
                    <th style={th}>அந்தரம் (தொடக்கம் – முடிவு)</th>
                  </tr>
                </thead>
                <tbody>
                  {(maha.children || []).map((bh, bi) => (
                    <tr key={bi}>
                      <td style={{ ...cell, fontWeight: 700, background: "#fff8ee", whiteSpace: "nowrap" }}>
                        {maha.lord}/{bh.lord}
                      </td>
                      <td style={{ ...cell, whiteSpace: "nowrap" }}>{fmtDate(bh.startDate)}</td>
                      <td style={{ ...cell, whiteSpace: "nowrap" }}>{fmtDate(bh.endDate)}</td>
                      <td style={{ ...cell, whiteSpace: "nowrap", textAlign: "center" }}>
                        {ageAt(birth, bh.startDate)}
                      </td>
                      <td style={{ ...cell, lineHeight: 1.4 }}>
                        {(bh.children || []).map((an, ai) => (
                          <span key={ai} style={{ marginRight: 6, whiteSpace: "nowrap" }}>
                            <b>{an.lord}</b> {fmtDate(an.startDate)}–{fmtDate(an.endDate)}
                            {ai < (bh.children || []).length - 1 ? " |" : ""}
                          </span>
                        ))}
                        {(bh.children || []).length === 0 ? "—" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

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
