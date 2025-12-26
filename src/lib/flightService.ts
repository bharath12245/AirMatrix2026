import { Flight, Seat, SearchParams } from '@/store/bookingStore';
import { worldAirports, findNearestAirport, Airport } from './airportData';

const airlines = [
  { name: 'Air India', code: 'AI' },
  { name: 'IndiGo', code: '6E' },
  { name: 'SpiceJet', code: 'SG' },
  { name: 'Vistara', code: 'UK' },
  { name: 'Akasa Air', code: 'QP' },
  { name: 'AirAsia India', code: 'I5' },
  { name: 'Emirates', code: 'EK' },
  { name: 'Qatar Airways', code: 'QR' },
  { name: 'Singapore Airlines', code: 'SQ' },
  { name: 'Lufthansa', code: 'LH' },
  { name: 'British Airways', code: 'BA' },
  { name: 'Air France', code: 'AF' },
  { name: 'Etihad Airways', code: 'EY' },
  { name: 'Thai Airways', code: 'TG' },
];

export const getAirports = () => worldAirports;

const getRandomAirline = () => airlines[Math.floor(Math.random() * airlines.length)];

const generateFlightNumber = (airlineCode: string) => {
  return `${airlineCode}${Math.floor(Math.random() * 9000) + 1000}`;
};

