import { MessageCircle } from "lucide-react";

interface Props {
  phone?: string; // E.164 without +, e.g. 919600543617
  message?: string;
}

const DEFAULT_PHONE = "919600543617"; // 9600543617 with India country code

export const WhatsAppButton = ({ phone = DEFAULT_PHONE, message }: Props) => {
  const url = `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp மூலம் ஆலோசனை பெற"
      className="fixed bottom-6 right-6 z-50 group"
    >
      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-30" />
      <span className="relative flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-tamil font-semibold py-3 pl-4 pr-5 rounded-full shadow-2xl border-2 border-white/40 transition-all">
        <MessageCircle className="w-6 h-6 fill-white" />
        <span className="hidden sm:inline">WhatsApp</span>
      </span>
    </a>
  );
};
