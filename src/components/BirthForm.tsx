import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLACES } from "@/lib/places";
import { BirthInput } from "@/lib/jathagam";
import { Sparkles, MapPin, Calendar, Clock, User, Phone } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  onSubmit: (input: BirthInput) => void;
  loading?: boolean;
}

export const BirthForm = ({ onSubmit, loading }: Props) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("ஆண்");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [placeOpen, setPlaceOpen] = useState(false);
  const [place, setPlace] = useState("");

  const placeData = useMemo(() => PLACES.find((p) => p.name === place), [place]);

  const phoneDigits = phone.replace(/\D/g, "");
  const phoneValid = phoneDigits.length >= 7 && phoneDigits.length <= 15;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phoneValid || !date || !time || !placeData) return;
    const [yyyy, mm, dd] = date.split("-").map(Number);
    const [hh, min] = time.split(":").map(Number);
    onSubmit({
      year: yyyy,
      month: mm,
      day: dd,
      hour: hh,
      minute: min,
      tzOffsetHours: placeData.tz,
      latitude: placeData.lat,
      longitude: placeData.lon,
      placeName: placeData.name,
      name,
      gender,
      phone: phone.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="parchment p-6 md:p-8 rounded-2xl space-y-5 animate-fade-up">
      <div className="text-center mb-6">
        <div className="font-tamil text-2xl md:text-3xl text-maroon-deep font-bold">
          பிறப்பு விவரங்கள்
        </div>
        <div className="text-muted-foreground text-sm mt-1 font-tamil">
          உங்கள் ஜாதகத்தை அறிய தகவல்களை பூர்த்தி செய்யவும்
        </div>
        <div className="temple-divider mt-4" />
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="font-tamil flex items-center gap-2 text-maroon-deep">
          <User className="w-4 h-4" /> பெயர்
        </Label>
        <Input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="உங்கள் பெயர்"
          className="font-tamil bg-cream/50 border-gold/40 focus-visible:ring-accent"
        />
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label className="font-tamil text-maroon-deep">பாலினம்</Label>
        <div className="flex gap-2">
          {["ஆண்", "பெண்", "மற்றவை"].map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => setGender(g)}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg border font-tamil transition-all",
                gender === g
                  ? "bg-gradient-royal text-primary-foreground border-gold shadow-soft"
                  : "bg-cream/50 border-gold/30 text-foreground hover:border-gold"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="date" className="font-tamil flex items-center gap-2 text-maroon-deep">
            <Calendar className="w-4 h-4" /> பிறந்த தேதி
          </Label>
          <Input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-cream/50 border-gold/40 focus-visible:ring-accent"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time" className="font-tamil flex items-center gap-2 text-maroon-deep">
            <Clock className="w-4 h-4" /> பிறந்த நேரம்
          </Label>
          <Input
            id="time"
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-cream/50 border-gold/40 focus-visible:ring-accent"
          />
        </div>
      </div>

      {/* Place */}
      <div className="space-y-2">
        <Label className="font-tamil flex items-center gap-2 text-maroon-deep">
          <MapPin className="w-4 h-4" /> பிறந்த ஊர்
        </Label>
        <Popover open={placeOpen} onOpenChange={setPlaceOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between bg-cream/50 border-gold/40 hover:bg-cream font-normal",
                !place && "text-muted-foreground"
              )}
            >
              {place || "ஊரை தேர்ந்தெடுக்கவும்..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover z-50">
            <Command>
              <CommandInput placeholder="ஊரை தேடவும்..." />
              <CommandList>
                <CommandEmpty>ஊர் கிடைக்கவில்லை</CommandEmpty>
                <CommandGroup>
                  {PLACES.map((p) => (
                    <CommandItem
                      key={p.name}
                      value={p.name}
                      onSelect={() => {
                        setPlace(p.name);
                        setPlaceOpen(false);
                      }}
                    >
                      {p.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Button
        type="submit"
        disabled={loading || !name || !date || !time || !placeData}
        className="w-full bg-gradient-royal hover:opacity-95 text-primary-foreground font-tamil text-lg py-6 shadow-royal border border-gold/40"
      >
        <Sparkles className="w-5 h-5 mr-2 text-gold-bright" />
        {loading ? "ஜாதகம் கணிக்கப்படுகிறது..." : "ஜாதகம் பார்க்கவும்"}
      </Button>
    </form>
  );
};
