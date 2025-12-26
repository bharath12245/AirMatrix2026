import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useBookingStore } from '@/store/bookingStore';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, Plane, Calendar, User, Share2, Mail, Phone, Clock, MapPin, IndianRupee, Copy, Printer } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const { currentBooking, resetBooking } = useBookingStore();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!currentBooking) {
      navigate('/');
      return;
    }

    // Celebrate!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0066b3', '#00a0e9', '#f5a623', '#00c853'],
    });
  }, [currentBooking, navigate]);

  const copyBookingReference = () => {
    if (currentBooking) {
      navigator.clipboard.writeText(currentBooking.id);
      setCopied(true);
      toast.success('Booking reference copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!currentBooking) return null;

  const { flight, passengers, seats, totalPrice, id, createdAt, paymentMethod } = currentBooking;
  const bookingDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-background print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="pt-24 pb-12 print:pt-4">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8 animate-slide-up print:animate-none">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Booking Confirmed!
              </h1>
              <p className="text-muted-foreground">
                Your flight has been booked successfully
              </p>
            </div>

            {/* Email Confirmation Notice */}
            <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Confirmation email sent</p>
                  <p className="text-sm text-muted-foreground">
                    A confirmation email with your e-ticket has been sent to{' '}
                    <span className="font-medium text-foreground">{user?.email || passengers[0]?.email}</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Booking Reference */}
            <Card className="p-6 mb-6 text-center border-2 border-dashed border-primary/30">
              <p className="text-sm text-muted-foreground mb-2">Booking Reference (PNR)</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-4xl font-bold text-primary tracking-[0.2em] font-mono">{id}</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={copyBookingReference}
                  className="print:hidden"
                >
                  <Copy className={`h-4 w-4 ${copied ? 'text-emerald-600' : ''}`} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Booked on {bookingDate}
              </p>
            </Card>

            {/* Flight Details */}
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Plane className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">Flight Details</h2>
                </div>
                <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                  Confirmed
                </Badge>
              </div>

              {/* Airline Info */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plane className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{flight.airline}</p>
                  <p className="text-sm text-muted-foreground">{flight.flightNumber} • {flight.aircraft}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{flight.departureTime}</p>
                      <p className="text-lg font-medium text-primary">{flight.fromCode}</p>
                      <p className="text-sm text-muted-foreground">{flight.from}</p>
                      <p className="text-xs text-muted-foreground mt-1">Local time</p>
                    </div>

                    <div className="flex-1 px-4 relative">
                      <div className="border-t-2 border-dashed border-muted-foreground/30 w-full" />
                      <Plane className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-primary transform rotate-90" />
                      <div className="text-center mt-4">
                        <p className="text-sm font-medium">{flight.duration}</p>
                        {flight.stops === 0 ? (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">Direct</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">{flight.stops} stop(s)</p>
                        )}
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold">{flight.arrivalTime}</p>
                      <p className="text-lg font-medium text-primary">{flight.toCode}</p>
                      <p className="text-sm text-muted-foreground">{flight.to}</p>
                      <p className="text-xs text-muted-foreground mt-1">Local time</p>
                    </div>
                  </div>
                </div>

                <div className="md:border-l md:pl-6 md:border-border space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Class:</span>
                    <span className="font-medium capitalize">{flight.classType}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Passengers & Seats */}
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold">Passengers & Seats</h2>
              </div>

              <div className="space-y-4">
                {passengers.map((passenger, index) => (
                  <div
                    key={passenger.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="font-semibold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {passenger.firstName} {passenger.lastName}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {passenger.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {passenger.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:text-right">
                      <div className="px-4 py-2 bg-primary/10 rounded-lg">
                        <p className="text-lg font-bold text-primary">
                          {seats[index]?.row}{seats[index]?.column}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {seats[index]?.type} seat
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment Summary */}
            <Card className="p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Payment Details</h3>
                <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                  Paid
                </Badge>
              </div>
              
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <p className="text-muted-foreground text-sm">Payment Method</p>
                  <p className="font-medium">{paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-sm">Total Amount</p>
                  <p className="text-2xl font-bold text-primary flex items-center">
                    <IndianRupee className="h-5 w-5" />
                    {totalPrice.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 print:hidden">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </Card>

            {/* Important Information */}
            <Card className="p-6 mb-8 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-3">Important Information</h3>
              <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                <li>• Please arrive at the airport at least 2 hours before domestic and 3 hours before international flights</li>
                <li>• Carry a valid government-issued photo ID (Aadhaar, Passport, or Voter ID)</li>
                <li>• Web check-in opens 48 hours before departure</li>
                <li>• Baggage allowance: 15kg check-in + 7kg cabin for Economy class</li>
              </ul>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
              <Link to="/dashboard">
                <Button variant="default" size="lg" className="w-full sm:w-auto">
                  <Calendar className="h-4 w-4 mr-2" />
                  View My Trips
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  resetBooking();
                  navigate('/');
                }}
                className="w-full sm:w-auto"
              >
                <Plane className="h-4 w-4 mr-2" />
                Book Another Flight
              </Button>
            </div>

            {/* Footer for print */}
            <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
              <p>Thank you for booking with AirMatrix</p>
              <p>For support, contact: support@airmatrix.com | +91-1800-XXX-XXXX</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
