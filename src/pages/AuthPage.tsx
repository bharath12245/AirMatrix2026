import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, signIn, signUp } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; fullName?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    if (!isLogin && !fullName.trim()) {
      newErrors.fullName = 'Please enter your full name';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Login Failed',
              description: 'Invalid email or password. Please try again.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Login Failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully logged in.',
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account Exists',
              description: 'An account with this email already exists. Please log in instead.',
              variant: 'destructive',
            });
            setIsLogin(true);
          } else {
            toast({
              title: 'Sign Up Failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Account Created!',
            description: 'Welcome to AirMatrix! You can now start booking flights.',
          });
          navigate('/');
        }
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Plane className="h-12 w-12 text-primary animate-float" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-navy to-ocean/90" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 opacity-20">
          <Plane className="h-32 w-32 text-primary-foreground transform -rotate-12 animate-float" />
        </div>
        <div className="absolute bottom-32 right-20 opacity-10">
          <Plane className="h-48 w-48 text-primary-foreground transform rotate-45" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary-foreground/10 rounded-2xl backdrop-blur-sm">
              <Plane className="h-8 w-8 transform -rotate-45" />
            </div>
            <span className="text-3xl font-bold">AirMatrix</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Your Journey to
            <br />
            <span className="text-accent">Smarter Travel</span>
            <br />
            Starts Here
          </h1>
          
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-md">
            Experience AI-powered flight booking with smart fare predictions, 
            real-time pricing in INR, and personalized travel recommendations.
          </p>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-foreground/10 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <span>AI-powered fare predictions</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-foreground/10 rounded-lg">
                <span className="text-sm font-bold">₹</span>
              </div>
              <span>Real-time prices in Indian Rupees</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-foreground/10 rounded-lg">
                <Lock className="h-5 w-5" />
              </div>
              <span>Secure & encrypted transactions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <Plane className="h-8 w-8 text-primary transform -rotate-45" />
            <span className="text-2xl font-bold">AirMatrix</span>
          </div>

          <Card className="p-8 glass-card">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-muted-foreground">
                {isLogin 
                  ? 'Sign in to continue your journey' 
                  : 'Join AirMatrix and start booking smarter'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">◌</span>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  }}
                  className="ml-2 text-primary font-medium hover:underline"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to AirMatrix's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
