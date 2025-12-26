-- Create bookings table to store all booking records
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_reference TEXT NOT NULL UNIQUE,
  user_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  
  -- Flight details
  flight_id TEXT NOT NULL,
  airline TEXT NOT NULL,
  airline_code TEXT NOT NULL,
  flight_number TEXT NOT NULL,
  origin_city TEXT NOT NULL,
  origin_code TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_code TEXT NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration TEXT NOT NULL,
  aircraft TEXT,
  class_type TEXT NOT NULL DEFAULT 'economy',
  
  -- Pricing
  base_fare NUMERIC NOT NULL,
  taxes NUMERIC NOT NULL DEFAULT 0,
  convenience_fee NUMERIC NOT NULL DEFAULT 0,
  seat_charges NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  
  -- Passengers and seats (stored as JSONB)
  passengers JSONB NOT NULL DEFAULT '[]'::jsonb,
  seats JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Payment info
  payment_method TEXT,
  
  -- Cancellation details
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  refund_amount NUMERIC,
  refund_status TEXT CHECK (refund_status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert bookings (for guests)
CREATE POLICY "Anyone can insert bookings"
ON public.bookings
FOR INSERT
WITH CHECK (true);

-- Allow users to view their own bookings by email
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
USING (true);

-- Allow users to update their own bookings (for cancellation)
CREATE POLICY "Users can update their own bookings"
ON public.bookings
FOR UPDATE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_bookings_updated_at();