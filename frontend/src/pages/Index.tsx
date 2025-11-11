import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Search, FileText, User, Shield, Clock, CheckCircle, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useUserRole } from "@/hooks/useUserRole";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";

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
    if (!userLoaded) return;

    // Trigger hero animation immediately since it's above the fold
    setIsVisible((prev) => ({ ...prev, hero: true }));

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: true,
          }));
        }
      });
    }, observerOptions);

    const elements = [
      { ref: featuresRef, id: "features" },
    ];

    elements.forEach(({ ref, id }) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      elements.forEach(({ ref }) => {
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
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Full-Width Hero Section - NKU Style */}
      <section ref={heroRef} id="hero" className="relative w-full h-[85vh] min-h-[600px] sm:min-h-[700px] md:min-h-[800px] lg:min-h-[90vh] overflow-hidden">
        {/* Full-Width Image Carousel Background */}
        <div className="absolute inset-0 w-full h-full">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              duration: 50,
            }}
            plugins={[
              Autoplay({
                delay: 6000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
            className="relative w-full h-full"
          >
            <CarouselContent className="-ml-0 h-full">
              {nkuImages.map((image, index) => (
                <CarouselItem key={index} className="pl-0 h-full">
                  <div className="relative w-full h-full">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover object-center"
                      loading={index === 0 ? "eager" : "lazy"}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== "/placeholder.svg") {
                          target.src = "/placeholder.svg";
                        }
                      }}
                    />
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40"></div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Overlay Content - Text and Buttons on Top */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full">
            <div 
              className={`max-w-3xl lg:max-w-4xl xl:max-w-5xl space-y-6 sm:space-y-8 md:space-y-10 transition-all duration-1000 ${
                isVisible["hero"] ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit animate-fade-in-down delay-200">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-nku-gold flex-shrink-0" />
                <span className="text-sm sm:text-base font-semibold text-white">Northern Kentucky University</span>
              </div>

              {/* Heading - Large and Prominent */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] xl:text-[88px] font-bold leading-[1.1] sm:leading-[1.08] text-white animate-fade-in-up delay-300 drop-shadow-2xl">
                <span className="block">
                  Lost Something at <span className="text-nku-gold">NKU</span>?
                </span>
                <span className="block mt-3 sm:mt-4 md:mt-5 lg:mt-6">
                  We'll Help You Find It
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl text-white/95 leading-relaxed max-w-2xl animate-fade-in-up delay-400 drop-shadow-lg">
                Connect lost items with their owners quickly and easily. Browse and claim items without login. 
                Students can report lost items instantly.
              </p>

              {/* Action Buttons - Prominent on Top */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4 animate-fade-in-up delay-500">
                <Button 
                  size="default" 
                  asChild 
                  className="shadow-lg hover-lift button-shine group h-11 sm:h-12 text-base sm:text-lg px-6 sm:px-8 bg-white text-foreground hover:bg-white/95 font-semibold"
                >
                  <Link to="/browse" className="flex items-center justify-center">
                    <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span className="whitespace-nowrap">Search Items</span>
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </Link>
                </Button>
                <Button 
                  size="default" 
                  variant="outline" 
                  asChild
                  className="shadow-lg hover-lift hover-glow group h-11 sm:h-12 text-base sm:text-lg px-6 sm:px-8 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 font-semibold"
                >
                  <Link to="/report" className="flex items-center justify-center">
                    <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span className="whitespace-nowrap">Report Item</span>
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Stats Section */}
      <section 
        ref={featuresRef} 
        id="features" 
        className="py-16 md:py-20 lg:py-24 bg-background relative overflow-hidden"
      >
        <div className="container mx-auto px-4">
          <div 
            className={`text-center mb-12 transition-all duration-1000 ${
              isVisible["features"] ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Why Choose Lost & Found NKU?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Quick, easy, and secure way to reunite lost items with their owners
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: Clock,
                title: "Quick Search",
                description: "Find items instantly with our powerful search",
                delay: "delay-100",
              },
              {
                icon: Shield,
                title: "Secure & Safe",
                description: "Your items are protected and verified",
                delay: "delay-200",
              },
              {
                icon: CheckCircle,
                title: "Easy Claiming",
                description: "Claim your items without complex processes",
                delay: "delay-300",
              },
              {
                icon: TrendingUp,
                title: "Fast Recovery",
                description: "High success rate in reuniting items",
                delay: "delay-400",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`interactive-card border-2 bg-card/50 backdrop-blur-sm transition-all duration-1000 ${
                  isVisible["features"]
                    ? `animate-fade-in-up ${feature.delay}`
                    : "opacity-0"
                }`}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-nku-gold/10 border-2 border-nku-gold/20">
                    <feature.icon className="h-8 w-8 text-nku-gold" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-border bg-card/30 py-8 md:py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="h-5 w-5 text-nku-gold" />
              <span className="text-lg font-bold text-foreground">
                Lost and Found <span className="text-nku-gold">NKU</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              © 2025 Lost and Found NKU. Northern Kentucky University.
            </p>
            <p className="text-xs text-muted-foreground/80">
              Reuniting lost items with their owners since 2025
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