// Calculate distance between two airports in km
const calculateDistance = (fromAirport: Airport, toAirport: Airport): number => {
  const R = 6371;
  const dLat = (toAirport.lat - fromAirport.lat) * Math.PI / 180;
  const dLng = (toAirport.lng - fromAirport.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(fromAirport.lat * Math.PI / 180) * Math.cos(toAirport.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate duration based on distance with layover time for stops
const calculateDuration = (distance: number, stops: number): { hours: number; minutes: number; totalMinutes: number } => {
  // Average cruising speed: 850 km/h
  // Add 30 min for takeoff/landing per segment
  // Add 90 min for each layover
  const flightHours = distance / 850;
  const totalMinutes = Math.round((flightHours + 0.5) * 60) + (stops * 90);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes, totalMinutes };
};

// Generate realistic departure times based on route type
const generateDepartureTime = (distance: number): string => {
  // Short haul: 6 AM - 10 PM
  // Long haul: Any time (24h)
  const isLongHaul = distance > 3000;
  
  let hours: number;
  if (isLongHaul) {
    hours = Math.floor(Math.random() * 24);
  } else {
    hours = Math.floor(Math.random() * 17) + 5; // 5 AM to 10 PM
  }
  const minutes = Math.floor(Math.random() * 12) * 5;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Calculate accurate arrival time based on departure and duration
// Takes into account timezone differences
const calculateArrivalTime = (
  departureTime: string, 
  durationMinutes: number, 
  fromAirport: Airport, 
  toAirport: Airport
): string => {
  const [depHours, depMinutes] = departureTime.split(':').map(Number);
  
  // Calculate timezone difference (approximate based on longitude)
  // Each 15 degrees = 1 hour
  const fromTzOffset = Math.round(fromAirport.lng / 15);
  const toTzOffset = Math.round(toAirport.lng / 15);
  const tzDiffMinutes = (toTzOffset - fromTzOffset) * 60;
  
  // Total arrival time in destination local time
  const totalMinutes = depHours * 60 + depMinutes + durationMinutes + tzDiffMinutes;
  
  // Handle day overflow (arrival next day)
  let arrivalMinutes = totalMinutes % (24 * 60);
  if (arrivalMinutes < 0) arrivalMinutes += 24 * 60;
  
  const arrHours = Math.floor(arrivalMinutes / 60);
  const arrMins = arrivalMinutes % 60;
  
  return `${arrHours.toString().padStart(2, '0')}:${arrMins.toString().padStart(2, '0')}`;
};

// Calculate price in INR
const calculatePriceINR = (classType: string, daysUntilFlight: number, distance: number): number => {
  // Base price per km in INR (roughly ₹6-8 per km for economy)
  let basePricePerKm = 6.5;
  
  // Minimum base fare
  const minFare = 2500;
  
  let basePrice = Math.max(minFare, Math.round(distance * basePricePerKm));
  
  // Class multipliers
  if (classType === 'business') basePrice *= 3.5;
  if (classType === 'first') basePrice *= 7;
  
  // Dynamic pricing based on days until flight
  let multiplier = 1;
  if (daysUntilFlight < 1) multiplier = 2.8;
  else if (daysUntilFlight < 3) multiplier = 2.2;
  else if (daysUntilFlight < 7) multiplier = 1.7;
  else if (daysUntilFlight < 14) multiplier = 1.35;
  else if (daysUntilFlight < 30) multiplier = 1.1;
  else multiplier = 0.9;
  
  // Add some randomness (±10%)
  const variance = 1 + (Math.random() * 0.2 - 0.1);
  
  return Math.round(basePrice * multiplier * variance);
};

export interface FlightSearchResult {
  flights: Flight[];
  fromAirport: Airport;
  toAirport: Airport;
  fromNearestInfo?: { originalCity: string; distance: number };
  toNearestInfo?: { originalCity: string; distance: number };
}

export const searchFlights = (params: SearchParams): FlightSearchResult => {
  const daysUntilFlight = Math.max(0, Math.ceil(
    (new Date(params.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  ));
  
  // Find airports for origin and destination
  const fromResult = findNearestAirport(params.from);
  const toResult = findNearestAirport(params.to);
  
  // Fallback to default airports if not found
  const fromAirport = fromResult?.airport || worldAirports[0];
  const toAirport = toResult?.airport || worldAirports[1];
  
  const distance = calculateDistance(fromAirport, toAirport);
  
  const numFlights = Math.floor(Math.random() * 5) + 4;
  const flights: Flight[] = [];
  
  for (let i = 0; i < numFlights; i++) {
    const airline = getRandomAirline();
    
    // Determine stops based on distance
    let stops: number;
    if (distance < 1000) {
      stops = 0;
    } else if (distance < 3000) {
      stops = Math.random() > 0.7 ? 1 : 0;
    } else if (distance < 6000) {
      stops = Math.random() > 0.4 ? 1 : 0;
    } else {
      stops = Math.random() > 0.6 ? (Math.random() > 0.5 ? 2 : 1) : 1;
    }
    
    const departureTime = generateDepartureTime(distance);
    const duration = calculateDuration(distance, stops);
    const arrivalTime = calculateArrivalTime(departureTime, duration.totalMinutes, fromAirport, toAirport);
    
    // Determine delay risk based on departure time and route complexity
    const depHour = parseInt(departureTime.split(':')[0]);
    let delayRisk: 'low' | 'medium' | 'high';
    if (depHour < 9 && stops === 0) {
      delayRisk = 'low';
    } else if (depHour > 18 || stops > 1) {
      delayRisk = 'high';
    } else {
      delayRisk = 'medium';
    }
    
    flights.push({
      id: `flight-${Date.now()}-${i}`,
      airline: airline.name,
      airlineCode: airline.code,
      flightNumber: generateFlightNumber(airline.code),
      from: fromAirport.city,
      fromCode: fromAirport.code,
      to: toAirport.city,
      toCode: toAirport.code,
      departureTime,
      arrivalTime,
      duration: `${duration.hours}h ${duration.minutes}m`,
      price: calculatePriceINR(params.classType, daysUntilFlight, distance),
      classType: params.classType,
      availableSeats: Math.floor(Math.random() * 50) + 10,
      aircraft: ['Boeing 737-800', 'Airbus A320neo', 'Boeing 787-9', 'Airbus A350-900', 'Boeing 777-300ER', 'Airbus A380-800'][Math.floor(Math.random() * 6)],
      stops,
      delayRisk,
    });
  }
  
  return {
    flights: flights.sort((a, b) => a.price - b.price),
    fromAirport,
    toAirport,
    fromNearestInfo: fromResult && !fromResult.isExactMatch ? { originalCity: params.from, distance: fromResult.distance } : undefined,
    toNearestInfo: toResult && !toResult.isExactMatch ? { originalCity: params.to, distance: toResult.distance } : undefined,
  };
};

export const generateSeats = (flightId: string, classType: string): Seat[] => {
  const seats: Seat[] = [];
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
  const rows = classType === 'first' ? 4 : classType === 'business' ? 8 : 30;
  
  for (let row = 1; row <= rows; row++) {
    for (const col of columns) {
      const isEmergency = row === 14 || row === 15;
      const isPremium = row <= 5 && classType === 'economy';
      const isBooked = Math.random() > 0.7;
      
      // Seat prices in INR
      const premiumPrice = 1500;
      const emergencyPrice = 1000;
      
      seats.push({
        id: `${flightId}-${row}${col}`,
        row,
        column: col,
        type: isEmergency ? 'emergency' : isPremium ? 'premium' : 'standard',
        status: isBooked ? 'booked' : 'available',
        price: isPremium ? premiumPrice : isEmergency ? emergencyPrice : 0,
        legroom: row === 1 || isEmergency ? 'extra' : 'standard',
        isWindow: col === 'A' || col === 'F',
        isAisle: col === 'C' || col === 'D',
      });
    }
  }
  
  return seats;
};

export const getPredictedFares = (from: string, to: string) => {
  const today = new Date();
  const fares: { date: string; price: number; level: 'low' | 'medium' | 'high' }[] = [];
  
  // Get airports for distance-based pricing
  const fromResult = findNearestAirport(from);
  const toResult = findNearestAirport(to);
  const fromAirport = fromResult?.airport || worldAirports[0];
  const toAirport = toResult?.airport || worldAirports[1];
  
  const distance = calculateDistance(fromAirport, toAirport);
  
  // Base price in INR
  const basePrice = Math.max(2500, Math.round(distance * 6.5));
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isFriday = dayOfWeek === 5;
    
    let price = basePrice;
    
    // Weekend and Friday premium
    if (isWeekend) price *= 1.25;
    if (isFriday) price *= 1.15;
    
    // Dynamic pricing based on days ahead
    if (i < 3) price *= 1.8;
    else if (i < 7) price *= 1.5;
    else if (i < 14) price *= 1.2;
    else if (i > 21) price *= 0.9;
    
    // Add variance
    price += Math.random() * 500 - 250;
    price = Math.round(price);
    
    const avgPrice = basePrice * 1.2;
    let level: 'low' | 'medium' | 'high' = 'medium';
    if (price < avgPrice * 0.9) level = 'low';
    else if (price > avgPrice * 1.3) level = 'high';
    
    fares.push({
      date: date.toISOString().split('T')[0],
      price,
      level
    });
  }
  
  return fares;
};
