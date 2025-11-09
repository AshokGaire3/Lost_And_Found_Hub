import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Search, FileText, Shield, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useUserRole } from "@/hooks/useUserRole";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const { role, loading: roleLoading } = useUserRole();
  const [user, setUser] = useState<any>(null);
  const [userLoaded, setUserLoaded] = useState(false);

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

  // Memoize staff check to prevent unnecessary re-renders
  // Only show staff content if we're certain the user is staff (prevents flash of wrong content)
  const isStaff = useMemo(() => {
    // Don't show staff content until we've confirmed user state and role
    if (!userLoaded || roleLoading) return false;
    return user && role === "staff";
  }, [user, role, roleLoading, userLoaded]);

  // Prevent layout shift by using a stable layout
  // Default to non-staff view to prevent glitches during navigation
  const showStaffContent = isStaff;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 min-h-[200px] flex flex-col justify-center">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-foreground transition-opacity duration-200">
                {showStaffContent ? (
                  <>
                    Staff Dashboard
                    <span className="block text-foreground">
                      Manage Lost and Found
                    </span>
                  </>
                ) : (
                  <>
                    Lost Something at <span className="text-nku-gold">NKU</span>?
                    <span className="block text-foreground">
                      We'll Help You Find It
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xl text-muted-foreground min-h-[60px] transition-opacity duration-200">
                {showStaffContent
                  ? "Manage found items, track claims, and help reunite lost items with their owners. Use the navigation bar above to access all management tools."
                  : "Connect lost items with their owners. Browse and claim items without login. Students can report lost items without signing in - staff login required to report found items."
                }
              </p>
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

      {/* Quick Actions Section - Role-based functional buttons */}
      <section className={`py-20 bg-card/30 transition-all duration-200 ${!showStaffContent ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
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

              {/* Report Lost Item - Available to guests and students (not staff) */}
              {role !== "staff" && (
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
              )}

              {/* Report Found Item - Staff only */}
              {user && role === "staff" && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild 
                  className="shadow-lg min-w-[160px]"
                >
                  <Link to="/report">
                    <FileText className="mr-2 h-5 w-5" />
                    Report Found Item
                  </Link>
                </Button>
              )}

              {/* My Items - Only for logged-in users */}
              {user && (
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

              {/* Admin Dashboard - Only for staff */}
              {user && role === "staff" && (
                <Button 
                  size="lg" 
                  asChild 
                  className="shadow-lg min-w-[160px] bg-purple-600 hover:bg-purple-700"
                >
                  <Link to="/admin">
                    <Shield className="mr-2 h-5 w-5" />
                    Admin Dashboard
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
