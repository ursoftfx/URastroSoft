import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/** Astrologer controls: online toggle, rate, earnings, live chat requests. */
const AstroLivePanel = () => {
  const { user } = useAuth();
  const [a, setA] = useState<any>(null);
  const [rate, setRate] = useState("10");
  const [sessions, setSessions] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("astrologer_profiles")
      .select("id, status, is_online, rate_per_minute, earnings, rating_avg, rating_count").eq("user_id", user.id).maybeSingle();
    setA(data); if (data) setRate(String(data.rate_per_minute));
    if (data) {
      const { data: ss } = await supabase.from("chat_sessions").select("*").eq("astrologer_id", data.id)
        .order("created_at", { ascending: false }).limit(30);
      setSessions(ss || []);
    }
  }, [user]);

  useEffect(() => {
    load();
    const ch = supabase.channel("astro-sessions")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions" }, () => {
        load(); toast.info("புதிய உரையாடல் மாற்றம்");
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  if (!a) return null;
  const save = async (patch: any) => {
    const { error } = await supabase.from("astrologer_profiles").update(patch).eq("id", a.id);
    if (error) toast.error(error.message); else { toast.success("சேமிக்கப்பட்டது"); load(); }
  };

  return (
    <div className="parchment rounded-2xl p-4 mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <label className="flex items-center gap-2 font-tamil font-bold">
          <Switch checked={a.is_online} disabled={a.status !== "approved"} onCheckedChange={(v) => save({ is_online: v })} />
          {a.is_online ? "ஆன்லைன்" : "ஆஃப்லைன்"}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm">₹/நிமிடம்</span>
          <Input type="number" className="w-20" value={rate} min={1} onChange={(e) => setRate(e.target.value)} />
          <Button size="sm" onClick={() => save({ rate_per_minute: Math.max(1, Number(rate) || 1) })}>சேமி</Button>
        </div>
        <div className="text-sm">வருமானம்: <b>₹{Number(a.earnings).toFixed(2)}</b> • ⭐ {a.rating_avg} ({a.rating_count})</div>
      </div>
      {a.status !== "approved" && <p className="text-sm font-tamil text-destructive">நிர்வாகி அங்கீகாரம் காத்திருக்கிறது ({a.status})</p>}
      <div>
        <h3 className="font-tamil font-bold text-maroon-deep mb-1">நேரலை உரையாடல்கள்</h3>
        {sessions.length === 0 && <p className="text-sm text-muted-foreground font-tamil">இல்லை</p>}
        {sessions.map((s) => (
          <Link key={s.id} to={`/chat/${s.id}`} className="flex justify-between items-center text-sm py-1 border-b border-gold/20">
            <span>{new Date(s.created_at).toLocaleString()} • {s.minutes} நிமி • ₹{s.amount}</span>
            <Badge variant={s.status === "requested" ? "destructive" : "secondary"}>{s.status === "requested" ? "புதிய கோரிக்கை" : s.status}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default AstroLivePanel;
