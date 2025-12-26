import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AeroSenseChat from '@/components/AeroSenseChat';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, Calendar, MapPin, Clock, ChevronRight, Ticket, XCircle, IndianRupee } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { currentBooking, recentSearches } = useBookingStore();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Trips</h1>
            <p className="text-muted-foreground">Manage your bookings and travel history</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Bookings */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  Active Bookings
                </h2>

                {currentBooking ? (
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Plane className="h-7 w-7 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-lg">
                                {currentBooking.flight.from} → {currentBooking.flight.to}
                              </p>
                              {getStatusBadge(currentBooking.status)}
                            </div>
                            <p className="text-muted-foreground">
                              {currentBooking.flight.flightNumber} • {currentBooking.flight.departureTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Booking Ref</p>
                            <p className="font-bold text-primary">{currentBooking.id}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Price & Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-5 w-5 text-muted-foreground" />
                          <span className="text-lg font-semibold">
                            ₹{currentBooking.totalPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({currentBooking.passengers.length} passenger{currentBooking.passengers.length > 1 ? 's' : ''})
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {currentBooking.status !== 'cancelled' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => navigate(`/cancel?ref=${currentBooking.id}`)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel Booking
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Plane className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">No Active Bookings</h3>
                    <p className="text-muted-foreground mb-4">
                      Ready for your next adventure? Start searching for flights.
                    </p>
                    <Link to="/">
                      <Button variant="hero">Search Flights</Button>
                    </Link>
                  </Card>
                )}
              </div>

              {/* Recent Searches */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Searches
                </h2>

                {recentSearches.length > 0 ? (
                  <div className="space-y-3">
                    {recentSearches.map((search, index) => (
                      <Card
                        key={index}
                        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {search.from} → {search.to}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {search.date} • {search.passengers} passenger{search.passengers > 1 ? 's' : ''} • {search.classType}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-6 text-center">
                    <p className="text-muted-foreground">No recent searches yet</p>
                  </Card>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Plane className="h-4 w-4 mr-2" />
                      Book a Flight
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage Booking
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    Check-in Online
                  </Button>
                </div>
              </Card>

              {/* Refund Policy Info */}
              <Card className="p-6 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                <h3 className="font-semibold mb-3">Cancellation Policy</h3>
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p>• <strong className="text-green-600">100%</strong> refund within 24 hours</p>
                  <p>• <strong className="text-green-600">90%</strong> refund within 72 hours</p>
                  <p>• <strong className="text-amber-600">75%</strong> refund within 7 days</p>
                  <p>• <strong className="text-red-600">50%</strong> refund within 14 days</p>
                </div>
              </Card>

              {/* Travel Stats */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Travel Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Trips</span>
                    <span className="font-bold text-2xl">{currentBooking ? 1 : 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Miles Traveled</span>
                    <span className="font-bold text-2xl">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Countries Visited</span>
                    <span className="font-bold text-2xl">0</span>
                  </div>
                </div>
              </Card>

              {/* Promo */}
              <Card className="p-6 gradient-hero text-primary-foreground">
                <h3 className="font-semibold mb-2">AirMatrix Rewards</h3>
                <p className="text-sm opacity-90 mb-4">
                  Join our rewards program and earn points on every flight!
                </p>
                <Button variant="glass" size="sm">
                  Learn More
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <AeroSenseChat />
    </div>
  );
};

export default DashboardPage;
