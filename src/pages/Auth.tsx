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

const schema = z.object({
  email: z.string().trim().email("சரியான மின்னஞ்சல் கொடுக்கவும்").max(255),
  password: z.string().min(6, "குறைந்தது 6 எழுத்துகள்").max(72),
});

const Auth = () => {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) nav("/admin", { replace: true });
  }, [user, loading, nav]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("வரவேற்கிறோம்!"); nav("/admin"); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("கணக்கு உருவாக்கப்பட்டது. மின்னஞ்சலை சரிபார்க்கவும்.");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <SEO title="உள்நுழைவு | Admin Login" description="நிர்வாக உள்நுழைவு" />
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-sm text-maroon-deep mb-4 font-tamil">
          <ArrowLeft className="w-4 h-4 mr-1" /> முகப்பு
        </Link>
        <div className="parchment rounded-2xl p-6 md:p-8">
          <h1 className="font-tamil text-2xl md:text-3xl font-bold text-maroon-deep text-center mb-6">
            நிர்வாக உள்நுழைவு
          </h1>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className="font-tamil">உள்நுழை</TabsTrigger>
              <TabsTrigger value="signup" className="font-tamil">பதிவு</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-in">மின்னஞ்சல்</Label>
                  <Input id="email-in" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-in">கடவுச்சொல்</Label>
                  <Input id="pw-in" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-gradient-royal text-primary-foreground font-tamil">
                  {busy ? "..." : "உள்நுழை"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-up">மின்னஞ்சல்</Label>
                  <Input id="email-up" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-up">கடவுச்சொல்</Label>
                  <Input id="pw-up" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-gradient-royal text-primary-foreground font-tamil">
                  {busy ? "..." : "பதிவு செய்"}
                </Button>
                <p className="text-xs text-muted-foreground font-tamil text-center">
                  புதிய பயனர்களுக்கு admin அனுமதி தனியாக வழங்கப்படும்.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
};

export default Auth;
