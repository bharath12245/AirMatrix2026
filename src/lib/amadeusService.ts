import { Flight, SearchParams } from '@/store/bookingStore';
import { supabase } from '@/integrations/supabase/client';
import { worldAirports, findNearestAirport, Airport } from './airportData';

// Indian airlines for fallback
const indianAirlines = [
  { name: 'IndiGo', code: '6E' },
  { name: 'Air India', code: 'AI' },
  { name: 'SpiceJet', code: 'SG' },
  { name: 'Vistara', code: 'UK' },
  { name: 'AirAsia India', code: 'I5' },
  { name: 'Akasa Air', code: 'QP' },
  { name: 'Go First', code: 'G8' },
  { name: 'Emirates', code: 'EK' },
  { name: 'Qatar Airways', code: 'QR' },
  { name: 'Singapore Airlines', code: 'SQ' },
  { name: 'Etihad Airways', code: 'EY' },
  { name: 'Thai Airways', code: 'TG' },
  { name: 'Lufthansa', code: 'LH' },
  { name: 'British Airways', code: 'BA' },
];

const getRandomAirline = () => indianAirlines[Math.floor(Math.random() * indianAirlines.length)];

const generateFlightNumber = (airlineCode: string) => {
  return `${airlineCode}${Math.floor(Math.random() * 9000) + 1000}`;
};

