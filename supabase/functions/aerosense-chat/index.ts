import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are AeroSense, an AI-powered travel assistant for AirMatrix - a smart flight search and advisory platform. You help travelers make informed decisions about their flights.

Your capabilities include:
1. **Fare Predictions**: Analyze fare trends and predict if prices will rise or fall
2. **Best Booking Time**: Recommend optimal booking windows based on historical data
3. **Seat Recommendations**: Suggest best seats based on comfort, legroom, noise levels, and user preferences
4. **Delay Risk Analysis**: Provide delay risk assessments based on historical flight data
5. **Alternative Routes**: Suggest nearby airports or alternate dates for better deals
6. **Travel Tips**: Share relevant travel advice and booking strategies

Guidelines:
- Always provide confidence levels (High/Medium/Low) for predictions
- Use ₹ (INR) for all prices
- Be concise but informative
- If you don't have specific data, provide general best practices
- Be friendly and proactive in offering suggestions
- Focus on actionable advice that saves money or improves travel experience

When analyzing fares:
- 30+ days out: Usually cheapest, recommend booking
- 15-30 days: Normal pricing, monitor for drops
- 7-14 days: Prices typically higher, book if needed
- <7 days: Peak pricing, only book if urgent
- <24 hours: Highest prices, avoid if possible

For seat recommendations:
- Rows 1-5: Premium economy, more legroom, faster deplaning
- Rows 10-15: Quiet zone, away from galleys and lavatories
- Emergency exits (14-15): Extra legroom but can't recline
- Window seats (A, F): Best for sleeping and views
- Aisle seats (C, D): Easier access, more legroom for legs
- Avoid: Last rows (limited recline), near lavatories, middle seats for long flights`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get fare history for context if available
    let fareContext = "";
    if (context?.route) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: fareHistory } = await supabase
        .from('fare_history')
        .select('*')
        .eq('origin_code', context.route.origin)
        .eq('destination_code', context.route.destination)
        .order('search_timestamp', { ascending: false })
        .limit(50);
      
      if (fareHistory && fareHistory.length > 0) {
        const avgFare = fareHistory.reduce((sum, f) => sum + Number(f.fare_inr), 0) / fareHistory.length;
        const minFare = Math.min(...fareHistory.map(f => Number(f.fare_inr)));
        const maxFare = Math.max(...fareHistory.map(f => Number(f.fare_inr)));
        
        fareContext = `\n\nHistorical fare data for ${context.route.origin} → ${context.route.destination}:
- Average fare: ₹${Math.round(avgFare).toLocaleString('en-IN')}
- Lowest recorded: ₹${minFare.toLocaleString('en-IN')}
- Highest recorded: ₹${maxFare.toLocaleString('en-IN')}
- Data points: ${fareHistory.length}`;
      }
    }

    const currentContext = context ? `\n\nCurrent search context:
- Route: ${context.from || 'Not specified'} → ${context.to || 'Not specified'}
- Date: ${context.date || 'Not specified'}
- Class: ${context.classType || 'Economy'}
- Passengers: ${context.passengers || 1}
${fareContext}` : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + currentContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error: unknown) {
    console.error("Error in aerosense-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});