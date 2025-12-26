import { supabase } from "@/integrations/supabase/client";
import { Flight, Passenger, Seat } from "@/store/bookingStore";

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface BookingRecord {
  id: string;
  booking_reference: string;
  user_email: string;
  status: BookingStatus;
  flight_id: string;
  airline: string;
  airline_code: string;
  flight_number: string;
  origin_city: string;
  origin_code: string;
  destination_city: string;
  destination_code: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  aircraft: string | null;
  class_type: string;
  base_fare: number;
  taxes: number;
  convenience_fee: number;
  seat_charges: number;
  total_amount: number;
  passengers: Passenger[];
  seats: Seat[];
  payment_method: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  refund_amount: number | null;
  refund_status: RefundStatus | null;
  created_at: string;
  updated_at: string;
}

export const createBooking = async (
  bookingReference: string,
  flight: Flight,
  passengers: Passenger[],
  seats: Seat[],
  pricing: {
    baseFare: number;
    taxes: number;
    convenienceFee: number;
    seatCharges: number;
    totalAmount: number;
  },
  paymentMethod: string
): Promise<{ data: BookingRecord | null; error: Error | null }> => {
  try {
    const userEmail = passengers[0]?.email || 'guest@airmatrix.com';
    
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        booking_reference: bookingReference,
        user_email: userEmail,
        status: 'confirmed',
        flight_id: flight.id,
        airline: flight.airline,
        airline_code: flight.airlineCode,
        flight_number: flight.flightNumber,
        origin_city: flight.from,
        origin_code: flight.fromCode,
        destination_city: flight.to,
        destination_code: flight.toCode,
        departure_time: flight.departureTime,
        arrival_time: flight.arrivalTime,
        duration: flight.duration,
        aircraft: flight.aircraft,
        class_type: flight.classType,
        base_fare: pricing.baseFare,
        taxes: pricing.taxes,
        convenience_fee: pricing.convenienceFee,
        seat_charges: pricing.seatCharges,
        total_amount: pricing.totalAmount,
        passengers: passengers as unknown as never,
        seats: seats as unknown as never,
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (error) throw error;
    
    // Transform the response to match our interface
    const transformedData: BookingRecord = {
      ...data,
      status: data.status as BookingStatus,
      refund_status: data.refund_status as RefundStatus | null,
      passengers: data.passengers as unknown as Passenger[],
      seats: data.seats as unknown as Seat[],
    };
    
    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { data: null, error: error as Error };
  }
};

export const getBookingsByEmail = async (email: string): Promise<{ data: BookingRecord[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the response to match our interface
    const transformedData: BookingRecord[] = (data || []).map(booking => ({
      ...booking,
      status: booking.status as BookingStatus,
      refund_status: booking.refund_status as RefundStatus | null,
      passengers: booking.passengers as unknown as Passenger[],
      seats: booking.seats as unknown as Seat[],
    }));
    
    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return { data: null, error: error as Error };
  }
};

export const getBookingByReference = async (reference: string): Promise<{ data: BookingRecord | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_reference', reference)
      .maybeSingle();

    if (error) throw error;
    
    if (!data) {
      return { data: null, error: null };
    }
    
    // Transform the response to match our interface
    const transformedData: BookingRecord = {
      ...data,
      status: data.status as BookingStatus,
      refund_status: data.refund_status as RefundStatus | null,
      passengers: data.passengers as unknown as Passenger[],
      seats: data.seats as unknown as Seat[],
    };
    
    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error fetching booking:', error);
    return { data: null, error: error as Error };
  }
};

export const cancelBooking = async (
  bookingReference: string,
  cancellationReason: string,
  refundAmount: number
): Promise<{ data: BookingRecord | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: cancellationReason,
        refund_amount: refundAmount,
        refund_status: 'pending',
      })
      .eq('booking_reference', bookingReference)
      .select()
      .single();

    if (error) throw error;
    
    // Transform the response to match our interface
    const transformedData: BookingRecord = {
      ...data,
      status: data.status as BookingStatus,
      refund_status: data.refund_status as RefundStatus | null,
      passengers: data.passengers as unknown as Passenger[],
      seats: data.seats as unknown as Seat[],
    };
    
    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { data: null, error: error as Error };
  }
};

export const sendBookingEmail = async (
  type: 'confirmation' | 'cancellation',
  booking: BookingRecord,
  refundAmount?: number,
  cancellationReason?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const passengers = booking.passengers.map(p => ({
      firstName: p.firstName,
      lastName: p.lastName,
      seatId: p.seatId,
    }));

    const { data, error } = await supabase.functions.invoke('send-booking-email', {
      body: {
        type,
        booking: {
          bookingReference: booking.booking_reference,
          userEmail: booking.user_email,
          airline: booking.airline,
          flightNumber: booking.flight_number,
          originCity: booking.origin_city,
          originCode: booking.origin_code,
          destinationCity: booking.destination_city,
          destinationCode: booking.destination_code,
          departureTime: booking.departure_time,
          arrivalTime: booking.arrival_time,
          duration: booking.duration,
          classType: booking.class_type,
          totalAmount: booking.total_amount,
          passengers,
        },
        refundAmount,
        cancellationReason,
      },
    });

    if (error) throw error;
    
    return { success: data?.success || false, error: data?.message };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getAllBookings = async (): Promise<{ data: BookingRecord[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the response to match our interface
    const transformedData: BookingRecord[] = (data || []).map(booking => ({
      ...booking,
      status: booking.status as BookingStatus,
      refund_status: booking.refund_status as RefundStatus | null,
      passengers: booking.passengers as unknown as Passenger[],
      seats: booking.seats as unknown as Seat[],
    }));
    
    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return { data: null, error: error as Error };
  }
};
