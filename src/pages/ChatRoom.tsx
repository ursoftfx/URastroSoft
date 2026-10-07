import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Send, Star } from "lucide-react";

const ChatRoom = () => {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [s, setS] = useState<any>(null);
  const [astroUid, setAstroUid] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [now, setNow] = useState(Date.now());
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!loading && !user) nav("/auth"); }, [user, loading, nav]);

  const loadSession = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.from("chat_sessions")
      .select("*, astrologer:astrologer_profiles(display_name, user_id)").eq("id", id).maybeSingle();
    setS(data); setAstroUid((data as any)?.astrologer?.user_id || null);
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;
    loadSession();
    supabase.from("chat_messages").select("*").eq("session_id", id).order("created_at")
      .then(({ data }) => setMsgs(data || []));
    supabase.from("astrologer_reviews").select("id").eq("session_id", id).maybeSingle()
      .then(({ data }) => setReviewed(!!data));
    const ch = supabase.channel(`chat-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${id}` },
        (p) => setMsgs((m) => m.some((x) => x.id === (p.new as any).id) ? m : [...m, p.new]))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_sessions", filter: `id=eq.${id}` },
        () => loadSession())
      .subscribe();
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => { supabase.removeChannel(ch); clearInterval(t); };
  }, [id, user, loadSession]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  if (!s) return <main className="p-8 text-center font-tamil">ஏற்றுகிறது...</main>;
  const isAstro = astroUid === user?.id;
  const secs = s.started_at ? Math.floor((now - new Date(s.started_at).getTime()) / 1000) : 0;
  const mm = String(Math.floor(secs / 60)).padStart(2, "0"), ss = String(secs % 60).padStart(2, "0");
  const cost = s.status === "active" ? Math.max(1, Math.ceil(secs / 60)) * Number(s.rate) : Number(s.amount);

  const send = async () => {
    if (!text.trim() || !user) return;
    const body = text.trim(); setText("");
    const { error } = await supabase.from("chat_messages").insert({ session_id: id!, sender_id: user.id, body });
    if (error) toast.error(error.message);
  };
  const end = async () => {
    const { data, error } = await supabase.rpc("end_chat", { _session: id! });
    if (error) { toast.error(error.message); return; }
    toast.success(`உரையாடல் முடிந்தது — ₹${Number(data).toFixed(2)}`); loadSession();
  };
  const respond = async (accept: boolean) => {
    const { error } = await supabase.rpc("respond_chat", { _session: id!, _accept: accept });
    if (error) toast.error(error.message); else loadSession();
  };
  const review = async () => {
    const { error } = await supabase.rpc("submit_review", { _session: id!, _rating: rating, _comment: comment });
    if (error) { toast.error(error.message); return; }
    toast.success("நன்றி!"); setReviewed(true);
  };

  return (
    <main className="min-h-screen px-4 py-6 max-w-3xl mx-auto flex flex-col">
      <SEO title="நேரலை உரையாடல் | AMMAN SOFTWARES TALK" description="Live chat" noIndex />
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <Link to={isAstro ? "/astrologer/dashboard" : "/astrologers"} className="inline-flex items-center text-sm font-tamil text-maroon-deep">
          <ArrowLeft className="w-4 h-4 mr-1" /> பின்செல்
        </Link>
        <div className="font-tamil font-bold text-maroon-deep">{isAstro ? "பயனர்" : s.astrologer?.display_name}</div>
        <Badge>{s.status}</Badge>
      </div>

      <div className="parchment rounded-xl p-3 mb-3 flex items-center justify-between flex-wrap gap-2">
        <span className="font-mono text-xl font-bold">{mm}:{ss}</span>
        <span className="text-sm">₹{s.rate}/நிமிடம் • ₹{cost.toFixed(2)}</span>
        {(s.status === "active" || s.status === "requested") && (
          <Button size="sm" variant="destructive" onClick={end}>{s.status === "requested" ? "ரத்து" : "முடி"}</Button>
        )}
      </div>

      {s.status === "requested" && (
        isAstro ? (
          <div className="parchment rounded-xl p-4 mb-3 flex gap-2 justify-center">
            <Button onClick={() => respond(true)} className="bg-gradient-royal text-primary-foreground">ஏற்கவும்</Button>
            <Button variant="outline" onClick={() => respond(false)}>மறு</Button>
          </div>
        ) : <p className="text-center font-tamil text-muted-foreground mb-3">ஜோதிடர் ஏற்கும் வரை காத்திருக்கவும்...</p>
      )}

      <div className="parchment rounded-xl p-3 flex-1 min-h-[50vh] max-h-[60vh] overflow-y-auto space-y-2">
        {msgs.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-2 rounded ${mine ? "bg-gradient-royal text-primary-foreground" : "bg-secondary"}`}>
                <div className="text-sm font-tamil whitespace-pre-wrap">{m.body}</div>
                <div className="text-[10px] opacity-70">{new Date(m.created_at).toLocaleTimeString()}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      {s.status === "active" && (
        <div className="flex gap-2 mt-3">
          <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="செய்தி..." maxLength={2000} />
          <Button onClick={send} className="bg-gradient-royal text-primary-foreground"><Send className="w-4 h-4" /></Button>
        </div>
      )}

      {s.status === "ended" && !isAstro && !reviewed && (
        <div className="parchment rounded-xl p-4 mt-3 space-y-2">
          <p className="font-tamil font-bold">மதிப்பீடு தரவும்</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <Star className={`w-7 h-7 ${n <= rating ? "fill-gold text-gold-deep" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} maxLength={500} placeholder="கருத்து (விருப்பம்)" />
          <Button onClick={review} className="bg-gradient-royal text-primary-foreground">அனுப்பு</Button>
        </div>
      )}
    </main>
  );
};
export default ChatRoom;
