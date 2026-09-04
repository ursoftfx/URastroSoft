import { useState } from "react";
import { BirthForm } from "@/components/BirthForm";
import { JathagamReport } from "@/components/JathagamReport";
import { BirthInput, computeJathagam, JathagamResult } from "@/lib/jathagam";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, FileText, LayoutList, Shield, ScrollText, Baby, BookOpen, Heart, Sun, Sparkles, Flame, Phone, MessageCircle, Star, CalendarDays } from "lucide-react";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SEO } from "@/components/SEO";
import { DownloadReport } from "@/components/DownloadReport";
import { OnePageReport } from "@/components/OnePageReport";
import { ProfessionalReport } from "@/components/ProfessionalReport";
import { JenanaKurippu } from "@/components/JenanaKurippu";
import { BabyNamesPage } from "@/components/BabyNamesPage";
import { TharaPalanPage } from "@/components/TharaPalanPage";
import { DhanishtaPanchamiPage } from "@/components/DhanishtaPanchamiPage";
import { RuthuJathagamPage } from "@/components/RuthuJathagamPage";
import { supabase } from "@/integrations/supabase/client";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { SiteFooter } from "@/components/SiteFooter";
import { AstrologyContentSections } from "@/components/AstrologyContentSections";
import { AnnouncementsBanner } from "@/components/AnnouncementsBanner";
import { GocharaSummary } from "@/components/GocharaSummary";
import { TodayPanchangam } from "@/components/TodayPanchangam";
import { useAuth } from "@/hooks/useAuth";

const REPORT_TABS = [
  { key: "pro", label: "Professional PDF" },
  { key: "onepage", label: "ஒரு பக்கம் (A4)" },
  { key: "kurippu", label: "ஜெனன குறிப்பு" },
  { key: "babynames", label: "குழந்தை பெயர்கள்" },
  { key: "thara", label: "தாரா அட்டவணை" },
  { key: "dhanishta", label: "தனிஷ்ட பஞ்சமி" },
  { key: "ruthu", label: "ருது ஜாதகம் & பரிகாரம்" },
  { key: "detailed", label: "முழு அறிக்கை" },
] as const;

type ReportView = (typeof REPORT_TABS)[number]["key"];

const TAB_ICONS = [FileText, LayoutList, ScrollText, Baby, Star, Sparkles, Flame, BookOpen];

