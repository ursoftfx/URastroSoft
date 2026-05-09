// Comprehensive life-area predictions for the Professional report.
// All Tamil text. Heuristic rules based on lagna lord, house placements, aspects.

import { JathagamResult, RASIS_TAMIL } from "./jathagam";

const PLANET_TA: Record<string, string> = {
  sun: "சூரியன்", moon: "சந்திரன்", mars: "செவ்வாய்", mercury: "புதன்",
  jupiter: "குரு", venus: "சுக்ரன்", saturn: "சனி", rahu: "ராகு", ketu: "கேது",
};

const RASI_LORDS = ["mars","venus","mercury","moon","sun","mercury","venus","mars","jupiter","saturn","saturn","jupiter"];
const BENEFIC = new Set(["jupiter","venus","moon","mercury"]);
const MALEFIC = new Set(["sun","mars","saturn","rahu","ketu"]);

export interface LifeArea {
  title: string;
  intro: string;
  positives: string[];
  negatives: string[];
  remedies: string[];
  timing: string;
}

// --- helpers ---
const houseOf = (rasiIdx: number, ascRasi: number) => ((rasiIdx - ascRasi + 12) % 12) + 1;
const lordOfHouse = (h: number, ascRasi: number) => RASI_LORDS[(ascRasi + h - 1) % 12];
const planetRasi = (r: JathagamResult, key: string) =>
  r.planets.find(p => p.key === key)?.rasiIndex ?? 0;
const planetHouse = (r: JathagamResult, key: string) =>
  houseOf(planetRasi(r, key), r.ascendant.rasiIndex);

// === Career & Profession ===
export function careerPrediction(r: JathagamResult): LifeArea {
  const asc = r.ascendant.rasiIndex;
  const tenthLord = lordOfHouse(10, asc);
  const tenthLordHouse = planetHouse(r, tenthLord);
  const sun = planetHouse(r, "sun");
  const sat = planetHouse(r, "saturn");
  const mars = planetHouse(r, "mars");
  const positives: string[] = [];
  const negatives: string[] = [];
  if ([1,2,4,5,7,9,10,11].includes(tenthLordHouse)) positives.push(`கர்மாதிபதி ${PLANET_TA[tenthLord]} ${tenthLordHouse}-ம் வீட்டில் — தொழில் நிலையான வளர்ச்சி.`);
  if ([6,8,12].includes(tenthLordHouse)) negatives.push(`கர்மாதிபதி ${PLANET_TA[tenthLord]} ${tenthLordHouse}-ம் வீட்டில் — அடிக்கடி இடம் / தொழில் மாற்றம்.`);
  if ([10,11,1,9].includes(sun)) positives.push("சூரியன் கர்ம ஸ்தானத்திற்கு வலு — அதிகார பதவி, அரசு வேலை வாய்ப்பு.");
  if ([10,11,6].includes(sat)) positives.push("சனி பல வீட்டில் — பெரு நிறுவனம், கட்டுமானம், எண்ணெய், இரும்பு துறை.");
  if ([1,3,6,10,11].includes(mars)) positives.push("செவ்வாய் வலிமை — பொறியியல், ராணுவம், அறுவை சிகிச்சை, விளையாட்டு.");
  if (planetHouse(r, "mercury") === 10) positives.push("புதன் 10-ல் — எழுத்து, பேச்சு, ஆலோசனை, IT, கணக்கியல்.");
  if (planetHouse(r, "venus") === 10) positives.push("சுக்ரன் 10-ல் — கலை, அழகியல், ஆபரணம், திரை, ஆடம்பர பொருள்.");
  if (planetHouse(r, "jupiter") === 10) positives.push("குரு 10-ல் — ஆசிரியர், நீதிபதி, ஆலோசகர், ஆன்மீக பணி.");
  if (planetHouse(r, "rahu") === 10) positives.push("ராகு 10-ல் — அரசியல், விளம்பரம், திடீர் உயர்வு, வெளிநாட்டு தொழில்.");
  if (negatives.length === 0) positives.push("தொழிலில் பொதுவாக நல்ல வாய்ப்புகள் இருக்கும்.");
  return {
    title: "தொழில் & வாழ்க்கை வழி",
    intro: `${r.lagnaTamil} லக்னத்திற்கு கர்மாதிபதி ${PLANET_TA[tenthLord]}. தொழில் தொடர்பான பாவம் (10-ம் வீடு) ${RASIS_TAMIL[(asc+9)%12]}.`,
    positives,
    negatives,
    remedies: [
      "ஞாயிறு தோறும் சூரியனுக்கு அர்க்கியம்.",
      "தொழில் தொடங்கும் முன் கணபதி வழிபாடு.",
      "சனிக்கிழமை எண்ணெய் தீபம், ஹனுமான் சாலிசா.",
    ],
    timing: "வியாழன் / சூரியன் / சனி தசை-புத்தியில் தொழில் முக்கிய திருப்பு கிடைக்கும்.",
  };
}

