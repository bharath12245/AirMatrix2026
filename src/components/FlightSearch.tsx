import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRightLeft, Search, Plane, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBookingStore, SearchParams } from '@/store/bookingStore';
import { getAirportSuggestions, findNearestAirport } from '@/lib/airportData';
import { cn } from '@/lib/utils';

const FlightSearch = () => {
  const navigate = useNavigate();
  const { setSearchParams, addRecentSearch } = useBookingStore();

  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [classType, setClassType] = useState<'economy' | 'business' | 'first'>('economy');
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const fromSuggestions = useMemo(() => getAirportSuggestions(from), [from]);
  const toSuggestions = useMemo(() => getAirportSuggestions(to), [to]);
  
  const fromAirportInfo = useMemo(() => from.length >= 2 ? findNearestAirport(from) : null, [from]);
  const toAirportInfo = useMemo(() => to.length >= 2 ? findNearestAirport(to) : null, [to]);

  const handleSwapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = () => {
    if (!from || !to || !date) return;

    const params: SearchParams = {
      from,
      to,
      date,
      returnDate: tripType === 'round-trip' ? returnDate : undefined,
      passengers: parseInt(passengers),
      classType,
      tripType,
    };

    setSearchParams(params);
    addRecentSearch(params);
    navigate('/flights');
  };

  const selectFromAirport = (city: string, code: string) => {
    setFrom(`${city} (${code})`);
    setShowFromSuggestions(false);
  };

  const selectToAirport = (city: string, code: string) => {
    setTo(`${city} (${code})`);
    setShowToSuggestions(false);
  };

  return (
    <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 glass-card">
      {/* Trip Type Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={tripType === 'one-way' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTripType('one-way')}
          className="rounded-full"
        >
          One Way
        </Button>
        <Button
          variant={tripType === 'round-trip' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTripType('round-trip')}
          className="rounded-full"
        >
          Round Trip
        </Button>
      </div>

      {/* Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* From/To Section */}
        <div className="md:col-span-2 flex gap-2 items-start">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-3 text-muted-foreground z-10">
              <MapPin className="h-4 w-4" />
            </div>
            <Input
              placeholder="Enter any city worldwide"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setShowFromSuggestions(true);
              }}
              onFocus={() => setShowFromSuggestions(true)}
              onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
              className="pl-10"
            />
            
            {/* Suggestions dropdown */}
            {showFromSuggestions && fromSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {fromSuggestions.map((airport) => (
                  <button
                    key={airport.code}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 flex items-center gap-3 border-b border-border/50 last:border-0"
                    onMouseDown={() => selectFromAirport(airport.city, airport.code)}
                  >
                    <Plane className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <div className="font-medium">{airport.city} ({airport.code})</div>
                      <div className="text-xs text-muted-foreground">{airport.name}, {airport.country}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Nearest airport info */}
            {from.length >= 2 && fromAirportInfo && !fromAirportInfo.isExactMatch && (
              <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 dark:text-amber-400">
                <Info className="h-3 w-3" />
                <span>Nearest: {fromAirportInfo.airport.city} ({fromAirportInfo.airport.code}) - {fromAirportInfo.distance}km away</span>
              </div>
            )}
            {from.length >= 2 && fromAirportInfo?.isExactMatch && (
              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                <Plane className="h-3 w-3" />
                <span>{fromAirportInfo.airport.name}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleSwapLocations}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors shrink-0 mt-1"
          >
            <ArrowRightLeft className="h-4 w-4 text-secondary-foreground" />
          </button>

          <div className="flex-1 relative">
            <div className="absolute left-3 top-3 text-muted-foreground z-10">
              <Plane className="h-4 w-4" />
            </div>
            <Input
              placeholder="Enter destination city"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setShowToSuggestions(true);
              }}
              onFocus={() => setShowToSuggestions(true)}
              onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
              className="pl-10"
            />
            
            {/* Suggestions dropdown */}
            {showToSuggestions && toSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {toSuggestions.map((airport) => (
                  <button
                    key={airport.code}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 flex items-center gap-3 border-b border-border/50 last:border-0"
                    onMouseDown={() => selectToAirport(airport.city, airport.code)}
                  >
                    <Plane className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <div className="font-medium">{airport.city} ({airport.code})</div>
                      <div className="text-xs text-muted-foreground">{airport.name}, {airport.country}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Nearest airport info */}
            {to.length >= 2 && toAirportInfo && !toAirportInfo.isExactMatch && (
              <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 dark:text-amber-400">
                <Info className="h-3 w-3" />
                <span>Nearest: {toAirportInfo.airport.city} ({toAirportInfo.airport.code}) - {toAirportInfo.distance}km away</span>
              </div>
            )}
            {to.length >= 2 && toAirportInfo?.isExactMatch && (
              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                <Plane className="h-3 w-3" />
                <span>{toAirportInfo.airport.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Date Section */}
        <div className={cn("flex gap-2", tripType === 'one-way' && "lg:col-span-1")}>
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
            </div>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          {tripType === 'round-trip' && (
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
              </div>
              <Input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="pl-10"
                min={date || new Date().toISOString().split('T')[0]}
              />
            </div>
          )}
        </div>

        {/* Passengers & Class */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Users className="h-4 w-4" />
            </div>
            <Select value={passengers} onValueChange={setPassengers}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Passengers" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={classType} onValueChange={(v) => setClassType(v as typeof classType)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="first">First Class</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-6 flex justify-center">
        <Button
          variant="hero"
          size="xl"
          onClick={handleSearch}
          disabled={!from || !to || !date}
          className="w-full md:w-auto min-w-[200px]"
        >
          <Search className="h-5 w-5 mr-2" />
          Search Flights
        </Button>
      </div>
    </Card>
  );
};

export default FlightSearch;
