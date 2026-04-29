// Dosham detection: Manglik (Kuja/Sevvai), Kala Sarpa, Sade Sati, Kemadruma
import { JathagamResult } from "./jathagam";

export interface Dosham {
  name: string;
  present: boolean;
  severity: "none" | "mild" | "moderate" | "severe";
  description: string;
  remedy?: string;
}

export function detectDoshams(r: JathagamResult): Dosham[] {
  const list: Dosham[] = [];
  const lagna = r.ascendant.rasiIndex;
  const moon = r.moon.rasiIndex;
  const mars = r.planets.find(p => p.key === "mars")!.rasiIndex;
  const saturn = r.planets.find(p => p.key === "saturn")!.rasiIndex;
  const rahu = r.planets.find(p => p.key === "rahu")!.rasiIndex;
  const ketu = r.planets.find(p => p.key === "ketu")!.rasiIndex;

  // ----- Mangal / Sevvai Dosham -----
  // Mars in 1,2,4,7,8,12 from Lagna OR Moon
  const houseFromLagna = ((mars - lagna + 12) % 12) + 1;
  const houseFromMoon = ((mars - moon + 12) % 12) + 1;
  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const fromLagna = manglikHouses.includes(houseFromLagna);
  const fromMoon = manglikHouses.includes(houseFromMoon);
  list.push({
    name: "செவ்வாய் தோஷம் (Mangal Dosha)",
    present: fromLagna || fromMoon,
    severity: fromLagna && fromMoon ? "severe" : (fromLagna || fromMoon) ? "moderate" : "none",
    description: fromLagna || fromMoon
      ? `செவ்வாய் லக்னத்திலிருந்து ${houseFromLagna}-ம் இடம், சந்திரனிலிருந்து ${houseFromMoon}-ம் இடம் — திருமண தாமதம்/தடைகள் ஏற்படலாம்.`
      : "செவ்வாய் தோஷம் இல்லை.",
    remedy: fromLagna || fromMoon ? "செவ்வாய் வாரம் முருகனை வழிபடவும், அங்காரக ஸ்தோத்திரம் பாராயணம்." : undefined,
  });

  // ----- Kala Sarpa Dosha -----
  // All 7 planets between Rahu and Ketu (one half)
  const planetLons = r.planets
    .filter(p => !["rahu", "ketu"].includes(p.key))
    .map(p => p.longitude);
  const rahuLon = r.planets.find(p => p.key === "rahu")!.longitude;
  // Distance from Rahu (forward)
  const distancesFromRahu = planetLons.map(lon => ((lon - rahuLon + 360) % 360));
  const allInOneHalf = distancesFromRahu.every(d => d < 180) || distancesFromRahu.every(d => d > 180);
  list.push({
    name: "கால சர்ப்ப தோஷம் (Kala Sarpa)",
    present: allInOneHalf,
    severity: allInOneHalf ? "severe" : "none",
    description: allInOneHalf
      ? "எல்லா கிரகங்களும் ராகு-கேது அச்சில் ஒரு பக்கம் — கால சர்ப்ப தோஷம் உள்ளது."
      : "கால சர்ப்ப தோஷம் இல்லை.",
    remedy: allInOneHalf ? "ராகு-கேது பரிகாரம், நாக பிரதிஷ்டை, கால ஹஸ்தீஸ்வர க்ஷேத்திர தரிசனம்." : undefined,
  });

  // ----- Sade Sati (7.5 yr Saturn transit) -----
  // Saturn currently in 12,1,2 from Moon = Sade Sati
  // We use natal Saturn position relative to Moon as a proxy "currently active in chart"
  const sat = ((saturn - moon + 12) % 12) + 1;
  const sadeSati = [12, 1, 2].includes(sat);
  list.push({
    name: "ஏழரை சனி (Sade Sati)",
    present: sadeSati,
    severity: sat === 1 ? "severe" : sadeSati ? "moderate" : "none",
    description: sadeSati
      ? `சனி சந்திரனிலிருந்து ${sat}-ம் இடம் — ${sat === 12 ? "முதல் கட்டம்" : sat === 1 ? "உச்சக் கட்டம்" : "மூன்றாம் கட்டம்"}.`
      : `சனி சந்திரனிலிருந்து ${sat}-ம் இடம் — ஏழரை சனி தற்போது இல்லை.`,
    remedy: sadeSati ? "சனி பகவான் வழிபாடு, திருநள்ளாறு க்ஷேத்திரம், எள் தானம்." : undefined,
  });

  // ----- Kemadruma Dosha -----
  // No planet (except Sun) in 2nd or 12th from Moon
  const has2nd = r.planets.some(p => {
    if (["moon", "sun", "rahu", "ketu"].includes(p.key)) return false;
    const h = ((p.rasiIndex - moon + 12) % 12) + 1;
    return h === 2 || h === 12;
  });
  list.push({
    name: "கேமத்ரும தோஷம் (Kemadruma)",
    present: !has2nd,
    severity: !has2nd ? "moderate" : "none",
    description: !has2nd
      ? "சந்திரனுக்கு 2-ம் 12-ம் வீட்டில் கிரகம் இல்லை — செல்வத் தடை சாத்தியம்."
      : "சந்திரனுக்கு துணை கிரகம் உள்ளது — தோஷம் இல்லை.",
    remedy: !has2nd ? "திங்கட்கிழமை சந்திர வழிபாடு, வெள்ளை வஸ்திரம் தானம்." : undefined,
  });

  // ----- Guru Chandala -----
  const jupiter = r.planets.find(p => p.key === "jupiter")!.rasiIndex;
  const guruChandala = jupiter === rahu || jupiter === ketu;
  list.push({
    name: "குரு சண்டாள தோஷம்",
    present: guruChandala,
    severity: guruChandala ? "moderate" : "none",
    description: guruChandala
      ? "குரு + ராகு/கேது சேர்க்கை — மதிப்பீட்டில் குழப்பம்."
      : "குரு சண்டாள தோஷம் இல்லை.",
    remedy: guruChandala ? "குரு வாரம் (வியாழன்) குரு பகவான் வழிபாடு, மஞ்சள் தானம்." : undefined,
  });

  return list;
}
