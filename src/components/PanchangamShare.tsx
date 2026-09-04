import { useCallback } from "react";
import { toast } from "sonner";
import { Copy, Facebook, Instagram, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  /** Share text (Tamil panchangam summary). The site URL is appended automatically. */
  message: string;
  className?: string;
  compact?: boolean;
}

const SITE_URL = "https://kanagadara.lovable.app/panchangam";

export const PanchangamShare = ({ message, className, compact = false }: Props) => {
  const shareText = `${message}\n${SITE_URL}`;

  const doShare = useCallback(
    async (network: "facebook" | "whatsapp" | "instagram") => {
      const url = typeof window !== "undefined" ? window.location.href : SITE_URL;

      if (network === "whatsapp") {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
        return;
      }

      if (network === "facebook") {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`;
        window.open(fbUrl, "_blank", "noopener,noreferrer,width=600,height=560");
        return;
      }

      // Instagram has no web share-by-link endpoint — copy the text so the
      // user can paste it into a story / DM, then open Instagram.
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("பங்காங்க விவரம் நகலெடுக்கப்பட்டது — Instagram-ல் ஒட்டவும்");
      } catch {
        toast.error("நகலெடுக்க முடியவில்லை");
      }
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    },
    [message, shareText]
  );

  const nativeShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "பஞ்சாங்கம் — AMMAN SOFTWARES", text: message, url: SITE_URL });
        return;
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("விவரங்கள் நகலெடுக்கப்பட்டது");
    } catch {
      toast.error("நகலெடுக்க முடியவில்லை");
    }
  }, [message, shareText]);

  const btn = compact
    ? "h-9 w-9 p-0 rounded-full"
    : "h-9 px-3 rounded-full font-tamil text-xs font-bold";

  return (
    <div className={cn("flex items-center gap-2 flex-wrap no-print", className)} role="group" aria-label="பஞ்சாங்கத்தை பகிர்">
      <span className="font-tamil text-xs font-bold text-maroon-deep inline-flex items-center gap-1">
        <Share2 className="w-3.5 h-3.5 text-gold-deep" /> பகிர்:
      </span>
      <Button
        type="button"
        size="sm"
        onClick={() => doShare("whatsapp")}
        aria-label="WhatsApp-ல் பகிர்"
        className={cn(btn, "bg-whatsapp hover:bg-whatsapp-deep text-white border-0")}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className={compact ? "w-4 h-4" : "w-4 h-4 mr-1.5"} aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        {!compact && "WhatsApp"}
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={() => doShare("facebook")}
        aria-label="Facebook-ல் பகிர்"
        className={cn(btn, "bg-[#1877F2] hover:bg-[#0f5bd0] text-white border-0")}
      >
        <Facebook className={compact ? "w-4 h-4" : "w-4 h-4 mr-1.5"} />
        {!compact && "Facebook"}
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={() => doShare("instagram")}
        aria-label="Instagram-ல் பகிர்"
        className={cn(btn, "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:opacity-90 text-white border-0")}
      >
        <Instagram className={compact ? "w-4 h-4" : "w-4 h-4 mr-1.5"} />
        {!compact && "Instagram"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={nativeShare}
        aria-label="பிற செயலிகளில் பகிர் / நகலெடு"
        className={cn(btn, "font-tamil text-maroon-deep border-gold/40")}
      >
        <Copy className={compact ? "w-4 h-4" : "w-3.5 h-3.5 mr-1"} />
        {!compact && "நகல்"}
      </Button>
    </div>
  );
};
