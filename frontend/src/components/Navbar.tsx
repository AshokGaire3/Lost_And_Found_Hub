import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Package, User, LogOut, FileText, ClipboardList, BarChart3, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useMemo, memo } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useUserRole } from "@/hooks/useUserRole";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { role } = useUserRole();
  const [pendingLocation, setPendingLocation] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  // Track location changes to prevent flicker
  useEffect(() => {
    // Clear pending location after a short delay to allow page to render
    if (pendingLocation) {
      const timer = setTimeout(() => {
        setPendingLocation(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location, pendingLocation]);

  // Check if we're on an admin route - if so, show staff navigation immediately
  // This prevents showing homepage buttons when navigating to staff pages
  // Use location.pathname directly (synchronous) to ensure immediate route detection
  const isAdminRoute = location.pathname.startsWith("/admin") || (pendingLocation?.startsWith("/admin") ?? false);

  // Optimistically determine if we should show staff navigation
  // Show staff nav if: role is staff OR we're on admin route (to prevent flash)
  // This ensures staff nav shows immediately on page reload for admin routes
  const showStaffNav = isAdminRoute || (user && role === "staff");

  // Memoize active states for all navigation buttons to prevent unnecessary re-renders
  // Use pending location if available to prevent flicker during navigation
  const activeStates = useMemo(() => {
    const currentPath = pendingLocation || location.pathname + location.search;
    
    const checkActive = (path: string): boolean => {
      if (path.includes("?")) {
        const [basePath, queryString] = path.split("?");
        const params = new URLSearchParams(queryString);
        
        // Check if current path matches
        if (!currentPath.startsWith(basePath)) return false;
        
        // For paths with query params, check them
        if (currentPath.includes("?")) {
          const currentParams = new URLSearchParams(currentPath.split("?")[1]);
          for (const [key, value] of params.entries()) {
            if (currentParams.get(key) !== value) return false;
          }
        } else if (params.toString()) {
          return false;
        }
        return true;
      }
      // For /admin without tab parameter, default to items tab being active
      if (path === "/admin?tab=items" && currentPath === "/admin") {
        return true;
      }
      // Exact path match
      return currentPath === path;
    };

    return {
      items: checkActive("/admin?tab=items"),
      claims: checkActive("/admin?tab=claims"),
      bulkRelease: checkActive("/admin/bulk-release"),
      reports: checkActive("/admin/reports"),
    };
  }, [location.pathname, location.search, pendingLocation]);

  return (
    <nav className="border-b-2 border-foreground/20 bg-background backdrop-blur-sm sticky top-0 z-50 shadow-sm will-change-[transform]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-foreground" />
            <span className="text-xl font-bold text-foreground">
              Lost and Found <span className="text-nku-gold">NKU</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {showStaffNav ? (
              <>
                {/* Staff Navigation Buttons */}
                <Link 
                  to="/admin?tab=items"
                  onClick={() => setPendingLocation("/admin?tab=items")}
                  className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all duration-75 ease-linear will-change-auto ${
                    activeStates.items
                      ? "bg-foreground text-background hover:bg-foreground/90 shadow-sm" 
                      : "text-foreground hover:text-nku-gold hover:bg-secondary/50"
                  }`}
                  style={{ 
                    transitionProperty: 'background-color, color, box-shadow',
                    WebkitFontSmoothing: 'antialiased'
                  }}
                >
                  <Package className="h-4 w-4 shrink-0" />
                  <span>Items</span>
                </Link>
                <Link 
                  to="/admin?tab=claims"
                  onClick={() => setPendingLocation("/admin?tab=claims")}
                  className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all duration-75 ease-linear will-change-auto ${
                    activeStates.claims
                      ? "bg-foreground text-background hover:bg-foreground/90 shadow-sm" 
                      : "text-foreground hover:text-nku-gold hover:bg-secondary/50"
                  }`}
                  style={{ 
                    transitionProperty: 'background-color, color, box-shadow',
                    WebkitFontSmoothing: 'antialiased'
                  }}
                >
                  <ClipboardList className="h-4 w-4 shrink-0" />
                  <span>Claims</span>
                </Link>
                <Link 
                  to="/admin/bulk-release"
                  onClick={() => setPendingLocation("/admin/bulk-release")}
                  className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all duration-75 ease-linear will-change-auto ${
                    activeStates.bulkRelease
                      ? "bg-foreground text-background hover:bg-foreground/90 shadow-sm" 
                      : "text-foreground hover:text-nku-gold hover:bg-secondary/50"
                  }`}
                  style={{ 
                    transitionProperty: 'background-color, color, box-shadow',
                    WebkitFontSmoothing: 'antialiased'
                  }}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span>Bulk Release</span>
                </Link>
                <Link 
                  to="/admin/reports"
                  onClick={() => setPendingLocation("/admin/reports")}
                  className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all duration-75 ease-linear will-change-auto ${
                    activeStates.reports
                      ? "bg-foreground text-background hover:bg-foreground/90 shadow-sm" 
                      : "text-foreground hover:text-nku-gold hover:bg-secondary/50"
                  }`}
                  style={{ 
                    transitionProperty: 'background-color, color, box-shadow',
                    WebkitFontSmoothing: 'antialiased'
                  }}
                >
                  <BarChart3 className="h-4 w-4 shrink-0" />
                  <span>Reports</span>
                </Link>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem asChild>
                      <Link to="/my-items">
                        <Package className="h-4 w-4 mr-2" />
                        My Items
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/storage">
                        <Package className="h-4 w-4 mr-2" />
                        Storage Management
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/audit">
                        <FileText className="h-4 w-4 mr-2" />
                        Audit Log
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : user ? (
              <>
                {/* Non-staff user navigation */}
                <Button variant="link" size="sm" asChild className="text-foreground font-semibold hover:text-nku-gold transition-colors">
                  <Link to="/browse">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Link>
                </Button>
                <Button variant="link" size="sm" asChild className="text-foreground font-semibold hover:text-nku-gold transition-colors">
                  <Link to="/report">Report Item</Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem asChild>
                      <Link to="/my-items">My Items</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Guest navigation */}
                <Button variant="link" size="sm" asChild className="text-foreground font-semibold hover:text-nku-gold transition-colors">
                  <Link to="/browse">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Link>
                </Button>
                <Button variant="link" size="sm" asChild className="text-foreground font-semibold hover:text-nku-gold transition-colors">
                  <Link to="/report">Report Lost Item</Link>
                </Button>
                <Button variant="link" size="sm" asChild className="text-foreground font-semibold hover:text-nku-gold transition-colors">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
