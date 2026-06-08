import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { ArrowLeft } from "lucide-react";
import { isValidPhone, normalizePhone, phoneToEmail } from "@/lib/phone-auth";

const signInSchema = z.object({
  phone: z.string().refine(isValidPhone, "சரியான தொலைபேசி எண்"),
  password: z.string().min(6).max(72),
});
const signUpSchema = signInSchema.extend({
  full_name: z.string().trim().min(2, "பெயர் தேவை").max(80),
});

const Auth = () => {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) nav("/", { replace: true });
  }, [user, loading, nav]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signInSchema.safeParse({ phone, password });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: phoneToEmail(phone), password,
    });
    setBusy(false);
    if (error) toast.error("தவறான தொலைபேசி/கடவுச்சொல்");
    else { toast.success("வரவேற்கிறோம்!"); nav("/"); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({ phone, password, full_name: fullName });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setBusy(true);
    const normPhone = normalizePhone(phone);
    const { data, error } = await supabase.auth.signUp({
      email: phoneToEmail(phone),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName, phone: normPhone },
      },
    });
    if (error) { setBusy(false); toast.error(error.message); return; }
    // Insert profile row
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        phone: normPhone,
        whatsapp_number: normPhone,
      });
    }
    setBusy(false);
    toast.success("கணக்கு உருவாக்கப்பட்டது!");
    nav("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <SEO title="உள்நுழைவு | URASTROTALK Login" description="தொலைபேசி எண் கொண்டு உள்நுழையவும்" noIndex />
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-sm text-maroon-deep mb-4 font-tamil">
          <ArrowLeft className="w-4 h-4 mr-1" /> முகப்பு
        </Link>
        <div className="parchment rounded-2xl p-6 md:p-8">
          <h1 className="font-tamil text-2xl md:text-3xl font-bold text-maroon-deep text-center mb-2">
            URASTROTALK
          </h1>
          <p className="text-center text-sm text-muted-foreground font-tamil mb-6">ஜோதிடர்களுடன் நேரடி கலந்தாலோசனை</p>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className="font-tamil">உள்நுழை</TabsTrigger>
              <TabsTrigger value="signup" className="font-tamil">பதிவு</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>தொலைபேசி எண் (+91...)</Label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+919876543210" />
                </div>
                <div className="space-y-2">
                  <Label>கடவுச்சொல்</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-gradient-royal text-primary-foreground font-tamil">
                  {busy ? "..." : "உள்நுழை"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>உங்கள் பெயர்</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={80} />
                </div>
                <div className="space-y-2">
                  <Label>தொலைபேசி எண் (+91...)</Label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+919876543210" />
                </div>
                <div className="space-y-2">
                  <Label>கடவுச்சொல் (குறைந்தது 6)</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-gradient-royal text-primary-foreground font-tamil">
                  {busy ? "..." : "பதிவு செய்"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
};

export default Auth;
