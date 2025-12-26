import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AmadeusTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FlightOffer {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  classType: string;
  availableSeats: number;
  aircraft: string;
  stops: number;
  delayRisk: 'low' | 'medium' | 'high';
  isRealTime: boolean;
}

// Airline names mapping
const airlineNames: Record<string, string> = {
  '6E': 'IndiGo',
  'AI': 'Air India',
  'SG': 'SpiceJet',
  'UK': 'Vistara',
  'I5': 'AirAsia India',
  'G8': 'Go First',
  'QP': 'Akasa Air',
  'EK': 'Emirates',
  'QR': 'Qatar Airways',
  'SQ': 'Singapore Airlines',
  'LH': 'Lufthansa',
  'BA': 'British Airways',
  'AF': 'Air France',
  'DL': 'Delta Airlines',
  'UA': 'United Airlines',
  'AA': 'American Airlines',
  'TG': 'Thai Airways',
  'MH': 'Malaysia Airlines',
  'CX': 'Cathay Pacific',
  'JL': 'Japan Airlines',
  'NH': 'All Nippon Airways',
  'KE': 'Korean Air',
  'OZ': 'Asiana Airlines',
  'ET': 'Ethiopian Airlines',
  'WY': 'Oman Air',
  'GF': 'Gulf Air',
  'MS': 'EgyptAir',
  'TK': 'Turkish Airlines',
  'EY': 'Etihad Airways',
  'FZ': 'flydubai',
  'WS': 'WestJet',
  'AC': 'Air Canada',
  'KL': 'KLM',
  'LX': 'Swiss International',
  'OS': 'Austrian Airlines',
  'AY': 'Finnair',
  'SK': 'SAS',
  'IB': 'Iberia',
  'VY': 'Vueling',
  'FR': 'Ryanair',
  'U2': 'easyJet',
};

// Get OAuth token from Amadeus
async function getAmadeusToken(): Promise<string | null> {
  const apiKey = Deno.env.get("AMADEUS_API_KEY");
  const apiSecret = Deno.env.get("AMADEUS_API_SECRET");

  if (!apiKey || !apiSecret) {
    console.error("Amadeus API credentials not configured");
    return null;
  }

  try {
    const response = await fetch("https://api.amadeus.com/v1/security/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`,
    });

    if (!response.ok) {
      console.error("Failed to get Amadeus token:", response.status, await response.text());
      return null;
    }

    const data: AmadeusTokenResponse = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting Amadeus token:", error);
    return null;
  }
}

// Parse ISO duration (PT2H30M) to readable format
function parseDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return isoDuration;
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  
  return `${hours}h ${minutes}m`;
}

