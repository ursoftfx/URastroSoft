import { Link } from "react-router-dom";

export const SiteFooter = () => {
  return (
    <footer className="mt-16 border-t border-gold-deep/30 bg-parchment/60 print:hidden">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-4 text-sm font-tamil">
        <div>
          <h3 className="font-bold text-maroon-deep mb-3">UR ASTRO SOFT</h3>
          <p className="text-muted-foreground leading-relaxed">
            இலவச தமிழ் வேத ஜோதிடம் — ஜாதகம், பஞ்சாங்கம், பொருத்தம், தசா-புத்தி கணிப்பு.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-maroon-deep mb-3">கருவிகள்</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-maroon-deep text-muted-foreground">இலவச ஜாதகம்</Link></li>
            <li><Link to="/free-horoscope" className="hover:text-maroon-deep text-muted-foreground">Free Horoscope</Link></li>
            <li><Link to="/birth-horoscope" className="hover:text-maroon-deep text-muted-foreground">பிறப்பு ஜாதகம்</Link></li>
            <li><Link to="/porutham" className="hover:text-maroon-deep text-muted-foreground">திருமண பொருத்தம்</Link></li>
            <li><Link to="/astrology-consultation" className="hover:text-maroon-deep text-muted-foreground">ஆலோசனை</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-maroon-deep mb-3">கட்டுரைகள்</h4>
          <ul className="space-y-2">
            <li><Link to="/articles" className="hover:text-maroon-deep text-muted-foreground">அனைத்து கட்டுரைகள்</Link></li>
            <li><Link to="/articles/jathagam-introduction" className="hover:text-maroon-deep text-muted-foreground">ஜாதகம் என்றால்?</Link></li>
            <li><Link to="/articles/27-nakshatras" className="hover:text-maroon-deep text-muted-foreground">27 நட்சத்திரம்</Link></li>
            <li><Link to="/articles/12-rasis" className="hover:text-maroon-deep text-muted-foreground">12 ராசிகள்</Link></li>
            <li><Link to="/articles/dasha-bukthi" className="hover:text-maroon-deep text-muted-foreground">மகா தசை</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-maroon-deep mb-3">தகவல்</h4>
          <ul className="space-y-2">
            <li><Link to="/about" className="hover:text-maroon-deep text-muted-foreground">எங்களை பற்றி</Link></li>
            <li><Link to="/contact" className="hover:text-maroon-deep text-muted-foreground">தொடர்பு</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-maroon-deep text-muted-foreground">தனியுரிமை</Link></li>
            <li><Link to="/terms" className="hover:text-maroon-deep text-muted-foreground">நிபந்தனைகள்</Link></li>
            <li><Link to="/disclaimer" className="hover:text-maroon-deep text-muted-foreground">பொறுப்புத்துறப்பு</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gold-deep/20 py-4 text-center text-xs text-muted-foreground font-tamil">
        © {new Date().getFullYear()} UR ASTRO SOFT. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.
      </div>
    </footer>
  );
};