// === Marriage ===
export function marriagePrediction(r: JathagamResult): LifeArea {
  const asc = r.ascendant.rasiIndex;
  const seventhLord = lordOfHouse(7, asc);
  const slH = planetHouse(r, seventhLord);
  const venus = planetHouse(r, "venus");
  const jup = planetHouse(r, "jupiter");
  const mars = planetHouse(r, "mars");
  const sat = planetHouse(r, "saturn");
  const positives: string[] = [];
  const negatives: string[] = [];
  if ([1,2,4,5,7,9,11].includes(slH)) positives.push(`களத்திராதிபதி ${PLANET_TA[seventhLord]} சுப ஸ்தானத்தில் — மகிழ்ச்சியான வாழ்க்கை துணை.`);
  if ([6,8,12].includes(slH)) negatives.push(`களத்திராதிபதி ${PLANET_TA[seventhLord]} ${slH}-ல் — திருமணத்தில் தாமதம் / சோதனை.`);
  if ([1,2,4,5,7,11].includes(venus)) positives.push("சுக்ரன் சுப பாவத்தில் — காதலர் இணக்கம், அழகான துணை.");
  if ([1,5,7,9].includes(jup)) positives.push("குரு பார்வை / நிலை — தர்ம வாழ்க்கை, குழந்தை பாக்கியம்.");
  if ([1,2,4,7,8,12].includes(mars)) negatives.push(`செவ்வாய் ${mars}-ல் — செவ்வாய் தோஷம் கவனிக்கவும், திருமண தாமதம் சாத்தியம்.`);
  if ([1,5,7,8].includes(sat)) negatives.push("சனி பார்வை — மூத்த துணை அல்லது தாமதம்.");
  return {
    title: "திருமணம் & கூட்டு வாழ்க்கை",
    intro: `களத்திர ஸ்தானம் (7) ${RASIS_TAMIL[(asc+6)%12]} — அதிபதி ${PLANET_TA[seventhLord]} ${slH}-ம் வீட்டில்.`,
    positives,
    negatives,
    remedies: [
      "வெள்ளிக்கிழமை லக்ஷ்மி வழிபாடு, வெள்ளை மலர்.",
      "திருமணம் தாமதம் இருந்தால் சுவாமி மலை, திருச்செந்தூர் வழிபாடு.",
      "மங்கல்ய பாக்ய ஸ்தோத்திரம் தினமும் ஓதுதல்.",
    ],
    timing: "சுக்ரன் / குரு / 7-ம் அதிபதி தசை-புத்தியில் திருமணம் சாத்தியம்.",
  };
}

// === Wealth ===
export function wealthPrediction(r: JathagamResult): LifeArea {
  const asc = r.ascendant.rasiIndex;
  const secondL = lordOfHouse(2, asc);
  const eleventhL = lordOfHouse(11, asc);
  const slH = planetHouse(r, secondL);
  const elH = planetHouse(r, eleventhL);
  const positives: string[] = [];
  const negatives: string[] = [];
  if ([1,2,4,5,9,10,11].includes(slH)) positives.push(`தனாதிபதி ${PLANET_TA[secondL]} ${slH}-ல் — செல்வ சேர்க்கை சிறப்பு.`);
  if ([6,8,12].includes(slH)) negatives.push(`தனாதிபதி ${slH}-ல் — செல்வம் சேர்வதில் கடினம், செலவுகள் அதிகம்.`);
  if ([1,2,5,9,10,11].includes(elH)) positives.push(`லாபாதிபதி ${PLANET_TA[eleventhL]} ${elH}-ல் — பல வழி வருமானம்.`);
  if (planetHouse(r, "jupiter") === 2 || planetHouse(r, "jupiter") === 11) positives.push("குரு தன/லாப ஸ்தானத்தில் — பெரும் தனயோகம்.");
  if (planetHouse(r, "venus") === 2 || planetHouse(r, "venus") === 11) positives.push("சுக்ரன் தன/லாப ஸ்தானத்தில் — ஆடம்பர செல்வம்.");
  if (planetHouse(r, "rahu") === 11) positives.push("ராகு லாபத்தில் — திடீர் வருமானம், வெளிநாட்டு வழி தனம்.");
  if (planetHouse(r, "saturn") === 12) negatives.push("சனி வ்யய ஸ்தானத்தில் — செலவு கட்டுப்பாடு கவனம்.");
  return {
    title: "செல்வம் & நிதி நிலை",
    intro: `தன ஸ்தானம் (2) — ${PLANET_TA[secondL]} ${slH}-ல். லாப ஸ்தானம் (11) — ${PLANET_TA[eleventhL]} ${elH}-ல்.`,
    positives,
    negatives,
    remedies: [
      "வெள்ளிக்கிழமை ஸ்ரீ சூக்தம், கனகதாரா ஸ்தோத்திரம்.",
      "வியாழன் தோறும் மஞ்சள் / கடலை பருப்பு தானம்.",
      "வீட்டில் வடகிழக்கு மூலையில் குபேர யந்திரம்.",
    ],
    timing: "வியாழன் / சுக்ரன் / தன-லாப அதிபதி தசையில் பெரும் ஆதாயம்.",
  };
}

