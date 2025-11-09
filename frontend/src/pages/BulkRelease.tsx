import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { Skeleton } from "@/components/ui/skeleton";

const BulkRelease = () => {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const [redirecting, setRedirecting] = useState(false);

  // Verify authorization in background - don't block initial render
  useEffect(() => {
    if (!roleLoading) {
      if (role !== "staff" && role !== null) {
        // Not staff - redirect after a brief moment to allow page structure to render
        setRedirecting(true);
        toast.error("Access denied. Staff only.");
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 100);
      } else if (role === "staff") {
        // Cache role for future navigation
        try {
          sessionStorage.setItem("user_role", "staff");
        } catch {}
      }
    }
  }, [role, roleLoading, navigate]);

  // Always render the page structure immediately - never return null
  // This ensures React Router doesn't try to render another route
  // On page reload, this component mounts immediately, preventing any flash
  // Default to showing content (optimistic) - only show skeleton if we're definitely not staff and still checking
  const shouldShowSkeleton = roleLoading && role === null && !redirecting;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {shouldShowSkeleton ? (
          <div className="space-y-8">
            <div className="mb-8">
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-96" />
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          // Always show content structure by default - prevents flash on reload
          <div className="space-y-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Bulk Release</h1>
              <p className="text-muted-foreground">
                Release multiple items in bulk operations
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Bulk Release Operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Bulk Release Feature</h3>
                  <p className="text-muted-foreground mb-6">
                    This feature will allow you to release multiple items at once.
                    Coming soon...
                  </p>
                  <Button asChild>
                    <Link to="/admin?tab=items">Go to Items</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkRelease;

