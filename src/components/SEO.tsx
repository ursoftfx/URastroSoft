import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
  noIndex?: boolean;
  keywords?: string;
}

/** Lightweight head manager — sets title, meta description, canonical, optional JSON-LD. */
export const SEO = ({ title, description, canonical, jsonLd, noIndex = false, keywords }: SEOProps) => {
  useEffect(() => {
    document.title = title.length > 60 ? title.slice(0, 57) + "…" : title;

    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const desc = description.length > 160 ? description.slice(0, 157) + "…" : description;
    setMeta("description", desc);
    setMeta("og:title", title, "property");
    setMeta("og:description", desc, "property");
    setMeta("twitter:title", title);
    setMeta("twitter:description", desc);
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    if (keywords) setMeta("keywords", keywords);

    const href = canonical || window.location.href.split("?")[0].split("#")[0];
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;

    const ldNodes: HTMLScriptElement[] = [];
    if (jsonLd) {
      const list = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      list.forEach((schema) => {
        const ld = document.createElement("script");
        ld.type = "application/ld+json";
        ld.text = JSON.stringify(schema);
        document.head.appendChild(ld);
        ldNodes.push(ld);
      });
    }
    return () => {
      ldNodes.forEach((n) => n.parentNode && n.parentNode.removeChild(n));
    };
  }, [title, description, canonical, jsonLd, noIndex, keywords]);

  return null;
};
