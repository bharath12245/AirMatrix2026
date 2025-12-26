import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SeatMap from '@/components/SeatMap';
import AeroSenseChat from '@/components/AeroSenseChat';
import { useBookingStore, Seat } from '@/store/bookingStore';
import { generateSeats } from '@/lib/flightService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plane, Clock, Users, ArrowRight, Info } from 'lucide-react';

const SeatSelectionPage = () => {
  const navigate = useNavigate();
  const { selectedFlight, selectedSeats, searchParams, addSelectedSeat, removeSelectedSeat, clearSelectedSeats } = useBookingStore();
  const [seats, setSeats] = useState<Seat[]>([]);

  useEffect(() => {
    if (!selectedFlight) {
      navigate('/');
      return;
    }

    clearSelectedSeats();
    const generatedSeats = generateSeats(selectedFlight.id, selectedFlight.classType);
    setSeats(generatedSeats);
  }, [selectedFlight, navigate, clearSelectedSeats]);

  const handleContinue = () => {
    if (selectedSeats.length < (searchParams?.passengers || 1)) {
      return;
    }
    navigate('/passengers');
  };

  const totalSeatPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const totalPrice = (selectedFlight?.price || 0) * (searchParams?.passengers || 1) + totalSeatPrice;

  if (!selectedFlight || !searchParams) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="pt-20 pb-6 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Plane className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Select Your Seats</h1>
              <p className="text-muted-foreground">
                {selectedFlight.flightNumber} • {selectedFlight.from} → {selectedFlight.to}
              </p>
            </div>
          </div>

          {/* Flight Summary */}
          <Card className="p-4 bg-card/80 backdrop-blur">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {selectedFlight.departureTime} - {selectedFlight.arrivalTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedFlight.aircraft}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {searchParams.passengers} passenger{searchParams.passengers > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <SeatMap
              seats={seats}
              selectedSeats={selectedSeats}
              maxSeats={searchParams.passengers}
              onSeatSelect={addSelectedSeat}
              onSeatDeselect={removeSelectedSeat}
            />
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6">Booking Summary</h2>

              {/* Flight Details */}
              <div className="border-b border-border pb-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Flight</span>
                  <span className="font-medium">{selectedFlight.flightNumber}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Route</span>
                  <span className="font-medium">{selectedFlight.fromCode} → {selectedFlight.toCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Class</span>
                  <span className="font-medium capitalize">{selectedFlight.classType}</span>
                </div>
              </div>

              {/* Selected Seats */}
              <div className="border-b border-border pb-4 mb-4">
                <h3 className="font-semibold mb-3">Selected Seats</h3>
                {selectedSeats.length === 0 ? (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Please select {searchParams.passengers} seat{searchParams.passengers > 1 ? 's' : ''}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedSeats.map((seat) => (
                      <div key={seat.id} className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {seat.row}{seat.column}
                          </span>
                          <span className="text-sm capitalize">{seat.type}</span>
                        </span>
                        <span className="text-sm">
                          {seat.price > 0 ? `+₹${seat.price.toLocaleString('en-IN')}` : 'Free'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Base fare ({searchParams.passengers}x ₹{selectedFlight.price.toLocaleString('en-IN')})
                  </span>
                  <span>₹{(selectedFlight.price * searchParams.passengers).toLocaleString('en-IN')}</span>
                </div>
                {totalSeatPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seat upgrades</span>
                    <span>+₹{totalSeatPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Continue Button */}
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                disabled={selectedSeats.length < searchParams.passengers}
                onClick={handleContinue}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              {selectedSeats.length < searchParams.passengers && (
                <p className="text-sm text-muted-foreground text-center mt-3">
                  Select {searchParams.passengers - selectedSeats.length} more seat{searchParams.passengers - selectedSeats.length > 1 ? 's' : ''}
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      <AeroSenseChat />
    </div>
  );
};

export default SeatSelectionPage;
