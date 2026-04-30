import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ArrowLeft } from "lucide-react";

interface Post {
  id: string; title: string; slug: string; excerpt: string | null;
  body: string; cover_image_url: string | null; published_at: string | null;
}

export const PostsList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    supabase
      .from("posts")
      .select("id, title, slug, excerpt, body, cover_image_url, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => setPosts((data as Post[]) || []));
  }, []);

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-10">
      <SEO title="ஜோதிட கட்டுரைகள் | Tamil Astrology Articles" description="Tamil Vedic astrology articles, tips and guidance." />
      <Link to="/" className="inline-flex items-center text-sm font-tamil text-maroon-deep mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> முகப்பு
      </Link>
      <h1 className="font-tamil text-3xl md:text-4xl font-bold text-maroon-deep mb-2">ஜோதிட கட்டுரைகள்</h1>
      <div className="temple-divider mb-8 max-w-md" />
      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((p) => (
          <Link key={p.id} to={`/posts/${p.slug}`} className="parchment rounded-xl p-5 block hover:shadow-gold transition-shadow">
            {p.cover_image_url && (
              <img src={p.cover_image_url} alt={p.title} loading="lazy" className="w-full h-40 object-cover rounded mb-3" />
            )}
            <h2 className="font-tamil text-lg font-bold text-maroon-deep">{p.title}</h2>
            <p className="text-sm text-muted-foreground font-tamil mt-2 line-clamp-3">{p.excerpt || p.body.slice(0, 160)}</p>
            <div className="text-xs text-gold-deep mt-3">{p.published_at && new Date(p.published_at).toLocaleDateString("ta-IN")}</div>
          </Link>
        ))}
        {posts.length === 0 && <p className="font-tamil text-muted-foreground col-span-full text-center py-10">கட்டுரைகள் இல்லை.</p>}
      </div>
      <WhatsAppButton message="வணக்கம்! ஜாதக ஆலோசனை வேண்டும்." />
    </main>
  );
};

export const PostDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!slug) return;
    supabase
      .from("posts")
      .select("id, title, slug, excerpt, body, cover_image_url, published_at")
      .eq("slug", slug).eq("published", true).maybeSingle()
      .then(({ data }) => { setPost(data as Post | null); setLoading(false); });
  }, [slug]);

  if (loading) return <div className="p-10 text-center font-tamil">ஏற்றுகிறது...</div>;
  if (!post) return (
    <div className="p-10 text-center font-tamil">
      கட்டுரை கிடைக்கவில்லை. <Link to="/posts" className="text-maroon-deep underline">அனைத்து கட்டுரைகள்</Link>
    </div>
  );

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-4 py-10">
      <SEO title={`${post.title} | ஜோதிடம்`} description={post.excerpt || post.body.slice(0, 155)} />
      <Link to="/posts" className="inline-flex items-center text-sm font-tamil text-maroon-deep mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> கட்டுரைகள்
      </Link>
      <article className="parchment rounded-2xl p-6 md:p-10">
        {post.cover_image_url && (
          <img src={post.cover_image_url} alt={post.title} className="w-full max-h-80 object-cover rounded-xl mb-6" />
        )}
        <h1 className="font-tamil text-3xl md:text-4xl font-bold text-maroon-deep mb-2">{post.title}</h1>
        {post.published_at && <div className="text-xs text-gold-deep mb-6">{new Date(post.published_at).toLocaleDateString("ta-IN", { dateStyle: "long" })}</div>}
        <div className="font-tamil text-foreground/90 leading-relaxed whitespace-pre-wrap text-base md:text-lg">{post.body}</div>
      </article>
      <WhatsAppButton message="வணக்கம்! ஆலோசனை வேண்டும்." />
    </main>
  );
};
