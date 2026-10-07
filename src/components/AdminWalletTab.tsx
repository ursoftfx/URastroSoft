import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const AdminWalletTab = () => {
  const [recs, setRecs] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const load = useCallback(async () => {
    const [r, c] = await Promise.all([
      supabase.from("wallet_recharges").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("chat_sessions").select("*, astrologer:astrologer_profiles(display_name)").order("created_at", { ascending: false }).limit(100),
    ]);
    setRecs(r.data || []); setChats(c.data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (id: string, ok: boolean) => {
    const { error } = await supabase.rpc("approve_recharge", { _id: id, _approve: ok });
    if (error) toast.error(error.message); else { toast.success(ok ? "அங்கீகரிக்கப்பட்டது" : "நிராகரிக்கப்பட்டது"); load(); }
  };

  return (
    <div className="space-y-4">
      <div className="parchment rounded-xl p-4">
        <h3 className="font-tamil font-bold text-maroon-deep mb-3">வாலட் கோரிக்கைகள்</h3>
        {recs.map((r) => (
          <div key={r.id} className="p-2 border-b border-gold/20 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>₹{r.amount} • UTR <b>{r.utr}</b> • {new Date(r.created_at).toLocaleString()}</span>
            {r.status === "pending" ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => act(r.id, true)}>ஏற்று</Button>
                <Button size="sm" variant="outline" onClick={() => act(r.id, false)}>மறு</Button>
              </div>
            ) : <Badge variant="secondary">{r.status}</Badge>}
          </div>
        ))}
      </div>
      <div className="parchment rounded-xl p-4">
        <h3 className="font-tamil font-bold text-maroon-deep mb-3">அனைத்து உரையாடல்கள்</h3>
        {chats.map((c) => (
          <Link key={c.id} to={`/chat/${c.id}`} className="p-2 border-b border-gold/20 flex justify-between text-sm">
            <span>{c.astrologer?.display_name} • {new Date(c.created_at).toLocaleString()} • {c.minutes} நிமி • ₹{c.amount}</span>
            <Badge variant="secondary">{c.status}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default AdminWalletTab;
