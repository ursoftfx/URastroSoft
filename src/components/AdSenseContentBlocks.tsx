import { Link } from "react-router-dom";
import heroImg from "@/assets/tamil-astrology-hero.jpg";
import navagrahaImg from "@/assets/navagraha.jpg";
import rasiWheelImg from "@/assets/rasi-wheel.jpg";
import thirumanaImg from "@/assets/thirumana.jpg";

const articleLinks = [
  ["ஜாதகம் என்றால் என்ன?", "/articles/jathagam-introduction"],
  ["27 நட்சத்திரங்கள்", "/articles/27-nakshatras"],
  ["12 ராசிகள்", "/articles/12-rasis"],
  ["மகா தசை-புத்தி", "/articles/dasha-bukthi"],
  ["திருமண பொருத்தம்", "/articles/thirumana-porutham"],
  ["நவகிரகங்கள்", "/articles/nine-planets"],
];

export const FreeHoroscopePublisherContent = () => (
  <div className="print:hidden space-y-8 mt-10 font-tamil">
    <section className="parchment rounded-2xl overflow-hidden">
      <img src={heroImg} alt="தமிழ் ஜாதக ராசி கட்டம் விளக்கம்" width={1280} height={768} loading="lazy" className="w-full h-auto object-cover" />
      <div className="p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-maroon-deep mb-3">இலவச ஜாதகம் — பயனுள்ள முழு வழிகாட்டி</h2>
        <p className="text-foreground/85 leading-relaxed mb-3">
          UR ASTRO SOFT இலவச ஜாதக கருவி வெறும் input form அல்ல. பிறந்த தேதி, நேரம், ஊர் போன்ற அடிப்படை விவரங்களின் அடிப்படையில் ராசி, நட்சத்திரம், லக்னம், நவாம்சம், தசா-புத்தி, பஞ்சாங்க கூறுகள் ஆகியவற்றை ஒரே இடத்தில் விளக்கும் தமிழ் ஜோதிட வழிகாட்டி. ஜாதகத்தில் வரும் ஒவ்வொரு கூறும் என்ன அர்த்தம் தருகிறது என்பதை வாசகர்கள் புரிந்துகொள்ளும் வகையில் இங்கு விளக்கங்கள் சேர்க்கப்பட்டுள்ளன.
        </p>
        <p className="text-foreground/85 leading-relaxed">
          இந்த பக்கம் புதிய பயனர்களுக்காக உருவாக்கப்பட்டுள்ளது. ராசி என்பது மனநிலை மற்றும் உணர்ச்சி சார்ந்த அடிப்படை கூறுகளை குறிக்கும்; லக்னம் உடல், வெளிப்பாடு, வாழ்க்கை திசை ஆகியவற்றை காட்டும்; நட்சத்திரம் குணநிலை மற்றும் தசை ஆரம்பத்தை அறிய உதவும். ஜோதிட பலன்களை வாழ்க்கை முடிவுகளுக்கான ஒரே ஆதாரமாக பார்க்காமல், பாரம்பரிய அறிவு மற்றும் சுயபரிசீலனை கருவியாக பயன்படுத்துவது சிறந்தது.
        </p>
      </div>
    </section>

    <section className="parchment rounded-2xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-maroon-deep mb-4">ஜாதகத்தில் முக்கியமாக பார்க்கப்படும் தரவுகள்</h2>
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        {[
          ["ராசி", "சந்திரன் இருக்கும் ராசி; மனம், உணர்ச்சி, தினசரி பலன்களுக்கு முக்கியம்."],
          ["லக்னம்", "பிறந்த நேரத்தில் கிழக்கு திசையில் உதித்த ராசி; உடல், குணம், வாழ்க்கை பாதையை காட்டும்."],
          ["நட்சத்திரம்", "27 நட்சத்திரங்களில் ஜென்ம நட்சத்திரம்; தசை ஆரம்பம் மற்றும் பொருத்தத்தில் பயன்படும்."],
          ["நவாம்சம்", "திருமணம், தர்மம், உள்ளார்ந்த பலம் ஆகியவற்றை ஆராய உதவும் துணை சக்கரம்."],
          ["தசா-புத்தி", "வாழ்க்கையில் எந்த காலத்தில் எந்த கிரகத்தின் தாக்கம் அதிகம் என்பதை விளக்கும் முறை."],
          ["பஞ்சாங்கம்", "திதி, யோகம், கரணம், நாள் போன்ற காலக் கூறுகள் சுப நிகழ்வுகளுக்கு பயன்படும்."],
        ].map(([title, text]) => (
          <div key={title} className="border-l-2 border-gold/40 pl-3">
            <h3 className="font-bold text-maroon-deep">{title}</h3>
            <p className="text-muted-foreground mt-1">{text}</p>
          </div>
        ))}
      </div>
    </section>

    <RelatedReading />
  </div>
);

