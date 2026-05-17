import { Link } from "react-router-dom";
import heroImg from "@/assets/tamil-astrology-hero.jpg";
import navagrahaImg from "@/assets/navagraha.jpg";
import rasiWheelImg from "@/assets/rasi-wheel.jpg";
import thirumanaImg from "@/assets/thirumana.jpg";

export const AstrologyContentSections = () => {
  return (
    <div className="print:hidden">
      {/* SEO brand block */}
      <section className="max-w-5xl mx-auto px-4 mt-16">
        <div className="parchment rounded-2xl p-6 md:p-8 font-tamil">
          <h2 className="text-2xl md:text-3xl font-bold text-maroon-deep mb-3">
            UR ASTRO SOFT — Free Tamil Astrology Software
          </h2>
          <p className="text-foreground/85 leading-relaxed mb-3">
            <b>UR ASTRO SOFT</b> (also known as <b>UR ASTRO SOFTS</b> or <b>urastrosoft</b>) is a free, browser-based Tamil astrology software. It is the modern web edition of the popular tool published at{" "}
            <a href="https://urastrosoft.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-maroon-deep underline">urastrosoft.netlify.app</a>{" "}— rebuilt for mobile and A4 printing. No install, no registration, no payment.
          </p>
          <p className="text-foreground/85 leading-relaxed">
            Use UR ASTRO SOFT online to generate full Tamil jathagam with rasi & navamsa kattam, 27 nakshatra, lagna, Vimsottari dasha-bhukti, panchangam (tithi, yoga, karana, nalikai), thirumana porutham (10 matching), Chevvai / Rahu-Kethu dosha analysis, and a one-page A4 printable PDF — all in Tamil &amp; English.
          </p>
          <div className="grid sm:grid-cols-2 gap-2 text-sm text-foreground/80 mt-4">
            <div>✓ Free Tamil astrology software online</div>
            <div>✓ Jathagam / Kundli software in Tamil</div>
            <div>✓ Marriage matching (porutham) software</div>
            <div>✓ Panchangam &amp; nalikai calculator</div>
            <div>✓ A4 printable horoscope PDF</div>
            <div>✓ Works on mobile, tablet &amp; desktop</div>
          </div>
        </div>
      </section>

      {/* Intro with hero image */}
      <section className="max-w-5xl mx-auto px-4 mt-10">
        <div className="parchment rounded-2xl overflow-hidden">
          <img
            src={heroImg}
            alt="பாரம்பரிய தமிழ் ஜோதிட ராசி கட்டம் — Tamil Vedic astrology rasi chart"
            width={1280}
            height={768}
            loading="lazy"
            className="w-full h-auto object-cover"
          />
          <div className="p-6 md:p-10 font-tamil">
            <h2 className="text-2xl md:text-3xl font-bold text-maroon-deep mb-3">
              தமிழ் ஜோதிட வழிகாட்டி — UR ASTRO SOFT
            </h2>
            <p className="text-foreground/85 leading-relaxed mb-3">
              UR ASTRO SOFT என்பது பாரம்பரிய வேத ஜோதிடத்தை எளிய தமிழில் வழங்கும் இலவச இணையதளம். உங்கள் பிறந்த தேதி, நேரம், ஊர் கொடுத்தால் — ராசி, நட்சத்திரம், லக்னம், ராசி-நவாம்ச கட்டம், விம்ஷோத்தரி தசா-புத்தி, பஞ்சாங்கம், திருமண பொருத்தம் உள்ளிட்ட முழுமையான ஜாதகத்தை A4 அச்சிடும் வடிவில் பெறலாம். எந்த பதிவும் தேவையில்லை, எந்த கட்டணமும் இல்லை.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              ஜோதிடம் என்பது வானியல், கணிதம், காலக் கணிப்பு ஆகியவற்றின் கலவையால் உருவான ஆயிரக்கணக்கான ஆண்டுகள் பழமையான அறிவியல். கிரகங்களின் நிலை, நட்சத்திர பாதை, ராசி கூறு ஆகியவை மனிதனின் குணம், திறமை, தொழில், திருமணம், ஆரோக்கியம் பற்றிய நுட்பமான தகவல்களை வெளிப்படுத்துகின்றன. எங்கள் இலவச கருவிகள் இந்த பாரம்பரிய அறிவை அனைவருக்கும் எளிமையாக்குகின்றன.
            </p>
          </div>
        </div>
      </section>

      {/* Navagrahas with image */}
      <section className="max-w-5xl mx-auto px-4 mt-10">
        <div className="parchment rounded-2xl p-6 md:p-8 font-tamil grid md:grid-cols-2 gap-6 items-center">
          <img
            src={navagrahaImg}
            alt="நவகிரகங்கள் — Navagraha nine planets in Tamil astrology"
            width={1024}
            height={768}
            loading="lazy"
            className="w-full h-auto rounded-xl"
          />
          <div>
            <h2 className="text-2xl font-bold text-maroon-deep mb-3">நவகிரகங்கள் — ஒன்பது கிரகங்கள்</h2>
            <p className="text-foreground/85 leading-relaxed mb-3">
              சூரியன், சந்திரன், செவ்வாய், புதன், குரு, சுக்கிரன், சனி, ராகு, கேது — இந்த ஒன்பது கிரகங்களே ஒரு ஜாதகத்தின் அடித்தளம். ஒவ்வொரு கிரகமும் ஒரு குறிப்பிட்ட ஆற்றலையும், பலனையும், காலகட்டத்தையும் குறிக்கின்றன.
            </p>
            <ul className="text-sm space-y-1 text-foreground/80">
              <li>☀ <b>சூரியன்</b> — ஆத்மா, தந்தை, அதிகாரம், சுய நம்பிக்கை</li>
              <li>☾ <b>சந்திரன்</b> — மனம், தாய், உணர்ச்சி, மனநிலை</li>
              <li>♂ <b>செவ்வாய்</b> — தைரியம், சகோதரர், சொத்து, ஆற்றல்</li>
              <li>☿ <b>புதன்</b> — அறிவு, தொடர்பு, கல்வி, வியாபாரம்</li>
              <li>♃ <b>குரு</b> — ஞானம், குழந்தைகள், செல்வம், அதிர்ஷ்டம்</li>
              <li>♀ <b>சுக்கிரன்</b> — காதல், கலை, திருமணம், சுகபோகம்</li>
              <li>♄ <b>சனி</b> — கர்மா, கடின உழைப்பு, ஒழுக்கம், ஆயுள்</li>
              <li>☊ <b>ராகு</b> — ஆசை, மாயை, வெளிநாடு, திடீர் மாற்றம்</li>
              <li>☋ <b>கேது</b> — மோட்சம், ஆன்மீகம், துறவு, கடந்தகால கர்மா</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 12 Rasis */}
      <section className="max-w-5xl mx-auto px-4 mt-10">
        <div className="parchment rounded-2xl p-6 md:p-8 font-tamil grid md:grid-cols-2 gap-6 items-center">
          <div className="md:order-2">
            <img
              src={rasiWheelImg}
              alt="12 ராசிகள் சக்கரம் — 12 zodiac rasis wheel"
              width={1024}
              height={1024}
              loading="lazy"
              className="w-full h-auto rounded-xl"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-maroon-deep mb-3">12 ராசிகள் — பன்னிரெண்டு கூறுகள்</h2>
            <p className="text-foreground/85 leading-relaxed mb-3">
              வானத்தை 12 சம பகுதிகளாக பிரித்தால் கிடைப்பவையே ராசிகள். மேஷம், ரிஷபம், மிதுனம், கடகம், சிம்மம், கன்னி, துலாம், விருச்சிகம், தனுசு, மகரம், கும்பம், மீனம் — ஒவ்வொரு ராசிக்கும் ஒரு அதிபதி கிரகம், ஒரு தத்துவம் (அக்னி, பூமி, வாயு, ஜலம்), ஒரு குணம் உண்டு.
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-foreground/80">
              <div>♈ மேஷம் — செவ்வாய்</div>
              <div>♎ துலாம் — சுக்கிரன்</div>
              <div>♉ ரிஷபம் — சுக்கிரன்</div>
              <div>♏ விருச்சிகம் — செவ்வாய்</div>
              <div>♊ மிதுனம் — புதன்</div>
              <div>♐ தனுசு — குரு</div>
              <div>♋ கடகம் — சந்திரன்</div>
              <div>♑ மகரம் — சனி</div>
              <div>♌ சிம்மம் — சூரியன்</div>
              <div>♒ கும்பம் — சனி</div>
              <div>♍ கன்னி — புதன்</div>
              <div>♓ மீனம் — குரு</div>
            </div>
          </div>
        </div>
      </section>

      {/* 27 Nakshatras */}
      <section className="max-w-5xl mx-auto px-4 mt-10">
        <div className="parchment rounded-2xl p-6 md:p-8 font-tamil">
          <h2 className="text-2xl font-bold text-maroon-deep mb-3">27 நட்சத்திரங்கள்</h2>
          <p className="text-foreground/85 leading-relaxed mb-3">
            வேத ஜோதிடத்தில் சந்திரன் பயணிக்கும் பாதையை 27 சம பகுதிகளாக பிரிக்கிறோம். இவையே நட்சத்திரங்கள். பிறக்கும்போது சந்திரன் எந்த நட்சத்திரத்தில் இருந்தாரோ அதுவே ஜென்ம நட்சத்திரம். உங்கள் சுபாவம், ஆரோக்கியம், திருமண பொருத்தம், காரியசித்தி நாட்கள் ஆகியவை ஜென்ம நட்சத்திரத்தை அடிப்படையாக கொண்டே அமைகின்றன.
          </p>
          <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
            {[
              "அசுவினி","பரணி","கார்த்திகை","ரோகிணி","மிருகசீரிஷம்","திருவாதிரை","புனர்பூசம்","பூசம்","ஆயில்யம்",
              "மகம்","பூரம்","உத்திரம்","ஹஸ்தம்","சித்திரை","சுவாதி","விசாகம்","அனுஷம்","கேட்டை",
              "மூலம்","பூராடம்","உத்திராடம்","திருவோணம்","அவிட்டம்","சதயம்","பூரட்டாதி","உத்திரட்டாதி","ரேவதி",
            ].map((n) => (
              <div key={n} className="bg-cream/60 border border-gold/30 rounded px-2 py-1.5 text-center text-maroon-deep">{n}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Thirumana porutham */}
      <section className="max-w-5xl mx-auto px-4 mt-10">
        <div className="parchment rounded-2xl overflow-hidden">
          <img
            src={thirumanaImg}
            alt="தமிழ் திருமண பொருத்தம் — Tamil wedding matching"
            width={1280}
            height={768}
            loading="lazy"
            className="w-full h-auto object-cover"
          />
          <div className="p-6 md:p-8 font-tamil">
            <h2 className="text-2xl font-bold text-maroon-deep mb-3">திருமண பொருத்தம் — 10 பொருத்தங்கள்</h2>
            <p className="text-foreground/85 leading-relaxed mb-3">
              பாரம்பரிய தமிழ் ஜோதிடத்தில் ஆணுக்கும் பெண்ணுக்கும் இடையே பத்து வகை பொருத்தம் பார்க்கப்படுகிறது. திணை, ராசி, கணம், யோனி, ரஜ்ஜு, வேதை, வசியம், மஹேந்திரம், ஸ்த்ரீ தீர்க்கம், நாடி ஆகியவையே இவை. குறைந்தபட்சம் 6 பொருத்தம் இருந்தால் திருமணம் சுபம் என்று கூறப்படுகிறது.
            </p>
            <Link to="/porutham" className="inline-block mt-2 px-5 py-2.5 rounded-md bg-gradient-royal text-primary-foreground text-sm font-bold">
              உங்கள் பொருத்தம் இலவசமாக பார்க்க →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 mt-10">
        <div className="parchment rounded-2xl p-6 md:p-8 font-tamil">
          <h2 className="text-2xl font-bold text-maroon-deep mb-4">அடிக்கடி கேட்கப்படும் கேள்விகள்</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-maroon-deep">UR ASTRO SOFT பயன்படுத்த கட்டணம் உண்டா?</h3>
              <p className="text-sm text-foreground/80 mt-1">இல்லை. ஜாதகம், பொருத்தம், பஞ்சாங்கம் உள்ளிட்ட எல்லா கருவிகளும் முற்றிலும் இலவசம். பதிவு செய்ய தேவையில்லை.</p>
            </div>
            <div>
              <h3 className="font-bold text-maroon-deep">பிறந்த நேரம் தெரியாவிட்டால் ஜாதகம் கணக்கிட முடியுமா?</h3>
              <p className="text-sm text-foreground/80 mt-1">துல்லியமான லக்னம் கணக்கிட பிறந்த நேரம் அவசியம். தோராயமான நேரம் (காலை/மதியம்) கொடுத்தாலும் ராசி, நட்சத்திரம் மற்றும் சந்திர அடிப்படையிலான பலன்களை பெறலாம்.</p>
            </div>
            <div>
              <h3 className="font-bold text-maroon-deep">அச்சிடும் வசதி உள்ளதா?</h3>
              <p className="text-sm text-foreground/80 mt-1">ஆம். ஒவ்வொரு அறிக்கையும் A4 அளவில் சரியாக அச்சிடப்படும் வடிவில் தயாரிக்கப்படுகிறது. அச்சிடு பொத்தானை அழுத்தினால் போதும்.</p>
            </div>
            <div>
              <h3 className="font-bold text-maroon-deep">தரவு பாதுகாப்பானதா?</h3>
              <p className="text-sm text-foreground/80 mt-1">உங்கள் பிறப்பு விவரங்கள் கணக்கிட மட்டுமே பயன்படுத்தப்படுகின்றன. மூன்றாம் தரப்பினருடன் பகிரப்படுவதில்லை.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Articles links */}
      <section className="max-w-5xl mx-auto px-4 mt-10 mb-12">
        <div className="parchment rounded-2xl p-6 md:p-8 font-tamil">
          <h2 className="text-2xl font-bold text-maroon-deep mb-3">அதிகம் படிக்கப்படும் கட்டுரைகள்</h2>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            <li>• <Link to="/articles/jathagam-introduction" className="text-maroon-deep underline">ஜாதகம் என்றால் என்ன?</Link></li>
            <li>• <Link to="/articles/27-nakshatras" className="text-maroon-deep underline">27 நட்சத்திரங்கள் விளக்கம்</Link></li>
            <li>• <Link to="/articles/12-rasis" className="text-maroon-deep underline">12 ராசிகள் விளக்கம்</Link></li>
            <li>• <Link to="/articles/dasha-bukthi" className="text-maroon-deep underline">மகா தசை-புத்தி</Link></li>
            <li>• <Link to="/articles/thirumana-porutham" className="text-maroon-deep underline">திருமண பொருத்தம் — 10</Link></li>
            <li>• <Link to="/articles/chevvai-dosham" className="text-maroon-deep underline">செவ்வாய் தோஷம்</Link></li>
          </ul>
          <div className="mt-5">
            <Link to="/articles" className="text-maroon-deep font-semibold underline">அனைத்து கட்டுரைகளும் →</Link>
          </div>
        </div>
      </section>
    </div>
  );
};