const Index = () => {
  const { isAdmin } = useAuth();
  const isForm = useLocation().pathname === "/jathagam";
  const navigate = useNavigate();
  const searchParams = useSearchParams()[0];
  const [result, setResult] = useState<JathagamResult | null>(null);
  const [selectedTab, setSelectedTab] = useState<ReportView>("pro");

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
        title="AMMAN SOFTWARES — Free Tamil Horoscope Generator & Astrologer Chat"
        description="Generate free Tamil horoscope (jathagam) online instantly — rasi, nakshatra, lagna, navamsa, dasha, panchangam. Free astrologer chat & predictions. தமிழ் ஜோதிடம்."
        keywords="free horoscope, tamil horoscope, free jathagam, horoscope generator, free astrology chat, astrologer chat free, tamil astrology, online jathagam, rasi palan, nakshatra, lagna, navamsa, dasha bhukti, panchangam, thirumana porutham, bhrigu nandi nadi, gochara palan, free kundli tamil, ammansoftwares, AMMAN SOFTWARES, இலவச ஜாதகம், தமிழ் ஜோதிடம், ஜாதக பலன், ஜோசியர் chat"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "AMMAN SOFTWARES — Free Tamil Horoscope Generator",
            alternateName: ["AMMAN SOFTWARES", "ammansoftwares", "Tamil Astrology Software", "Free Jathagam Generator"],
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
            sameAs: ["https://astroup.netlify.app/", "https://kanagadara.lovable.app/"],
            url: typeof window !== "undefined" ? window.location.origin : "",
          },
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Free Tamil Horoscope Generation",
            serviceType: "Vedic Astrology / Jathagam",
            areaServed: ["IN", "Worldwide"],
            audience: { "@type": "Audience", audienceType: "Tamil speakers, astrology seekers" },
            provider: { "@type": "Organization", name: "AMMAN SOFTWARES", url: "https://kanagadara.lovable.app/" },
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR", availability: "https://schema.org/InStock" },
            description: "Generate an accurate Tamil horoscope (jathagam) free online using birth date, time and place — rasi, nakshatra, lagna, navamsa, dasha-bhukti and AI predictions.",
          },
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Free Astrologer Chat & Consultation (AMMAN SOFTWARES TALK)",
            serviceType: "Astrology Consultation",
            areaServed: ["IN", "Worldwide"],
            provider: { "@type": "Organization", name: "AMMAN SOFTWARES", url: "https://kanagadara.lovable.app/astrologers" },
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR", availability: "https://schema.org/InStock" },
            description: "Chat free with verified Tamil astrologers — ask horoscope questions, marriage match, career, dasha, dosham remedies via text or WhatsApp voice call.",
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "Is the Tamil horoscope generator really free?", acceptedAnswer: { "@type": "Answer", text: "Yes. AMMAN SOFTWARES generates complete Tamil horoscope reports — rasi, nakshatra, lagna, navamsa, dasha, panchangam — 100% free." } },
              { "@type": "Question", name: "Can I chat with an astrologer for free?", acceptedAnswer: { "@type": "Answer", text: "Yes. Register with your phone number, browse approved astrologers in AMMAN SOFTWARES TALK and send your question free; astrologers reply via chat or WhatsApp voice call." } },
              { "@type": "Question", name: "What details are needed to generate a horoscope?", acceptedAnswer: { "@type": "Answer", text: "Date of birth, exact time of birth and place of birth (city) are required. Approximate time still gives accurate rasi and nakshatra." } },
              { "@type": "Question", name: "Can I download the horoscope as PDF?", acceptedAnswer: { "@type": "Answer", text: "Yes. Reports can be downloaded as A4 or A5 (portrait/landscape) PDFs and printed." } },
              { "@type": "Question", name: "Does it support Bhrigu Nandi Nadi predictions?", acceptedAnswer: { "@type": "Answer", text: "Yes — the BNN page shows step-by-step rules, neecham/ucham tables and a plus-shape planet layout for prediction." } },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "AMMAN SOFTWARES",
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
              AMMAN<span className="text-gold"> SOFTWARES</span>
            </h1>
            <p className="font-tamil text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              உங்கள் பிறப்பு விவரங்களின் அடிப்படையில் வேத ஜோதிட பாணியில் முழுமையான ஜாதக பலன் பெறுங்கள்
            </p>
            {!isForm && (<nav aria-label="Main menu" className="mt-8 max-w-3xl mx-auto">
              <div className="parchment rounded-xl border-2 border-gold-deep/50 p-3 md:p-5">
                <div className="font-tamil text-2xl md:text-3xl font-bold text-maroon-deep text-center mb-4 tracking-wide">
                  திருக்கணிதம்
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {[
                    { to: "/jathagam", label: "ஜாதகம் பதிவு", icon: FileText },
                    { to: "/jathagam", label: "ஜாதகம் கணிப்பு", icon: LayoutList },
                    { to: "/porutham", label: "திருமண பொருத்தம்", icon: Heart },
                    { to: "/gochara", label: "தினசரி கோசாரம்", icon: Sun },
                    { to: "/panchangam", label: "தினசரி பஞ்சாங்கம்", icon: CalendarDays },
                    { to: "/bhrigu-nandi-nadi", label: "பிருகு நந்தி நாடி", icon: ScrollText },
                    { to: "/nakshatra-karma", label: "108 நட்சத்திர கர்மம்", icon: Sparkles },
                    { to: "/panchanga-deities", label: "பஞ்சாங்க அதிதேவதைகள்", icon: Flame },
                    { to: "/astrologers", label: "AMMAN SOFTWARES TALK", icon: Phone },
                    { to: "/my-consultations", label: "என் கேள்விகள்", icon: MessageCircle },
                    { to: "/jathagam?tab=thara", label: "தாரா அட்டவணை", icon: Star },
                    { to: "/jathagam?tab=dhanishta", label: "தனிஷ்ட பஞ்சமி", icon: Sparkles },
                    { to: "/jathagam?tab=ruthu", label: "ருது ஜாதகம் & பரிகாரம்", icon: Flame },
                    { to: "/articles", label: "உதவி — கட்டுரைகள்", icon: BookOpen },
                    { to: "/about", label: "சுபம்", icon: Star },
                  ].map((m, i) => (
                    <li key={m.label}>
                      <Link to={m.to} className={`pill-btn pill-g${(i % 5) + 1}`}>
                        <span className="pill-icon">
                          <m.icon className="h-5 w-5" />
                        </span>
                        <span className="pill-label font-tamil text-base md:text-lg">
                          <span className="mr-2">✓</span>{m.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                  {isAdmin && (
                    <li>
                      <Link to="/admin" className="pill-btn pill-g1">
                        <span className="pill-icon"><Shield className="h-5 w-5" /></span>
                        <span className="pill-label font-tamil text-base md:text-lg">நிர்வாகம்</span>
                      </Link>
                    </li>
                  )}
                </ul>
                <div className="font-tamil text-center text-sm text-gold-deep mt-4">
                  வாழ்க வளமுடன் — AMMAN SOFTWARES
                </div>
              </div>
            </nav>)}

            <div className="temple-divider mt-8 max-w-md mx-auto" />
          </header>
        )}

        {!result && (
          <div className="max-w-5xl mx-auto space-y-4 mb-6">
            <AnnouncementsBanner />
            {/* Quick access to report tabs — selectable list */}
            <div className="parchment rounded-xl border-2 border-gold-deep/50 p-4 no-print">
              <div className="font-tamil text-lg font-bold text-maroon-deep text-center mb-3">அறிக்கைகள் — தேர்வு பட்டியல்</div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {REPORT_TABS.map((t, i) => {
                  const active = selectedTab === t.key;
                  const Icon = TAB_ICONS[i % TAB_ICONS.length];
                  return (
                    <li key={t.key}>
                      <button
                        onClick={() => {
                          setSelectedTab(t.key);
                          navigate(`/jathagam?tab=${t.key}`);
                        }}
                        aria-pressed={active}
                        className={`pill-btn pill-g${(i % 5) + 1}`}
                      >
                        <span className="pill-icon">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="pill-label font-tamil text-base md:text-lg">
                          {t.label}
                          {active && <span className="ml-2">✓</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="font-tamil text-xs text-muted-foreground text-center mt-2">
                ஒரு அறிக்கையைத் தேர்ந்தெடுத்து, பிறப்பு விவரம் உள்ளிடவும் — தேர்ந்த அறிக்கை நேரடியாகத் திறக்கும்
              </div>
            </div>
            <TodayPanchangam />
            <GocharaSummary />
          </div>
        )}

        {!result ? (
          isForm ? (
          <div className="max-w-xl mx-auto">
            <div className="mb-4 no-print">
              <Link to="/" className="font-tamil text-sm text-maroon-deep hover:text-gold">← முதன்மை பட்டி</Link>
            </div>
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
          ) : null
        ) : (

          <ResultView
            result={result}
            initialView={searchParams.get("tab") as ReportView | null}
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
  initialView,
  interpretation,
  interpretationLoading,
  onReset,
}: {
  result: JathagamResult;
  initialView?: ReportView | null;
  interpretation: string;
  interpretationLoading: boolean;
  onReset: () => void;
}) => {
  const [view, setView] = useState<ReportView>(initialView ?? "pro");
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
              onClick={() => setView("babynames")}
              className={`px-3 py-1.5 text-xs font-tamil rounded ${view === "babynames" ? "bg-gradient-royal text-primary-foreground" : "text-maroon-deep"}`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1" /> குழந்தை பெயர்கள்
            </button>
            <button
              onClick={() => setView("thara")}
              className={`px-3 py-1.5 text-xs font-tamil rounded ${view === "thara" ? "bg-gradient-royal text-primary-foreground" : "text-maroon-deep"}`}
            >
              <Star className="w-3.5 h-3.5 inline mr-1" /> தாரா அட்டவணை
            </button>
            <button
              onClick={() => setView("dhanishta")}
              className={`px-3 py-1.5 text-xs font-tamil rounded ${view === "dhanishta" ? "bg-gradient-royal text-primary-foreground" : "text-maroon-deep"}`}
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1" /> தனிஷ்ட பஞ்சமி
            </button>
            <button
              onClick={() => setView("ruthu")}
              className={`px-3 py-1.5 text-xs font-tamil rounded ${view === "ruthu" ? "bg-gradient-royal text-primary-foreground" : "text-maroon-deep"}`}
            >
              <Flame className="w-3.5 h-3.5 inline mr-1" /> ருது ஜாதகம்
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
            targetId={view === "pro" ? "professional-report-root" : view === "onepage" ? "onepage-report-root" : view === "kurippu" ? "kurippu-report-root" : view === "babynames" ? "babynames-report-root" : view === "thara" ? "thara-report-root" : view === "dhanishta" ? "dhanishta-report-root" : view === "ruthu" ? "ruthu-report-root" : "jathagam-report-root"}
            fileName={`jathagam-${result.input.name.replace(/\s+/g, "-")}.pdf`}
            paperSize={view === "pro" ? "a5" : "a4"}
            orientation={view === "pro" ? proOrient : "p"}
            priceInRupees={view === "pro" ? 99 : view === "onepage" ? 9 : undefined}
            productLabel={view === "pro" ? "Professional Report" : view === "onepage" ? "One Page Report" : "Report"}
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
      ) : view === "babynames" ? (
        <div id="babynames-report-root" className="overflow-x-auto">
          <BabyNamesPage result={result} />
        </div>
      ) : view === "thara" ? (
        <div id="thara-report-root" className="overflow-x-auto">
          <TharaPalanPage result={result} />
        </div>
      ) : view === "dhanishta" ? (
        <div id="dhanishta-report-root" className="overflow-x-auto">
          <DhanishtaPanchamiPage result={result} />
        </div>
      ) : view === "ruthu" ? (
        <div id="ruthu-report-root" className="overflow-x-auto">
          <RuthuJathagamPage result={result} />
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