// === Children ===
export function childrenPrediction(r: JathagamResult): LifeArea {
  const asc = r.ascendant.rasiIndex;
  const fifthL = lordOfHouse(5, asc);
  const flH = planetHouse(r, fifthL);
  const jup = planetHouse(r, "jupiter");
  const positives: string[] = [];
  const negatives: string[] = [];
  if ([1,2,4,5,9,10,11].includes(flH)) positives.push(`புத்திராதிபதி ${PLANET_TA[fifthL]} ${flH}-ல் — குழந்தை பாக்கியம் சிறப்பு.`);
  if ([6,8,12].includes(flH)) negatives.push(`புத்திராதிபதி ${flH}-ல் — குழந்தை தாமதம் / சோதனை சாத்தியம்.`);
  if ([1,5,7,9].includes(jup)) positives.push("குரு பஞ்சம ஸ்தானம் தொடர்பு — மகன் பாக்கியம்.");
  if ([5].includes(planetHouse(r,"saturn"))) negatives.push("சனி 5-ல் — குழந்தை தாமதம், கடின முயற்சி தேவை.");
  if ([5].includes(planetHouse(r,"rahu")) || [5].includes(planetHouse(r,"ketu"))) negatives.push("ராகு/கேது 5-ல் — பித்ரு சாப தோஷம் சாத்தியம்.");
  return {
    title: "குழந்தை பாக்கியம்",
    intro: `புத்திர ஸ்தானம் (5) ${RASIS_TAMIL[(asc+4)%12]} — அதிபதி ${PLANET_TA[fifthL]} ${flH}-ல்.`,
    positives, negatives,
    remedies: [
      "சந்தான கோபால ஸ்தோத்திரம் தினமும்.",
      "வியாழன் வழிபாடு, பால் அபிஷேகம்.",
      "திருஆவடுதுறை, கருகாவூர் தரிசனம்.",
    ],
    timing: "குரு / 5-ம் அதிபதி தசை-புத்தியில் குழந்தை பாக்கியம்.",
  };
}

// === Education ===
export function educationPrediction(r: JathagamResult): LifeArea {
  const asc = r.ascendant.rasiIndex;
  const fourthL = lordOfHouse(4, asc);
  const fifthL = lordOfHouse(5, asc);
  const ninthL = lordOfHouse(9, asc);
  const positives: string[] = [];
  const negatives: string[] = [];
  if (BENEFIC.has(fourthL)) positives.push("4-ம் அதிபதி சுபர் — பள்ளிக் கல்வி நன்றாக நடக்கும்.");
  if ([1,2,4,5,9,10,11].includes(planetHouse(r, fifthL))) positives.push("5-ம் அதிபதி சுப ஸ்தானம் — கூர்ந்த புத்தி, கல்வி வெற்றி.");
  if ([1,5,9,10].includes(planetHouse(r, ninthL))) positives.push("9-ம் அதிபதி வலு — மேற்கல்வி, ஆராய்ச்சி வாய்ப்பு.");
  if (planetHouse(r,"jupiter") === 5 || planetHouse(r,"jupiter") === 4) positives.push("குரு பார்வை — ஆழ்ந்த ஞானம், உயர் கல்வி.");
  if (planetHouse(r,"mercury") === 5 || planetHouse(r,"mercury") === 1) positives.push("புதன் வலு — கணிதம், எழுத்து, ஆராய்ச்சி.");
  if (planetHouse(r,"saturn") === 4 || planetHouse(r,"saturn") === 5) negatives.push("சனி 4/5-ல் — கல்வியில் தாமதம், கடின முயற்சி.");
  if (planetHouse(r,"ketu") === 5) negatives.push("கேது 5-ல் — விஷயத்தில் கவனம் சிதறல், ஆனால் ஆழ்ந்த ஆராய்ச்சி.");
  return {
    title: "கல்வி & அறிவாற்றல்",
    intro: `வித்யா ஸ்தானங்கள் (4, 5, 9) — அதிபதிகள் ${PLANET_TA[fourthL]}, ${PLANET_TA[fifthL]}, ${PLANET_TA[ninthL]}.`,
    positives, negatives,
    remedies: [
      "ஸரஸ்வதி ஸ்தோத்திரம் தினமும்.",
      "புதன் — பச்சை வஸ்திரம், விஷ்ணு வழிபாடு.",
      "கல்வி தொடங்கும் முன் சம்புத்தி கூர்ந்த தீப ஆராதனை.",
    ],
    timing: "புதன் / குரு தசையில் கல்வியில் சிறப்பு.",
  };
}

