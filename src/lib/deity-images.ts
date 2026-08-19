// Maps deity names (Tamil) to a devotional image asset.
import imgShiva from "@/assets/god-shiva.jpg";
import imgVishnu from "@/assets/god-vishnu.jpg";
import imgMurugan from "@/assets/god-murugan.jpg";
import imgGanesha from "@/assets/god-ganesha.jpg";
import imgLakshmi from "@/assets/god-lakshmi.jpg";
import imgDurga from "@/assets/god-durga.jpg";
import imgBrahma from "@/assets/god-brahma.jpg";
import imgSurya from "@/assets/god-surya.jpg";
import imgChandra from "@/assets/god-chandra.jpg";
import imgNaga from "@/assets/god-naga.jpg";
import imgSani from "@/assets/god-sani.jpg";

import birdVulture from "@/assets/bird-vulture.jpg";
import birdOwl from "@/assets/bird-owl.jpg";
import birdCrow from "@/assets/bird-crow.jpg";
import birdCock from "@/assets/bird-cock.jpg";
import birdPeacock from "@/assets/bird-peacock.jpg";

// keyword → image (checked in order)
const RULES: { keys: string[]; img: string }[] = [
  { keys: ["விநாயக", "கணேச", "கணபதி", "பிள்ளையார்"], img: imgGanesha },
  { keys: ["முருக", "சுப்ரமணி", "கந்த", "தண்டாயுத", "வேல்", "வஜ்ர", "செவ்வாய்", "அங்காரக", "இந்திராக்னி"], img: imgMurugan },
  { keys: ["லக்ஷ்மி", "லட்சுமி", "மகாலட்சுமி", "சுக்ர", "ஆண்டாள்", "குபேர", "விஸ்வேதேவ"], img: imgLakshmi },
  { keys: ["துர்க்க", "காளி", "அம்மன்", "பகவதி", "கௌரி", "சக்தி", "மீனாக்ஷி", "காமாக்ஷி", "விசாலாக்ஷி", "அதிதி"], img: imgDurga },
  { keys: ["பிரம்ம", "சரஸ்வதி", "வாக்", "துவஷ்டா", "பிரகஸ்பதி", "குரு", "வியாழ"], img: imgBrahma },
  { keys: ["சூரிய", "மித்ர", "பகன்", "அர்யமன்", "பூஷன்", "அக்னி", "இந்திர"], img: imgSurya },
  { keys: ["சந்திர", "சோம", "பித்ரு", "வருண", "ஜலம்", "அப்பு", "வாயு", "வாய்யு"], img: imgChandra },
  { keys: ["நாக", "அஹிர்புத்ன", "அஜ ஏகபாத்", "ராகு", "கேது"], img: imgNaga },
  { keys: ["சனி", "சனீஸ்வர", "ஐயப்ப", "சாஸ்தா", "யமன்", "நிருதி", "பைரவ", "பத்ரா", "விஷ்டி"], img: imgSani },
  { keys: ["விஷ்ணு", "பெருமாள்", "ரங்கநாத", "நாராயண", "வேங்கடேச", "திரிவிக்ரம", "பார்த்தசாரதி", "புதன்", "வரதராஜ"], img: imgVishnu },
  { keys: ["சிவ", "ருத்ர", "நடராஜ", "கைலாச", "ஈஸ்வர", "நாதர்", "வசு", "பூமி"], img: imgShiva },
];

export const deityImage = (name: string): string => {
  for (const r of RULES) {
    if (r.keys.some((k) => name.includes(k))) return r.img;
  }
  return imgShiva;
};

export const BIRD_IMAGES: Record<string, string> = {
  "கழுகு": birdVulture,
  "ஆந்தை": birdOwl,
  "காகம்": birdCrow,
  "சேவல்": birdCock,
  "மயில்": birdPeacock,
};

export const WEEKDAY_DEITY = [
  { deity: "சூரிய பகவான்", temple: "சூரியனார் கோயில் (ஆடுதுறை)", note: "ஆரோக்கியம், அதிகாரம், தந்தை வழி நன்மை." },
  { deity: "சந்திரன் / சிவன்", temple: "திங்களூர் கைலாசநாதர்", note: "மனநிம்மதி, தாய் வழி நன்மை." },
  { deity: "அங்காரகன் / முருகன்", temple: "வைத்தீஸ்வரன் கோயில்", note: "தைரியம், சொத்து, கடன் நிவர்த்தி." },
  { deity: "புதன் / விஷ்ணு", temple: "திருவெண்காடு புதன் கோயில்", note: "கல்வி, வர்த்தகம், பேச்சுத்திறன்." },
  { deity: "குரு பகவான்", temple: "ஆலங்குடி குரு கோயில்", note: "ஞானம், திருமணம், சந்தான பாக்கியம்." },
  { deity: "சுக்ரன் / மகாலட்சுமி", temple: "கஞ்சனூர் சுக்கிரன் கோயில்", note: "செல்வம், கலை, சுகபோகம்." },
  { deity: "சனீஸ்வரன் / ஐயப்பன்", temple: "திருநள்ளாறு சனீஸ்வரன் கோயில்", note: "உழைப்பு பலன், தடை நீக்கம்." },
];

export const NAKSHATRA_DEVATA = [
  "அஸ்வினி தேவர்கள்", "யமன்", "அக்னி", "பிரம்மா", "சந்திரன்", "ருத்ரன்", "அதிதி", "பிரகஸ்பதி (குரு)", "நாக தேவதை",
  "பித்ருக்கள்", "பகன்", "அர்யமன்", "சூரியன்", "துவஷ்டா", "வாயு", "இந்திராக்னி", "மித்ரன்", "இந்திரன்",
  "நிருதி", "ஜலம் (அப்பு)", "விஸ்வேதேவர்கள்", "விஷ்ணு", "வசுக்கள்", "வருணன்", "அஜ ஏகபாத்", "அஹிர்புத்னியன்", "பூஷன்",
];

export const WEEKDAY_TAMIL = [
  "ஞாயிற்றுக்கிழமை", "திங்கட்கிழமை", "செவ்வாய்க்கிழமை", "புதன்கிழமை", "வியாழக்கிழமை", "வெள்ளிக்கிழமை", "சனிக்கிழமை",
];