export const BirthHoroscopePublisherContent = () => (
  <div className="print:hidden space-y-8 mt-10 font-tamil">
    <section className="parchment rounded-2xl p-6 md:p-8 grid md:grid-cols-2 gap-6 items-center">
      <img src={rasiWheelImg} alt="பிறப்பு ஜாதகத்தில் 12 ராசிகள்" width={1024} height={1024} loading="lazy" className="w-full h-auto rounded-xl" />
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-maroon-deep mb-3">பிறப்பு ஜாதகம் எதற்காக பயன்படுத்தப்படுகிறது?</h2>
        <p className="text-foreground/85 leading-relaxed mb-3">
          பிறப்பு ஜாதகம் என்பது ஒருவரின் பிறந்த நேர வானியல் நிலையின் வரைபடம். இது எதிர்காலத்தை மட்டும் கூறும் கருவி அல்ல; குணநிலை, திறமை, கல்வி போக்கு, தொழில் திசை, குடும்ப நிலை, திருமண யோகம், ஆரோக்கிய கவனம் போன்ற வாழ்க்கை பகுதிகளை புரிந்துகொள்ள உதவும் பாரம்பரிய தமிழ் ஜோதிட முறை.
        </p>
        <p className="text-foreground/85 leading-relaxed">
          சரியான பிறந்த நேரம் கொடுக்கப்பட்டால் லக்னம் மற்றும் பாவ நிலைகள் தெளிவாக கணக்கிடப்படும். நேரம் சில நிமிடங்கள் மாறினாலும் லக்னம் அல்லது நவாம்சம் மாற வாய்ப்பு உள்ளது. அதனால் பதிவுசெய்யப்பட்ட பிறப்பு சான்றிதழ் நேரம், குடும்ப குறிப்புகள், அல்லது மருத்துவமனை பதிவு போன்ற ஆதாரங்களை பயன்படுத்துவது நல்லது.
        </p>
      </div>
    </section>

    <section className="parchment rounded-2xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-maroon-deep mb-4">துல்லியமான பிறப்பு ஜாதகத்திற்கான வழிமுறைகள்</h2>
      <ol className="space-y-3 text-foreground/85 leading-relaxed">
        <li><b>1. தேதி:</b> பிறந்த நாள், மாதம், ஆண்டு ஆகியவற்றை சரியாக உள்ளிடவும். English calendar தேதியை பயன்படுத்தவும்.</li>
        <li><b>2. நேரம்:</b> AM/PM குழப்பம் இல்லாமல் மணி மற்றும் நிமிடத்தை சரிபார்க்கவும். காலை 6:30 மற்றும் மாலை 6:30 வித்தியாசமான லக்னம் தரும்.</li>
        <li><b>3. ஊர்:</b> பிறந்த ஊரின் latitude/longitude அடிப்படையில் லக்னம் கணக்கிடப்படும். அருகிலுள்ள பெரிய நகரம் மட்டும் கொடுத்தால் சிறிய வேறுபாடு ஏற்படலாம்.</li>
        <li><b>4. பலன் வாசிப்பு:</b> ஒரு கிரக நிலையை மட்டும் வைத்து முடிவு செய்யாமல், லக்னம், ராசி, நவாம்சம், தசை, பாவ பலம் ஆகியவற்றை சேர்த்து பார்க்க வேண்டும்.</li>
      </ol>
    </section>

    <RelatedReading />
  </div>
);

