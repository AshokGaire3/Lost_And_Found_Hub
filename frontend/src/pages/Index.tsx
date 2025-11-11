import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Search, FileText, User, Shield, Clock, CheckCircle, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useUserRole } from "@/hooks/useUserRole";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// NKU Campus Images - Imported from assets folder
import nkuStudentUnion from "@/assets/nku-student-union.jpg";
import nkuStudentsGroup from "@/assets/nku-students-group.jpg";
import nkuAutumn from "@/assets/nku-autumn.jpg";
import nkuGriffinHall from "@/assets/nku-griffin-hall.jpg";

const nkuImages = [
  {
    src: nkuStudentUnion,
    alt: "NKU Student Union - Students walking in front of the modern NKU Student Union building",
    title: "NKU Student Union"
  },
  {
    src: nkuStudentsGroup,
    alt: "NKU Students - Large group of NKU students gathered on campus",
    title: "NKU Community"
  },
  {
    src: nkuAutumn,
    alt: "NKU Campus in Autumn - Beautiful autumn scene with NKU buildings reflected in water",
    title: "NKU Campus"
  },
  {
    src: nkuGriffinHall,
    alt: "Griffin Hall at NKU - Griffin Hall illuminated at sunset with colorful lighting",
    title: "Griffin Hall"
  }
];

const Index = () => {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const [user, setUser] = useState<any>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user || null);
          setUserLoaded(true);
        }
      } catch (error) {
        if (mounted) {
          setUser(null);
          setUserLoaded(true);
        }
      }
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (mounted) {
        checkUser();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Redirect staff users to admin dashboard immediately to prevent glitch
  // This ensures staff never see the homepage content
  useEffect(() => {
    // Only redirect if we're certain the user is staff
    // Wait for both user and role to be loaded to avoid false redirects
    if (userLoaded && !roleLoading && user && role === "staff") {
      setIsRedirecting(true);
      // Use replace instead of push to prevent back button issues
      navigate("/admin?tab=items", { replace: true });
    }
  }, [user, role, roleLoading, userLoaded, navigate]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: true,
          }));
        }
      });
    }, observerOptions);

    const refs = [heroRef, featuresRef, actionsRef].filter(Boolean);
    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      refs.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, [userLoaded]);

  // Show loading skeleton while checking user role
  // This prevents any flash of content for staff users
  const isLoading = !userLoaded || roleLoading;
  const isStaffUser = userLoaded && !roleLoading && user && role === "staff";

  // If staff user, show redirect message immediately (before redirect happens)
  if (isLoading || isStaffUser || isRedirecting) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          {isStaffUser || isRedirecting ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <Skeleton className="h-12 w-64 mx-auto" />
                <Skeleton className="h-6 w-48 mx-auto" />
                <p className="text-muted-foreground">Redirecting to admin dashboard...</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                </div>
              </div>
              <Skeleton className="aspect-video w-full rounded-2xl" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 min-h-[200px] flex flex-col justify-center">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-foreground">
                Lost Something at <span className="text-nku-gold">NKU</span>?
                <span className="block text-foreground">
                  We'll Help You Find It
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Connect lost items with their owners. Browse and claim items without login. Students can report lost items without signing in - staff login required to report found items.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="shadow-lg">
                  <Link to="/browse">
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/report">
                    <FileText className="mr-2 h-5 w-5" />
                    Report an Item
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative min-h-[300px]">
              <div className="absolute inset-0 bg-secondary rounded-2xl blur-3xl opacity-50"></div>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="relative w-full rounded-2xl shadow-2xl border-2 border-border overflow-hidden"
              >
                <CarouselContent>
                  {nkuImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-video w-full">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                          loading="eager"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            if (target.src !== "/placeholder.svg") {
                              target.src = "/placeholder.svg";
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
                          <div className="p-6 text-white">
                            <h3 className="text-xl font-semibold drop-shadow-lg">{image.title}</h3>
                            <p className="text-sm text-white/90 mt-1">Northern Kentucky University</p>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4 bg-background/80 hover:bg-background border-border" />
                <CarouselNext className="right-4 bg-background/80 hover:bg-background border-border" />
              </Carousel>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Quick Actions</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {/* Browse Items - Available to everyone */}
            <Button 
              size="lg" 
              asChild 
              className="shadow-lg min-w-[160px]"
            >
              <Link to="/browse">
                <Search className="mr-2 h-5 w-5" />
                Browse Items
              </Link>
            </Button>

            {/* Report Lost Item - Available to guests and students */}
            <Button 
              size="lg" 
              variant="outline" 
              asChild 
              className="shadow-lg min-w-[160px]"
            >
              <Link to="/report">
                <FileText className="mr-2 h-5 w-5" />
                Report Lost Item
              </Link>
            </Button>

            {/* My Items - Only for logged-in users (students) */}
            {user && role !== "staff" && (
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="shadow-lg min-w-[160px]"
              >
                <Link to="/my-items">
                  <Package className="mr-2 h-5 w-5" />
                  My Items
                </Link>
              </Button>
            )}

            {/* Sign In - Only for guests */}
            {!user && (
              <Button 
                size="lg" 
                variant="secondary" 
                asChild 
                className="shadow-lg min-w-[160px]"
              >
                <Link to="/auth">
                  <User className="mr-2 h-5 w-5" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Lost and Found NKU. Northern Kentucky University.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