// === Health ===
export function healthPrediction(r: JathagamResult): LifeArea {
  const asc = r.ascendant.rasiIndex;
  const lagL = lordOfHouse(1, asc);
  const sixthL = lordOfHouse(6, asc);
  const eighthL = lordOfHouse(8, asc);
  const positives: string[] = [];
  const negatives: string[] = [];
  if ([1,5,9,10,11].includes(planetHouse(r, lagL))) positives.push("லக்னாதிபதி வலு — உடல் ஆரோக்கியம், எதிர்ப்பு சக்தி நல்லது.");
  if ([6].includes(planetHouse(r, sixthL))) positives.push("ரோகாதிபதி 6-ல் — நோய் எதிர்ப்பு சக்தி அதிகம்.");
  if ([1,8,12].includes(planetHouse(r, sixthL))) negatives.push(`ரோகாதிபதி ${planetHouse(r, sixthL)}-ல் — அடிக்கடி நோய் சாத்தியம்.`);
  if ([1,8].includes(planetHouse(r, eighthL))) negatives.push("ஆயுள் அதிபதி பலவீனம் — விபத்து கவனம்.");
  if (planetHouse(r,"saturn") === 1) negatives.push("சனி லக்னத்தில் — மெல்லிய உடல், மூட்டு வலி சாத்தியம்.");
  if (planetHouse(r,"mars") === 1) negatives.push("செவ்வாய் லக்னத்தில் — உடல் வெப்பம், அறுவை சிகிச்சை சாத்தியம்.");
  if (planetHouse(r,"rahu") === 1 || planetHouse(r,"rahu") === 8) negatives.push("ராகு பாதிப்பு — மர்ம வியாதி, மன கலக்கம் கவனம்.");
  return {
    title: "ஆரோக்கியம் & ஆயுள்",
    intro: `தனு (1) ${PLANET_TA[lagL]} | ரோக (6) ${PLANET_TA[sixthL]} | ஆயுள் (8) ${PLANET_TA[eighthL]}.`,
    positives, negatives,
    remedies: [
      "தினமும் சூரிய நமஸ்காரம், பிராணாயாமம்.",
      "செவ்வாய்க்கிழமை முருகன் வழிபாடு, ஸ்கந்த சஷ்டி.",
      "மிருத்யுஞ்சய ஹோமம் — ஆயுள் பாதுகாப்புக்கு.",
    ],
    timing: "சனி / ராகு தசையில் ஆரோக்கிய சோதனை, கவனம் தேவை.",
  };
}

// === Foreign / Travel ===
export function foreignPrediction(r: JathagamResult): LifeArea {
  const asc = r.ascendant.rasiIndex;
  const ninthL = lordOfHouse(9, asc);
  const twelfthL = lordOfHouse(12, asc);
  const positives: string[] = [];
  const negatives: string[] = [];
  if ([3,7,9,12].includes(planetHouse(r, twelfthL))) positives.push(`வ்யயாதிபதி ${PLANET_TA[twelfthL]} — வெளிநாடு பயணம் / குடியேற்றம் சாத்தியம்.`);
  if (planetHouse(r,"rahu") === 7 || planetHouse(r,"rahu") === 9 || planetHouse(r,"rahu") === 12) positives.push("ராகு பார்வை — வெளிநாட்டு வாய்ப்பு வலுவாக.");
  if (planetHouse(r,"moon") === 9 || planetHouse(r,"moon") === 12) positives.push("சந்திரன் — தீர்த்த யாத்திரை, பயண சாத்தியம்.");
  if ([1,4,9].includes(planetHouse(r, ninthL))) positives.push("9-ம் அதிபதி வலு — தர்ம பயணம், மேற்கல்வி வெளிநாடு.");
  return {
    title: "வெளிநாடு & பயணம்",
    intro: `9-ம் வீடு (தர்மம்/தூர பயணம்) ${PLANET_TA[ninthL]} | 12-ம் வீடு (வெளிநாடு) ${PLANET_TA[twelfthL]}.`,
    positives, negatives,
    remedies: [
      "ஞாயிறு / வியாழன் வழிபாடு பயண முன்.",
      "ஹனுமான் சாலிசா — பயண பாதுகாப்பு.",
      "நீல, கருப்பு வண்ண ஆடைகள் தவிர்க்க பயணத்தில்.",
    ],
    timing: "ராகு / சனி / 12-ம் அதிபதி தசையில் வெளிநாடு வாய்ப்பு.",
  };
}

// === Property & Vehicles ===
export function propertyPrediction(r: JathagamResult): LifeArea {
  const asc = r.ascendant.rasiIndex;
  const fourthL = lordOfHouse(4, asc);
  const flH = planetHouse(r, fourthL);
  const positives: string[] = [];
  const negatives: string[] = [];
  if ([1,2,4,5,9,10,11].includes(flH)) positives.push(`சுகாதிபதி ${PLANET_TA[fourthL]} ${flH}-ல் — சொந்த வீடு, வாகனம் கிடைக்கும்.`);
  if ([6,8,12].includes(flH)) negatives.push(`சுகாதிபதி ${flH}-ல் — சொத்து தாமதம் / சண்டை சாத்தியம்.`);
  if (planetHouse(r,"venus") === 4) positives.push("சுக்ரன் 4-ல் — ஆடம்பர வாகனம், அழகான வீடு.");
  if (planetHouse(r,"mars") === 4) negatives.push("செவ்வாய் 4-ல் — நில சண்டை, வீட்டில் அமைதி குறை.");
  if (planetHouse(r,"saturn") === 4) negatives.push("சனி 4-ல் — பழமையான வீடு, தாமத ஆதாயம்.");
  return {
    title: "சொத்து • நிலம் • வாகனம்",
    intro: `சுக ஸ்தானம் (4) ${RASIS_TAMIL[(asc+3)%12]} — அதிபதி ${PLANET_TA[fourthL]}.`,
    positives, negatives,
    remedies: [
      "வாஸ்து தோஷம் இருந்தால் வாஸ்து ஹோமம்.",
      "வாகனம் வாங்கும் முன் கணபதி பூஜை, எலுமிச்சை.",
      "சந்திரனுக்கு நீர் சமர்ப்பணம் (திங்கள்).",
    ],
    timing: "சுக்ரன் / சந்திரன் / 4-ம் அதிபதி தசையில் சொத்து சேர்க்கை.",
  };
}

