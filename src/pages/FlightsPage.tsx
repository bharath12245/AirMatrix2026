import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FlightCard from '@/components/FlightCard';
import AeroSenseChat from '@/components/AeroSenseChat';
import { useBookingStore, Flight } from '@/store/bookingStore';
import { searchFlightsWithAmadeus, getFareCalendarWithHistory, AmadeusSearchResult } from '@/lib/amadeusService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, Filter, Plane, Calendar, TrendingDown, Loader2, Info, Wifi, WifiOff, Zap, Clock, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';

const FlightsPage = () => {
  const navigate = useNavigate();
  const { searchParams, setSelectedFlight } = useBookingStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price');
  const [fareCalendar, setFareCalendar] = useState<{ date: string; price: number; level: 'low' | 'medium' | 'high'; isHistorical?: boolean }[]>([]);
  const [showFareCalendar, setShowFareCalendar] = useState(false);
  const [searchResult, setSearchResult] = useState<AmadeusSearchResult | null>(null);
  const [stopsFilter, setStopsFilter] = useState<string[]>(['all']);
  const [airlineFilter, setAirlineFilter] = useState<string[]>([]);

  useEffect(() => {
    if (!searchParams) {
      navigate('/');
      return;
    }

    const fetchFlights = async () => {
      setLoading(true);
      try {
        const results = await searchFlightsWithAmadeus(searchParams);
        setSearchResult(results);
        setFlights(results.flights);
        
        // Get fare calendar
        const calendar = await getFareCalendarWithHistory(searchParams.from, searchParams.to);
        setFareCalendar(calendar);
      } catch (error) {
        console.error('Error fetching flights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [searchParams, navigate]);

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    navigate('/seats');
  };

  // Get unique airlines for filter
  const uniqueAirlines = [...new Set(flights.map(f => f.airline))];

  // Apply filters
  const filteredFlights = flights.filter(flight => {
    // Stops filter
    if (!stopsFilter.includes('all')) {
      if (stopsFilter.includes('nonstop') && flight.stops !== 0) return false;
      if (stopsFilter.includes('1stop') && flight.stops !== 1) return false;
      if (stopsFilter.includes('2plus') && flight.stops < 2) return false;
    }
    
    // Airline filter
    if (airlineFilter.length > 0 && !airlineFilter.includes(flight.airline)) {
      return false;
    }
    
    return true;
  });

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'duration':
        const getDurationMinutes = (d: string) => {
          const match = d.match(/(\d+)h\s*(\d+)m/);
          return match ? parseInt(match[1]) * 60 + parseInt(match[2]) : 0;
        };
        return getDurationMinutes(a.duration) - getDurationMinutes(b.duration);
      case 'departure':
        return a.departureTime.localeCompare(b.departureTime);
      default:
        return 0;
    }
  });

  // Find best/cheapest/fastest
  const cheapestFlight = filteredFlights.length > 0 ? filteredFlights.reduce((a, b) => a.price < b.price ? a : b) : null;
  const fastestFlight = filteredFlights.length > 0 ? filteredFlights.reduce((a, b) => {
    const getDurationMinutes = (d: string) => {
      const match = d.match(/(\d+)h\s*(\d+)m/);
      return match ? parseInt(match[1]) * 60 + parseInt(match[2]) : 0;
    };
    return getDurationMinutes(a.duration) < getDurationMinutes(b.duration) ? a : b;
  }) : null;

  const getFlightTags = (flight: Flight) => {
    const tags: { label: string; variant: 'default' | 'secondary' | 'outline' }[] = [];
    if (cheapestFlight && flight.id === cheapestFlight.id) {
      tags.push({ label: 'Cheapest', variant: 'default' });
    }
    if (fastestFlight && flight.id === fastestFlight.id) {
      tags.push({ label: 'Fastest', variant: 'secondary' });
    }
    if (flight.stops === 0) {
      tags.push({ label: 'Non-stop', variant: 'outline' });
    }
    return tags;
  };

  if (!searchParams) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="pt-20 pb-8 gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Plane className="h-8 w-8" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {searchResult?.fromAirport.city} ({searchResult?.fromAirport.code}) → {searchResult?.toAirport.city} ({searchResult?.toAirport.code})
                </h1>
                <p className="text-sm opacity-80">
                  {searchParams.date} • {searchParams.passengers} passenger{searchParams.passengers > 1 ? 's' : ''} • {searchParams.classType}
                </p>
                
                {/* Real-time / Fallback indicator */}
                <div className="flex items-center gap-2 mt-2">
                  {searchResult?.isRealTime ? (
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-100 border-emerald-400/50">
                      <Wifi className="h-3 w-3 mr-1" />
                      Live Amadeus Fares
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-100 border-amber-400/50">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Estimated Fares
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                    <IndianRupee className="h-3 w-3 mr-1" />
                    INR
                  </Badge>
                </div>

                {(searchResult?.fromNearestInfo || searchResult?.toNearestInfo) && (
                  <div className="flex items-center gap-1 mt-2 text-xs bg-white/20 rounded px-2 py-1 w-fit">
                    <Info className="h-3 w-3" />
                    {searchResult?.fromNearestInfo && (
                      <span>Nearest to "{searchResult.fromNearestInfo.originalCity}": {searchResult.fromAirport.city} ({searchResult.fromNearestInfo.distance}km)</span>
                    )}
                    {searchResult?.fromNearestInfo && searchResult?.toNearestInfo && <span className="mx-1">|</span>}
                    {searchResult?.toNearestInfo && (
                      <span>Nearest to "{searchResult.toNearestInfo.originalCity}": {searchResult.toAirport.city} ({searchResult.toNearestInfo.distance}km)</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Button variant="glass" onClick={() => navigate('/')}>
              Modify Search
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Fare Calendar Toggle */}
            <Card className="p-4">
              <Button
                variant={showFareCalendar ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setShowFareCalendar(!showFareCalendar)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Fare Calendar Heatmap
              </Button>
            </Card>

            {/* Fare Calendar */}
            {showFareCalendar && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-primary" />
                  30-Day Fare Trend
                </h3>
                <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-muted-foreground font-medium">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {fareCalendar.slice(0, 28).map((day, index) => (
                    <div
                      key={day.date}
                      className={cn(
                        "aspect-square rounded text-xs flex flex-col items-center justify-center font-medium cursor-pointer transition-all hover:scale-110 relative",
                        day.level === 'low' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
                        day.level === 'medium' && "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
                        day.level === 'high' && "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                      )}
                      title={`${day.date}: ₹${day.price.toLocaleString('en-IN')}${day.isHistorical ? ' (Historical)' : ' (Est.)'}`}
                    >
                      {index + 1}
                      {day.isHistorical && <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full" />}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-emerald-500" /> Low
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-amber-500" /> Medium
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-500" /> High
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mr-1" />
                  = Historical data
                </p>
              </Card>
            )}

            {/* Filters */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Stops</label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Flights' },
                      { value: 'nonstop', label: 'Non-stop' },
                      { value: '1stop', label: '1 Stop' },
                      { value: '2plus', label: '2+ Stops' },
                    ].map((stop) => (
                      <label key={stop.value} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-border" 
                          checked={stopsFilter.includes(stop.value)}
                          onChange={(e) => {
                            if (stop.value === 'all') {
                              setStopsFilter(e.target.checked ? ['all'] : []);
                            } else {
                              if (e.target.checked) {
                                setStopsFilter(prev => [...prev.filter(s => s !== 'all'), stop.value]);
                              } else {
                                setStopsFilter(prev => prev.filter(s => s !== stop.value));
                              }
                            }
                          }}
                        />
                        {stop.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Airlines</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uniqueAirlines.map((airline) => (
                      <label key={airline} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-border" 
                          checked={airlineFilter.length === 0 || airlineFilter.includes(airline)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (airlineFilter.length === uniqueAirlines.length - 1) {
                                setAirlineFilter([]);
                              } else {
                                setAirlineFilter(prev => [...prev, airline]);
                              }
                            } else {
                              if (airlineFilter.length === 0) {
                                setAirlineFilter(uniqueAirlines.filter(a => a !== airline));
                              } else {
                                setAirlineFilter(prev => prev.filter(a => a !== airline));
                              }
                            }
                          }}
                        />
                        {airline}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Flight Results */}
          <div className="lg:col-span-3">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-muted-foreground">
                  {loading ? 'Searching...' : `${sortedFlights.length} flights found`}
                </p>
                {searchResult?.message && !loading && (
                  <p className="text-xs text-muted-foreground">{searchResult.message}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">
                      <span className="flex items-center gap-2">
                        <IndianRupee className="h-3 w-3" /> Lowest Price
                      </span>
                    </SelectItem>
                    <SelectItem value="duration">
                      <span className="flex items-center gap-2">
                        <Clock className="h-3 w-3" /> Shortest Duration
                      </span>
                    </SelectItem>
                    <SelectItem value="departure">
                      <span className="flex items-center gap-2">
                        <Zap className="h-3 w-3" /> Departure Time
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Searching real-time fares via Amadeus...</p>
                <p className="text-xs text-muted-foreground mt-1">Finding the best flights for you</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedFlights.map((flight, index) => {
                  const tags = getFlightTags(flight);
                  return (
                    <div key={flight.id} className="relative">
                      {tags.length > 0 && (
                        <div className="absolute -top-2 left-4 z-10 flex gap-1">
                          {tags.map((tag, i) => (
                            <Badge 
                              key={i} 
                              variant={tag.variant}
                              className={cn(
                                tag.label === 'Cheapest' && 'bg-emerald-500 text-white',
                                tag.label === 'Fastest' && 'bg-blue-500 text-white'
                              )}
                            >
                              {tag.label}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <FlightCard
                        flight={flight}
                        onSelect={handleSelectFlight}
                      />
                    </div>
                  );
                })}

                {sortedFlights.length === 0 && !loading && (
                  <div className="text-center py-20">
                    <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No flights found</p>
                    <p className="text-muted-foreground">Try adjusting your filters or search criteria</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AeroSenseChat />
    </div>
  );
};

export default FlightsPage;