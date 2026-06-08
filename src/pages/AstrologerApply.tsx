import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { ArrowLeft } from "lucide-react";

const AstrologerApply = () => {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [existing, setExisting] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [languages, setLanguages] = useState("தமிழ், English");
  const [exp, setExp] = useState(1);
  const [charges, setCharges] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) { nav("/auth"); return; }
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("astrologer_profiles")
        .select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        setExisting(data);
        setDisplayName(data.display_name); setBio(data.bio || "");
        setSpecialties((data.specialties || []).join(", "));
        setLanguages((data.languages || []).join(", "));
        setExp(data.experience_years); setCharges(data.charges_note || "");
        setWhatsapp(data.contact_whatsapp || ""); setPhone(data.contact_phone || "");
        setPhoto(data.photo_url || "");
      }
    })();
  }, [user, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (displayName.trim().length < 2) { toast.error("பெயர் தேவை"); return; }
    setBusy(true);
    const payload = {
      user_id: user.id,
      display_name: displayName.trim(),
      bio: bio.trim() || null,
      specialties: specialties.split(",").map((s) => s.trim()).filter(Boolean),
      languages: languages.split(",").map((s) => s.trim()).filter(Boolean),
      experience_years: exp,
      charges_note: charges.trim() || null,
      contact_phone: phone.trim() || null,
      contact_whatsapp: whatsapp.trim() || null,
      photo_url: photo.trim() || null,
      status: (existing?.status === "approved" ? "approved" : "pending") as "approved" | "pending",
    };
    const { error } = existing
      ? await supabase.from("astrologer_profiles").update(payload).eq("id", existing.id)
      : await supabase.from("astrologer_profiles").insert(payload);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(existing ? "புதுப்பிக்கப்பட்டது" : "விண்ணப்பம் அனுப்பப்பட்டது — admin அனுமதிக்கான காத்திருப்பு");
    nav("/astrologer/dashboard");
  };

  return (
    <main className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <SEO title="ஜோதிடராக சேர | URASTROTALK" description="URASTROTALK இல் ஜோதிடராக பதிவு செய்யுங்கள்" noIndex />
      <Link to="/astrologers" className="inline-flex items-center text-sm font-tamil text-maroon-deep mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> பின் செல்
      </Link>
      <div className="parchment rounded-2xl p-6">
        <h1 className="font-tamil text-2xl font-bold text-maroon-deep mb-2">ஜோதிடர் பதிவு</h1>
        {existing && (
          <p className="mb-4 text-sm font-tamil">
            நிலை: <Badge variant={existing.status === "approved" ? "default" : "secondary"} className="font-tamil">
              {existing.status === "approved" ? "அங்கீகரிக்கப்பட்டது" : existing.status === "rejected" ? "நிராகரிக்கப்பட்டது" : "காத்திருப்பு"}
            </Badge>
          </p>
        )}
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label>பெயர் (Display name)</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={80} /></div>
          <div className="space-y-2"><Label>சுருக்கம் / Bio</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={1000} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>அனுபவம் (ஆண்டுகள்)</Label>
              <Input type="number" min={0} max={80} value={exp} onChange={(e) => setExp(parseInt(e.target.value) || 0)} /></div>
            <div className="space-y-2"><Label>கட்டணம் குறிப்பு</Label>
              <Input value={charges} onChange={(e) => setCharges(e.target.value)} placeholder="₹500/session" /></div>
          </div>
          <div className="space-y-2"><Label>நிபுணத்துவம் (கமா பிரிக்க)</Label>
            <Input value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="ஜாதகம், திருமணப் பொருத்தம், நாடி" /></div>
          <div className="space-y-2"><Label>மொழிகள் (கமா பிரிக்க)</Label>
            <Input value={languages} onChange={(e) => setLanguages(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>WhatsApp எண்</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+91..." /></div>
            <div className="space-y-2"><Label>தொலைபேசி எண்</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." /></div>
          </div>
          <div className="space-y-2"><Label>Photo URL (optional)</Label>
            <Input value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="https://..." /></div>
          <Button type="submit" disabled={busy} className="w-full bg-gradient-royal text-primary-foreground font-tamil">
            {busy ? "..." : existing ? "புதுப்பி" : "விண்ணப்பி"}
          </Button>
          {!existing && <p className="text-xs text-muted-foreground font-tamil text-center">
            விண்ணப்பத்தை admin அனுமதித்த பிறகே நீங்கள் ஜோதிடர் பட்டியலில் தோன்றுவீர்கள்.
          </p>}
        </form>
      </div>
    </main>
  );
};

export default AstrologerApply;