// === Family ===
export function familyPrediction(r: JathagamResult): LifeArea {
  const asc = r.ascendant.rasiIndex;
  const positives: string[] = [];
  const negatives: string[] = [];
  const fourthL = lordOfHouse(4, asc);
  const ninthL = lordOfHouse(9, asc);
  const thirdL = lordOfHouse(3, asc);
  if ([1,4,5,9,10,11].includes(planetHouse(r, fourthL))) positives.push("தாய் சுகம் சிறப்பு — தாயின் ஆசிர்வாதம்.");
  else negatives.push("தாய் சுகத்தில் சில சோதனைகள் சாத்தியம்.");
  if ([1,4,5,9,10,11].includes(planetHouse(r, ninthL))) positives.push("தந்தை வழி பாக்கியம் — தந்தையின் ஆதரவு.");
  else negatives.push("தந்தை சம்பந்தத்தில் சில சோதனைகள்.");
  if ([1,3,5,11].includes(planetHouse(r, thirdL))) positives.push("சகோதர பிணைப்பு நல்லது.");
  if (planetHouse(r,"sun") === 9) positives.push("சூரியன் 9-ல் — தந்தை வழி அதிகாரம், அரசு பயன்.");
  if (planetHouse(r,"moon") === 4) positives.push("சந்திரன் 4-ல் — தாய் வழி பெரும் சுகம்.");
  return {
    title: "குடும்பம் — தாய் / தந்தை / சகோதரர்",
    intro: "4 (தாய்), 9 (தந்தை), 3 (சகோதரர்) பாவ பகுப்பாய்வு.",
    positives, negatives,
    remedies: [
      "தாய் தந்தையை தினமும் வணங்குதல்.",
      "பித்ரு பக்ஷத்தில் திதி, தர்ப்பணம்.",
      "ருத்ர அபிஷேகம் — குடும்ப ஒற்றுமைக்கு.",
    ],
    timing: "சந்திரன் / சூரியன் / குரு தசையில் குடும்ப சம்பவங்கள்.",
  };
}

// === Spirituality ===
export function spiritualPrediction(r: JathagamResult): LifeArea {
  const asc = r.ascendant.rasiIndex;
  const ninthL = lordOfHouse(9, asc);
  const twelfthL = lordOfHouse(12, asc);
  const ketu = planetHouse(r, "ketu");
  const positives: string[] = [];
  const negatives: string[] = [];
  if ([5,9,12].includes(planetHouse(r, ninthL))) positives.push("தர்மாதிபதி பலம் — ஆன்மிக ஈடுபாடு இயல்பாக வரும்.");
  if ([5,9,12].includes(ketu)) positives.push("கேது தர்ம / மோட்ச ஸ்தானத்தில் — மோட்ச யோகம், ஆன்மிக துறவு.");
  if (planetHouse(r,"jupiter") === 9 || planetHouse(r,"jupiter") === 12) positives.push("குரு — மிக சிறந்த ஆன்மிக ஆசிரியர் / குரு கிடைப்பார்.");
  if (planetHouse(r,"saturn") === 12) positives.push("சனி 12-ல் — தனிமை, தியானம், மோட்ச நாட்டம்.");
  return {
    title: "ஆன்மிகம் • தர்மம் • மோட்சம்",
    intro: `தர்ம (9) ${PLANET_TA[ninthL]} | மோட்ச (12) ${PLANET_TA[twelfthL]} | கேது ${ketu}-ம் வீட்டில்.`,
    positives, negatives,
    remedies: [
      "தினமும் காலை தியானம், 108 முறை இஷ்ட தெய்வ ஜபம்.",
      "பௌர்ணமி / அமாவாசை — விரதம், கோயில் தரிசனம்.",
      "வாரம் ஒரு முறை அன்னதானம்.",
    ],
    timing: "குரு / கேது தசையில் ஆன்மிக மாற்றம்.",
  };
}

