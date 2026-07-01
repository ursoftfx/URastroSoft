import { useState } from "react";
import { BirthForm } from "@/components/BirthForm";
import { JathagamReport } from "@/components/JathagamReport";
import { BirthInput, computeJathagam, JathagamResult } from "@/lib/jathagam";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, FileText, LayoutList, Shield } from "lucide-react";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SEO } from "@/components/SEO";
import { DownloadReport } from "@/components/DownloadReport";
import { OnePageReport } from "@/components/OnePageReport";
import { ProfessionalReport } from "@/components/ProfessionalReport";
import { JenanaKurippu } from "@/components/JenanaKurippu";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { SiteFooter } from "@/components/SiteFooter";
import { AstrologyContentSections } from "@/components/AstrologyContentSections";
import { AnnouncementsBanner } from "@/components/AnnouncementsBanner";
import { GocharaSummary } from "@/components/GocharaSummary";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { isAdmin } = useAuth();
  const [result, setResult] = useState<JathagamResult | null>(null);
  const [interpretation, setInterpretation] = useState("");
  const [interpretationLoading, setInterpretationLoading] = useState(false);

  const streamInterpretation = async (jathagam: JathagamResult) => {
    setInterpretation("");
    setInterpretationLoading(true);

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/jathagam-interpretation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON}`,
        },
        body: JSON.stringify({ jathagam }),
      });
      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          toast.error("அதிக கோரிக்கைகள். சிறிது நேரம் கழித்து முயற்சிக்கவும்.");
        } else if (resp.status === 402) {
          toast.error("கிரெடிட் தீர்ந்துவிட்டது. தயவுசெய்து கணக்கில் சேர்க்கவும்.");
        } else {
          toast.error("பலன் தரவில்லை. மீண்டும் முயற்சிக்கவும்.");
        }
        setInterpretationLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) setInterpretation((prev) => prev + c);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("தொடர்பு கொள்ள முடியவில்லை");
    } finally {
      setInterpretationLoading(false);
    }
  };

  const handleSubmit = async (input: BirthInput) => {
    try {
      const r = computeJathagam(input);
      setResult(r);
      window.scrollTo({ top: 0, behavior: "smooth" });
      streamInterpretation(r);
      // Share with other pages (Bhrigu Nandi Nadi, Gochara) so users don't re-enter data
      try {
        sessionStorage.setItem("lastBirthInput", JSON.stringify(input));
        sessionStorage.setItem("lastJathagamResult", JSON.stringify(r));
      } catch {}

      // Save lead (fire-and-forget; never block the user)
      const pad = (n: number) => String(n).padStart(2, "0");
      supabase
        .from("jathagam_leads")
        .insert({
          name: input.name,
          phone: input.phone || "",
          gender: input.gender ?? null,
          birth_date: `${input.year}-${pad(input.month)}-${pad(input.day)}`,
          birth_time: `${pad(input.hour)}:${pad(input.minute)}:00`,
          place_name: input.placeName,
          latitude: input.latitude,
          longitude: input.longitude,
          tz_offset_hours: input.tzOffsetHours,
          rasi: r.rasiTamil,
          nakshatra: r.nakshatraTamil,
          lagna: r.lagnaTamil,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 255) : null,
        })
        .then(({ error }) => {
          if (error) console.error("lead save failed", error);
        });
    } catch (e) {
      console.error(e);
      toast.error("ஜாதகம் கணக்கிட முடியவில்லை");
    }
  };

  const handleReset = () => {
    setResult(null);
    setInterpretation("");
  };

  return (
    <>
    <main className="min-h-screen relative">
      <SEO
        title="UR ASTRO SOFT — Free Tamil Horoscope Generator & Astrologer Chat"
        description="Generate free Tamil horoscope (jathagam) online instantly — rasi, nakshatra, lagna, navamsa, dasha, panchangam. Free astrologer chat & predictions. தமிழ் ஜோதிடம்."
        keywords="free horoscope, tamil horoscope, free jathagam, horoscope generator, free astrology chat, astrologer chat free, tamil astrology, online jathagam, rasi palan, nakshatra, lagna, navamsa, dasha bhukti, panchangam, thirumana porutham, bhrigu nandi nadi, gochara palan, free kundli tamil, urastrosoft, UR ASTRO SOFT, இலவச ஜாதகம், தமிழ் ஜோதிடம், ஜாதக பலன், ஜோசியர் chat"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "UR ASTRO SOFT — Free Tamil Horoscope Generator",
            alternateName: ["UR ASTRO SOFTS", "urastrosoft", "Tamil Astrology Software", "Free Jathagam Generator"],
            applicationCategory: "LifestyleApplication",
            applicationSubCategory: "Astrology Software",
            operatingSystem: "Web, Android, iOS, Windows",
            inLanguage: ["ta", "en"],
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
            featureList: [
              "Free Tamil horoscope generation",
              "Rasi, Nakshatra, Lagna, Navamsa charts",
              "Vimshottari Dasha & Bhukti",
              "Panchangam (Tithi, Yoga, Karana, Nakshatra)",
              "Bhrigu Nandi Nadi predictions",
              "Thirumana Porutham (marriage matching)",
              "Free astrologer chat & consultation",
              "A4 / A5 printable PDF reports",
            ],
            sameAs: ["https://urastrosoft.netlify.app/", "https://kanagadara.lovable.app/"],
            url: typeof window !== "undefined" ? window.location.origin : "",
          },
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Free Tamil Horoscope Generation",
            serviceType: "Vedic Astrology / Jathagam",
            areaServed: ["IN", "Worldwide"],
            audience: { "@type": "Audience", audienceType: "Tamil speakers, astrology seekers" },
            provider: { "@type": "Organization", name: "UR ASTRO SOFT", url: "https://kanagadara.lovable.app/" },
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR", availability: "https://schema.org/InStock" },
            description: "Generate an accurate Tamil horoscope (jathagam) free online using birth date, time and place — rasi, nakshatra, lagna, navamsa, dasha-bhukti and AI predictions.",
          },
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Free Astrologer Chat & Consultation (URASTROTALK)",
            serviceType: "Astrology Consultation",
            areaServed: ["IN", "Worldwide"],
            provider: { "@type": "Organization", name: "UR ASTRO SOFT", url: "https://kanagadara.lovable.app/astrologers" },
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR", availability: "https://schema.org/InStock" },
            description: "Chat free with verified Tamil astrologers — ask horoscope questions, marriage match, career, dasha, dosham remedies via text or WhatsApp voice call.",
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "Is the Tamil horoscope generator really free?", acceptedAnswer: { "@type": "Answer", text: "Yes. UR ASTRO SOFT generates complete Tamil horoscope reports — rasi, nakshatra, lagna, navamsa, dasha, panchangam — 100% free." } },
              { "@type": "Question", name: "Can I chat with an astrologer for free?", acceptedAnswer: { "@type": "Answer", text: "Yes. Register with your phone number, browse approved astrologers in URASTROTALK and send your question free; astrologers reply via chat or WhatsApp voice call." } },
              { "@type": "Question", name: "What details are needed to generate a horoscope?", acceptedAnswer: { "@type": "Answer", text: "Date of birth, exact time of birth and place of birth (city) are required. Approximate time still gives accurate rasi and nakshatra." } },
              { "@type": "Question", name: "Can I download the horoscope as PDF?", acceptedAnswer: { "@type": "Answer", text: "Yes. Reports can be downloaded as A4 or A5 (portrait/landscape) PDFs and printed." } },
              { "@type": "Question", name: "Does it support Bhrigu Nandi Nadi predictions?", acceptedAnswer: { "@type": "Answer", text: "Yes — the BNN page shows step-by-step rules, neecham/ucham tables and a plus-shape planet layout for prediction." } },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "UR ASTRO SOFT",
            url: "https://kanagadara.lovable.app/",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://kanagadara.lovable.app/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
        ]}
      />
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-gold opacity-[0.04] blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-maroon opacity-[0.05] blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-10 md:py-16">
        {/* Header */}
        {!result && (
          <header className="text-center mb-12 animate-fade-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-royal shadow-royal mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-gold opacity-30 animate-shimmer" />
              <span className="relative font-tamil text-4xl text-gold-bright">ॐ</span>
            </div>
            <div className="font-display text-xs tracking-[0.5em] text-gold-deep mb-3">
              ✦ TAMIL VEDIC ASTROLOGY ✦
            </div>
            <h1 className="font-tamil text-4xl sm:text-5xl md:text-7xl font-bold text-maroon-deep leading-tight">
              UR<span className="text-gold"> AstroSofts</span>
            </h1>
            <p className="font-tamil text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              உங்கள் பிறப்பு விவரங்களின் அடிப்படையில் வேத ஜோதிட பாணியில் முழுமையான ஜாதக பலன் பெறுங்கள்
            </p>
            <nav aria-label="Quick links" className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-6 text-sm font-tamil">
              <Link to="/free-horoscope" className="text-maroon-deep hover:text-gold underline-offset-4 hover:underline">இலவச ஜாதகம்</Link>
              <span className="text-gold-deep">•</span>
              <Link to="/birth-horoscope" className="text-maroon-deep hover:text-gold underline-offset-4 hover:underline">பிறப்பு ஜாதகம்</Link>
              <span className="text-gold-deep">•</span>
              <Link to="/astrology-consultation" className="text-maroon-deep hover:text-gold underline-offset-4 hover:underline">இலவச ஆலோசனை</Link>
              <span className="text-gold-deep">•</span>
              <Link to="/porutham" className="text-maroon-deep hover:text-gold underline-offset-4 hover:underline">திருமண பொருத்தம்</Link>
              <span className="text-gold-deep">•</span>
              <Link to="/gochara" className="text-maroon-deep hover:text-gold underline-offset-4 hover:underline">தினசரி கோசாரம்</Link>
              <span className="text-gold-deep">•</span>
              <Link to="/bhrigu-nandi-nadi" className="text-maroon-deep hover:text-gold underline-offset-4 hover:underline">பிருகு நந்தி நாடி</Link>
              <span className="text-gold-deep">•</span>
              <Link to="/nakshatra-karma" className="text-maroon-deep hover:text-gold underline-offset-4 hover:underline">108 நட்சத்திர கர்மம்</Link>
              <span className="text-gold-deep">•</span>
              <Link to="/astrologers" className="text-maroon-deep hover:text-gold underline-offset-4 hover:underline font-bold">URASTROTALK</Link>
              <span className="text-gold-deep">•</span>
              <Link to="/my-consultations" className="text-maroon-deep hover:text-gold underline-offset-4 hover:underline">என் கேள்விகள்</Link>
              <span className="text-gold-deep">•</span>
              <Link to="/articles" className="text-maroon-deep hover:text-gold underline-offset-4 hover:underline">கட்டுரைகள்</Link>
              {isAdmin && (
                <>
                  <span className="text-gold-deep">•</span>
                  <Link to="/admin" className="inline-flex items-center gap-1 text-maroon-deep hover:text-gold underline-offset-4 hover:underline">
                    <Shield className="w-3 h-3" /> நிர்வாகம்
                  </Link>
                </>
              )}
            </nav>
            <div className="temple-divider mt-8 max-w-md mx-auto" />
          </header>
        )}

        {!result && (
          <div className="max-w-5xl mx-auto space-y-4 mb-6">
            <AnnouncementsBanner />
            <GocharaSummary />
          </div>
        )}

        {!result ? (
          <div className="max-w-xl mx-auto">
            <BirthForm onSubmit={handleSubmit} />
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { t: "ராசி & நட்சத்திரம்", s: "துல்லியமான கணிப்பு" },
                { t: "தசா புத்தி", s: "விம்சோத்தரி தசை" },
                { t: "AI பலன்", s: "தமிழில் விரிவான பலன்" },
              ].map((f, i) => (
                <div key={i} className="parchment p-4 rounded-xl">
                  <div className="font-tamil font-bold text-maroon-deep text-sm">{f.t}</div>
                  <div className="font-tamil text-xs text-muted-foreground mt-1">{f.s}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ResultView
            result={result}
            interpretation={interpretation}
            interpretationLoading={interpretationLoading}
            onReset={handleReset}
          />
        )}
      </div>
      <WhatsAppButton message="வணக்கம்! எனக்கு ஜாதக ஆலோசனை வேண்டும்." />
      <AstrologyContentSections />
    </main>
    <SiteFooter />
    </>
  );
};

const ResultView = ({
  result,
  interpretation,
  interpretationLoading,
  onReset,
}: {
  result: JathagamResult;
  interpretation: string;
  interpretationLoading: boolean;
  onReset: () => void;
}) => {
  const [view, setView] = useState<"detailed" | "onepage" | "pro" | "kurippu">("pro");
  const [proOrient, setProOrient] = useState<"p" | "l">("p");
  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <Button variant="ghost" onClick={onReset} className="font-tamil text-maroon-deep hover:bg-cream">
          <ArrowLeft className="w-4 h-4 mr-2" /> புதிய ஜாதகம்
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-md border border-gold/40 bg-cream/50 p-1">
            <button
              onClick={() => setView("pro")}
              className={`px-3 py-1.5 text-xs font-tamil rounded ${view === "pro" ? "bg-gradient-royal text-primary-foreground" : "text-maroon-deep"}`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1" /> Professional PDF
            </button>
            <button
              onClick={() => setView("onepage")}
              className={`px-3 py-1.5 text-xs font-tamil rounded ${view === "onepage" ? "bg-gradient-royal text-primary-foreground" : "text-maroon-deep"}`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1" /> ஒரு பக்கம் (A4)
            </button>
            <button
              onClick={() => setView("kurippu")}
              className={`px-3 py-1.5 text-xs font-tamil rounded ${view === "kurippu" ? "bg-gradient-royal text-primary-foreground" : "text-maroon-deep"}`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1" /> ஜெனன குறிப்பு
            </button>
            <button
              onClick={() => setView("detailed")}
              className={`px-3 py-1.5 text-xs font-tamil rounded ${view === "detailed" ? "bg-gradient-royal text-primary-foreground" : "text-maroon-deep"}`}
            >
              <LayoutList className="w-3.5 h-3.5 inline mr-1" /> முழு அறிக்கை
            </button>
          </div>
          {view === "pro" && (
            <div className="inline-flex rounded-md border border-gold/40 bg-cream/50 p-1">
              <button
                onClick={() => setProOrient("p")}
                className={`px-2 py-1 text-xs font-tamil rounded ${proOrient === "p" ? "bg-gradient-royal text-primary-foreground" : "text-maroon-deep"}`}
              >A5 செங்குத்து</button>
              <button
                onClick={() => setProOrient("l")}
                className={`px-2 py-1 text-xs font-tamil rounded ${proOrient === "l" ? "bg-gradient-royal text-primary-foreground" : "text-maroon-deep"}`}
              >A5 கிடைமட்டம்</button>
            </div>
          )}
          <Button onClick={handlePrint} className="bg-gradient-royal text-primary-foreground font-tamil" size="sm">
            <Printer className="w-4 h-4 mr-1" /> அச்சிடு
          </Button>
          <DownloadReport
            targetId={view === "pro" ? "professional-report-root" : view === "onepage" ? "onepage-report-root" : view === "kurippu" ? "kurippu-report-root" : "jathagam-report-root"}
            fileName={`jathagam-${result.input.name.replace(/\s+/g, "-")}.pdf`}
            paperSize={view === "pro" ? "a5" : "a4"}
            orientation={view === "pro" ? proOrient : "p"}
          />
        </div>
      </div>

      {view === "pro" ? (
        <div className="overflow-x-auto">
          <ProfessionalReport result={result} orientation={proOrient} />
        </div>
      ) : view === "onepage" ? (
        <div id="onepage-report-root" className="overflow-x-auto">
          <OnePageReport result={result} />
        </div>
      ) : view === "kurippu" ? (
        <div id="kurippu-report-root" className="overflow-x-auto">
          <JenanaKurippu result={result} />
        </div>
      ) : (
        <div id="jathagam-report-root">
          <JathagamReport result={result} interpretation={interpretation} interpretationLoading={interpretationLoading} />
        </div>
      )}
    </div>
  );
};

export default Index;
