import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AeroSenseChat from '@/components/AeroSenseChat';
import { useBookingStore, Passenger } from '@/store/bookingStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, ArrowRight, ArrowLeft, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const PassengerDetailsPage = () => {
  const navigate = useNavigate();
  const { selectedFlight, selectedSeats, searchParams, setPassengers } = useBookingStore();
  const [passengerForms, setPassengerForms] = useState<Passenger[]>(() =>
    Array.from({ length: searchParams?.passengers || 1 }, (_, i) => ({
      id: `passenger-${i}`,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      seatId: selectedSeats[i]?.id,
    }))
  );

  const handleInputChange = (index: number, field: keyof Passenger, value: string) => {
    setPassengerForms(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleContinue = () => {
    // Validate all passengers
    for (let i = 0; i < passengerForms.length; i++) {
      const p = passengerForms[i];
      if (!p.firstName || !p.lastName || !p.email || !p.phone || !p.dateOfBirth) {
        toast.error(`Please complete all fields for Passenger ${i + 1}`);
        return;
      }
    }

    setPassengers(passengerForms);
    navigate('/payment');
  };

  if (!selectedFlight || !searchParams) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="pt-20 pb-6 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Passenger Details</h1>
              <p className="text-muted-foreground">
                Enter information for {searchParams.passengers} passenger{searchParams.passengers > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {['Flight', 'Seats', 'Passengers', 'Payment', 'Confirmation'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= 2
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 4 && (
                  <div
                    className={`w-12 h-0.5 mx-1 ${
                      index < 2 ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Passenger Forms */}
          {passengerForms.map((passenger, index) => (
            <Card key={passenger.id} className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary">{index + 1}</span>
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Passenger {index + 1}</h2>
                  {selectedSeats[index] && (
                    <p className="text-sm text-muted-foreground">
                      Seat {selectedSeats[index].row}{selectedSeats[index].column}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`firstName-${index}`}>First Name</Label>
                  <Input
                    id={`firstName-${index}`}
                    placeholder="John"
                    value={passenger.firstName}
                    onChange={(e) => handleInputChange(index, 'firstName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`lastName-${index}`}>Last Name</Label>
                  <Input
                    id={`lastName-${index}`}
                    placeholder="Doe"
                    value={passenger.lastName}
                    onChange={(e) => handleInputChange(index, 'lastName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`email-${index}`}>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id={`email-${index}`}
                      type="email"
                      placeholder="john@example.com"
                      className="pl-10"
                      value={passenger.email}
                      onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`phone-${index}`}>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id={`phone-${index}`}
                      type="tel"
                      placeholder="+1 234 567 8900"
                      className="pl-10"
                      value={passenger.phone}
                      onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`dob-${index}`}>Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id={`dob-${index}`}
                      type="date"
                      className="pl-10"
                      value={passenger.dateOfBirth}
                      onChange={(e) => handleInputChange(index, 'dateOfBirth', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => navigate('/seats')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Seats
            </Button>
            <Button variant="hero" onClick={handleContinue}>
              Continue to Payment
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <AeroSenseChat />
    </div>
  );
};

export default PassengerDetailsPage;