// === Yogas detected ===
export interface DetectedYoga { name: string; type: "raja"|"dhana"|"mahapurusha"|"other"; description: string; }
export function detectYogas(r: JathagamResult): DetectedYoga[] {
  const out: DetectedYoga[] = [];
  const asc = r.ascendant.rasiIndex;
  const planets = r.planets;
  const moon = r.moon.rasiIndex;
  // Pancha Mahapurusha
  const PMP: Record<string, { rasis: number[]; yoga: string; }> = {
    mars: { rasis: [0,7,9], yoga: "ருசக யோகம்" },
    mercury: { rasis: [2,5], yoga: "பத்ரக யோகம்" },
    jupiter: { rasis: [3,8,11], yoga: "ஹம்ஸ யோகம்" },
    venus: { rasis: [1,6,11], yoga: "மாலவ்ய யோகம்" },
    saturn: { rasis: [6,9,10], yoga: "சச யோகம்" },
  };
  for (const p of planets) {
    if (!PMP[p.key]) continue;
    const h = houseOf(p.rasiIndex, asc);
    if (PMP[p.key].rasis.includes(p.rasiIndex) && [1,4,7,10].includes(h)) {
      out.push({ name: PMP[p.key].yoga, type: "mahapurusha", description: `${PLANET_TA[p.key]} ${RASIS_TAMIL[p.rasiIndex]}-ல் கேந்த்ர (${h}-ம் வீடு) — பஞ்ச மஹா புருஷ யோகம்.` });
    }
  }
  // Gajakesari
  const jH = planetHouse(r, "jupiter");
  const moonH = houseOf(moon, asc);
  const diff = ((jH - moonH + 12) % 12);
  if ([0,3,6,9].includes(diff)) out.push({ name: "கஜகேசரி யோகம்", type: "raja", description: "சந்திரன் — குரு கேந்த்ரத்தில் — புகழ், செல்வம், மரியாதை." });
  // Chandra-Mangala
  if (planetHouse(r,"mars") === houseOf(moon, asc)) out.push({ name: "சந்திர-மங்கள யோகம்", type: "dhana", description: "சந்திரன் — செவ்வாய் இணைவு — தனாதிக்கம்." });
  // Budha-Aditya
  if (planetHouse(r,"sun") === planetHouse(r,"mercury")) out.push({ name: "புத-ஆதித்ய யோகம்", type: "raja", description: "சூரியன் — புதன் இணைவு — புத்திக் கூர்மை, அரசு பதவி." });
  // Lakshmi yoga (9th lord in own / exalted, Venus strong)
  const ninthL = lordOfHouse(9, asc);
  if (planetHouse(r, ninthL) <= 11 && [1,5,9,10,11].includes(planetHouse(r, ninthL)) && [1,2,4,5,7,9,11].includes(planetHouse(r,"venus"))) {
    out.push({ name: "லக்ஷ்மி யோகம்", type: "dhana", description: "9-ம் அதிபதி வலு + சுக்ரன் சுப ஸ்தானம் — பெரும் செல்வ யோகம்." });
  }
  // Adhi yoga (benefics in 6,7,8 from Moon)
  const benHouses = ["jupiter","venus","mercury"].map(k => ((planetRasi(r,k) - moon + 12) % 12) + 1);
  if (benHouses.every(h => [6,7,8].includes(h))) {
    out.push({ name: "அதி யோகம்", type: "raja", description: "சந்திரனிலிருந்து 6,7,8-ல் சுபர்கள் — தலைமை, பெரு செல்வம்." });
  }
  // Neecha bhanga (simple): a planet in debilitation but its dispositor in kendra
  const debil: Record<string, number> = { sun:6, moon:7, mars:3, mercury:11, jupiter:9, venus:5, saturn:0 };
  for (const p of planets) {
    if (debil[p.key] === p.rasiIndex) {
      const dispositor = RASI_LORDS[p.rasiIndex];
      const dh = planetHouse(r, dispositor);
      if ([1,4,7,10].includes(dh)) out.push({ name: `நீச பங்க ராஜ யோகம் (${PLANET_TA[p.key]})`, type: "raja", description: `${PLANET_TA[p.key]} நீசம் — ஆனால் அதிபதி ${PLANET_TA[dispositor]} கேந்த்ரம் — நீசம் நீங்கி ராஜ யோகம்.` });
    }
  }
  // Kemadruma (no planet 2nd/12th from Moon, no conjunction)
  const around = planets.filter(p => p.key !== "moon").some(p => {
    const h = ((p.rasiIndex - moon + 12) % 12);
    return h === 0 || h === 1 || h === 11;
  });
  if (!around) out.push({ name: "கேமத்ரும யோகம்", type: "other", description: "சந்திரனை சுற்றி கிரகம் இல்லை — வாழ்க்கையில் கடின உழைப்பு, ஆனால் ஆன்மிகம்." });
  if (out.length === 0) out.push({ name: "பொது யோகம்", type: "other", description: "சிறப்பு மஹாயோகம் இல்லை — பொதுவான ஜாதகம், கடின உழைப்பால் உயர்வு." });
  return out;
}

// === Aspects (Drishti) ===
export interface Aspect { from: string; to: string; type: string; }
export function planetAspects(r: JathagamResult): Aspect[] {
  const out: Aspect[] = [];
  const ASPECTS: Record<string, number[]> = {
    sun: [7], moon: [7], mercury: [7], venus: [7],
    mars: [4,7,8], jupiter: [5,7,9], saturn: [3,7,10],
    rahu: [5,7,9], ketu: [5,7,9],
  };
  for (const p of r.planets) {
    const fromH = houseOf(p.rasiIndex, r.ascendant.rasiIndex);
    for (const a of ASPECTS[p.key] || [7]) {
      const toH = ((fromH + a - 1 - 1) % 12) + 1;
      const target = r.planets.find(q => q.key !== p.key && houseOf(q.rasiIndex, r.ascendant.rasiIndex) === toH);
      if (target) out.push({ from: PLANET_TA[p.key], to: PLANET_TA[target.key], type: `${a}-ம் பார்வை (${fromH}→${toH})` });
    }
  }
  return out;
}

