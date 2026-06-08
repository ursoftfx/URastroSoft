import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Star, MessageCircle, Phone } from "lucide-react";

interface Astrologer {
  id: string;
  display_name: string;
  bio: string | null;
  specialties: string[];
  languages: string[];
  experience_years: number;
  charges_note: string | null;
  photo_url: string | null;
}

const Astrologers = () => {
  const [list, setList] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("astrologer_profiles")
        .select("id, display_name, bio, specialties, languages, experience_years, charges_note, photo_url")
        .eq("status", "approved")
        .order("experience_years", { ascending: false });
      setList((data as Astrologer[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      <SEO
        title="URASTROTALK — ஜோதிடர்களிடம் கேள்வி கேளுங்கள்"
        description="அங்கீகரிக்கப்பட்ட தமிழ் ஜோதிடர்களுடன் உரையாடல் மற்றும் குரல் அழைப்பு மூலம் ஜாதக கேள்விகள் கேளுங்கள்."
      />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link to="/" className="inline-flex items-center text-sm font-tamil text-maroon-deep">
          <ArrowLeft className="w-4 h-4 mr-1" /> முகப்பு
        </Link>
        <h1 className="font-tamil text-2xl md:text-3xl font-bold text-maroon-deep">URASTROTALK — ஜோதிடர்கள்</h1>
        <Button asChild variant="outline" size="sm" className="font-tamil">
          <Link to="/astrologer/apply">ஜோதிடராக சேர</Link>
        </Button>
      </div>

      <p className="font-tamil text-center text-muted-foreground mb-6 max-w-2xl mx-auto">
        அங்கீகரிக்கப்பட்ட ஜோதிடர்களைத் தேர்ந்தெடுத்து, உரை அல்லது குரல் அழைப்பு மூலம் கேள்வி கேளுங்கள்.
      </p>

      {loading ? (
        <p className="text-center font-tamil py-10">ஏற்றுகிறது...</p>
      ) : list.length === 0 ? (
        <div className="parchment rounded-2xl p-8 text-center">
          <p className="font-tamil text-muted-foreground">இன்னும் அங்கீகரிக்கப்பட்ட ஜோதிடர்கள் இல்லை. விரைவில் சேர்க்கப்படும்.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((a) => (
            <article key={a.id} className="parchment rounded-2xl p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-full bg-gradient-royal text-primary-foreground flex items-center justify-center font-bold text-lg overflow-hidden">
                  {a.photo_url ? <img src={a.photo_url} alt={a.display_name} className="w-full h-full object-cover" /> : a.display_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-tamil font-bold text-maroon-deep truncate">{a.display_name}</h2>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="w-3 h-3 text-gold-deep" /> {a.experience_years}+ ஆண்டுகள் அனுபவம்
                  </div>
                </div>
              </div>
              {a.bio && <p className="text-sm font-tamil text-foreground/80 line-clamp-3 mb-3">{a.bio}</p>}
              <div className="flex flex-wrap gap-1 mb-3">
                {a.specialties.slice(0, 4).map((s) => (
                  <Badge key={s} variant="secondary" className="font-tamil text-xs">{s}</Badge>
                ))}
              </div>
              {a.charges_note && <p className="text-xs text-gold-deep font-tamil mb-3">{a.charges_note}</p>}
              <div className="mt-auto grid grid-cols-2 gap-2">
                <Button asChild size="sm" className="bg-gradient-royal text-primary-foreground font-tamil">
                  <Link to={`/astrologers/${a.id}?mode=text`}><MessageCircle className="w-4 h-4" /> உரை</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="font-tamil">
                  <Link to={`/astrologers/${a.id}?mode=voice`}><Phone className="w-4 h-4" /> குரல்</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default Astrologers;
