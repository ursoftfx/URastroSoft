import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Phone, MessageCircle, Clock, ShieldCheck, Heart, Briefcase, Users, ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { ConsultationPublisherContent } from "@/components/AdSenseContentBlocks";

const PHONE_DISPLAY = "+91 96005 43617";
const PHONE_RAW = "919600543617";

const AstrologyConsultation = () => {
  return (
    <>
    <main className="min-h-screen relative">
      <SEO
        title="இலவச ஜோதிட ஆலோசனை — Free Astrology Consultation Tamil"
        description="அனுபவம் மிக்க ஜோதிடரிடம் இலவச ஆலோசனை. திருமணம், தொழில், ஆரோக்கியம், கல்வி — WhatsApp / Call: +91 96005 43617."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "Tamil Astrology Consultation",
          telephone: "+91-9600543617",
          priceRange: "Free",
          areaServed: ["IN", "Worldwide"],
          openingHours: "Mo-Su 09:00-21:00",
        }}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-maroon opacity-[0.05] blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-gold opacity-[0.05] blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-20">
        <header className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-royal shadow-royal mb-4">
            <Phone className="w-8 h-8 text-gold-bright" />
          </div>
          <h1 className="font-tamil text-4xl md:text-6xl font-bold text-maroon-deep leading-tight">
            இலவச <span className="text-gold">ஜோதிட ஆலோசனை</span>
          </h1>
          <p className="font-tamil text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            அனுபவம் மிக்க ஜோதிடரிடம் நேரடியாக பேசி உங்கள் கேள்விகளுக்கு பதில் பெறுங்கள்.
          </p>
          <div className="temple-divider mt-6 max-w-sm mx-auto" />
        </header>

        {/* Primary CTAs */}
        <section className="grid md:grid-cols-2 gap-4 mb-10">
          <a
            href={`https://wa.me/${PHONE_RAW}?text=${encodeURIComponent("வணக்கம்! எனக்கு ஜோதிட ஆலோசனை வேண்டும்.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="parchment p-6 rounded-2xl border-2 border-whatsapp/30 hover:border-whatsapp transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-whatsapp/20 flex items-center justify-center group-hover:bg-whatsapp/30">
                <MessageCircle className="w-6 h-6 text-whatsapp-deep fill-whatsapp" />
              </div>
              <div>
                <div className="font-tamil font-bold text-maroon-deep text-xl">WhatsApp</div>
                <div className="text-xs text-muted-foreground">உடனடி பதில்</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-whatsapp-deep">{PHONE_DISPLAY}</div>
            <p className="font-tamil text-sm text-muted-foreground mt-2">Message அனுப்பி ஆலோசனை தொடங்குங்கள்.</p>
          </a>

          <a
            href={`tel:+${PHONE_RAW}`}
            className="parchment p-6 rounded-2xl border-2 border-gold/30 hover:border-gold transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center group-hover:bg-gold/30">
                <Phone className="w-6 h-6 text-gold-deep" />
              </div>
              <div>
                <div className="font-tamil font-bold text-maroon-deep text-xl">தொலைபேசி அழைப்பு</div>
                <div className="text-xs text-muted-foreground">9 AM - 9 PM</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-maroon-deep">{PHONE_DISPLAY}</div>
            <p className="font-tamil text-sm text-muted-foreground mt-2">இப்போதே அழைத்து பேசலாம்.</p>
          </a>
        </section>

        {/* Topics */}
        <section className="parchment p-6 md:p-8 rounded-2xl mb-8">
          <h2 className="font-tamil text-2xl md:text-3xl font-bold text-maroon-deep mb-5">
            எந்த விஷயங்களுக்கு ஆலோசனை?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 font-tamil">
            {[
              { icon: Heart, t: "திருமணம் & பொருத்தம்", s: "ஜாதக பொருத்தம், திருமண காலம்" },
              { icon: Briefcase, t: "தொழில் & வேலை", s: "தொழில் தேர்வு, வளர்ச்சி காலம்" },
              { icon: ShieldCheck, t: "ஆரோக்கியம்", s: "உடல்நலம், எதிர்காலம்" },
              { icon: Users, t: "குடும்பம் & குழந்தைகள்", s: "குழந்தை யோகம், குடும்ப ஒற்றுமை" },
            ].map((it, i) => (
              <div key={i} className="flex items-start gap-3 border-l-2 border-gold/40 pl-3">
                <it.icon className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                <div>
                  <div className="font-bold text-maroon">{it.t}</div>
                  <div className="text-sm text-muted-foreground">{it.s}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="parchment p-6 rounded-2xl mb-8 flex items-center gap-4">
          <Clock className="w-8 h-8 text-gold flex-shrink-0" />
          <div className="font-tamil">
            <div className="font-bold text-maroon-deep">கிடைக்கும் நேரம்</div>
            <div className="text-sm text-muted-foreground">திங்கள் — ஞாயிறு, காலை 9 மணி முதல் இரவு 9 மணி வரை</div>
          </div>
        </section>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-tamil text-maroon-deep hover:text-gold underline-offset-4 hover:underline"
          >
            முதலில் இலவச ஜாதகம் கணிக்க <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ConsultationPublisherContent />
      </div>

      <WhatsAppButton message="வணக்கம்! எனக்கு ஜோதிட ஆலோசனை வேண்டும்." />
    </main>
    <SiteFooter />
    </>
  );
};

export default AstrologyConsultation;
