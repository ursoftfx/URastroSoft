import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Sparkles, Star, Phone, MessageCircle, ArrowRight } from "lucide-react";

const FreeHoroscope = () => {
  return (
    <main className="min-h-screen relative">
      <SEO
        title="இலவச ஜாதகம் — Free Tamil Jathagam Online"
        description="பிறந்த தேதி, நேரம், ஊர் கொடுத்து இலவசமாக துல்லியமான தமிழ் ஜாதகம் பெறுங்கள். ராசி, நட்சத்திரம், தசை, AI பலன்."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "இலவச ஜாதகம்",
          serviceType: "Tamil Vedic Horoscope",
          areaServed: "IN",
          provider: { "@type": "Organization", name: "Kanagadara Jathagam" },
        }}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-gold opacity-[0.04] blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-20">
        <header className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-royal shadow-royal mb-4">
            <Star className="w-8 h-8 text-gold-bright" />
          </div>
          <h1 className="font-tamil text-4xl md:text-6xl font-bold text-maroon-deep leading-tight">
            இலவச <span className="text-gold">ஜாதகம்</span>
          </h1>
          <p className="font-tamil text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            வேத ஜோதிட பாணியில் துல்லியமான தமிழ் ஜாதகம் — முற்றிலும் இலவசம்.
          </p>
          <div className="temple-divider mt-6 max-w-sm mx-auto" />
        </header>

        <section className="parchment p-6 md:p-8 rounded-2xl mb-8">
          <h2 className="font-tamil text-2xl md:text-3xl font-bold text-maroon-deep mb-4">
            இலவச தமிழ் ஜாதகம் என்ன கொடுக்கும்?
          </h2>
          <ul className="space-y-3 font-tamil text-foreground">
            {[
              "துல்லியமான ராசி, நட்சத்திரம், பாதம், லக்னம்",
              "9 கிரகங்களின் நிராயன கிரக நிலைகள் (Lahiri Ayanamsa)",
              "தென் இந்திய பாணி ராசி + நவாம்ச சக்கரம்",
              "விம்சோத்தரி தசை - புத்தி காலம்",
              "AI மூலம் தமிழில் விரிவான பலன் விளக்கம்",
              "PDF ஆக download செய்து கொள்ளலாம்",
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link to="/" className="parchment p-6 rounded-xl hover:shadow-royal transition-all group">
            <div className="font-tamil font-bold text-maroon-deep text-xl mb-2 group-hover:text-gold">
              ஜாதகம் இப்போதே பார்க்க
            </div>
            <p className="font-tamil text-sm text-muted-foreground mb-3">
              ஓரு நிமிடத்தில் உங்கள் முழு ஜாதகம் தயார்.
            </p>
            <span className="inline-flex items-center gap-2 text-gold-deep font-tamil font-semibold">
              தொடங்க <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
          <a
            href="https://wa.me/919600543617?text=வணக்கம்! எனக்கு இலவச ஜாதக ஆலோசனை வேண்டும்."
            target="_blank"
            rel="noopener noreferrer"
            className="parchment p-6 rounded-xl hover:shadow-royal transition-all group"
          >
            <div className="font-tamil font-bold text-maroon-deep text-xl mb-2 group-hover:text-whatsapp-deep flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-whatsapp" />
              நேரடி ஆலோசனை
            </div>
            <p className="font-tamil text-sm text-muted-foreground mb-3">
              WhatsApp மூலம் ஜோதிடரை தொடர்பு கொள்ளுங்கள்.
            </p>
            <span className="inline-flex items-center gap-2 text-whatsapp-deep font-tamil font-semibold">
              <Phone className="w-4 h-4" /> 96005 43617
            </span>
          </a>
        </div>

        <section className="parchment p-6 md:p-8 rounded-2xl">
          <h2 className="font-tamil text-2xl font-bold text-maroon-deep mb-3">
            அடிக்கடி கேட்கப்படும் கேள்விகள்
          </h2>
          <div className="space-y-4 font-tamil">
            <div>
              <div className="font-bold text-maroon">இது உண்மையாகவே இலவசமா?</div>
              <p className="text-sm text-muted-foreground">ஆம். ஜாதகம் கணிக்க எந்த கட்டணமும் இல்லை.</p>
            </div>
            <div>
              <div className="font-bold text-maroon">பிறந்த நேரம் சரியாக தெரியவில்லையே?</div>
              <p className="text-sm text-muted-foreground">தோராய நேரம் கொடுத்தாலும் ராசி, நட்சத்திரம் கணக்கிட முடியும். லக்னம் மட்டும் சற்று மாறலாம்.</p>
            </div>
            <div>
              <div className="font-bold text-maroon">என் தனிப்பட்ட விவரங்கள் பாதுகாப்பானதா?</div>
              <p className="text-sm text-muted-foreground">ஆம். உங்கள் விவரங்கள் encrypted ஆக சேமிக்கப்படுகிறது, யாருக்கும் வெளியிடப்படாது.</p>
            </div>
          </div>
        </section>
      </div>

      <WhatsAppButton message="வணக்கம்! எனக்கு இலவச ஜாதகம் வேண்டும்." />
    </main>
  );
};

export default FreeHoroscope;
