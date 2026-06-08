import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Phone, MessageCircle } from "lucide-react";

interface Astrologer {
  id: string; display_name: string; bio: string | null;
  specialties: string[]; languages: string[]; experience_years: number;
  charges_note: string | null; contact_phone: string | null;
  contact_whatsapp: string | null; photo_url: string | null;
}

const AstrologerDetail = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "voice" ? "voice" : "text";
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [a, setA] = useState<Astrologer | null>(null);
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("astrologer_profiles")
        .select("id, display_name, bio, specialties, languages, experience_years, charges_note, contact_phone, contact_whatsapp, photo_url")
        .eq("id", id).eq("status", "approved").maybeSingle();
      setA(data as Astrologer | null);
    })();
  }, [id]);

  const submit = async (mode: "text" | "voice") => {
    if (!user) { nav("/auth"); return; }
    if (question.trim().length < 5) { toast.error("கேள்வியை விரிவாக எழுதவும்"); return; }
    setBusy(true);
    const { data, error } = await supabase.from("consultations").insert({
      user_id: user.id, astrologer_id: id, mode, subject: subject.trim() || null, question: question.trim(),
    }).select("id").single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("கேள்வி அனுப்பப்பட்டது");
    nav(`/my-consultations`);
    if (mode === "voice" && a?.contact_whatsapp) {
      const msg = encodeURIComponent(`Hi ${a.display_name}, I just booked a voice consultation on URASTROTALK. Subject: ${subject}`);
      window.open(`https://wa.me/${a.contact_whatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank");
    }
  };

  if (!a) return <main className="p-8 text-center font-tamil">ஏற்றுகிறது...</main>;

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <SEO title={`${a.display_name} | URASTROTALK ஜோதிடர்`} description={a.bio?.slice(0, 150) || `Consult ${a.display_name}`} />
      <Link to="/astrologers" className="inline-flex items-center text-sm font-tamil text-maroon-deep mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> ஜோதிடர் பட்டியல்
      </Link>

      <div className="parchment rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-royal text-primary-foreground flex items-center justify-center font-bold text-2xl overflow-hidden">
            {a.photo_url ? <img src={a.photo_url} alt={a.display_name} className="w-full h-full object-cover" /> : a.display_name.charAt(0)}
          </div>
          <div>
            <h1 className="font-tamil text-2xl font-bold text-maroon-deep">{a.display_name}</h1>
            <p className="text-sm text-muted-foreground">{a.experience_years}+ years • {a.languages.join(", ")}</p>
          </div>
        </div>
        {a.bio && <p className="font-tamil text-sm mb-3">{a.bio}</p>}
        <div className="flex flex-wrap gap-1 mb-2">
          {a.specialties.map((s) => <Badge key={s} variant="secondary" className="font-tamil">{s}</Badge>)}
        </div>
        {a.charges_note && <p className="text-sm font-tamil text-gold-deep">{a.charges_note}</p>}
      </div>

      <div className="parchment rounded-2xl p-6">
        <h2 className="font-tamil text-xl font-bold text-maroon-deep mb-4">கேள்வி கேளுங்கள்</h2>
        {!user && (
          <p className="font-tamil text-sm text-muted-foreground mb-3">
            கேள்வி அனுப்ப <Link to="/auth" className="text-maroon-deep underline">உள்நுழைய</Link> வேண்டும்.
          </p>
        )}
        <Tabs defaultValue={initialMode}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="text" className="font-tamil"><MessageCircle className="w-4 h-4 mr-1" /> உரை</TabsTrigger>
            <TabsTrigger value="voice" className="font-tamil"><Phone className="w-4 h-4 mr-1" /> குரல்</TabsTrigger>
          </TabsList>
          {(["text", "voice"] as const).map((mode) => (
            <TabsContent key={mode} value={mode} className="space-y-3 mt-4">
              <div className="space-y-2">
                <Label>தலைப்பு</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} placeholder="உ.ம் — திருமணம், தொழில்" />
              </div>
              <div className="space-y-2">
                <Label>உங்கள் கேள்வி</Label>
                <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={5} maxLength={2000} required />
              </div>
              {mode === "voice" && (
                <p className="text-xs font-tamil text-muted-foreground">
                  கேள்வி அனுப்பியதும் ஜோதிடருடன் WhatsApp மூலம் குரல் அழைப்பு தொடங்கலாம்.
                </p>
              )}
              <Button onClick={() => submit(mode)} disabled={busy || !user || loading}
                className="w-full bg-gradient-royal text-primary-foreground font-tamil">
                {busy ? "..." : mode === "voice" ? "Voice Booking அனுப்பு" : "கேள்வி அனுப்பு"}
              </Button>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
};

export default AstrologerDetail;
