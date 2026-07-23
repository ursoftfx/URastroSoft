// Parihara temples for Nakshatra-Padam, Thithi, Yogam, Karanam
// Sources: Traditional Tamil Nadu Navagraha Parihara Sthalams + Nithya Devi Sthalams

export const NAVAGRAHA_TEMPLES: Record<string, string> = {
  sun: "சூரியனார் கோயில் (ஆடுதுறை)",
  moon: "திங்களூர் சந்திரன் கோயில்",
  mars: "வைத்தீஸ்வரன் கோயில்",
  mercury: "திருவெண்காடு புதன் கோயில்",
  jupiter: "ஆலங்குடி குரு கோயில்",
  venus: "கஞ்சனூர் சுக்கிரன் கோயில்",
  saturn: "திருநள்ளாறு சனீஸ்வரன் கோயில்",
  rahu: "திருநாகேஸ்வரம் ராகு கோயில்",
  ketu: "கீழ்ப்பெரும்பள்ளம் கேது கோயில்",
};

// Rasi lord (0..11 - Mesha to Meena)
const RASI_LORD_KEY = [
  "mars", "venus", "mercury", "moon", "sun", "mercury",
  "venus", "mars", "jupiter", "saturn", "saturn", "jupiter",
];

// Chara(movable)=0,3,6,9 start=same; Sthira(fixed)=1,4,7,10 start=+8; Dwi=2,5,8,11 start=+4
const navamsaStart = (rasi: number): number => {
  if ([0, 3, 6, 9].includes(rasi)) return rasi;
  if ([1, 4, 7, 10].includes(rasi)) return (rasi + 8) % 12;
  return (rasi + 4) % 12;
};

// Compute navamsa rasi for nakshatra (0..26) + padam (1..4)
export const padamNavamsaRasi = (nakIdx: number, pada: number): number => {
  const globalPadam = nakIdx * 4 + (pada - 1); // 0..107
  const rasi = Math.floor(globalPadam / 9);
  const inRasi = globalPadam % 9;
  return (navamsaStart(rasi) + inRasi) % 12;
};

export const padamTemple = (nakIdx: number, pada: number): { navamsaRasi: number; lordKey: string; temple: string } => {
  const navRasi = padamNavamsaRasi(nakIdx, pada);
  const lord = RASI_LORD_KEY[navRasi];
  return { navamsaRasi: navRasi, lordKey: lord, temple: NAVAGRAHA_TEMPLES[lord] };
};

// 15 Thithi temples (Nithya Devi / Ishta Devata per tithi 1..15)
export const THITHI_TEMPLES: { deity: string; temple: string }[] = [
  { deity: "காமாக்ஷி அம்மன்", temple: "காஞ்சிபுரம் காமாக்ஷி கோயில்" },
  { deity: "விசாலாக்ஷி", temple: "காசி விசாலாக்ஷி கோயில்" },
  { deity: "மீனாக்ஷி அம்மன்", temple: "மதுரை மீனாக்ஷி அம்மன் கோயில்" },
  { deity: "விநாயகர்", temple: "பிள்ளையார்பட்டி கற்பக விநாயகர்" },
  { deity: "நாக தேவதை", temple: "நாகர்கோவில் நாகராஜா கோயில்" },
  { deity: "சுப்ரமணியர்", temple: "திருச்செந்தூர் முருகன் கோயில்" },
  { deity: "சூரியன்", temple: "சூரியனார் கோயில் (ஆடுதுறை)" },
  { deity: "பைரவர்", temple: "சீர்காழி சட்டைநாதர் / பைரவர்" },
  { deity: "துர்க்கை", temple: "பட்டீஸ்வரம் துர்க்கை அம்மன்" },
  { deity: "தர்ம சாஸ்தா", temple: "சபரிமலை ஐயப்பன் / ஆரியங்காவு" },
  { deity: "விஷ்ணு", temple: "ஸ்ரீரங்கம் ரங்கநாதர் கோயில்" },
  { deity: "வரதராஜப் பெருமாள்", temple: "காஞ்சி வரதராஜப் பெருமாள் கோயில்" },
  { deity: "நடராஜர்", temple: "சிதம்பரம் நடராஜர் கோயில்" },
  { deity: "கைலாசநாதர்", temple: "காஞ்சி கைலாசநாதர் / திருக்கயிலாயம்" },
  { deity: "சந்திரன் / பித்ருக்கள்", temple: "திங்களூர் / திருக்கடையூர் அமிர்தகடேஸ்வரர்" },
];

export const thithiTemple = (tithiIndex: number) => THITHI_TEMPLES[tithiIndex % 15];

