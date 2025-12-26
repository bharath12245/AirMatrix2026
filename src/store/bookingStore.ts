import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  classType: 'economy' | 'business' | 'first';
  availableSeats: number;
  aircraft: string;
  stops: number;
  delayRisk: 'low' | 'medium' | 'high';
}

export interface Seat {
  id: string;
  row: number;
  column: string;
  type: 'standard' | 'premium' | 'emergency';
  status: 'available' | 'booked' | 'selected';
  price: number;
  legroom: 'standard' | 'extra';
  isWindow: boolean;
  isAisle: boolean;
}

export interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  passportNumber?: string;
  seatId?: string;
}

export interface Booking {
  id: string;
  flight: Flight;
  passengers: Passenger[];
  seats: Seat[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  paymentMethod?: string;
}

export interface SearchParams {
  from: string;
  to: string;
  date: string;
  returnDate?: string;
  passengers: number;
  classType: 'economy' | 'business' | 'first';
  tripType: 'one-way' | 'round-trip';
}

interface BookingState {
  searchParams: SearchParams | null;
  selectedFlight: Flight | null;
  selectedSeats: Seat[];
  passengers: Passenger[];
  currentBooking: Booking | null;
  recentSearches: SearchParams[];
  savedPassengers: Passenger[];
  
  setSearchParams: (params: SearchParams) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  addSelectedSeat: (seat: Seat) => void;
  removeSelectedSeat: (seatId: string) => void;
  clearSelectedSeats: () => void;
  setPassengers: (passengers: Passenger[]) => void;
  setCurrentBooking: (booking: Booking | null) => void;
  addRecentSearch: (search: SearchParams) => void;
  addSavedPassenger: (passenger: Passenger) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      searchParams: null,
      selectedFlight: null,
      selectedSeats: [],
      passengers: [],
      currentBooking: null,
      recentSearches: [],
      savedPassengers: [],

      setSearchParams: (params) => set({ searchParams: params }),
      
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      
      addSelectedSeat: (seat) => set((state) => ({
        selectedSeats: [...state.selectedSeats, { ...seat, status: 'selected' }]
      })),
      
      removeSelectedSeat: (seatId) => set((state) => ({
        selectedSeats: state.selectedSeats.filter((s) => s.id !== seatId)
      })),
      
      clearSelectedSeats: () => set({ selectedSeats: [] }),
      
      setPassengers: (passengers) => set({ passengers }),
      
      setCurrentBooking: (booking) => set({ currentBooking: booking }),
      
      addRecentSearch: (search) => set((state) => ({
        recentSearches: [search, ...state.recentSearches.slice(0, 4)]
      })),
      
      addSavedPassenger: (passenger) => set((state) => ({
        savedPassengers: [...state.savedPassengers, passenger]
      })),
      
      resetBooking: () => set({
        selectedFlight: null,
        selectedSeats: [],
        passengers: [],
        currentBooking: null
      })
    }),
    {
      name: 'airmatrix-booking-storage',
    }
  )
);
