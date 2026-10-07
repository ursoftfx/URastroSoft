import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Wallet as WalletIcon } from "lucide-react";

const UPI = "udhayaraj24-1@oksbi";

const Wallet = () => {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [bal, setBal] = useState(0);
  const [tx, setTx] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [amount, setAmount] = useState("100");
  const [utr, setUtr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) nav("/auth"); }, [user, loading, nav]);

  const load = useCallback(async () => {
    if (!user) return;
    const [w, t, r] = await Promise.all([
      supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle(),
      supabase.from("wallet_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("wallet_recharges").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    setBal(Number(w.data?.balance || 0)); setTx(t.data || []); setRecs(r.data || []);
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const amt = Number(amount) || 0;
  const upiLink = `upi://pay?pa=${UPI}&pn=AMMAN%20SOFTWARES&am=${amt}&cu=INR&tn=Wallet%20Recharge`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`;

  const submit = async () => {
    if (!user) return;
    if (amt < 10 || amt > 100000) { toast.error("₹10 – ₹1,00,000 வரை மட்டும்"); return; }
    if (utr.trim().length < 6) { toast.error("சரியான UTR எண் தரவும்"); return; }
    setBusy(true);
    const { error } = await supabase.from("wallet_recharges").insert({ user_id: user.id, amount: amt, utr: utr.trim() });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("கோரிக்கை அனுப்பப்பட்டது — நிர்வாகி சரிபார்த்ததும் இருப்பில் சேரும்");
    setUtr(""); load();
  };

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto space-y-4">
      <SEO title="என் வாலட் | AMMAN SOFTWARES TALK" description="Wallet" noIndex />
      <Link to="/astrologers" className="inline-flex items-center text-sm font-tamil text-maroon-deep">
        <ArrowLeft className="w-4 h-4 mr-1" /> ஜோதிடர்கள்
      </Link>
      <div className="parchment rounded-2xl p-6 text-center">
        <WalletIcon className="w-8 h-8 mx-auto text-gold-deep" />
        <p className="font-tamil text-muted-foreground">வாலட் இருப்பு</p>
        <p className="text-4xl font-bold text-maroon-deep">₹{bal.toFixed(2)}</p>
      </div>

      <div className="parchment rounded-2xl p-6 space-y-3">
        <h2 className="font-tamil text-xl font-bold text-maroon-deep">பணம் சேர்க்க (UPI)</h2>
        <div className="flex flex-wrap gap-2">
          {[50, 100, 200, 500, 1000].map((v) => (
            <Button key={v} size="sm" variant={amt === v ? "default" : "outline"} onClick={() => setAmount(String(v))}>₹{v}</Button>
          ))}
        </div>
        <div className="space-y-1"><Label>தொகை (₹)</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min={10} /></div>
        <div className="flex flex-col items-center gap-2">
          <img src={qr} alt="UPI QR" className="w-52 h-52 bg-card p-2 rounded" />
          <p className="text-sm font-bold">{UPI}</p>
          <Button asChild size="sm" variant="outline"><a href={upiLink}>UPI App-ல் திற</a></Button>
        </div>
        <div className="space-y-1"><Label>பணம் செலுத்திய பின் UTR / Ref எண்</Label>
          <Input value={utr} onChange={(e) => setUtr(e.target.value)} maxLength={40} /></div>
        <Button onClick={submit} disabled={busy} className="w-full bg-gradient-royal text-primary-foreground font-tamil">சரிபார்க்க அனுப்பு</Button>
      </div>

      {recs.length > 0 && (
        <div className="parchment rounded-2xl p-6">
          <h3 className="font-tamil font-bold text-maroon-deep mb-2">கோரிக்கைகள்</h3>
          {recs.map((r) => (
            <div key={r.id} className="flex justify-between text-sm py-1 border-b border-gold/20">
              <span>₹{r.amount} • UTR {r.utr}</span>
              <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}>{r.status}</Badge>
            </div>
          ))}
        </div>
      )}

      <div className="parchment rounded-2xl p-6">
        <h3 className="font-tamil font-bold text-maroon-deep mb-2">பரிவர்த்தனைகள்</h3>
        {tx.length === 0 && <p className="text-sm text-muted-foreground font-tamil">இல்லை</p>}
        {tx.map((t) => (
          <div key={t.id} className="flex justify-between text-sm py-1 border-b border-gold/20">
            <span>{t.note || t.kind} • {new Date(t.created_at).toLocaleString()}</span>
            <span className={Number(t.amount) >= 0 ? "text-primary font-bold" : "text-destructive font-bold"}>
              {Number(t.amount) >= 0 ? "+" : ""}₹{Number(t.amount).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
};
export default Wallet;
