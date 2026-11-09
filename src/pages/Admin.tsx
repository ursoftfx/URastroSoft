import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { RASIS_TAMIL } from "@/lib/jathagam";
import { ArrowLeft, Trash2, Eye, EyeOff, LogOut, Search, Download, RefreshCw } from "lucide-react";
import { z } from "zod";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\u0B80-\u0BFF]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || `post-${Date.now()}`;

const postSchema = z.object({
  title: z.string().trim().min(3).max(200),
  body: z.string().trim().min(10).max(50000),
});
const annSchema = z.object({
  title: z.string().trim().min(2).max(200),
  message: z.string().trim().min(2).max(2000),
});

interface Post { id: string; title: string; slug: string; published: boolean; created_at: string; }
interface Ann { id: string; rasi: string | null; title: string; message: string; active_date: string; active: boolean; }
interface Prof { id: string; full_name: string | null; phone: string; whatsapp_number: string | null; created_at: string; }
interface Lead { id: string; name: string; phone: string; gender: string | null; birth_date: string; birth_time: string; place_name: string; rasi: string | null; nakshatra: string | null; lagna: string | null; created_at: string; }
interface ReportDownload { id: string; lead_id: string | null; report_type: string; created_at: string; }

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const nav = useNavigate();

  // Post form
  const [pTitle, setPTitle] = useState("");
  const [pExcerpt, setPExcerpt] = useState("");
  const [pBody, setPBody] = useState("");
  const [pImage, setPImage] = useState("");
  const [pPublished, setPPublished] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  // Announcement form
  const [aTitle, setATitle] = useState("");
  const [aMsg, setAMsg] = useState("");
  const [aRasi, setARasi] = useState<string>("all");
  const [anns, setAnns] = useState<Ann[]>([]);
  const [profs, setProfs] = useState<Prof[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [downloads, setDownloads] = useState<ReportDownload[]>([]);
  const [leadCount, setLeadCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadPeriod, setLeadPeriod] = useState("all");

  useEffect(() => {
    if (!loading && !user) nav("/auth", { replace: true });
  }, [user, loading, nav]);

  const loadPosts = async () => {
    const { data } = await supabase.from("posts").select("id, title, slug, published, created_at").order("created_at", { ascending: false });
    setPosts((data as Post[]) || []);
  };
  const loadAnns = async () => {
    const { data } = await supabase.from("announcements").select("id, rasi, title, message, active_date, active").order("created_at", { ascending: false });
    setAnns((data as Ann[]) || []);
  };

  const loadProfs = async () => {
    const { data } = await supabase.from("profiles")
      .select("id, full_name, phone, whatsapp_number, created_at")
      .order("created_at", { ascending: false });
    setProfs((data as Prof[]) || []);
  };

  const loadReportAnalytics = async () => {
    const [leadTotal, downloadTotal, recentLeads, recentDownloads] = await Promise.all([
      supabase.from("jathagam_leads").select("id", { count: "exact", head: true }),
      supabase.from("report_download_events").select("id", { count: "exact", head: true }),
      supabase.from("jathagam_leads").select("id, name, phone, gender, birth_date, birth_time, place_name, rasi, nakshatra, lagna, created_at").order("created_at", { ascending: false }).limit(1000),
      supabase.from("report_download_events").select("id, lead_id, report_type, created_at").order("created_at", { ascending: false }).limit(1000),
    ]);
    if (leadTotal.error || downloadTotal.error || recentLeads.error || recentDownloads.error) {
      toast.error("அறிக்கை விவரங்களை ஏற்ற முடியவில்லை");
      return;
    }
    setLeadCount(leadTotal.count ?? 0);
    setDownloadCount(downloadTotal.count ?? 0);
    setLeads((recentLeads.data as Lead[]) || []);
    setDownloads((recentDownloads.data as ReportDownload[]) || []);
  };

  useEffect(() => { if (isAdmin) { loadPosts(); loadAnns(); loadProfs(); loadReportAnalytics(); } }, [isAdmin]);

  const visibleLeads = leads.filter((lead) => {
    const matchesSearch = `${lead.name} ${lead.phone} ${lead.place_name} ${lead.rasi ?? ""} ${lead.nakshatra ?? ""}`
      .toLocaleLowerCase().includes(leadSearch.toLocaleLowerCase().trim());
    const days = Number(leadPeriod);
    const matchesPeriod = !days || Date.now() - new Date(lead.created_at).getTime() <= days * 24 * 60 * 60 * 1000;
    return matchesSearch && matchesPeriod;
  });

  const exportLeads = () => {
    const headers = ["Name", "Phone", "Birth date", "Birth time", "Place", "Rasi", "Nakshatra", "Lagna", "Generated at"];
    const rows = visibleLeads.map((lead) => [lead.name, lead.phone, lead.birth_date, lead.birth_time, lead.place_name, lead.rasi ?? "", lead.nakshatra ?? "", lead.lagna ?? "", new Date(lead.created_at).toLocaleString()]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "amman-horoscope-reports.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const reportName = (type: string) => ({
    professional: "Professional PDF",
    onepage: "ஒரு பக்க அறிக்கை",
    birth_report: "ஜாதக அறிக்கை",
    daily_panchangam: "தினசரி பஞ்சாங்கம்",
  }[type] ?? type);

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = postSchema.safeParse({ title: pTitle, body: pBody });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    if (!user) return;
    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      title: pTitle.trim(),
      slug: slugify(pTitle),
      excerpt: pExcerpt.trim() || null,
      body: pBody.trim(),
      cover_image_url: pImage.trim() || null,
      published: pPublished,
      published_at: pPublished ? new Date().toISOString() : null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("கட்டுரை வெளியிடப்பட்டது");
    setPTitle(""); setPExcerpt(""); setPBody(""); setPImage("");
    loadPosts();
  };

  const togglePost = async (p: Post) => {
    const { error } = await supabase.from("posts").update({
      published: !p.published,
      published_at: !p.published ? new Date().toISOString() : null,
    }).eq("id", p.id);
    if (error) toast.error(error.message); else loadPosts();
  };
  const deletePost = async (id: string) => {
    if (!confirm("நீக்கவா?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("நீக்கப்பட்டது"); loadPosts(); }
  };

  const submitAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = annSchema.safeParse({ title: aTitle, message: aMsg });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    if (!user) return;
    const { error } = await supabase.from("announcements").insert({
      author_id: user.id,
      rasi: aRasi === "all" ? null : aRasi,
      title: aTitle.trim(),
      message: aMsg.trim(),
    });
    if (error) { toast.error(error.message); return; }
    toast.success("அறிவிப்பு சேர்க்கப்பட்டது");
    setATitle(""); setAMsg(""); setARasi("all");
    loadAnns();
  };
  const toggleAnn = async (a: Ann) => {
    const { error } = await supabase.from("announcements").update({ active: !a.active }).eq("id", a.id);
    if (error) toast.error(error.message); else loadAnns();
  };
  const deleteAnn = async (id: string) => {
    if (!confirm("நீக்கவா?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("நீக்கப்பட்டது"); loadAnns(); }
  };

  if (loading) return <div className="p-10 text-center font-tamil">ஏற்றுகிறது...</div>;
  if (!user) return null;
  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="parchment rounded-2xl p-6 max-w-md text-center">
          <h1 className="font-tamil text-xl font-bold text-maroon-deep mb-2">அனுமதி இல்லை</h1>
          <p className="font-tamil text-sm text-muted-foreground mb-4">
            இந்த பக்கத்தைப் பார்க்க admin பாத்திரம் தேவை. நிர்வாகியை அணுகவும்.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => signOut().then(() => nav("/auth"))}>வெளியேறு</Button>
            <Button asChild><Link to="/">முகப்பு</Link></Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <SEO title="நிர்வாக பலகை | Admin" description="Admin dashboard" noIndex />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link to="/" className="inline-flex items-center text-sm font-tamil text-maroon-deep">
          <ArrowLeft className="w-4 h-4 mr-1" /> முகப்பு
        </Link>
        <h1 className="font-tamil text-2xl md:text-3xl font-bold text-maroon-deep">நிர்வாக பலகை</h1>
        <Button variant="outline" size="sm" onClick={() => signOut().then(() => nav("/"))}>
          <LogOut className="w-4 h-4 mr-1" /> வெளியேறு
        </Button>
      </div>

      <Tabs defaultValue="reports">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="reports" className="font-tamil">அறிக்கை விவரங்கள்</TabsTrigger>
          <TabsTrigger value="posts" className="font-tamil">கட்டுரைகள்</TabsTrigger>
          <TabsTrigger value="anns" className="font-tamil">அறிவிப்புகள்</TabsTrigger>
          <TabsTrigger value="users" className="font-tamil">பயனர்கள்</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4 mt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="parchment rounded-lg border border-gold/30 p-4">
              <div className="font-tamil text-sm text-muted-foreground">ஜாதகம் உருவாக்கியவர்கள்</div>
              <div className="text-3xl font-bold text-maroon-deep">{leadCount.toLocaleString()}</div>
            </div>
            <div className="parchment rounded-lg border border-gold/30 p-4">
              <div className="font-tamil text-sm text-muted-foreground">PDF பதிவிறக்கங்கள்</div>
              <div className="text-3xl font-bold text-maroon-deep">{downloadCount.toLocaleString()}</div>
            </div>
          </div>
          <section className="parchment rounded-lg border border-gold/30 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-tamil text-lg font-bold text-maroon-deep">சமீபத்திய ஜாதக பதிவுகள்</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadReportAnalytics} aria-label="புதுப்பிக்க">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={exportLeads}>
                  <Download className="h-4 w-4 mr-1" /> CSV
                </Button>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} placeholder="பெயர், தொலைபேசி அல்லது ஊர் தேடுக" />
              </div>
              <Select value={leadPeriod} onValueChange={setLeadPeriod}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">எல்லா நாட்களும்</SelectItem>
                  <SelectItem value="7">கடந்த 7 நாட்கள்</SelectItem>
                  <SelectItem value="30">கடந்த 30 நாட்கள்</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground font-tamil">காட்டப்படுவது: {visibleLeads.length} / {leadCount.toLocaleString()} • சமீபத்திய 1,000 பதிவுகள் வரை</p>
            <div className="space-y-2">
              {visibleLeads.map((lead) => {
                const leadDownloads = downloads.filter((entry) => entry.lead_id === lead.id);
                return (
                  <article key={lead.id} className="border border-gold/20 rounded-md p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-tamil font-semibold text-maroon-deep">{lead.name}</h3>
                        <a href={`tel:${lead.phone}`} className="text-sm underline">{lead.phone || "தொலைபேசி இல்லை"}</a>
                        <p className="text-sm text-muted-foreground font-tamil">{lead.place_name} • {lead.birth_date} {lead.birth_time}</p>
                        <p className="text-sm text-muted-foreground font-tamil">{[lead.rasi, lead.nakshatra, lead.lagna].filter(Boolean).join(" • ") || "ஜாதக விவரங்கள் இல்லை"}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground font-tamil">
                        <div>{new Date(lead.created_at).toLocaleString()}</div>
                        <div>PDF: {leadDownloads.length ? leadDownloads.map((entry) => reportName(entry.report_type)).join(", ") : "இன்னும் பதிவிறக்கம் இல்லை"}</div>
                      </div>
                    </div>
                  </article>
                );
              })}
              {visibleLeads.length === 0 && <p className="py-6 text-center font-tamil text-muted-foreground">பதிவுகள் இல்லை</p>}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6 mt-4">
          <form onSubmit={submitPost} className="parchment rounded-xl p-5 space-y-4">
            <h2 className="font-tamil text-lg font-bold text-maroon-deep">புதிய கட்டுரை</h2>
            <div className="space-y-2">
              <Label>தலைப்பு</Label>
              <Input value={pTitle} onChange={(e) => setPTitle(e.target.value)} required maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label>சுருக்கம் (optional)</Label>
              <Input value={pExcerpt} onChange={(e) => setPExcerpt(e.target.value)} maxLength={300} />
            </div>
            <div className="space-y-2">
              <Label>உள்ளடக்கம்</Label>
              <Textarea value={pBody} onChange={(e) => setPBody(e.target.value)} rows={8} required maxLength={50000} />
            </div>
            <div className="space-y-2">
              <Label>படம் URL (optional)</Label>
              <Input value={pImage} onChange={(e) => setPImage(e.target.value)} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2">
              <input id="pub" type="checkbox" checked={pPublished} onChange={(e) => setPPublished(e.target.checked)} />
              <Label htmlFor="pub" className="cursor-pointer">உடனே வெளியிடு</Label>
            </div>
            <Button type="submit" className="w-full bg-gradient-royal text-primary-foreground font-tamil">பதிவு செய்</Button>
          </form>

          <div className="parchment rounded-xl p-4">
            <h3 className="font-tamil font-bold text-maroon-deep mb-3">தற்போதைய கட்டுரைகள் ({posts.length})</h3>
            <div className="space-y-2">
              {posts.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 p-2 border border-gold/20 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="font-tamil font-semibold truncate">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()} • {p.published ? "வெளியிடப்பட்டது" : "வரைவு"}</div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => togglePost(p)}>
                    {p.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deletePost(p.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {posts.length === 0 && <p className="text-sm text-muted-foreground font-tamil text-center py-4">கட்டுரைகள் இல்லை</p>}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="anns" className="space-y-6 mt-4">
          <form onSubmit={submitAnn} className="parchment rounded-xl p-5 space-y-4">
            <h2 className="font-tamil text-lg font-bold text-maroon-deep">புதிய அறிவிப்பு</h2>
            <div className="space-y-2">
              <Label>ராசி</Label>
              <Select value={aRasi} onValueChange={setARasi}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">அனைத்து ராசி</SelectItem>
                  {RASIS_TAMIL.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>தலைப்பு</Label>
              <Input value={aTitle} onChange={(e) => setATitle(e.target.value)} required maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label>செய்தி</Label>
              <Textarea value={aMsg} onChange={(e) => setAMsg(e.target.value)} rows={4} required maxLength={2000} />
            </div>
            <Button type="submit" className="w-full bg-gradient-royal text-primary-foreground font-tamil">சேர்</Button>
          </form>

          <div className="parchment rounded-xl p-4">
            <h3 className="font-tamil font-bold text-maroon-deep mb-3">அறிவிப்புகள் ({anns.length})</h3>
            <div className="space-y-2">
              {anns.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-2 p-3 border border-gold/20 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="font-tamil font-semibold">{a.title} {a.rasi && <span className="text-xs text-gold-deep">• {a.rasi}</span>}</div>
                    <div className="text-xs text-muted-foreground">{a.active_date} • {a.active ? "செயலில்" : "முடக்கப்பட்டது"}</div>
                    <div className="text-sm mt-1 font-tamil">{a.message}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button size="icon" variant="ghost" onClick={() => toggleAnn(a)}>
                      {a.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteAnn(a.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {anns.length === 0 && <p className="text-sm text-muted-foreground font-tamil text-center py-4">அறிவிப்புகள் இல்லை</p>}
            </div>
          </div>
        </TabsContent>



        <TabsContent value="users" className="space-y-4 mt-4">
          <div className="parchment rounded-xl p-4">
            <h3 className="font-tamil font-bold text-maroon-deep mb-3">பதிவான பயனர்கள் ({profs.length})</h3>
            <div className="space-y-2">
              {profs.map((p) => (
                <div key={p.id} className="p-3 border border-gold/20 rounded flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-tamil font-semibold">{p.full_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      📞 {p.phone} {p.whatsapp_number && p.whatsapp_number !== p.phone ? `• WA ${p.whatsapp_number}` : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</div>
                  </div>
                  {p.whatsapp_number && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`https://wa.me/${p.whatsapp_number.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>
                    </Button>
                  )}
                </div>
              ))}
              {profs.length === 0 && <p className="text-sm text-muted-foreground font-tamil text-center py-4">பயனர்கள் இல்லை</p>}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Admin;