// === Year-by-year forecast (next 12 years from current) ===
export function yearForecast(r: JathagamResult, years = 12): { year: number; age: number; mahaLord: string; bhuktiLord: string; outlook: string }[] {
  const out: { year: number; age: number; mahaLord: string; bhuktiLord: string; outlook: string }[] = [];
  const birth = new Date(r.input.year, r.input.month - 1, r.input.day);
  const today = new Date();
  const startY = today.getFullYear();
  for (let i = 0; i < years; i++) {
    const y = startY + i;
    const checkDate = new Date(y, 6, 1);
    const age = y - birth.getFullYear();
    const maha = r.dashaTree.find(m => checkDate >= m.startDate && checkDate <= m.endDate);
    if (!maha) continue;
    const bh = (maha.children || []).find(b => checkDate >= b.startDate && checkDate <= b.endDate);
    const mLord = maha.lord;
    const bLord = bh?.lord || "—";
    const isBenefic = (l: string) => ["குரு","சுக்ரன்","புதன்","சந்திரன்"].includes(l);
    const outlook = isBenefic(mLord) && isBenefic(bLord)
      ? "மிக சிறந்த ஆண்டு — செல்வம், மகிழ்ச்சி, புது வாய்ப்புகள்."
      : isBenefic(mLord) || isBenefic(bLord)
      ? "சாதாரண நல்ல ஆண்டு — கடின உழைப்பால் வெற்றி."
      : "சவால் ஆண்டு — பொறுமை, ஆரோக்கியம், செலவு கவனம்.";
    out.push({ year: y, age, mahaLord: mLord, bhuktiLord: bLord, outlook });
  }
  return out;
}

// === Sade Sati timeline ===
export function sadeSatiTimeline(r: JathagamResult): { phase: string; from: string; to: string; effect: string }[] {
  // Approximate: each phase ~2.5 years; computed roughly from Saturn cycles relative to natal Moon
  // Simplification: provide conceptual past/current/future
  const moonRasi = r.moon.rasiIndex;
  const rasi12 = RASIS_TAMIL[(moonRasi + 11) % 12];
  const rasi1 = RASIS_TAMIL[moonRasi];
  const rasi2 = RASIS_TAMIL[(moonRasi + 1) % 12];
  return [
    { phase: "முதல் கட்டம் (மங்கல சனி)", from: `சனி ${rasi12}-ல் நுழையும் போது`, to: "+2.5 ஆண்டு", effect: "பணி மாற்றம், தந்தை சார்ந்த சோதனை, மன அழுத்தம்." },
    { phase: "உச்சக் கட்டம் (பொற் சனி)", from: `சனி ${rasi1}-ல்`, to: "+2.5 ஆண்டு", effect: "ஆரோக்கியம், மன கலக்கம், நெருங்கிய உறவில் சோதனை." },
    { phase: "மூன்றாம் கட்டம் (மறை சனி)", from: `சனி ${rasi2}-ல்`, to: "+2.5 ஆண்டு", effect: "பொருளாதார அழுத்தம், பயணம், மெல்ல மீட்சி." },
  ];
}

// === Gemstones ===
export function gemstoneRecommendation(r: JathagamResult): { planet: string; gem: string; weight: string; metal: string; finger: string; day: string }[] {
  const asc = r.ascendant.rasiIndex;
  const lagL = lordOfHouse(1, asc);
  const ninthL = lordOfHouse(9, asc);
  const fifthL = lordOfHouse(5, asc);
  const recs = new Set([lagL, ninthL, fifthL]);
  const map: Record<string, any> = {
    sun: { gem: "மாணிக்கம் (Ruby)", weight: "3-5 கேரட்", metal: "தங்கம்/செம்பு", finger: "மோதிர விரல்", day: "ஞாயிறு காலை" },
    moon: { gem: "முத்து (Pearl)", weight: "4-7 கேரட்", metal: "வெள்ளி", finger: "சிறு விரல்", day: "திங்கள் காலை" },
    mars: { gem: "பவளம் (Coral)", weight: "5-8 கேரட்", metal: "தங்கம்/செம்பு", finger: "மோதிர விரல்", day: "செவ்வாய் காலை" },
    mercury: { gem: "மரகதம் (Emerald)", weight: "3-5 கேரட்", metal: "தங்கம்/வெள்ளி", finger: "சிறு விரல்", day: "புதன் காலை" },
    jupiter: { gem: "புஷ்பராகம் (Yellow Sapphire)", weight: "3-5 கேரட்", metal: "தங்கம்", finger: "ஆட்காட்டி விரல்", day: "வியாழன் காலை" },
    venus: { gem: "வைரம் (Diamond)", weight: "0.5-1 கேரட்", metal: "வெள்ளி/பிளாட்டினம்", finger: "மோதிர விரல்", day: "வெள்ளி காலை" },
    saturn: { gem: "நீலம் (Blue Sapphire)", weight: "4-6 கேரட்", metal: "வெள்ளி/இரும்பு", finger: "நடு விரல்", day: "சனி காலை (சோதனை பிறகு)" },
  };
  return Array.from(recs).filter(p => map[p]).map(p => ({ planet: PLANET_TA[p], ...map[p] }));
}

