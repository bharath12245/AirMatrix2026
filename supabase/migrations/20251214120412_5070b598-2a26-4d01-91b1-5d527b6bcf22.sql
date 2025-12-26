-- Fare History table for AI-powered predictions
CREATE TABLE public.fare_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origin_code TEXT NOT NULL,
  destination_code TEXT NOT NULL,
  departure_date DATE NOT NULL,
  fare_inr NUMERIC NOT NULL,
  airline TEXT,
  flight_number TEXT,
  cabin_class TEXT DEFAULT 'ECONOMY',
  stops INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  search_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for efficient querying
CREATE INDEX idx_fare_history_route ON public.fare_history(origin_code, destination_code);
CREATE INDEX idx_fare_history_date ON public.fare_history(departure_date);
CREATE INDEX idx_fare_history_search_time ON public.fare_history(search_timestamp);

-- Enable RLS but allow public read/write for fare tracking
ALTER TABLE public.fare_history ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read fare history (for AI predictions)
CREATE POLICY "Anyone can view fare history" 
ON public.fare_history 
FOR SELECT 
USING (true);

-- Allow the system to insert fare history
CREATE POLICY "System can insert fare history" 
ON public.fare_history 
FOR INSERT 
WITH CHECK (true);

-- Flight searches table for user history
CREATE TABLE public.flight_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origin_city TEXT NOT NULL,
  origin_code TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_code TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  passengers INTEGER DEFAULT 1,
  cabin_class TEXT DEFAULT 'ECONOMY',
  lowest_fare_found NUMERIC,
  search_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.flight_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view searches" 
ON public.flight_searches 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert searches" 
ON public.flight_searches 
FOR INSERT 
WITH CHECK (true);