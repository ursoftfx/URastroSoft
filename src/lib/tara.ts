export interface Tara {
  name: string;
  nature: string;
  tone: string;
  light: string;
  palan: string;
  parikaram: string;
}

export const TARAS: Tara[] = [
  { name: "ஜென்ம தாரை", nature: "மத்திமம்", tone: "#7a1a2b", light: "#fbe9d0", palan: "உடல் நலம், மனநிலை சார்ந்த மாற்றங்கள். சொந்த முயற்சிக்கு பலன் உண்டு; பயணம் தவிர்க்கவும்.", parikaram: "ஜென்ம நட்சத்திர அதிதேவதைக்கு அர்ச்சனை." },
  { name: "சம்பத் தாரை", nature: "சுபம்", tone: "#1e8449", light: "#e9f7ef", palan: "செல்வம், பொருள் ஆதாயம், புதிய தொடக்கங்களுக்கு மிக உகந்தது.", parikaram: "லட்சுமி வழிபாடு — பலன் பெருகும்." },
  { name: "விபத் தாரை", nature: "அசுபம்", tone: "#c0392b", light: "#fdecea", palan: "இடையூறு, விபத்து, பண இழப்பு சாத்தியம். முக்கிய முடிவுகள் தவிர்க்கவும்.", parikaram: "மிருத்யுஞ்சய ஜபம், துர்கை தீபம் 9." },
  { name: "க்ஷேம தாரை", nature: "சுபம்", tone: "#0f4c75", light: "#e0efff", palan: "நலம், பாதுகாப்பு, மங்கல காரியங்கள் நிறைவேறும்.", parikaram: "விநாயகர் அர்ச்சனை." },
  { name: "பிரத்யரி தாரை", nature: "அசுபம்", tone: "#c0392b", light: "#fdecea", palan: "எதிர்ப்பு, வழக்கு, விரோதம். போட்டி அதிகரிக்கும்.", parikaram: "ஆஞ்சநேயர் வடை மாலை, சனி தீபம்." },
  { name: "சாதக தாரை", nature: "சுபம்", tone: "#1e8449", light: "#e9f7ef", palan: "தொடங்கிய காரியம் வெற்றி; வேலை, கல்வி முன்னேற்றம்.", parikaram: "முருகன் கந்த சஷ்டி கவசம்." },
  { name: "வத (நைதன) தாரை", nature: "அதி அசுபம்", tone: "#4a4a4a", light: "#e8e8e8", palan: "ஆபத்து, உடல் உபாதை, விபரீத முடிவுகள். மிகுந்த எச்சரிக்கை.", parikaram: "ருத்ர அபிஷேகம், எள் தானம், பயணம் தவிர்த்தல்." },
  { name: "மித்ர தாரை", nature: "சுபம்", tone: "#6c3483", light: "#f4ecf7", palan: "நண்பர் உதவி, கூட்டு முயற்சி வெற்றி, உறவுகள் வலுப்படும்.", parikaram: "பெருமாள் துளசி அர்ச்சனை." },
  { name: "அதி மித்ர (பரம மித்ர) தாரை", nature: "அதி சுபம்", tone: "#9a7d0a", light: "#fcf3cf", palan: "சர்வ காரிய சித்தி — திருமணம், கிரகப்பிரவேசம், புதிய தொழில் அனைத்திற்கும் சிறந்தது.", parikaram: "குரு பகவான் வழிபாடு." },
];

/** தாரை index (0-8) for a day nakshatra counted from janma nakshatra */
export const taraIndex = (janma: number, day: number) => ((day - janma + 27) % 27) % 9;
export const taraCycle = (janma: number, day: number) => Math.floor(((day - janma + 27) % 27) / 9) + 1;