// === Mantras ===
export const PLANET_MANTRAS: { planet: string; mantra: string; count: string }[] = [
  { planet: "சூரியன்", mantra: "ஓம் ஹ்ராம் ஹ்ரீம் ஹ்ரௌம் ஸஃ சூர்யாய நமஃ", count: "7,000 முறை / 40 நாள்" },
  { planet: "சந்திரன்", mantra: "ஓம் ஶ்ராம் ஶ்ரீம் ஶ்ரௌம் ஸஃ சந்த்ராய நமஃ", count: "11,000 முறை" },
  { planet: "செவ்வாய்", mantra: "ஓம் க்ராம் க்ரீம் க்ரௌம் ஸஃ பௌமாய நமஃ", count: "10,000 முறை" },
  { planet: "புதன்", mantra: "ஓம் ப்ராம் ப்ரீம் ப்ரௌம் ஸஃ புதாய நமஃ", count: "9,000 முறை" },
  { planet: "குரு", mantra: "ஓம் க்ராம் க்ரீம் க்ரௌம் ஸஃ குரவே நமஃ", count: "19,000 முறை" },
  { planet: "சுக்ரன்", mantra: "ஓம் த்ராம் த்ரீம் த்ரௌம் ஸஃ ஶுக்ராய நமஃ", count: "16,000 முறை" },
  { planet: "சனி", mantra: "ஓம் ப்ராம் ப்ரீம் ப்ரௌம் ஸஃ ஶனைஶ்சராய நமஃ", count: "23,000 முறை" },
  { planet: "ராகு", mantra: "ஓம் ப்ராம் ப்ரீம் ப்ரௌம் ஸஃ ராஹவே நமஃ", count: "18,000 முறை" },
  { planet: "கேது", mantra: "ஓம் ஸ்ராம் ஸ்ரீம் ஸ்ரௌம் ஸஃ கேதவே நமஃ", count: "17,000 முறை" },
];

// === Career field suggestions ===
export function careerFields(r: JathagamResult): string[] {
  const asc = r.ascendant.rasiIndex;
  const tenthRasi = (asc + 9) % 12;
  const tenthL = lordOfHouse(10, asc);
  const fields: Record<string, string[]> = {
    sun: ["அரசுப் பணி","நிர்வாக பதவி","மருத்துவம்","தலைமை பதவி","தங்க வியாபாரம்"],
    moon: ["திரவ பொருள் வியாபாரம்","கப்பல் / நீர் பணி","செவிலியர்","ஓட்டல் தொழில்","பால் பொருள்"],
    mars: ["ராணுவம்","காவல் துறை","பொறியியல்","அறுவை சிகிச்சை","இரும்பு / நிலம் வியாபாரம்","விளையாட்டு"],
    mercury: ["தகவல் தொழில்நுட்பம்","கணக்கியல்","எழுத்து","ஆலோசனை","பங்கு வர்த்தகம்","தொடர்பு துறை"],
    jupiter: ["ஆசிரியர்","வங்கி","நீதிபதி","ஆலோசகர்","ஆன்மிக பணி","நிதி ஆலோசனை"],
    venus: ["கலை","திரைப்படம்","ஆபரணம்","அழகு சாதனம்","ஆடை வியாபாரம்","சொகுசு பொருள்"],
    saturn: ["கட்டுமானம்","எண்ணெய் / நிலக்கரி","தொழில்துறை","விவசாயம்","சேவை துறை"],
    rahu: ["வெளிநாட்டு வியாபாரம்","தொழில்நுட்பம்","விளம்பரம்","மருந்து","அரசியல்"],
    ketu: ["ஆராய்ச்சி","ஆன்மிகம்","மர்ம ஆராய்ச்சி","மருத்துவம்","சாஃப்ட்வேர் பாதுகாப்பு"],
  };
  const base = fields[tenthL] || ["பொது தொழில்"];
  // add by sign element
  return [`கர்மாதிபதி ${PLANET_TA[tenthL]} (${RASIS_TAMIL[tenthRasi]} கர்ம ராசி) — ${base.join(", ")}.`];
}

// === Lucky days/colors ===
export function luckyAttributes(r: JathagamResult): { days: string; colors: string; numbers: string; gem: string; metal: string; direction: string } {
  const asc = r.ascendant.rasiIndex;
  const lagL = lordOfHouse(1, asc);
  const map: Record<string, any> = {
    sun:    { days:"ஞாயிறு, திங்கள், வியாழன்", colors:"செம்மஞ்சள், சிவப்பு, தங்க", numbers:"1, 4, 9", gem:"மாணிக்கம்", metal:"தங்கம்", direction:"கிழக்கு" },
    moon:   { days:"திங்கள், வியாழன், செவ்வாய்", colors:"வெள்ளை, கிரீம்", numbers:"2, 7", gem:"முத்து", metal:"வெள்ளி", direction:"வடமேற்கு" },
    mars:   { days:"செவ்வாய், ஞாயிறு", colors:"சிவப்பு, பவள", numbers:"9, 1", gem:"பவளம்", metal:"செம்பு", direction:"தெற்கு" },
    mercury:{ days:"புதன், வெள்ளி", colors:"பச்சை", numbers:"5", gem:"மரகதம்", metal:"வெள்ளி", direction:"வடக்கு" },
    jupiter:{ days:"வியாழன், ஞாயிறு", colors:"மஞ்சள், தங்க", numbers:"3", gem:"புஷ்பராகம்", metal:"தங்கம்", direction:"வடகிழக்கு" },
    venus:  { days:"வெள்ளி, புதன், சனி", colors:"வெள்ளை, இளஞ்சிவப்பு", numbers:"6", gem:"வைரம்", metal:"வெள்ளி", direction:"தென்கிழக்கு" },
    saturn: { days:"சனி, புதன், வெள்ளி", colors:"நீலம், கருப்பு", numbers:"8", gem:"நீலம்", metal:"இரும்பு", direction:"மேற்கு" },
  };
  return map[lagL] || map.sun;
}
