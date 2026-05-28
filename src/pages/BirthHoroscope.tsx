import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Calendar, Clock, MapPin, ArrowRight, MessageCircle } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { BirthHoroscopePublisherContent } from "@/components/AdSenseContentBlocks";

const BirthHoroscope = () => {
  return (
    <>
    <main className="min-h-screen relative">
      <SEO
        title="பிறப்பு ஜாதகம் — Birth Horoscope Generator (Tamil)"
        description="பிறந்த தேதி, நேரம், இடம் கொடுத்து உடனடியாக துல்லியமான தமிழ் பிறப்பு ஜாதகம் generate செய்யுங்கள் — இலவசம்."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Birth Horoscope Generator",
          applicationCategory: "Lifestyle",
          operatingSystem: "Web",
          inLanguage: ["ta", "en"],
        }}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-gradient-gold opacity-[0.05] blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-20">
        <header className="text-center mb-10 animate-fade-up">
          <div className="font-display text-xs tracking-[0.4em] text-gold-deep mb-3">
            ✦ BIRTH HOROSCOPE ✦
          </div>
          <h1 className="font-tamil text-4xl md:text-6xl font-bold text-maroon-deep leading-tight">
            பிறப்பு <span className="text-gold">ஜாதகம்</span>
          </h1>
          <p className="font-tamil text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            உங்கள் பிறந்த தேதி, நேரம், ஊர் கொடுத்து வேத ஜோதிட சூத்திரத்தின்படி பிறப்பு ஜாதகம் கணக்கிடப்படும்.
          </p>
          <div className="temple-divider mt-6 max-w-sm mx-auto" />
        </header>

        <section className="grid md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Calendar, t: "பிறந்த தேதி", s: "Year/Month/Day" },
            { icon: Clock, t: "பிறந்த நேரம்", s: "Hour & Minute" },
            { icon: MapPin, t: "பிறந்த ஊர்", s: "Latitude / Longitude" },
          ].map((f, i) => (
            <div key={i} className="parchment p-5 rounded-xl text-center">
              <f.icon className="w-8 h-8 text-gold mx-auto mb-2" />
              <div className="font-tamil font-bold text-maroon-deep">{f.t}</div>
              <div className="text-xs text-muted-foreground mt-1">{f.s}</div>
            </div>
          ))}
        </section>

        <section className="parchment p-6 md:p-8 rounded-2xl mb-8">
          <h2 className="font-tamil text-2xl md:text-3xl font-bold text-maroon-deep mb-4">
            என்ன கணக்கிடப்படும்?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 font-tamil">
            {[
              ["ராசி (Moon Sign)", "சந்திரன் இருக்கும் ராசி"],
              ["லக்னம் (Ascendant)", "உதயத்தில் கிழக்கில் வரும் ராசி"],
              ["நட்சத்திரம் & பாதம்", "27 நட்சத்திரத்தில் பாதம் வரை"],
              ["கிரக நிலைகள்", "9 கிரகங்களின் ராசி + பாகை"],
              ["ராசி சக்கரம்", "தென் இந்திய 12 பாவ அமைப்பு"],
              ["நவாம்ச சக்கரம்", "9-ம் பாக சூட்சும அமைப்பு"],
              ["விம்சோத்தரி தசை", "120 ஆண்டு தசா-புத்தி"],
              ["AI பலன்", "ஒவ்வொரு பாவத்திற்கும் தமிழ் விளக்கம்"],
            ].map(([t, s], i) => (
              <div key={i} className="border-l-2 border-gold/40 pl-3">
                <div className="font-bold text-maroon">{t}</div>
                <div className="text-sm text-muted-foreground">{s}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-royal text-primary-foreground font-tamil text-lg px-8 py-4 rounded-full shadow-royal border border-gold/40 hover:opacity-95 transition-all"
          >
            இப்போதே ஜாதகம் கணிக்கவும் <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="font-tamil text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4 text-whatsapp" />
            கேள்விகளுக்கு WhatsApp: <a href="https://wa.me/919600543617" className="text-whatsapp-deep font-semibold underline">96005 43617</a>
          </p>
        </div>

        <BirthHoroscopePublisherContent />
      </div>

      <WhatsAppButton message="வணக்கம்! எனக்கு பிறப்பு ஜாதகம் தயாரிக்க உதவ முடியுமா?" />
    </main>
    <SiteFooter />
    </>
  );
};

export default BirthHoroscope;
