import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { SiteFooter } from "@/components/SiteFooter";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

const Shell = ({
  title,
  description,
  canonical,
  children,
}: {
  title: string;
  description: string;
  canonical: string;
  children: ReactNode;
}) => (
  <>
    <main className="min-h-screen max-w-3xl mx-auto px-4 py-10">
      <SEO title={title} description={description} canonical={canonical} />
      <Link to="/" className="inline-flex items-center text-sm font-tamil text-maroon-deep mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> முகப்பு
      </Link>
      <article className="parchment rounded-2xl p-6 md:p-10 font-tamil text-foreground/90 leading-relaxed">
        {children}
      </article>
    </main>
    <SiteFooter />
  </>
);

export const About = () => (
  <Shell
    title="எங்களை பற்றி | About UR ASTRO SOFT"
    description="UR ASTRO SOFT — இலவச தமிழ் வேத ஜோதிட இணையதளம். எங்களின் நோக்கம், கணிப்பு முறை மற்றும் சேவைகள் பற்றிய தகவல்."
    canonical="https://kanagadara.lovable.app/about"
  >
    <h1 className="text-3xl font-bold text-maroon-deep mb-4">எங்களை பற்றி</h1>
    <p className="mb-4">
      UR ASTRO SOFT என்பது தமிழ் மக்களுக்காக உருவாக்கப்பட்ட இலவச வேத ஜோதிட இணையதளம். எங்களின் நோக்கம் — பாரம்பரிய ஜோதிட அறிவை எளிய தமிழில், எவரும் புரிந்து கொள்ளக்கூடிய வகையில், எந்த கட்டணமும் இல்லாமல் வழங்குவதாகும்.
    </p>
    <h2 className="text-xl font-bold text-maroon-deep mt-6 mb-2">எங்கள் சேவைகள்</h2>
    <ul className="list-disc pl-6 space-y-1">
      <li>இலவச ஜாதகம் (ராசி, நட்சத்திரம், லக்னம், நவாம்சம்)</li>
      <li>விம்ஷோத்தரி தசை-புத்தி கணிப்பு</li>
      <li>திருமண பொருத்தம் — 10 பொருத்தங்கள்</li>
      <li>ஜெனன குறிப்பு, பஞ்சாங்கம், நாழிகை</li>
      <li>தமிழ் ஜோதிட கட்டுரைகள் மற்றும் வழிகாட்டிகள்</li>
    </ul>
    <h2 className="text-xl font-bold text-maroon-deep mt-6 mb-2">கணிப்பு முறை</h2>
    <p className="mb-4">
      எங்கள் கணிப்புகள் வேத ஜோதிட சாஸ்திரத்தின் அடிப்படையில் — Swiss Ephemeris தரத்துடன் — Lahiri அயனாம்சம் கொண்டு நிர்ணயிக்கப்படுகின்றன. பிறந்த தேதி, துல்லியமான நேரம், ஊர் கொடுத்தால் — மிகச் சரியான ஜாதகம் பெறலாம்.
    </p>
    <h2 className="text-xl font-bold text-maroon-deep mt-6 mb-2">நோக்கம்</h2>
    <p>
      ஜோதிடம் என்பது வழிகாட்டி — விதியின் கட்டளை அல்ல. தனிப்பட்ட சவால்களை அறிந்து தயாராக இருக்கவும், சாதகமான காலங்களில் முக்கிய முடிவுகள் எடுக்கவும் இது உதவும் ஒரு கருவி. UR ASTRO SOFT இதை மக்களுக்கு அன்பளிப்பாக வழங்குகிறது.
    </p>
  </Shell>
);

