import { Flight } from '@/store/bookingStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Clock, AlertTriangle, CheckCircle, Circle, Info, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FlightCardProps {
  flight: Flight;
  onSelect: (flight: Flight) => void;
}

// Calculate fare breakup (base fare, taxes, fees)
const calculateFareBreakup = (totalPrice: number) => {
  // Typical Indian airline fare structure:
  // Base fare: ~60-65% of total
  // GST (5% on base): ~3% of total
  // Fuel surcharge: ~15% of total
  // Airport fees: ~10% of total
  // Convenience fee: ~5% of total
  
  const baseFare = Math.round(totalPrice * 0.62);
  const gst = Math.round(baseFare * 0.05);
  const fuelSurcharge = Math.round(totalPrice * 0.15);
  const airportFees = Math.round(totalPrice * 0.10);
  const convenienceFee = totalPrice - baseFare - gst - fuelSurcharge - airportFees;
  
  return {
    baseFare,
    gst,
    fuelSurcharge,
    airportFees,
    convenienceFee: Math.max(0, convenienceFee),
    total: totalPrice,
  };
};

const FlightCard = ({ flight, onSelect }: FlightCardProps) => {
  const fareBreakup = calculateFareBreakup(flight.price);

  const getDelayBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return (
          <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
            <CheckCircle className="h-3 w-3 mr-1" /> Low Delay Risk
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30">
            <Circle className="h-3 w-3 mr-1" /> Medium Risk
          </Badge>
        );
      case 'high':
        return (
          <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50 dark:bg-red-950/30">
            <AlertTriangle className="h-3 w-3 mr-1" /> High Risk
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="p-4 md:p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Airline Info */}
        <div className="flex items-center gap-3 lg:w-48">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Plane className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{flight.airline}</p>
            <p className="text-sm text-muted-foreground">{flight.flightNumber}</p>
          </div>
        </div>

        {/* Flight Times */}
        <div className="flex-1 flex items-center justify-between lg:justify-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{flight.departureTime}</p>
            <p className="text-sm text-muted-foreground">{flight.fromCode}</p>
            <p className="text-xs text-muted-foreground/70">Local time</p>
          </div>

          <div className="flex-1 max-w-[200px] relative px-4">
            <div className="border-t-2 border-dashed border-muted-foreground/30 w-full" />
            <Plane className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary transform rotate-90" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <span className="text-xs font-medium text-foreground">{flight.duration}</span>
              {flight.stops > 0 ? (
                <span className="text-xs text-accent">{flight.stops} stop{flight.stops > 1 ? 's' : ''}</span>
              ) : (
                <span className="text-xs text-emerald-600 dark:text-emerald-400">Direct</span>
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{flight.arrivalTime}</p>
            <p className="text-sm text-muted-foreground">{flight.toCode}</p>
            <p className="text-xs text-muted-foreground/70">Local time</p>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col items-end gap-2 lg:w-48">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {flight.aircraft}
          </div>
          {getDelayBadge(flight.delayRisk)}
          <p className="text-sm text-muted-foreground">{flight.availableSeats} seats left</p>
        </div>

        {/* Price & Book */}
        <div className="flex flex-col items-center gap-2 lg:w-44 lg:border-l lg:pl-6 lg:border-border">
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <p className="text-3xl font-bold text-primary">₹{flight.price.toLocaleString('en-IN')}</p>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="w-64 p-3">
                <h4 className="font-semibold mb-2 flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  Fare Breakup
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Fare</span>
                    <span>₹{fareBreakup.baseFare.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (5%)</span>
                    <span>₹{fareBreakup.gst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fuel Surcharge</span>
                    <span>₹{fareBreakup.fuelSurcharge.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Airport Fees</span>
                    <span>₹{fareBreakup.airportFees.toLocaleString('en-IN')}</span>
                  </div>
                  {fareBreakup.convenienceFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Convenience Fee</span>
                      <span>₹{fareBreakup.convenienceFee.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t pt-1 mt-1 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">₹{fareBreakup.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
            <p className="text-sm text-muted-foreground capitalize">{flight.classType}</p>
            <p className="text-xs text-muted-foreground">per person</p>
          </div>
          <Button
            variant="hero"
            onClick={() => onSelect(flight)}
            className="w-full lg:w-auto"
          >
            Select Flight
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FlightCard;
