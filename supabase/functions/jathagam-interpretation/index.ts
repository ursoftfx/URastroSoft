// Edge function: streams Tamil horoscope interpretation
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jathagam } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build a structured summary of the chart for the model
    const planetLines = jathagam.planets
      .map(
        (p: any) =>
          `${p.nameTamil}: ${p.rasiTamil} ராசி (${p.degreeInRasi.toFixed(2)}°), ${p.nakshatraTamil} ${p.pada}-ம் பாதம்`
      )
      .join("\n");

    const dashaLines = jathagam.dashaSequence
      .slice(0, 5)
      .map(
        (d: any) =>
          `${d.lord} தசை: ${new Date(d.startDate).toLocaleDateString("ta-IN")} → ${new Date(
            d.endDate
          ).toLocaleDateString("ta-IN")}`
      )
      .join("\n");

    const userPrompt = `கீழே ஒரு நபரின் ஜாதக விவரங்கள் கொடுக்கப்பட்டுள்ளன:

பெயர்: ${jathagam.input.name}
பாலினம்: ${jathagam.input.gender}
பிறந்த தேதி: ${jathagam.input.day}/${jathagam.input.month}/${jathagam.input.year}
பிறந்த நேரம்: ${jathagam.input.hour}:${String(jathagam.input.minute).padStart(2, "0")}
பிறந்த ஊர்: ${jathagam.input.placeName}

லக்னம்: ${jathagam.lagnaTamil}
சந்திர ராசி: ${jathagam.rasiTamil}
நட்சத்திரம்: ${jathagam.nakshatraTamil} (${jathagam.pada}-ம் பாதம்)
நட்சத்திர அதிபதி: ${jathagam.nakshatraLordTamil}

கிரக நிலைகள்:
${planetLines}

தற்போதைய தசை: ${jathagam.currentDasha.lord} (${new Date(jathagam.currentDasha.startDate).toLocaleDateString("ta-IN")} → ${new Date(jathagam.currentDasha.endDate).toLocaleDateString("ta-IN")})

வரும் தசைகள்:
${dashaLines}

இந்த ஜாதகத்தை அடிப்படையாக கொண்டு, பாரம்பரிய தமிழ் வேத ஜோதிட பாணியில் விரிவான பலன் எழுதுங்கள். கீழ்க்கண்ட பகுதிகளை உள்ளடக்கவும்:

1. **பொது குணாதிசயம்** - ராசி, லக்னம், நட்சத்திரத்தின் அடிப்படையில்
2. **கல்வி & அறிவாற்றல்**
3. **தொழில் & பொருளாதாரம்**
4. **காதல் & திருமணம்**
5. **குடும்பம் & ஆரோக்கியம்**
6. **தற்போதைய தசை பலன்** - ${jathagam.currentDasha.lord} தசையின் விளைவுகள்
7. **பரிகாரங்கள்** - பாரம்பரிய பரிகார வழிமுறைகள்

தலைப்புகளை ## குறியீட்டுடன் தெளிவாக பிரித்து, தமிழில் மட்டும் எழுதுங்கள். மரியாதையுடன், ஆழமாக, பாரம்பரிய ஜோதிட நுட்பங்களுடன் எழுதுங்கள்.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "நீங்கள் ஒரு அனுபவம் வாய்ந்த தமிழ் வேத ஜோதிடர். பாரம்பரிய ஜாதக பலன்களை தமிழில் மட்டும், மரியாதையுடன், அழகிய இலக்கிய நடையில் எழுதுவீர்கள். ஆங்கில வார்த்தைகளை தவிர்க்கவும்.",
          },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "அதிக கோரிக்கைகள். சிறிது நேரம் கழித்து முயற்சிக்கவும்." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "உங்கள் பணியிட கணக்கில் கிரெடிட் சேர்க்கவும்." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("jathagam error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
