import { Link, useParams } from "react-router-dom";
import { ARTICLES, findArticle } from "@/data/articles";
import { SEO } from "@/components/SEO";
import { SiteFooter } from "@/components/SiteFooter";
import { ArrowLeft, Calendar } from "lucide-react";

export const ArticlesList = () => {
  return (
    <>
      <main className="min-h-screen max-w-5xl mx-auto px-4 py-10">
        <SEO
          title="தமிழ் ஜோதிட கட்டுரைகள் | Tamil Astrology Articles"
          description="ஜாதகம், நட்சத்திரம், ராசி, தசை, பொருத்தம், நவகிரகம், தோஷம் — விரிவான தமிழ் ஜோதிட கட்டுரைகள்."
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "UR ASTRO SOFT — Tamil Astrology Articles",
            url: "https://kanagadara.lovable.app/articles",
            inLanguage: "ta",
          }}
        />
        <Link to="/" className="inline-flex items-center text-sm font-tamil text-maroon-deep mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> முகப்பு
        </Link>
        <h1 className="font-tamil text-3xl md:text-4xl font-bold text-maroon-deep mb-2">
          தமிழ் ஜோதிட கட்டுரைகள்
        </h1>
        <p className="font-tamil text-muted-foreground mb-8 max-w-2xl">
          ஜாதகம், ராசி, நட்சத்திரம், திருமண பொருத்தம், நவகிரகம், தோஷ பரிகாரம் — அனைத்து தலைப்புகளிலும் விரிவான தமிழ் கட்டுரைகள்.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          {ARTICLES.map((a) => (
            <Link
              key={a.slug}
              to={`/articles/${a.slug}`}
              className="parchment rounded-xl p-5 block hover:shadow-gold transition-shadow"
            >
              <h2 className="font-tamil text-lg font-bold text-maroon-deep mb-2">{a.title}</h2>
              <p className="font-tamil text-sm text-muted-foreground line-clamp-3">{a.excerpt}</p>
              <div className="flex items-center gap-1 text-xs text-gold-deep mt-3">
                <Calendar className="w-3 h-3" />
                {new Date(a.date).toLocaleDateString("ta-IN", { dateStyle: "long" })}
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
};

export const ArticleDetail = () => {
  const { slug } = useParams();
  const article = findArticle(slug);

  if (!article) {
    return (
      <main className="min-h-screen flex items-center justify-center p-10 font-tamil">
        <div className="text-center">
          <p className="mb-4">கட்டுரை கிடைக்கவில்லை.</p>
          <Link to="/articles" className="text-maroon-deep underline">அனைத்து கட்டுரைகள்</Link>
        </div>
      </main>
    );
  }

  const related = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 4);

  return (
    <>
      <main className="min-h-screen max-w-3xl mx-auto px-4 py-10">
        <SEO
          title={`${article.title} | UR ASTRO SOFT`}
          description={article.excerpt}
          canonical={`https://kanagadara.lovable.app/articles/${article.slug}`}
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.excerpt,
            datePublished: article.date,
            inLanguage: "ta",
            author: { "@type": "Organization", name: "UR ASTRO SOFT" },
            publisher: { "@type": "Organization", name: "UR ASTRO SOFT" },
            mainEntityOfPage: `https://kanagadara.lovable.app/articles/${article.slug}`,
          }}
        />
        <nav aria-label="Breadcrumb" className="text-xs font-tamil text-muted-foreground mb-4">
          <Link to="/" className="hover:text-maroon-deep">முகப்பு</Link> ›{" "}
          <Link to="/articles" className="hover:text-maroon-deep">கட்டுரைகள்</Link> ›{" "}
          <span className="text-foreground">{article.title}</span>
        </nav>

        <article className="parchment rounded-2xl p-6 md:p-10">
          <h1 className="font-tamil text-3xl md:text-4xl font-bold text-maroon-deep mb-3">
            {article.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-gold-deep mb-6">
            <Calendar className="w-3 h-3" />
            {new Date(article.date).toLocaleDateString("ta-IN", { dateStyle: "long" })}
          </div>
          <div
            className="font-tamil text-foreground/90 leading-relaxed prose prose-sm md:prose-base max-w-none [&_h2]:font-tamil [&_h2]:text-maroon-deep [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_p]:my-3 [&_a]:text-maroon-deep [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        </article>

        <section className="mt-10">
          <h2 className="font-tamil text-xl font-bold text-maroon-deep mb-4">தொடர்புடைய கட்டுரைகள்</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/articles/${r.slug}`}
                className="block parchment rounded-lg p-4 hover:shadow-gold transition-shadow"
              >
                <h3 className="font-tamil font-bold text-maroon-deep text-sm">{r.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
};