export const ConsultationPublisherContent = () => (
  <div className="print:hidden space-y-8 mt-10 font-tamil">
    <section className="parchment rounded-2xl p-6 md:p-8 grid md:grid-cols-2 gap-6 items-center">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-maroon-deep mb-3">ஜோதிட ஆலோசனைக்கு முன் தெரிந்திருக்க வேண்டியவை</h2>
        <p className="text-foreground/85 leading-relaxed mb-3">
          நல்ல ஜோதிட ஆலோசனை என்பது பயமுறுத்தும் கணிப்பு அல்ல. பிறப்பு ஜாதகத்தில் உள்ள பலம், சவால், காலநிலை, சுப வாய்ப்புகள் ஆகியவற்றை அமைதியாக விளக்கி, நடைமுறை முடிவுகளுக்கு தெளிவு தருவது தான் நோக்கம். திருமணம், தொழில், கல்வி, குடும்பம், சொத்து, வெளிநாடு போன்ற கேள்விகளில் ஒரே கிரகத்தை மட்டும் பார்த்து தீர்ப்பு கூறாமல், முழு ஜாதக அமைப்பையும் பரிசீலிக்க வேண்டும்.
        </p>
        <p className="text-foreground/85 leading-relaxed">
          ஆலோசனைக்கு முன் உங்கள் பெயர், பிறந்த தேதி, நேரம், ஊர், முக்கிய கேள்வி ஆகியவற்றை தயார் வைத்தால் விரைவாகவும் தெளிவாகவும் பேச முடியும். பரிகாரம் கூறப்பட்டால் அது உங்கள் நம்பிக்கை, உடல்நிலை, குடும்ப சூழல் ஆகியவற்றுக்கு பொருத்தமாக இருக்க வேண்டும்.
        </p>
      </div>
      <img src={navagrahaImg} alt="ஜோதிட ஆலோசனையில் பார்க்கப்படும் நவகிரகங்கள்" width={1024} height={768} loading="lazy" className="w-full h-auto rounded-xl" />
    </section>

    <section className="parchment rounded-2xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-maroon-deep mb-4">ஆலோசனையில் விவாதிக்கக்கூடிய தலைப்புகள்</h2>
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        {[
          ["திருமணம்", "திருமண காலம், பொருத்தம், செவ்வாய் தோஷம், ரஜ்ஜு/வேதை பொருத்தம்."],
          ["தொழில்", "வேலை மாற்றம், வியாபாரம், வருமான வளர்ச்சி, பதவி உயர்வு காலம்."],
          ["கல்வி", "படிப்பு திசை, தேர்வு காலம், வெளிநாட்டு கல்வி வாய்ப்பு."],
          ["குடும்பம்", "குடும்ப ஒற்றுமை, குழந்தை யோகம், சொத்து மற்றும் உறவு சமநிலை."],
        ].map(([title, text]) => (
          <div key={title} className="border-l-2 border-gold/40 pl-3">
            <h3 className="font-bold text-maroon-deep">{title}</h3>
            <p className="text-muted-foreground mt-1">{text}</p>
          </div>
        ))}
      </div>
    </section>

    <RelatedReading />
  </div>
);

