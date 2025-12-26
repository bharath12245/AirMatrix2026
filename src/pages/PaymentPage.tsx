import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AeroSenseChat from '@/components/AeroSenseChat';
import { useBookingStore, Booking } from '@/store/bookingStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Lock, ArrowLeft, Shield, Loader2, Smartphone, Building2, IndianRupee, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createBooking, sendBookingEmail } from '@/lib/bookingService';

// Generate booking reference in format: AM-XXXXXX
const generateBookingReference = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let reference = 'AM-';
  for (let i = 0; i < 6; i++) {
    reference += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return reference;
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const { selectedFlight, selectedSeats, searchParams, passengers, setCurrentBooking } = useBookingStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  const totalSeatPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const basePrice = (selectedFlight?.price || 0) * (searchParams?.passengers || 1);
  const totalPrice = basePrice + totalSeatPrice;

  // Calculate fare breakup
  const baseFare = Math.round(totalPrice * 0.62);
  const taxes = Math.round(totalPrice * 0.18);
  const convenienceFee = Math.round(totalPrice * 0.05);
  const seatCharges = totalSeatPrice;
  const airportFees = totalPrice - baseFare - taxes - convenienceFee - seatCharges;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validatePayment = (): boolean => {
    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Please enter a valid card number');
        return false;
      }
      if (!expiry || expiry.length < 5) {
        toast.error('Please enter a valid expiry date');
        return false;
      }
      if (!cvv || cvv.length < 3) {
        toast.error('Please enter a valid CVV');
        return false;
      }
      if (!name) {
        toast.error('Please enter cardholder name');
        return false;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID (e.g., name@upi)');
        return false;
      }
    } else if (paymentMethod === 'netbanking') {
      if (!selectedBank) {
        toast.error('Please select a bank');
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Simulate random success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;

    if (!isSuccess) {
      setIsProcessing(false);
      toast.error('Payment failed. Please try again or use a different payment method.');
      return;
    }

    const bookingReference = generateBookingReference();
    const paymentMethodText = paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'upi' ? 'UPI' : 'Net Banking';
    
    // Save booking to database
    const { data: dbBooking, error: dbError } = await createBooking(
      bookingReference,
      selectedFlight!,
      passengers,
      selectedSeats,
      {
        baseFare,
        taxes,
        convenienceFee,
        seatCharges,
        totalAmount: totalPrice,
      },
      paymentMethodText
    );

    if (dbError) {
      console.error('Error saving booking to database:', dbError);
      toast.error('Booking saved but there was an issue. Please contact support.');
    }
    
    const booking: Booking = {
      id: bookingReference,
      flight: selectedFlight!,
      passengers: passengers,
      seats: selectedSeats,
      totalPrice: totalPrice,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      paymentMethod: paymentMethodText,
    };

    setCurrentBooking(booking);
    
    // Send confirmation email (non-blocking)
    if (dbBooking) {
      sendBookingEmail('confirmation', dbBooking).then(({ success, error }) => {
        if (success) {
          console.log('Confirmation email sent successfully');
        } else {
          console.log('Email not sent:', error);
        }
      });
    }
    
    setIsProcessing(false);
    toast.success('Payment successful! Booking confirmed.');
    navigate('/confirmation');
  };

  if (!selectedFlight || !searchParams || passengers.length === 0) {
    navigate('/');
    return null;
  }

  const banks = [
    { id: 'sbi', name: 'State Bank of India' },
    { id: 'hdfc', name: 'HDFC Bank' },
    { id: 'icici', name: 'ICICI Bank' },
    { id: 'axis', name: 'Axis Bank' },
    { id: 'kotak', name: 'Kotak Mahindra Bank' },
    { id: 'pnb', name: 'Punjab National Bank' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="pt-20 pb-6 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Payment</h1>
              <p className="text-muted-foreground">Complete your booking securely</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {['Flight', 'Seats', 'Passengers', 'Payment', 'Confirmation'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= 3
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 4 && (
                    <div
                      className={`w-12 h-0.5 mx-1 ${
                        index < 3 ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Payment Method Selection */}
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Select Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)} className="space-y-3">
                <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Credit / Debit Card</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, RuPay</p>
                    </div>
                  </Label>
                </div>
                <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">UPI</p>
                      <p className="text-xs text-muted-foreground">GPay, PhonePe, Paytm</p>
                    </div>
                  </Label>
                </div>
                <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${paymentMethod === 'netbanking' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="netbanking" id="netbanking" />
                  <Label htmlFor="netbanking" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Net Banking</p>
                      <p className="text-xs text-muted-foreground">All major banks</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </Card>

            {/* Payment Details */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">
                  {paymentMethod === 'card' && 'Card Details'}
                  {paymentMethod === 'upi' && 'UPI Details'}
                  {paymentMethod === 'netbanking' && 'Select Bank'}
                </h2>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="As printed on card"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="pl-10"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        maxLength={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="upiId"
                        placeholder="yourname@upi"
                        className="pl-10"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Example: name@oksbi, name@paytm, name@ybl</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="space-y-4">
                  <RadioGroup value={selectedBank} onValueChange={setSelectedBank} className="grid grid-cols-2 gap-3">
                    {banks.map((bank) => (
                      <div key={bank.id} className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${selectedBank === bank.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <RadioGroupItem value={bank.id} id={bank.id} />
                        <Label htmlFor={bank.id} className="cursor-pointer text-sm">{bank.name}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div className="flex items-center gap-2 mt-6 p-3 bg-muted/50 rounded-lg">
                <Shield className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-muted-foreground">
                  Your payment is secured with 256-bit SSL encryption
                </span>
              </div>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => navigate('/passengers')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                variant="hero"
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <IndianRupee className="h-4 w-4 mr-1" />
                    Pay ₹{totalPrice.toLocaleString('en-IN')}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

              {/* Flight */}
              <div className="border-b border-border pb-4 mb-4">
                <p className="font-medium text-foreground mb-1">
                  {selectedFlight.from} → {selectedFlight.to}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedFlight.flightNumber} • {selectedFlight.departureTime}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchParams.date} • {selectedFlight.duration}
                </p>
              </div>

              {/* Passengers */}
              <div className="border-b border-border pb-4 mb-4">
                <p className="font-medium text-foreground mb-2">Passengers</p>
                {passengers.map((p, i) => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {p.firstName} {p.lastName}
                    </span>
                    <span>Seat {selectedSeats[i]?.row}{selectedSeats[i]?.column}</span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Fare</span>
                  <span>₹{baseFare.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes & GST</span>
                  <span>₹{taxes.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Airport Fees</span>
                  <span>₹{Math.max(0, airportFees).toLocaleString('en-IN')}</span>
                </div>
                {seatCharges > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seat Selection</span>
                    <span>₹{seatCharges.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Convenience Fee</span>
                  <span>₹{convenienceFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-3 border-t border-border mt-3">
                  <span>Total</span>
                  <span className="text-primary">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Price includes all taxes & fees</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <AeroSenseChat />
    </div>
  );
};

export default PaymentPage;
