import { JathagamResult, NAKSHATRAS_TAMIL } from "@/lib/jathagam";
import { thithiTemple, yogamTemple, karanamTemple, padamTemple } from "@/lib/temples";
import { panchaPakshi } from "@/lib/pancha-pakshi";
import { deityImage, BIRD_IMAGES, WEEKDAY_DEITY, WEEKDAY_TAMIL, NAKSHATRA_DEVATA } from "@/lib/deity-images";

interface Props {
  result: JathagamResult;
}

const Cell = ({
  title,
  value,
  deity,
  img,
  temple,
  note,
}: {
  title: string;
  value: string;
  deity: string;
  img: string;
  temple: string;
  note?: string;
}) => (
  <div style={{ border: "1px solid #c9a050", background: "#fffdf7", display: "flex", flexDirection: "column", overflow: "hidden" }}>
    <div style={{ background: "#7a1a2b", color: "#f4d58d", textAlign: "center", fontSize: 11, fontWeight: 800, padding: "2px 0" }}>{title}</div>
    <img src={img} alt={`${title} அதிதேவதை ${deity}`} loading="lazy" width={768} height={768} style={{ width: "100%", height: "42mm", objectFit: "cover" }} />
    <div style={{ padding: "3px 5px", fontSize: 10, lineHeight: 1.35, textAlign: "center" }}>
      <div style={{ fontWeight: 800, fontSize: 11, color: "#7a1a2b" }}>{value}</div>
      <div style={{ fontWeight: 700 }}>அதிதேவதை: {deity}</div>
      <div style={{ color: "#333" }}>{temple}</div>
      {note && <div style={{ color: "#555", fontSize: 9 }}>{note}</div>}
    </div>
  </div>
);

export const BirthDeityPage = ({ result }: Props) => {
  const i = result.input;
  const birthDate = new Date(i.year, i.month - 1, i.day);
  const wdIdx = birthDate.getDay();
  const wd = WEEKDAY_DEITY[wdIdx];

  const p = result.panchangam;
  const nakIdx = result.moon.nakshatraIndex;
  const pada = result.moon.pada;
  const devata = NAKSHATRA_DEVATA[nakIdx];
  const padT = padamTemple(nakIdx, pada);

  const th = thithiTemple(p.tithiIndex % 15);
  const yo = yogamTemple(p.yogaIndex);
  const ka = karanamTemple(p.karanaIndex);
  const bird = panchaPakshi(nakIdx);

  return (
    <div
      className="a4-sheet print-area"
      style={{
        width: "210mm", height: "297mm", padding: "8mm 10mm", margin: "auto", marginTop: "8mm",
        background: "white", color: "#000", fontFamily: "'Latha','Tahoma',sans-serif",
        boxSizing: "border-box", overflow: "hidden", pageBreakBefore: "always",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #7a1a2b", paddingBottom: 6 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1, color: "#7a1a2b" }}>ஜென்ம பஞ்சாங்க அதிதேவதைகள்</div>
          <div style={{ fontSize: 10, color: "#555" }}>Naal · Natchathiram · Thithi · Yogam · Karanam · Pancha Pakshi</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 10, color: "#555" }}>{i.name}</div>
      </div>

      <div style={{ marginTop: 5, fontSize: 10, background: "#fff8ee", border: "1px solid #c9a050", padding: 4, textAlign: "center" }}>
        பிறந்த நாள்: <b>{String(i.day).padStart(2, "0")}-{String(i.month).padStart(2, "0")}-{i.year}</b> · <b>{WEEKDAY_TAMIL[wdIdx]}</b> · {i.placeName}
      </div>

      <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4mm" }}>
        <Cell
          title="நாள் (வாரம்)"
          value={WEEKDAY_TAMIL[wdIdx]}
          deity={wd.deity}
          img={deityImage(wd.deity)}
          temple={wd.temple}
          note={wd.note}
        />
        <Cell
          title="நட்சத்திரம்"
          value={`${NAKSHATRAS_TAMIL[nakIdx]} — பாதம் ${pada}`}
          deity={devata}
          img={deityImage(devata)}
          temple={padT.temple}
          note="பாத நவாம்ச அதிபதி பரிகார ஸ்தலம்"
        />
        <Cell
          title="திதி"
          value={p.tithiTamil}
          deity={th.deity}
          img={deityImage(th.deity)}
          temple={th.temple}
        />
        <Cell
          title="யோகம்"
          value={p.yogaTamil}
          deity={yo.deity}
          img={deityImage(yo.deity)}
          temple={yo.temple}
        />
        <Cell
          title="கரணம்"
          value={p.karanaTamil}
          deity={ka.deity}
          img={deityImage(ka.deity)}
          temple={ka.temple}
        />
        <Cell
          title="பஞ்ச பட்சி"
          value={bird.bird}
          deity={bird.bird}
          img={BIRD_IMAGES[bird.bird] || BIRD_IMAGES["காகம்"]}
          temple={`நண்பர்: ${bird.friends.join(", ") || "—"} · எதிரி: ${bird.enemies.join(", ") || "—"}`}
          note={bird.nature}
        />
      </div>

      <div style={{ marginTop: 5, fontSize: 8.5, color: "#555", lineHeight: 1.35 }}>
        <b>குறிப்பு:</b> ஜாதகரின் ஜென்ம நாள், நட்சத்திரம், திதி, யோகம், கரணம் ஆகியவற்றின் அதிதேவதைகள் மற்றும் நட்சத்திர அடிப்படையிலான பஞ்ச பட்சி இங்கு காட்டப்பட்டுள்ளன. இந்த தேவதைகளை வழிபடுவதும், குறிப்பிட்ட பரிகார ஸ்தலங்களில் தரிசனம் செய்வதும் தோஷ நிவர்த்திக்கு உகந்தது.
      </div>
      <div style={{ marginTop: 4, fontSize: 9, textAlign: "center", borderTop: "1px solid #7a1a2b", paddingTop: 3, color: "#555" }}>
        © ASTRO UR — Janma Panchanga Adhi Devathai
      </div>
    </div>
  );
};
