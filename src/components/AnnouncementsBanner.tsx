import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone } from "lucide-react";

interface Ann { id: string; title: string; message: string; rasi: string | null; }

export const AnnouncementsBanner = () => {
  const [items, setItems] = useState<Ann[]>([]);
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("announcements")
      .select("id, title, message, rasi")
      .eq("active", true)
      .lte("active_date", today)
      .order("active_date", { ascending: false })
      .limit(5)
      .then(({ data }) => setItems((data as Ann[]) || []));
  }, []);

  if (items.length === 0) return null;
  return (
    <div className="max-w-3xl mx-auto mb-6 parchment rounded-xl p-4">
      <div className="flex items-center gap-2 text-maroon-deep font-tamil font-bold mb-2">
        <Megaphone className="w-5 h-5 text-gold-deep" /> அறிவிப்புகள்
      </div>
      <ul className="space-y-2 font-tamil text-sm">
        {items.map((a) => (
          <li key={a.id} className="border-l-2 border-gold/40 pl-3">
            <div className="font-semibold text-maroon-deep">
              {a.title} {a.rasi && <span className="text-xs text-gold-deep">• {a.rasi}</span>}
            </div>
            <div className="text-foreground/80">{a.message}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};
