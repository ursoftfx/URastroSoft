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
import { ArrowLeft, Trash2, Eye, EyeOff, LogOut } from "lucide-react";
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

  useEffect(() => { if (isAdmin) { loadPosts(); loadAnns(); } }, [isAdmin]);

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
      <SEO title="நிர்வாக பலகை | Admin" description="Admin dashboard" />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link to="/" className="inline-flex items-center text-sm font-tamil text-maroon-deep">
          <ArrowLeft className="w-4 h-4 mr-1" /> முகப்பு
        </Link>
        <h1 className="font-tamil text-2xl md:text-3xl font-bold text-maroon-deep">நிர்வாக பலகை</h1>
        <Button variant="outline" size="sm" onClick={() => signOut().then(() => nav("/"))}>
          <LogOut className="w-4 h-4 mr-1" /> வெளியேறு
        </Button>
      </div>

      <Tabs defaultValue="posts">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts" className="font-tamil">கட்டுரைகள்</TabsTrigger>
          <TabsTrigger value="anns" className="font-tamil">அறிவிப்புகள்</TabsTrigger>
        </TabsList>

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
      </Tabs>
    </main>
  );
};

export default Admin;