export const Contact = () => (
  <Shell
    title="தொடர்பு | Contact UR ASTRO SOFT"
    description="UR ASTRO SOFT — ஜோதிட ஆலோசனை, கருத்து, தொழில்நுட்ப ஆதரவுக்கு எங்களை தொடர்பு கொள்ள."
    canonical="https://kanagadara.lovable.app/contact"
  >
    <h1 className="text-3xl font-bold text-maroon-deep mb-4">தொடர்பு கொள்ள</h1>
    <p className="mb-6">
      ஜோதிட ஆலோசனை, தனிப்பட்ட ஜாதக பரிசீலனை, கருத்து, தவறு பற்றிய அறிக்கை அல்லது தொழில்நுட்ப உதவிக்கு — பின்வரும் வழிகளில் தொடர்பு கொள்ளலாம்.
    </p>
    <ul className="space-y-3 text-base">
      <li><strong>மின்னஞ்சல்:</strong> <a href="mailto:contact@kanagadara.lovable.app" className="text-maroon-deep underline">contact@kanagadara.lovable.app</a></li>
      <li><strong>WhatsApp:</strong> ஒவ்வொரு பக்கத்திலும் கீழே உள்ள பச்சை பட்டனை அழுத்தவும்.</li>
      <li><strong>ஆலோசனை பக்கம்:</strong> <Link to="/astrology-consultation" className="text-maroon-deep underline">ஆலோசனை கோர</Link></li>
    </ul>
    <h2 className="text-xl font-bold text-maroon-deep mt-8 mb-2">பதில் நேரம்</h2>
    <p>
      மின்னஞ்சல்களுக்கு 24–48 மணி நேரத்தில் பதிலளிக்க முயற்சிக்கிறோம். வார இறுதியில் சற்று தாமதம் ஏற்படலாம்.
    </p>
  </Shell>
);

export const PrivacyPolicy = () => (
  <Shell
    title="தனியுரிமை கொள்கை | Privacy Policy"
    description="UR ASTRO SOFT தனியுரிமை கொள்கை — தரவு சேகரிப்பு, பயன்பாடு, குக்கீ, மூன்றாம் தரப்பு சேவைகள் பற்றிய விளக்கம்."
    canonical="https://kanagadara.lovable.app/privacy-policy"
  >
    <h1 className="text-3xl font-bold text-maroon-deep mb-4">தனியுரிமை கொள்கை</h1>
    <p className="text-sm text-muted-foreground mb-6">கடைசி மேம்படுத்தம்: ஜனவரி 2026</p>

    <h2 className="text-xl font-bold text-maroon-deep mt-4 mb-2">1. நாங்கள் சேகரிக்கும் தகவல்கள்</h2>
    <p className="mb-3">
      ஜாதகம் கணிக்க — பிறந்த தேதி, நேரம், ஊர் ஆகியவை உங்கள் browser-ல் மட்டுமே பயன்படுத்தப்படுகின்றன. இவை எங்கள் சர்வரில் சேமிக்கப்படுவதில்லை. ஆலோசனை கோரும் போது நீங்கள் கொடுக்கும் பெயர், தொடர்பு விவரம் மட்டுமே சேமிக்கப்படும்.
    </p>

    <h2 className="text-xl font-bold text-maroon-deep mt-4 mb-2">2. குக்கீ (Cookies)</h2>
    <p className="mb-3">
      தளத்தின் செயல்பாட்டை மேம்படுத்த சில அத்தியாவசிய குக்கீகள் பயன்படுத்தப்படுகின்றன. மூன்றாம் தரப்பு சேவைகள் (Google AdSense, Analytics) — பயனர் அனுபவத்தை மேம்படுத்தவும் விளம்பரங்களை காட்டவும் சொந்த குக்கீகளை பயன்படுத்தலாம்.
    </p>

    <h2 className="text-xl font-bold text-maroon-deep mt-4 mb-2">3. மூன்றாம் தரப்பு விளம்பரம்</h2>
    <p className="mb-3">
      இந்த தளத்தில் Google AdSense மூலம் விளம்பரங்கள் காட்டப்படலாம். Google உங்கள் browser cookie-களை பயன்படுத்தி உங்களுக்கு பொருத்தமான விளம்பரங்களை காண்பிக்கும். விளம்பர குக்கீகளை நீங்கள் <a className="text-maroon-deep underline" href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>-ல் முடக்கலாம்.
    </p>

    <h2 className="text-xl font-bold text-maroon-deep mt-4 mb-2">4. தரவு பாதுகாப்பு</h2>
    <p className="mb-3">
      உங்கள் தனிப்பட்ட தகவலை மூன்றாம் தரப்பினருக்கு விற்போம் அல்லது பகிர்வது இல்லை. சட்டப்படி கட்டாயமான சூழ்நிலையில் மட்டுமே வெளிப்படுத்தப்படும்.
    </p>

    <h2 className="text-xl font-bold text-maroon-deep mt-4 mb-2">5. உங்கள் உரிமைகள்</h2>
    <p className="mb-3">
      உங்களைப் பற்றிய தரவை அறிய, திருத்த, நீக்க — <Link to="/contact" className="text-maroon-deep underline">contact@kanagadara.lovable.app</Link>-க்கு எழுதவும். 30 நாட்களுக்குள் நடவடிக்கை எடுப்போம்.
    </p>

    <h2 className="text-xl font-bold text-maroon-deep mt-4 mb-2">6. மாற்றங்கள்</h2>
    <p>
      இந்த கொள்கை அவ்வப்போது புதுப்பிக்கப்படும். முக்கிய மாற்றங்களை இங்கே பதிவிடுவோம்.
    </p>
  </Shell>
);

