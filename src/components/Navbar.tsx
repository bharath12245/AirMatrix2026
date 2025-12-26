import { Plane, User, Menu, X, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/flights', label: 'Flights' },
    { href: '/dashboard', label: 'My Trips' },
  ];

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Signed Out',
        description: 'You have been signed out successfully.',
      });
      navigate('/auth');
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:bg-primary/30 transition-colors" />
              <Plane className="relative h-8 w-8 text-primary transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-ocean bg-clip-text text-transparent">
              AirMatrix
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative py-1",
                  location.pathname === link.href 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                {link.label}
                {location.pathname === link.href && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="max-w-[150px] truncate">{getUserDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{getUserDisplayName()}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <Plane className="h-4 w-4 mr-2" />
                    My Trips
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button variant="default" size="sm" onClick={() => navigate('/auth')}>
                  Book Now
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === link.href 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 px-4 mt-2">
                {user ? (
                  <>
                    <div className="flex-1 px-2 py-1 text-sm">
                      <p className="font-medium">{getUserDisplayName()}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { navigate('/auth'); setIsOpen(false); }}>
                      Sign In
                    </Button>
                    <Button variant="default" size="sm" className="flex-1" onClick={() => { navigate('/auth'); setIsOpen(false); }}>
                      Book Now
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
