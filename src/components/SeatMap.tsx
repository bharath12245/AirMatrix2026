import { useState, useMemo } from 'react';
import { Seat } from '@/store/bookingStore';
import { cn } from '@/lib/utils';
import { AlertTriangle, Check, X } from 'lucide-react';

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: Seat[];
  maxSeats: number;
  onSeatSelect: (seat: Seat) => void;
  onSeatDeselect: (seatId: string) => void;
}

const SeatMap = ({ seats, selectedSeats, maxSeats, onSeatSelect, onSeatDeselect }: SeatMapProps) => {
  const rows = useMemo(() => {
    const rowMap = new Map<number, Seat[]>();
    seats.forEach(seat => {
      const rowSeats = rowMap.get(seat.row) || [];
      rowSeats.push(seat);
      rowMap.set(seat.row, rowSeats);
    });
    return Array.from(rowMap.entries()).sort((a, b) => a[0] - b[0]);
  }, [seats]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'booked') return;

    const isSelected = selectedSeats.some(s => s.id === seat.id);
    
    if (isSelected) {
      onSeatDeselect(seat.id);
    } else if (selectedSeats.length < maxSeats) {
      onSeatSelect(seat);
    }
  };

  const getSeatClass = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    
    if (isSelected) return 'seat-selected bg-primary text-primary-foreground';
    if (seat.status === 'booked') return 'seat-booked';
    if (seat.type === 'premium') return 'seat-premium';
    return 'seat-available text-primary-foreground';
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded seat-available" />
          <span className="text-sm text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded seat-premium" />
          <span className="text-sm text-muted-foreground">Premium (+₹1,500)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded seat-booked" />
          <span className="text-sm text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary ring-2 ring-primary ring-offset-2" />
          <span className="text-sm text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-500 border-2 border-orange-500" />
          <span className="text-sm text-muted-foreground">Emergency Exit</span>
        </div>
      </div>

      {/* Aircraft Nose */}
      <div className="flex justify-center mb-4">
        <div className="w-32 h-8 bg-gradient-to-b from-muted to-transparent rounded-t-full flex items-center justify-center">
          <span className="text-xs text-muted-foreground font-medium">COCKPIT</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="max-h-[500px] overflow-y-auto px-4">
        {/* Column Headers */}
        <div className="flex justify-center gap-1 mb-2 sticky top-0 bg-card py-2 z-10">
          <div className="w-8" />
          {['A', 'B', 'C'].map(col => (
            <div key={col} className="w-10 text-center text-sm font-semibold text-muted-foreground">
              {col}
            </div>
          ))}
          <div className="w-8 text-center text-xs text-muted-foreground">AISLE</div>
          {['D', 'E', 'F'].map(col => (
            <div key={col} className="w-10 text-center text-sm font-semibold text-muted-foreground">
              {col}
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.map(([rowNum, rowSeats]) => (
          <div key={rowNum} className="flex justify-center items-center gap-1 mb-1">
            <div className="w-8 text-right pr-2 text-sm font-medium text-muted-foreground">
              {rowNum}
            </div>
            
            {/* Left side (A, B, C) */}
            {['A', 'B', 'C'].map(col => {
              const seat = rowSeats.find(s => s.column === col);
              if (!seat) return <div key={col} className="w-10 h-10" />;
              
              return (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  disabled={seat.status === 'booked'}
                  className={cn(
                    "w-10 h-10 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center",
                    getSeatClass(seat),
                    seat.type === 'emergency' && 'seat-emergency'
                  )}
                  title={`Seat ${seat.row}${seat.column} - ${seat.type === 'premium' ? '₹1,500 extra' : seat.type === 'emergency' ? '₹1,000 extra' : 'Free'}`}
                >
                  {seat.status === 'booked' ? (
                    <X className="h-4 w-4" />
                  ) : selectedSeats.some(s => s.id === seat.id) ? (
                    <Check className="h-4 w-4" />
                  ) : seat.type === 'emergency' ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : (
                    `${seat.row}${seat.column}`
                  )}
                </button>
              );
            })}
            
            {/* Aisle */}
            <div className="w-8" />
            
            {/* Right side (D, E, F) */}
            {['D', 'E', 'F'].map(col => {
              const seat = rowSeats.find(s => s.column === col);
              if (!seat) return <div key={col} className="w-10 h-10" />;
              
              return (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  disabled={seat.status === 'booked'}
                  className={cn(
                    "w-10 h-10 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center",
                    getSeatClass(seat),
                    seat.type === 'emergency' && 'seat-emergency'
                  )}
                  title={`Seat ${seat.row}${seat.column} - ${seat.type === 'premium' ? '₹1,500 extra' : seat.type === 'emergency' ? '₹1,000 extra' : 'Free'}`}
                >
                  {seat.status === 'booked' ? (
                    <X className="h-4 w-4" />
                  ) : selectedSeats.some(s => s.id === seat.id) ? (
                    <Check className="h-4 w-4" />
                  ) : seat.type === 'emergency' ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : (
                    `${seat.row}${seat.column}`
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Aircraft Tail */}
      <div className="flex justify-center mt-4">
        <div className="w-24 h-6 bg-gradient-to-t from-muted to-transparent rounded-b-full" />
      </div>
    </div>
  );
};

export default SeatMap;
