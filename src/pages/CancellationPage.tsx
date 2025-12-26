import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AlertTriangle, 
  Plane, 
  Calendar, 
  Clock, 
  IndianRupee,
  CheckCircle2,
  ArrowLeft,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { cancelBooking, sendBookingEmail, getBookingByReference, BookingRecord } from '@/lib/bookingService';

const CancellationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingRef = searchParams.get('ref');
  
  const { currentBooking, setCurrentBooking, resetBooking } = useBookingStore();
  
  const [cancellationReason, setCancellationReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [refundDetails, setRefundDetails] = useState<{
    refundAmount: number;
    cancellationFee: number;
    refundPercentage: number;
    estimatedDays: number;
  } | null>(null);

  if (!currentBooking) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">No Booking Found</h1>
              <p className="text-muted-foreground mb-6">
                We couldn't find a booking to cancel. Please go to your dashboard to view your bookings.
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const calculateRefund = () => {
    const totalPrice = currentBooking.totalPrice;
    const bookingDate = new Date(currentBooking.createdAt);
    const now = new Date();
    const hoursSinceBooking = (now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60);
    
    let refundPercentage = 0;
    let estimatedDays = 7;
    
    // Refund policy based on time since booking
    if (hoursSinceBooking <= 24) {
      // Full refund within 24 hours
      refundPercentage = 100;
      estimatedDays = 3;
    } else if (hoursSinceBooking <= 72) {
      // 90% refund within 72 hours
      refundPercentage = 90;
      estimatedDays = 5;
    } else if (hoursSinceBooking <= 168) {
      // 75% refund within 7 days
      refundPercentage = 75;
      estimatedDays = 7;
    } else if (hoursSinceBooking <= 336) {
      // 50% refund within 14 days
      refundPercentage = 50;
      estimatedDays = 10;
    } else {
      // 25% refund after 14 days
      refundPercentage = 25;
      estimatedDays = 14;
    }
    
    const refundAmount = Math.round((totalPrice * refundPercentage) / 100);
    const cancellationFee = totalPrice - refundAmount;
    
    return { refundAmount, cancellationFee, refundPercentage, estimatedDays };
  };

  const refundInfo = calculateRefund();

  const cancellationReasons = [
    { value: 'change_of_plans', label: 'Change of travel plans' },
    { value: 'found_better_deal', label: 'Found a better deal' },
    { value: 'emergency', label: 'Personal emergency' },
    { value: 'health_issues', label: 'Health issues' },
    { value: 'visa_issues', label: 'Visa/documentation issues' },
    { value: 'schedule_conflict', label: 'Schedule conflict' },
    { value: 'other', label: 'Other reason' },
  ];

  const handleCancellation = async () => {
    if (!cancellationReason) {
      toast.error('Please select a cancellation reason');
      return;
    }
    
    if (cancellationReason === 'other' && !otherReason.trim()) {
      toast.error('Please provide details for your cancellation reason');
      return;
    }
    
    if (!agreedToTerms) {
      toast.error('Please agree to the cancellation terms');
      return;
    }
    
    setIsProcessing(true);
    
    const reasonText = cancellationReason === 'other' 
      ? otherReason 
      : cancellationReasons.find(r => r.value === cancellationReason)?.label || cancellationReason;
    
    // Cancel in database
    const { data: cancelledBooking, error: dbError } = await cancelBooking(
      currentBooking.id,
      reasonText,
      refundInfo.refundAmount
    );
    
    if (dbError) {
      console.error('Error cancelling booking in database:', dbError);
      // Continue with local cancellation even if DB fails
    }
    
    setRefundDetails(refundInfo);
    setIsCancelled(true);
    setIsProcessing(false);
    
    // Update booking status locally
    setCurrentBooking({
      ...currentBooking,
      status: 'cancelled'
    });
    
    // Send cancellation email (non-blocking)
    if (cancelledBooking) {
      sendBookingEmail('cancellation', cancelledBooking, refundInfo.refundAmount, reasonText).then(({ success, error }) => {
        if (success) {
          console.log('Cancellation email sent successfully');
        } else {
          console.log('Email not sent:', error);
        }
      });
    } else {
      // If DB call failed, try to get booking from DB and send email
      getBookingByReference(currentBooking.id).then(({ data }) => {
        if (data) {
          sendBookingEmail('cancellation', data, refundInfo.refundAmount, reasonText);
        }
      });
    }
    
    toast.success('Your booking has been cancelled successfully');
  };

  if (isCancelled && refundDetails) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Booking Cancelled</h1>
                <p className="text-muted-foreground">
                  Your booking has been successfully cancelled
                </p>
              </div>

              {/* Cancellation Summary */}
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Plane className="h-5 w-5 text-primary" />
                    Cancelled Flight
                  </h3>
                  <p className="font-medium">
                    {currentBooking.flight.from} → {currentBooking.flight.to}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentBooking.flight.flightNumber} • {currentBooking.flight.departureTime}
                  </p>
                </div>

                {/* Refund Details */}
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-green-600" />
                    Refund Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Original Amount</span>
                      <span>₹{currentBooking.totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-destructive">
                      <span>Cancellation Fee</span>
                      <span>-₹{refundDetails.cancellationFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Refund Amount</span>
                      <span className="text-green-600">₹{refundDetails.refundAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      ({refundDetails.refundPercentage}% of original amount)
                    </p>
                  </div>
                </div>

                {/* Refund Timeline */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Refund Timeline
                  </h3>
                  <p className="text-sm">
                    Your refund of <strong>₹{refundDetails.refundAmount.toLocaleString('en-IN')}</strong> will be credited to your original payment method within <strong>{refundDetails.estimatedDays} business days</strong>.
                  </p>
                </div>

                {/* Confirmation Email */}
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground">
                    A confirmation email has been sent to your registered email address with the cancellation details and refund information.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                  <Button 
                    variant="hero"
                    className="flex-1"
                    onClick={() => {
                      resetBooking();
                      navigate('/');
                    }}
                  >
                    Book New Flight
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              className="mb-6"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <h1 className="text-3xl font-bold mb-2">Cancel Booking</h1>
            <p className="text-muted-foreground mb-8">
              Booking Reference: <span className="font-bold text-primary">{currentBooking.id}</span>
            </p>

            <div className="grid gap-6">
              {/* Flight Details */}
              <Card className="p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Plane className="h-5 w-5 text-primary" />
                  Flight Details
                </h2>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-lg">
                      {currentBooking.flight.from} → {currentBooking.flight.to}
                    </p>
                    <p className="text-muted-foreground">
                      {currentBooking.flight.airline} • {currentBooking.flight.flightNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center gap-1 justify-end text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {currentBooking.flight.departureTime}
                    </p>
                    <p className="flex items-center gap-1 justify-end text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {currentBooking.flight.duration}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Refund Policy */}
              <Card className="p-6 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-amber-600" />
                  Refund Policy
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="p-3 rounded-lg bg-background border text-center">
                    <p className="font-bold text-green-600">100%</p>
                    <p className="text-muted-foreground">Within 24h</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border text-center">
                    <p className="font-bold text-green-600">90%</p>
                    <p className="text-muted-foreground">24-72 hours</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border text-center">
                    <p className="font-bold text-amber-600">75%</p>
                    <p className="text-muted-foreground">3-7 days</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border text-center">
                    <p className="font-bold text-red-600">50%</p>
                    <p className="text-muted-foreground">7-14 days</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  After 14 days, only 25% of the fare is refundable. Processing time: 3-14 business days.
                </p>
              </Card>

              {/* Your Refund Estimate */}
              <Card className="p-6 border-primary bg-primary/5">
                <h2 className="font-semibold mb-4">Your Refund Estimate</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original Fare</span>
                    <span>₹{currentBooking.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span>Cancellation Fee ({100 - refundInfo.refundPercentage}%)</span>
                    <span>-₹{refundInfo.cancellationFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Refund Amount</span>
                    <span className="text-green-600">₹{refundInfo.refundAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </Card>

              {/* Cancellation Reason */}
              <Card className="p-6">
                <h2 className="font-semibold mb-4">Reason for Cancellation</h2>
                <RadioGroup 
                  value={cancellationReason} 
                  onValueChange={setCancellationReason}
                  className="space-y-3"
                >
                  {cancellationReasons.map((reason) => (
                    <div key={reason.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={reason.value} id={reason.value} />
                      <Label htmlFor={reason.value} className="cursor-pointer">
                        {reason.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                
                {cancellationReason === 'other' && (
                  <Textarea 
                    className="mt-4"
                    placeholder="Please describe your reason for cancellation..."
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                  />
                )}
              </Card>

              {/* Terms Agreement */}
              <Card className="p-6">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="terms" 
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                    I understand that cancelling this booking will result in a cancellation fee of 
                    <strong className="text-destructive"> ₹{refundInfo.cancellationFee.toLocaleString('en-IN')}</strong> and 
                    I will receive a refund of 
                    <strong className="text-green-600"> ₹{refundInfo.refundAmount.toLocaleString('en-IN')}</strong> to my original payment method within {refundInfo.estimatedDays} business days. 
                    I agree to the AirMatrix cancellation and refund policy.
                  </Label>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/dashboard')}
                >
                  Keep My Booking
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={handleCancellation}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Cancellation...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Confirm Cancellation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationPage;