const generateDuration = (fromAirport: Airport, toAirport: Airport, stops: number) => {
  const R = 6371;
  const dLat = (toAirport.lat - fromAirport.lat) * Math.PI / 180;
  const dLng = (toAirport.lng - fromAirport.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(fromAirport.lat * Math.PI / 180) * Math.cos(toAirport.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  const flightHours = distance / 800;
  const totalMinutes = Math.round((flightHours + 0.5) * 60) + (stops * 90);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const generateTime = (baseHour?: number) => {
  const hours = baseHour !== undefined ? baseHour : Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 12) * 5;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Fallback pricing in INR based on distance and days until flight
const calculateFallbackPrice = (classType: string, daysUntilFlight: number, distance: number): number => {
  // Base price in INR (roughly ₹5-7 per km for economy)
  let basePrice = Math.max(2500, Math.round(distance * 5.5));
  
  if (classType === 'business') basePrice *= 3;
  if (classType === 'first') basePrice *= 6;
  
  // Dynamic pricing based on days until flight
  let multiplier = 1;
  if (daysUntilFlight < 1) multiplier = 2.5;      // <24 hours: Peak
  else if (daysUntilFlight < 7) multiplier = 1.8;  // <7 days: Expensive
  else if (daysUntilFlight < 14) multiplier = 1.4; // 7-14 days: Slightly high
  else if (daysUntilFlight < 30) multiplier = 1.1; // 15-30 days: Normal
  else multiplier = 0.85;                          // 30+ days: Cheapest
  
  return Math.round(basePrice * multiplier + Math.random() * 500);
};

const calculateDistance = (from: Airport, to: Airport): number => {
  const R = 6371;
  const dLat = (to.lat - from.lat) * Math.PI / 180;
  const dLng = (to.lng - from.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Generate fallback flights when Amadeus API is unavailable
const generateFallbackFlights = (
  params: SearchParams,
  fromAirport: Airport,
  toAirport: Airport
): Flight[] => {
  const daysUntilFlight = Math.max(0, Math.ceil(
    (new Date(params.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  ));
  
  const distance = calculateDistance(fromAirport, toAirport);
  const numFlights = Math.floor(Math.random() * 5) + 5;
  const flights: Flight[] = [];
  
  const departureHours = [6, 7, 9, 10, 12, 14, 16, 18, 20, 22];
  
  for (let i = 0; i < numFlights; i++) {
    const airline = getRandomAirline();
    const stops = distance > 3000 ? (Math.random() > 0.4 ? Math.floor(Math.random() * 2) + 1 : 0) : (Math.random() > 0.7 ? 1 : 0);
    const departureHour = departureHours[i % departureHours.length];
    
    // Calculate delay risk based on departure time
    let delayRisk: 'low' | 'medium' | 'high' = 'medium';
    if (departureHour < 9) delayRisk = 'low';
    else if (departureHour > 18) delayRisk = 'high';
    
    flights.push({
      id: `fallback-${Date.now()}-${i}`,
      airline: airline.name,
      airlineCode: airline.code,
      flightNumber: generateFlightNumber(airline.code),
      from: fromAirport.city,
      fromCode: fromAirport.code,
      to: toAirport.city,
      toCode: toAirport.code,
      departureTime: generateTime(departureHour),
      arrivalTime: generateTime(),
      duration: generateDuration(fromAirport, toAirport, stops),
      price: calculateFallbackPrice(params.classType, daysUntilFlight, distance),
      classType: params.classType,
      availableSeats: Math.floor(Math.random() * 50) + 10,
      aircraft: ['Boeing 737', 'Airbus A320', 'Boeing 787', 'Airbus A350', 'Boeing 777', 'ATR 72'][Math.floor(Math.random() * 6)],
      stops,
      delayRisk,
    });
  }
  
  return flights.sort((a, b) => a.price - b.price);
};

export interface AmadeusSearchResult {
  flights: Flight[];
  fromAirport: Airport;
  toAirport: Airport;
  fromNearestInfo?: { originalCity: string; distance: number };
  toNearestInfo?: { originalCity: string; distance: number };
  isRealTime: boolean;
  message?: string;
}

export const searchFlightsWithAmadeus = async (params: SearchParams): Promise<AmadeusSearchResult> => {
  // Find airports for origin and destination
  const fromResult = findNearestAirport(params.from);
  const toResult = findNearestAirport(params.to);
  
  const fromAirport = fromResult?.airport || worldAirports[0];
  const toAirport = toResult?.airport || worldAirports[1];
  
  const result: AmadeusSearchResult = {
    flights: [],
    fromAirport,
    toAirport,
    fromNearestInfo: fromResult && !fromResult.isExactMatch ? { originalCity: params.from, distance: fromResult.distance } : undefined,
    toNearestInfo: toResult && !toResult.isExactMatch ? { originalCity: params.to, distance: toResult.distance } : undefined,
    isRealTime: false,
  };

  try {
    console.log(`Searching Amadeus: ${fromAirport.code} -> ${toAirport.code} on ${params.date}`);
    
    const { data, error } = await supabase.functions.invoke('amadeus-search', {
      body: {
        origin: fromAirport.code,
        destination: toAirport.code,
        date: params.date,
        passengers: params.passengers,
        cabinClass: params.classType,
      },
    });

    if (error) {
      console.error('Amadeus search error:', error);
      throw new Error(error.message);
    }

    if (data.useFallback || !data.flights || data.flights.length === 0) {
      console.log('Using fallback flights:', data.message);
      result.flights = generateFallbackFlights(params, fromAirport, toAirport);
      result.isRealTime = false;
      result.message = data.message || 'Using estimated fares based on historical trends';
    } else {
      // Map Amadeus flights to our Flight type
      result.flights = data.flights.map((f: any) => ({
        id: f.id,
        airline: f.airline,
        airlineCode: f.airlineCode,
        flightNumber: f.flightNumber,
        from: fromAirport.city,
        fromCode: f.fromCode,
        to: toAirport.city,
        toCode: f.toCode,
        departureTime: f.departureTime,
        arrivalTime: f.arrivalTime,
        duration: f.duration,
        price: f.price,
        classType: params.classType,
        availableSeats: f.availableSeats,
        aircraft: f.aircraft,
        stops: f.stops,
        delayRisk: f.delayRisk,
      }));
      result.isRealTime = true;
      result.message = `Found ${data.flights.length} real-time flights`;
    }
  } catch (error) {
    console.error('Error fetching from Amadeus:', error);
    result.flights = generateFallbackFlights(params, fromAirport, toAirport);
    result.isRealTime = false;
    result.message = 'Using estimated fares (API temporarily unavailable)';
  }

  // Store the search in database for analytics
  try {
    const lowestFare = result.flights.length > 0 ? Math.min(...result.flights.map(f => f.price)) : null;
    
    await supabase.from('flight_searches').insert({
      origin_city: params.from,
      origin_code: fromAirport.code,
      destination_city: params.to,
      destination_code: toAirport.code,
      departure_date: params.date,
      passengers: params.passengers,
      cabin_class: params.classType.toUpperCase(),
      lowest_fare_found: lowestFare,
    });
  } catch (e) {
    console.error('Error logging search:', e);
  }

  return result;
};

// Get fare calendar with real + historical data
export const getFareCalendarWithHistory = async (
  from: string, 
  to: string
): Promise<{ date: string; price: number; level: 'low' | 'medium' | 'high'; isHistorical: boolean }[]> => {
  const fromResult = findNearestAirport(from);
  const toResult = findNearestAirport(to);
  const fromAirport = fromResult?.airport || worldAirports[0];
  const toAirport = toResult?.airport || worldAirports[1];
  
  const today = new Date();
  const fares: { date: string; price: number; level: 'low' | 'medium' | 'high'; isHistorical: boolean }[] = [];
  
  // Try to get historical data
  let historicalData: any[] = [];
  try {
    const { data } = await supabase
      .from('fare_history')
      .select('departure_date, fare_inr')
      .eq('origin_code', fromAirport.code)
      .eq('destination_code', toAirport.code)
      .gte('departure_date', today.toISOString().split('T')[0])
      .order('departure_date');
    
    if (data) {
      historicalData = data;
    }
  } catch (e) {
    console.error('Error fetching fare history:', e);
  }
  
  // Create fare map from historical data
  const fareMap = new Map<string, number[]>();
  historicalData.forEach((record) => {
    const dateKey = record.departure_date;
    if (!fareMap.has(dateKey)) {
      fareMap.set(dateKey, []);
    }
    fareMap.get(dateKey)!.push(Number(record.fare_inr));
  });
  
  // Calculate base price from distance
  const distance = calculateDistance(fromAirport, toAirport);
  const basePrice = Math.max(3000, Math.round(distance * 5.5));
  
  // Generate 30-day calendar
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    let price: number;
    let isHistorical = false;
    
    // Check if we have historical data for this date
    if (fareMap.has(dateStr)) {
      const prices = fareMap.get(dateStr)!;
      price = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      isHistorical = true;
    } else {
      // Estimate based on day of week and days until flight
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      price = basePrice;
      if (isWeekend) price *= 1.25;
      if (i < 7) price *= 1.5;
      else if (i < 14) price *= 1.2;
      else if (i > 21) price *= 0.9;
      
      price = Math.round(price + (Math.random() * 1000 - 500));
    }
    
    // Determine level based on price range
    const avgPrice = basePrice * 1.15;
    let level: 'low' | 'medium' | 'high' = 'medium';
    if (price < avgPrice * 0.9) level = 'low';
    else if (price > avgPrice * 1.3) level = 'high';
    
    fares.push({ date: dateStr, price, level, isHistorical });
  }
  
  return fares;
};