// 27 Yogam temples
export const YOGAM_TEMPLES: { deity: string; temple: string }[] = [
  { deity: "யமன்", temple: "திருச்சிற்றம்பலம் / திருக்கடையூர்" },
  { deity: "விஷ்ணு", temple: "திருவல்லிக்கேணி பார்த்தசாரதி" },
  { deity: "சந்திரன்", temple: "திங்களூர் கைலாசநாதர்" },
  { deity: "லக்ஷ்மி", temple: "திருக்கோஷ்டியூர் சௌம்ய நாராயணர்" },
  { deity: "இந்திரன்", temple: "பராசக்தி - மதுரை மீனாக்ஷி" },
  { deity: "சிவன்", temple: "சிதம்பரம் நடராஜர்" },
  { deity: "இந்திரன்", temple: "திருவையாறு பஞ்சநதீஸ்வரர்" },
  { deity: "ஜலம்", temple: "திருவானைக்காவல் ஜம்புகேஸ்வரர்" },
  { deity: "நாக தேவதை", temple: "திருநாகேஸ்வரம் நாகநாதர்" },
  { deity: "அக்னி", temple: "திருவண்ணாமலை அருணாசலேஸ்வரர்" },
  { deity: "சூரியன்", temple: "சூரியனார் கோயில்" },
  { deity: "பூமி", temple: "வைத்தீஸ்வரன் கோயில்" },
  { deity: "வாயு", temple: "பழநி தண்டாயுதபாணி" },
  { deity: "பகவதி", temple: "காஞ்சி காமாக்ஷி" },
  { deity: "வஜ்ர ஆயுதம்", temple: "திருச்செந்தூர் முருகன்" },
  { deity: "கணேசர்", temple: "பிள்ளையார்பட்டி விநாயகர்" },
  { deity: "ருத்ரன்", temple: "திருவாரூர் தியாகராஜர்" },
  { deity: "குபேரன்", temple: "திருப்பதி வேங்கடேசர்" },
  { deity: "பிரம்மா", temple: "திருப்பட்டூர் பிரம்மபுரீஸ்வரர்" },
  { deity: "சிவன்", temple: "ராமேஸ்வரம் ராமநாதசுவாமி" },
  { deity: "பித்ருக்கள்", temple: "திருக்கடையூர் அமிர்தகடேஸ்வரர்" },
  { deity: "விஷ்ணு", temple: "ஸ்ரீரங்கம் ரங்கநாதர்" },
  { deity: "கௌரி", temple: "மேலூர் அர்த்தநாரீஸ்வரர்" },
  { deity: "லக்ஷ்மி", temple: "திருக்கோவலூர் திரிவிக்ரமன்" },
  { deity: "பிரம்மா", temple: "குடந்தை ஆதிகும்பேஸ்வரர்" },
  { deity: "இந்திரன்", temple: "திருவேற்காடு தேவி கருமாரி" },
  { deity: "வாய்யு", temple: "திருப்பரங்குன்றம் முருகன்" },
];

export const yogamTemple = (yogaIndex: number) => YOGAM_TEMPLES[yogaIndex % 27];

// 11 Karanam temples
export const KARANAM_TEMPLES: { deity: string; temple: string }[] = [
  { deity: "இந்திரன் (பவ)", temple: "திருக்கோஷ்டியூர் / விஷ்ணு" },
  { deity: "பிரம்மா (பாலவ)", temple: "திருப்பட்டூர் பிரம்மபுரீஸ்வரர்" },
  { deity: "மித்திரன் (கௌலவ)", temple: "சூரியனார் கோயில்" },
  { deity: "அரியமன் (தைதுல)", temple: "திருவாரூர் தியாகராஜர்" },
  { deity: "பூமி (கரஜ)", temple: "வைத்தீஸ்வரன் கோயில்" },
  { deity: "லக்ஷ்மி (வணிஜ)", temple: "திருவெள்ளக்குளம் ஆண்டாள்" },
  { deity: "யமன் (விஷ்டி/பத்ரா)", temple: "திருக்கடையூர் அமிர்தகடேஸ்வரர்" },
  { deity: "காளி (சகுனி)", temple: "சாமய்யாபுரம் மாரியம்மன்" },
  { deity: "நாகர் (சதுஷ்பாத)", temple: "நாகர்கோவில் நாகராஜா" },
  { deity: "நாக தேவதை (நாகவ)", temple: "திருநாகேஸ்வரம் நாகநாதர்" },
  { deity: "பவனன் (கிம்ஸ்துக்னம்)", temple: "பழநி தண்டாயுதபாணி" },
];

export const karanamTemple = (karanaIndex: number) => KARANAM_TEMPLES[karanaIndex % 11];
