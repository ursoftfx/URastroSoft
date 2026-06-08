import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Send } from "lucide-react";

interface Consult {
  id: string; mode: string; subject: string | null; question: string; status: string; created_at: string;
  astrologer_id: string; user_id: string;
  astrologer?: { display_name: string };
}
interface Msg { id: string; sender_id: string; body: string; created_at: string; }

const MyConsultations = ({ asAstrologer = false }: { asAstrologer?: boolean }) => {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [list, setList] = useState<Consult[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [astroId, setAstroId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) nav("/auth");
  }, [user, loading, nav]);

  const loadList = useCallback(async () => {
    if (!user) return;
    let aId: string | null = null;
    if (asAstrologer) {
      const { data: a } = await supabase.from("astrologer_profiles")
        .select("id").eq("user_id", user.id).maybeSingle();
      aId = a?.id || null;
      setAstroId(aId);
      if (!aId) { setList([]); return; }
    }
    const q = supabase.from("consultations")
      .select("id, mode, subject, question, status, created_at, astrologer_id, user_id, astrologer:astrologer_profiles(display_name)")
      .order("created_at", { ascending: false });
    const { data } = asAstrologer
      ? await q.eq("astrologer_id", aId!)
      : await q.eq("user_id", user.id);
    setList((data as any) || []);
  }, [user, asAstrologer]);

  useEffect(() => { loadList(); }, [loadList]);

  const openConsult = async (id: string) => {
    setActive(id);
    const { data } = await supabase.from("consultation_messages")
      .select("id, sender_id, body, created_at")
      .eq("consultation_id", id).order("created_at", { ascending: true });
    setMsgs((data as Msg[]) || []);
  };

  const send = async () => {
    if (!active || !user || text.trim().length < 1) return;
    const { error } = await supabase.from("consultation_messages").insert({
      consultation_id: active, sender_id: user.id, body: text.trim(),
    });
    if (error) { toast.error(error.message); return; }
    setText("");
    if (asAstrologer) {
      await supabase.from("consultations").update({ status: "answered" }).eq("id", active);
      loadList();
    }
    openConsult(active);
  };

  const activeRow = list.find((c) => c.id === active);

  return (
    <main className="min-h-screen px-4 py-8 max-w-5xl mx-auto">
      <SEO title={asAstrologer ? "ஜோதிடர் டாஷ்போர்டு" : "என் கேள்விகள்"} description="URASTROTALK consultations" noIndex />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link to="/" className="inline-flex items-center text-sm font-tamil text-maroon-deep">
          <ArrowLeft className="w-4 h-4 mr-1" /> முகப்பு
        </Link>
        <h1 className="font-tamil text-2xl font-bold text-maroon-deep">
          {asAstrologer ? "ஜோதிடர் டாஷ்போர்டு" : "என் கேள்விகள்"}
        </h1>
        {!asAstrologer && (
          <Button asChild size="sm" variant="outline" className="font-tamil">
            <Link to="/astrologers">ஜோதிடர்கள்</Link>
          </Button>
        )}
      </div>

      {asAstrologer && !astroId && (
        <div className="parchment rounded-2xl p-6 text-center">
          <p className="font-tamil mb-3">நீங்கள் ஜோதிடராக பதிவு செய்யவில்லை.</p>
          <Button asChild className="bg-gradient-royal text-primary-foreground font-tamil">
            <Link to="/astrologer/apply">விண்ணப்பி</Link>
          </Button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="parchment rounded-2xl p-4 space-y-2 max-h-[70vh] overflow-y-auto">
          <h2 className="font-tamil font-bold text-maroon-deep mb-2">பட்டியல் ({list.length})</h2>
          {list.length === 0 && <p className="text-sm font-tamil text-muted-foreground py-6 text-center">இன்னும் கேள்விகள் இல்லை</p>}
          {list.map((c) => (
            <button key={c.id} onClick={() => openConsult(c.id)}
              className={`w-full text-left p-3 rounded border ${active === c.id ? "border-gold-deep bg-gold/10" : "border-gold/20"}`}>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-tamil font-semibold truncate">{c.subject || c.question.slice(0, 50)}</div>
                  <div className="text-xs text-muted-foreground">
                    {asAstrologer ? "User" : (c.astrologer?.display_name || "")} • {new Date(c.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge variant="outline" className="text-xs">{c.mode}</Badge>
                  <Badge variant={c.status === "answered" ? "default" : "secondary"} className="text-xs">{c.status}</Badge>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="parchment rounded-2xl p-4 flex flex-col max-h-[70vh]">
          {activeRow ? (
            <>
              <div className="border-b border-gold/20 pb-2 mb-2">
                <div className="font-tamil font-bold text-maroon-deep">{activeRow.subject || "கேள்வி"}</div>
                <div className="text-sm font-tamil text-foreground/80 mt-1">{activeRow.question}</div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 mb-2">
                {msgs.map((m) => {
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] p-2 rounded ${mine ? "bg-gradient-royal text-primary-foreground" : "bg-secondary"}`}>
                        <div className="text-sm font-tamil whitespace-pre-wrap">{m.body}</div>
                        <div className={`text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {new Date(m.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {msgs.length === 0 && <p className="text-center text-sm text-muted-foreground font-tamil py-4">பதில் காத்திருக்கிறது...</p>}
              </div>
              <div className="flex gap-2 items-end">
                <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="பதில்..." />
                <Button onClick={send} className="bg-gradient-royal text-primary-foreground"><Send className="w-4 h-4" /></Button>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground font-tamil py-10">ஒரு கேள்வியை தேர்ந்தெடுக்கவும்</p>
          )}
        </div>
      </div>
    </main>
  );
};

export const MyConsultationsPage = () => <MyConsultations />;
export const AstrologerDashboardPage = () => <MyConsultations asAstrologer />;