// Calculate total duration from segments
function calculateTotalDuration(segments: any[]): string {
  let totalMinutes = 0;
  
  for (const segment of segments) {
    const match = segment.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (match) {
      const hours = match[1] ? parseInt(match[1]) : 0;
      const minutes = match[2] ? parseInt(match[2]) : 0;
      totalMinutes += hours * 60 + minutes;
    }
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}h ${minutes}m`;
}

// Transform Amadeus response to our format
function transformAmadeusResponse(amadeusData: any): FlightOffer[] {
  const flights: FlightOffer[] = [];
  
  if (!amadeusData.data || !Array.isArray(amadeusData.data)) {
    return flights;
  }

  const dictionaries = amadeusData.dictionaries || {};
  
  for (const offer of amadeusData.data) {
    try {
      const itinerary = offer.itineraries[0];
      const segments = itinerary.segments;
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];
      
      const carrierCode = firstSegment.carrierCode;
      const airlineName = airlineNames[carrierCode] || dictionaries.carriers?.[carrierCode] || carrierCode;
      
      // Calculate delay risk based on departure time
      const departureHour = parseInt(firstSegment.departure.at.split('T')[1].split(':')[0]);
      let delayRisk: 'low' | 'medium' | 'high' = 'medium';
      if (departureHour < 9) delayRisk = 'low';
      else if (departureHour > 18) delayRisk = 'high';
      
      const flight: FlightOffer = {
        id: `amadeus-${offer.id}`,
        airline: airlineName,
        airlineCode: carrierCode,
        flightNumber: `${carrierCode}${firstSegment.number}`,
        from: firstSegment.departure.iataCode,
        fromCode: firstSegment.departure.iataCode,
        to: lastSegment.arrival.iataCode,
        toCode: lastSegment.arrival.iataCode,
        departureTime: firstSegment.departure.at.split('T')[1].substring(0, 5),
        arrivalTime: lastSegment.arrival.at.split('T')[1].substring(0, 5),
        duration: calculateTotalDuration(segments),
        price: Math.round(parseFloat(offer.price.total)),
        classType: offer.travelerPricings[0].fareDetailsBySegment[0].cabin?.toLowerCase() || 'economy',
        availableSeats: offer.numberOfBookableSeats || Math.floor(Math.random() * 50) + 10,
        aircraft: dictionaries.aircraft?.[firstSegment.aircraft?.code] || firstSegment.aircraft?.code || 'Aircraft',
        stops: segments.length - 1,
        delayRisk,
        isRealTime: true,
      };
      
      flights.push(flight);
    } catch (e) {
      console.error("Error parsing flight offer:", e);
    }
  }
  
  return flights;
}

// Store fare history in database
async function storeFareHistory(supabase: any, flights: FlightOffer[], origin: string, destination: string, date: string) {
  try {
    const fareRecords = flights.map(flight => ({
      origin_code: origin,
      destination_code: destination,
      departure_date: date,
      fare_inr: flight.price,
      airline: flight.airline,
      flight_number: flight.flightNumber,
      cabin_class: flight.classType.toUpperCase(),
      stops: flight.stops,
      duration_minutes: parseDurationToMinutes(flight.duration),
    }));
    
    const { error } = await supabase.from('fare_history').insert(fareRecords);
    
    if (error) {
      console.error("Error storing fare history:", error);
    } else {
      console.log(`Stored ${fareRecords.length} fare records`);
    }
  } catch (e) {
    console.error("Error in storeFareHistory:", e);
  }
}

function parseDurationToMinutes(duration: string): number {
  const match = duration.match(/(\d+)h\s*(\d+)m/);
  if (!match) return 0;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination, date, passengers, cabinClass } = await req.json();

    console.log(`Searching flights: ${origin} -> ${destination} on ${date}`);

    // Get Amadeus token
    const token = await getAmadeusToken();
    
    if (!token) {
      console.log("No Amadeus token, returning fallback indicator");
      return new Response(
        JSON.stringify({ 
          flights: [], 
          useFallback: true,
          message: "API unavailable, using fallback pricing" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Amadeus search URL
    const searchParams = new URLSearchParams({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: date,
      adults: String(passengers || 1),
      currencyCode: "INR",
      max: "20",
    });

    if (cabinClass && cabinClass !== 'economy') {
      searchParams.append('travelClass', cabinClass.toUpperCase());
    }

    const searchUrl = `https://api.amadeus.com/v2/shopping/flight-offers?${searchParams}`;
    console.log("Amadeus search URL:", searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Amadeus API error:", response.status, errorText);
      
      // Check for rate limiting or other recoverable errors
      if (response.status === 429 || response.status >= 500) {
        return new Response(
          JSON.stringify({ 
            flights: [], 
            useFallback: true,
            message: "API rate limited or unavailable" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          flights: [], 
          useFallback: true,
          message: "API error, using fallback" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amadeusData = await response.json();
    console.log(`Amadeus returned ${amadeusData.data?.length || 0} offers`);

    const flights = transformAmadeusResponse(amadeusData);

    // Store fare history
    if (flights.length > 0) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Store in background without blocking response
      storeFareHistory(supabase, flights, origin, destination, date).catch(console.error);
      
    }

    return new Response(
      JSON.stringify({ 
        flights, 
        useFallback: false,
        count: flights.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in amadeus-search:", error);
    return new Response(
      JSON.stringify({ 
        flights: [], 
        useFallback: true,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});