export const Terms = () => (
  <Shell
    title="பயன்பாட்டு நிபந்தனைகள் | Terms of Service"
    description="UR ASTRO SOFT பயன்பாட்டு நிபந்தனைகள் — சேவை விதிமுறைகள், பொறுப்புத்துறப்பு மற்றும் பயனர் கடமைகள்."
    canonical="https://kanagadara.lovable.app/terms"
  >
    <h1 className="text-3xl font-bold text-maroon-deep mb-4">பயன்பாட்டு நிபந்தனைகள்</h1>
    <p className="text-sm text-muted-foreground mb-6">கடைசி மேம்படுத்தம்: ஜனவரி 2026</p>

    <h2 className="text-xl font-bold text-maroon-deep mt-4 mb-2">1. சேவை</h2>
    <p className="mb-3">
      UR ASTRO SOFT இலவச ஜோதிட கணிப்பு கருவிகள் மற்றும் கல்வி தொடர்பான கட்டுரைகளை வழங்குகிறது. இந்த தளத்தை பயன்படுத்துவதன் மூலம் இங்குள்ள நிபந்தனைகளை நீங்கள் ஏற்றுக்கொள்கிறீர்கள்.
    </p>

    <h2 className="text-xl font-bold text-maroon-deep mt-4 mb-2">2. பொறுப்புத்துறப்பு</h2>
    <p className="mb-3">
      எங்கள் கணிப்புகள் கல்வி மற்றும் தகவல் நோக்கங்களுக்காக மட்டுமே. முக்கிய மருத்துவ, சட்ட, நிதி முடிவுகளுக்கு தகுதியான நிபுணரை அணுகவும். ஜோதிட பலன்கள் ஒரு குறிப்பாகவே கருதப்பட வேண்டும்.
    </p>

    <h2 className="text-xl font-bold text-maroon-deep mt-4 mb-2">3. பயனர் கடமை</h2>
    <ul className="list-disc pl-6 space-y-1 mb-3">
      <li>இந்த தளத்தை சட்டவிரோத நோக்கங்களுக்கு பயன்படுத்தக் கூடாது.</li>
      <li>தளத்தின் செயல்பாட்டை குலைக்கும் முயற்சிகள் தடைசெய்யப்படுகின்றன.</li>
      <li>உள்ளடக்கத்தை அனுமதியின்றி நகலெடுத்து பகிர்வது தடைசெய்யப்படுகிறது.</li>
    </ul>

    <h2 className="text-xl font-bold text-maroon-deep mt-4 mb-2">4. அறிவுசார் சொத்து</h2>
    <p className="mb-3">
      இந்த தளத்தின் அனைத்து உள்ளடக்கம், வடிவமைப்பு, லோகோ — UR ASTRO SOFT-க்கு சொந்தமானது. தனிப்பட்ட பயன்பாட்டிற்கு மட்டுமே அனுமதிக்கப்படுகிறது.
    </p>

    <h2 className="text-xl font-bold text-maroon-deep mt-4 mb-2">5. பொறுப்பு வரம்பு</h2>
    <p>
      ஜோதிட பலன்களின் அடிப்படையில் எடுக்கும் முடிவுகளுக்கு UR ASTRO SOFT பொறுப்பல்ல. தளம் "as is" அடிப்படையில் வழங்கப்படுகிறது.
    </p>
  </Shell>
);