export const PoruthamPublisherContent = () => (
  <div className="print:hidden space-y-8 mt-10 font-tamil">
    <section className="parchment rounded-2xl overflow-hidden">
      <img src={thirumanaImg} alt="திருமண பொருத்தம் தமிழ் ஜோதிட வழிகாட்டி" width={1280} height={768} loading="lazy" className="w-full h-auto object-cover" />
      <div className="p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-maroon-deep mb-3">திருமண பொருத்தம் — பத்து பொருத்தங்களின் பொருள்</h2>
        <p className="text-foreground/85 leading-relaxed mb-3">
          திருமண பொருத்தம் என்பது இரண்டு நபர்களின் பெயர் அல்லது விருப்பத்தை மட்டும் பார்க்கும் முறை அல்ல. தமிழ் ஜோதிடத்தில் ஜென்ம நட்சத்திரம், ராசி, கிரக சம்பந்தம், மனப்பாங்கு, குடும்ப ஒற்றுமை, ஆயுள் சமநிலை ஆகியவற்றை கருத்தில் கொண்டு பல அடுக்குகளில் பொருத்தம் பார்க்கப்படுகிறது. பத்து பொருத்தங்கள் அதன் முக்கியமான முதல் கட்டம்.
        </p>
        <p className="text-foreground/85 leading-relaxed">
          தினம், கணம், மஹேந்திரம், ஸ்த்ரீ தீர்க்கம், யோனி, ராசி, ராசி அதிபதி, வசியம், ரஜ்ஜு, வேதை போன்றவை ஒவ்வொன்றும் வெவ்வேறு வாழ்க்கை அம்சங்களை குறிக்கும். கணக்கீட்டு முடிவு நல்லதாக இருந்தாலும் குடும்ப சூழல், கல்வி, குணநிலை, ஆரோக்கியம், தனிப்பட்ட சம்மதம் ஆகியவற்றையும் சேர்த்து பார்க்க வேண்டும்.
        </p>
      </div>
    </section>

    <section className="parchment rounded-2xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-maroon-deep mb-4">10 பொருத்தங்களில் கவனிக்க வேண்டியவை</h2>
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        {[
          ["தின பொருத்தம்", "ஆரோக்கியம், தினசரி ஒத்துழைப்பு, மன அமைதி."],
          ["கண பொருத்தம்", "குணநிலை, பழக்கம், உறவு சமநிலை."],
          ["யோனி பொருத்தம்", "உடல் மற்றும் மன ஈர்ப்பு சார்ந்த பொருத்தம்."],
          ["ராசி பொருத்தம்", "சந்திர ராசி அடிப்படையிலான குடும்ப மற்றும் மன பொருத்தம்."],
          ["ரஜ்ஜு பொருத்தம்", "பாரம்பரியமாக ஆயுள் மற்றும் திருமண நிலைத்தன்மைக்கு முக்கியமானதாக கருதப்படுகிறது."],
          ["வேதை பொருத்தம்", "நட்சத்திரங்களுக்கிடையிலான தடைகள் உள்ளதா என்பதை பார்க்கிறது."],
        ].map(([title, text]) => (
          <div key={title} className="border-l-2 border-gold/40 pl-3">
            <h3 className="font-bold text-maroon-deep">{title}</h3>
            <p className="text-muted-foreground mt-1">{text}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="parchment rounded-2xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-maroon-deep mb-3">முக்கிய குறிப்பு</h2>
      <p className="text-foreground/85 leading-relaxed">
        இந்த இலவச பொருத்தம் கருவி ஆரம்ப வழிகாட்டுதலுக்காக மட்டுமே. முழுமையான திருமண முடிவுக்கு இருவரின் முழு ஜாதகம், தசை காலம், செவ்வாய் தோஷம், ராகு-கேது அமைப்பு, குடும்ப சூழல், மருத்துவ மற்றும் தனிப்பட்ட விருப்பங்கள் ஆகியவற்றையும் சேர்த்து அனுபவம் வாய்ந்த ஜோதிடரிடம் ஆலோசனை பெறுவது நல்லது.
      </p>
    </section>

    <RelatedReading />
  </div>
);

const RelatedReading = () => (
  <section className="parchment rounded-2xl p-6 md:p-8">
    <h2 className="text-2xl font-bold text-maroon-deep mb-3">மேலும் படிக்க</h2>
    <ul className="grid sm:grid-cols-2 gap-2 text-sm">
      {articleLinks.map(([label, href]) => (
        <li key={href}>• <Link to={href} className="text-maroon-deep underline">{label}</Link></li>
      ))}
    </ul>
  </section>
);
