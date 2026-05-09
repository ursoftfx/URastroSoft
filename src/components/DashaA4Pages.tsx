import { JathagamResult } from "@/lib/jathagam";

interface Props {
  result: JathagamResult;
}

const fmtDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
};
const fmtTimeStr = (h: number, m: number) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${pad(h12)}:${pad(m)} ${ampm}`;
};

export const DashaA4Pages = ({ result }: Props) => {
  const i = result.input;
  const birthDate = new Date(i.year, i.month - 1, i.day);

  return (
    <>
      {result.dashaTree.map((maha, mi) => (
        <div
          key={mi}
          className="a4-sheet print-area"
          style={{
            width: "148mm",
            minHeight: "210mm",
            padding: "7mm 8mm",
            margin: "5mm auto",
            background: "white",
            color: "#000",
            fontFamily: "'Latha','Tahoma',sans-serif",
            boxSizing: "border-box",
            pageBreakBefore: "always",
            fontSize: 8.5,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px solid #7a1a2b",
              paddingBottom: 6,
              marginBottom: 8,
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#7a1a2b" }}>120 ஆண்டு தசா புத்தி</div>
              <div style={{ fontSize: 11, color: "#555" }}>
                {i.name} • {fmtDate(birthDate)} {fmtTimeStr(i.hour, i.minute)}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: 10, color: "#555" }}>
              பக்கம் {mi + 1} / {result.dashaTree.length}
            </div>
          </div>

          <div
            style={{
              background: "#fbe9d0",
              border: "1px solid #c9a050",
              padding: "4px 8px",
              fontSize: 13,
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {maha.lord} மகா தசை &nbsp;•&nbsp; {fmtDate(maha.startDate)} → {fmtDate(maha.endDate)}
          </div>

          <table
            style={{
              width: "100%",
              fontSize: 10,
              borderCollapse: "collapse",
              border: "1px solid #c9a050",
              marginTop: 6,
            }}
          >
            <thead>
              <tr style={{ background: "#fff8ee" }}>
                <th style={{ border: "1px solid #c9a050", padding: 3 }}>புத்தி</th>
                <th style={{ border: "1px solid #c9a050", padding: 3 }}>தொடக்கம்</th>
                <th style={{ border: "1px solid #c9a050", padding: 3 }}>முடிவு</th>
                <th style={{ border: "1px solid #c9a050", padding: 3 }}>அந்தரம்</th>
                <th style={{ border: "1px solid #c9a050", padding: 3 }}>தொடக்கம்</th>
                <th style={{ border: "1px solid #c9a050", padding: 3 }}>முடிவு</th>
              </tr>
            </thead>
            <tbody>
              {(maha.children || []).flatMap((bhukti, bi) => {
                const antaras = bhukti.children || [];
                const rows: JSX.Element[] = [];
                const span = Math.max(antaras.length, 1);
                if (antaras.length === 0) {
                  rows.push(
                    <tr key={`${bi}-empty`}>
                      <td style={{ border: "1px solid #c9a050", padding: 3, fontWeight: 700 }}>
                        {maha.lord}/{bhukti.lord}
                      </td>
                      <td style={{ border: "1px solid #c9a050", padding: 3 }}>{fmtDate(bhukti.startDate)}</td>
                      <td style={{ border: "1px solid #c9a050", padding: 3 }}>{fmtDate(bhukti.endDate)}</td>
                      <td colSpan={3} style={{ border: "1px solid #c9a050", padding: 3, textAlign: "center", color: "#888" }}>
                        —
                      </td>
                    </tr>,
                  );
                } else {
                  antaras.forEach((ant, ai) => {
                    rows.push(
                      <tr key={`${bi}-${ai}`}>
                        {ai === 0 && (
                          <>
                            <td
                              rowSpan={span}
                              style={{
                                border: "1px solid #c9a050",
                                padding: 3,
                                fontWeight: 700,
                                background: "#fff8ee",
                                verticalAlign: "top",
                              }}
                            >
                              {maha.lord}/{bhukti.lord}
                            </td>
                            <td rowSpan={span} style={{ border: "1px solid #c9a050", padding: 3, verticalAlign: "top" }}>
                              {fmtDate(bhukti.startDate)}
                            </td>
                            <td rowSpan={span} style={{ border: "1px solid #c9a050", padding: 3, verticalAlign: "top" }}>
                              {fmtDate(bhukti.endDate)}
                            </td>
                          </>
                        )}
                        <td style={{ border: "1px solid #c9a050", padding: 3 }}>{ant.lord}</td>
                        <td style={{ border: "1px solid #c9a050", padding: 3 }}>{fmtDate(ant.startDate)}</td>
                        <td style={{ border: "1px solid #c9a050", padding: 3 }}>{fmtDate(ant.endDate)}</td>
                      </tr>,
                    );
                  });
                }
                return rows;
              })}
            </tbody>
          </table>

          <div
            style={{
              marginTop: 8,
              fontSize: 9,
              textAlign: "center",
              borderTop: "1px solid #7a1a2b",
              paddingTop: 4,
              color: "#555",
            }}
          >
            விம்சோத்தரி தசா • © UR ASTRO SOFT
          </div>
        </div>
      ))}
    </>
  );
};