export const Disclaimer = () => (
  <Shell
    title="பொறுப்புத்துறப்பு | Astrology Disclaimer"
    description="UR ASTRO SOFT — ஜோதிட பலன்கள் கல்வி நோக்கம் மட்டுமே என்ற பொறுப்புத்துறப்பு."
    canonical="https://kanagadara.lovable.app/disclaimer"
  >
    <h1 className="text-3xl font-bold text-maroon-deep mb-4">பொறுப்புத்துறப்பு</h1>
    <p className="mb-4">
      UR ASTRO SOFT வழங்கும் அனைத்து ஜோதிட கணிப்புகள், கட்டுரைகள் மற்றும் பலன்கள் — <strong>கல்வி, தகவல் மற்றும் கலாச்சார நோக்கங்களுக்காக மட்டுமே</strong>. இதை ஒரு வழிகாட்டியாக கருதவேண்டுமே தவிர, விதியின் இறுதி தீர்ப்பாக அல்ல.
    </p>

    <h2 className="text-xl font-bold text-maroon-deep mt-6 mb-2">மருத்துவ ஆலோசனை அல்ல</h2>
    <p className="mb-3">
      ஜோதிடம் எந்த நோய்க்கும் மருத்துவ சிகிச்சை அல்ல. உடல், மன ஆரோக்கிய பிரச்சினைகளுக்கு — தகுதியான மருத்துவரை அணுகுவது அவசியம்.
    </p>

    <h2 className="text-xl font-bold text-maroon-deep mt-6 mb-2">நிதி/சட்ட ஆலோசனை அல்ல</h2>
    <p className="mb-3">
      பணம், சொத்து, வழக்கு போன்ற முக்கிய முடிவுகளுக்கு — பதிவு பெற்ற நிபுணரை மட்டுமே நம்பி செயல்படவும். ஜோதிட பலன்களின் அடிப்படையில் மட்டும் முடிவெடுப்பதை தவிர்க்கவும்.
    </p>

    <h2 className="text-xl font-bold text-maroon-deep mt-6 mb-2">துல்லியம்</h2>
    <p className="mb-3">
      எங்கள் கணிப்புகள் சாஸ்திர ரீதியான கணிதம் கொண்டு உருவாக்கப்பட்டாலும், கொடுக்கப்படும் பிறந்த நேரம், ஊர் தவறானால் — பலன்களும் தவறாக வரும். துல்லியமான பிறப்பு நேரத்தை வழங்குங்கள்.
    </p>

    <h2 className="text-xl font-bold text-maroon-deep mt-6 mb-2">உங்கள் பொறுப்பு</h2>
    <p>
      உங்கள் வாழ்க்கை முடிவுகள் முழுமையாக உங்களுடையதே. UR ASTRO SOFT வழங்கும் தகவல்களின் அடிப்படையில் எடுக்கும் எந்த நடவடிக்கைக்கும் தளம் பொறுப்பேற்காது.
    </p>
  </Shell>
);
