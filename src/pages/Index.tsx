import Navbar from '@/components/Navbar';
import FlightSearch from '@/components/FlightSearch';
import AeroSenseChat from '@/components/AeroSenseChat';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plane, Shield, Clock, Sparkles, ChevronRight, TrendingDown, Calendar, MapPin } from 'lucide-react';
import heroImage from '@/assets/hero-plane.jpg';

const Index = () => {
  const features = [
    {
      icon: TrendingDown,
      title: 'Smart Fare Predictions',
      description: 'AI-powered price analysis helps you find the cheapest days to fly',
    },
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Bank-grade encryption protects your payment and personal data',
    },
    {
      icon: Clock,
      title: 'Delay Insights',
      description: 'Historical data shows flight delay risks before you book',
    },
    {
      icon: Sparkles,
      title: 'AI Assistant',
      description: 'AeroSense helps you plan the perfect trip with personalized tips',
    },
  ];

  const destinations = [
    { city: 'Dubai', country: 'UAE', price: 24999, image: '🏙️' },
    { city: 'Singapore', country: 'Singapore', price: 18499, image: '🏢' },
    { city: 'Bangkok', country: 'Thailand', price: 12999, image: '🛕' },
    { city: 'Maldives', country: 'Maldives', price: 29999, image: '🏝️' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Airplane flying through golden clouds"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Flight Booking
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4">
              Your Journey Begins
              <br />
              <span className="bg-gradient-to-r from-primary to-ocean bg-clip-text text-transparent">
                With AirMatrix
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Smart fare predictions, interactive seat selection, and AI-powered recommendations 
              to make your travel experience seamless.
            </p>
          </div>

          {/* Flight Search */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <FlightSearch />
          </div>
        </div>

        {/* Floating Plane Animation */}
        <div className="absolute top-1/4 -left-20 opacity-20 animate-float hidden lg:block">
          <Plane className="h-32 w-32 text-primary transform -rotate-12" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose AirMatrix?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the future of flight booking with cutting-edge technology and intelligent features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Popular Destinations
              </h2>
              <p className="text-muted-foreground">
                Explore trending destinations with the best fares
              </p>
            </div>
            <Button variant="ghost" className="hidden md:flex">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest) => (
              <Card
                key={dest.city}
                className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
              >
                <div className="h-40 bg-gradient-to-br from-primary/20 to-ocean/20 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                  {dest.image}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-foreground">{dest.city}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{dest.country}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">From</span>
                    <span className="text-xl font-bold text-primary">₹{dest.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Join millions of travelers who trust AirMatrix for their journey. 
            Get exclusive deals and personalized recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl">
              Start Booking
            </Button>
            <Button variant="glass" size="xl" className="text-primary-foreground border-primary-foreground/30">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Plane className="h-6 w-6 text-primary transform -rotate-45" />
              <span className="text-lg font-bold">AirMatrix</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Destinations</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            </nav>
            <p className="text-sm text-muted-foreground">
              © 2024 AirMatrix. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* AI Chat Widget */}
      <AeroSenseChat />
    </div>
  );
};

export default Index;
