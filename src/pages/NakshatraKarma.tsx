import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { SEO } from "@/components/SEO";
import { SiteFooter } from "@/components/SiteFooter";
import { NAKSHATRA_KARMA_LIST } from "@/data/nakshatra-karma";

export default function NakshatraKarma() {
  const [selectedNak, setSelectedNak] = useState<number>(0); // 0 = all
  const [selectedPadam, setSelectedPadam] = useState<number>(0); // 0 = all

  const filtered = useMemo(() => {
    let list = NAKSHATRA_KARMA_LIST;
    if (selectedNak > 0) list = list.filter((n) => n.index === selectedNak);
    return list.map((n) => ({
      ...n,
      padams: selectedPadam > 0 ? n.padams.filter((p) => p.padam === selectedPadam) : n.padams,
    }));
  }, [selectedNak, selectedPadam]);

  return (
    <>
      <SEO
        title="108 நட்சத்திர பாத கர்ம விவரங்கள் | Nakshatra Padam Karma"
        description="27 நட்சத்திரங்கள் × 4 பாதங்கள் = 108 நட்சத்திர பாத கர்ம விவரங்கள். ஜாதக நட்சத்திர பாதத்தின் அடிப்படையில் முற்பிறவி கர்மம், நிகழ்கால பலன் மற்றும் பரிகாரங்கள்."
        canonical="https://kanagadara.lovable.app/nakshatra-karma"
        keywords="nakshatra karma, natchathira karma, 108 padam karma, tamil astrology, nadi jothidam, ur astro soft"
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50" />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-sm font-tamil text-maroon-deep mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> முகப்பு
        </Link>

        <header className="parchment rounded-2xl p-6 md:p-8 mb-6 text-center">
          <div className="inline-flex items-center gap-2 text-maroon-deep mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-tamil text-sm tracking-wide">UR ASTRO SOFT</span>
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-maroon-deep font-tamil">
            108 நட்சத்திர பாத கர்ம விவரங்கள்
          </h1>
          <p className="mt-3 font-tamil text-foreground/80 max-w-3xl mx-auto">
            27 நட்சத்திரங்கள் ஒவ்வொன்றும் 4 பாதங்களைக் கொண்டவை. இதனால் மொத்தம்{" "}
            <strong>108 பாதங்கள்</strong> உள்ளன. ஒவ்வொரு பாதமும் தனித்தனி நவாம்ச ராசியில்
            அமைந்து, முற்பிறவி கர்ம வினையையும், நிகழ்கால பலனையும் காட்டுகிறது. உங்கள் ஜாதக
            சந்திர நட்சத்திரம் மற்றும் பாதத்தைத் தேர்ந்தெடுத்து விவரங்களை காணலாம்.
          </p>
        </header>

        {/* Filters */}
        <div className="parchment rounded-2xl p-4 md:p-6 mb-6 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-tamil font-semibold text-maroon-deep mb-1">
              நட்சத்திரம் தேர்வு
            </label>
            <select
              value={selectedNak}
              onChange={(e) => setSelectedNak(Number(e.target.value))}
              className="w-full border border-amber-300 rounded-lg px-3 py-2 font-tamil bg-white"
            >
              <option value={0}>— அனைத்தும் —</option>
              {NAKSHATRA_KARMA_LIST.map((n) => (
                <option key={n.index} value={n.index}>
                  {n.index}. {n.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-tamil font-semibold text-maroon-deep mb-1">
              பாதம் தேர்வு
            </label>
            <select
              value={selectedPadam}
              onChange={(e) => setSelectedPadam(Number(e.target.value))}
              className="w-full border border-amber-300 rounded-lg px-3 py-2 font-tamil bg-white"
            >
              <option value={0}>— அனைத்து பாதங்கள் —</option>
              <option value={1}>1-ம் பாதம்</option>
              <option value={2}>2-ம் பாதம்</option>
              <option value={3}>3-ம் பாதம்</option>
              <option value={4}>4-ம் பாதம்</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {filtered.map((n) => (
            <section
              key={n.index}
              className="parchment rounded-2xl p-5 md:p-7"
              id={`nak-${n.index}`}
            >
              <div className="border-b border-amber-300/60 pb-3 mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-maroon-deep font-tamil">
                  {n.index}. {n.name} <span className="text-base font-normal">— {n.lord}</span>
                </h2>
                <p className="text-sm font-tamil text-foreground/70 mt-1">
                  தேவதை: <strong>{n.deity}</strong> · சின்னம்: <strong>{n.symbol}</strong>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {n.padams.map((p) => (
                  <div
                    key={p.padam}
                    className="border border-amber-300/70 bg-white/60 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-maroon-deep font-tamil">
                        {p.padam}-ம் பாதம்
                      </h3>
                      <span className="text-xs font-tamil bg-amber-100 text-maroon-deep px-2 py-0.5 rounded-full">
                        நவாம்சம்: {p.navamsaRasi}
                      </span>
                    </div>
                    <p className="font-tamil text-sm mb-2">
                      <strong className="text-maroon-deep">முற்பிறவி கர்மம்:</strong> {p.karma}
                    </p>
                    <p className="font-tamil text-sm mb-2">
                      <strong className="text-maroon-deep">நிகழ்கால பலன்:</strong> {p.palan}
                    </p>
                    <p className="font-tamil text-sm">
                      <strong className="text-maroon-deep">பரிகாரம்:</strong> {p.parikaram}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="parchment rounded-2xl p-5 md:p-7 mt-6 font-tamil text-sm text-foreground/80">
          <h3 className="font-bold text-maroon-deep mb-2">குறிப்பு</h3>
          <p>
            மேலே கூறப்பட்ட கர்ம விவரங்கள் பாரம்பரிய நாடி மற்றும் வேத ஜோதிட நூல்களின்
            அடிப்படையில் பொது வழிகாட்டியாக மட்டுமே வழங்கப்படுகின்றன. முழுமையான பலன்
            அறியவும், தனிப்பட்ட பரிகாரங்களுக்கும் அனுபவமிக்க ஜோதிடரை அணுகவும். ஒவ்வொரு
            பாதத்தின் பலனும் ஜாதக முழு அமைப்பைப் பொறுத்து மாறும்.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
