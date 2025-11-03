import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Search, FileText, CheckCircle, LayoutDashboard, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-image.jpg";
import { useUserRole } from "@/hooks/useUserRole";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { role, loading: roleLoading } = useUserRole();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      {/* Staff Welcome Banner */}
      {user && role === "staff" && !roleLoading && (
        <section className="bg-gradient-to-r from-primary/20 to-accent/20 border-b border-primary/30">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Welcome back, Staff!</h3>
                  <p className="text-sm text-muted-foreground">
                    You're logged in with staff privileges. Manage found items and review claims.
                  </p>
                </div>
              </div>
              <Button asChild variant="default">
                <Link to="/admin">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                {user && role === "staff" && !roleLoading ? (
                  <>
                    Welcome Staff!
                    <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Manage Lost & Found
                    </span>
                  </>
                ) : (
                  <>
                    Lost Something?
                    <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      We'll Help You Find It
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xl text-muted-foreground">
                {user && role === "staff" && !roleLoading 
                  ? "As a staff member, you can manage found items, review claims, and help reunite lost items with their owners. Access your dashboard for advanced management tools."
                  : "Connect lost items with their owners. Browse and claim items without login. Students can report lost items without signing in - staff login required to report found items."
                }
              </p>
              <div className="flex flex-wrap gap-4">
                {user && role === "staff" && !roleLoading ? (
                  <>
                    <Button size="lg" asChild className="shadow-lg">
                      <Link to="/admin">
                        <LayoutDashboard className="mr-2 h-5 w-5" />
                        Go to Dashboard
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/report">
                        <FileText className="mr-2 h-5 w-5" />
                        Report Found Item
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="lg" asChild className="shadow-lg">
                      <Link to="/browse">
                        <Search className="mr-2 h-5 w-5" />
                        Browse Items
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/report">
                        <FileText className="mr-2 h-5 w-5" />
                        Report an Item
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl"></div>
              <img
                src={heroImage}
                alt="Students helping each other"
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Staff Quick Actions */}
      {user && role === "staff" && !roleLoading && (
        <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Staff Quick Actions</h2>
              <p className="text-xl text-muted-foreground">
                Manage items, claims, and storage locations
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = "/admin"}>
                <CardContent className="pt-6">
                  <LayoutDashboard className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    View all items, manage claims, and track activity
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = "/report"}>
                <CardContent className="pt-6">
                  <FileText className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Report Found Item</h3>
                  <p className="text-sm text-muted-foreground">
                    Log items you've found on campus
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = "/admin/storage"}>
                <CardContent className="pt-6">
                  <Package className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Storage Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Assign physical storage locations
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = "/admin/reports"}>
                <CardContent className="pt-6">
                  <Search className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    View statistics and reports
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to reunite lost items
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center mb-6">
                <FileText className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Report</h3>
              <p className="text-muted-foreground">
                Lost something? Report it without signing in! Create a detailed report with photos and 
                description. Staff can report found items with login.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent-glow rounded-lg flex items-center justify-center mb-6">
                <Search className="h-7 w-7 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Search</h3>
              <p className="text-muted-foreground">
                No login required! Browse through found items using filters for category, color, location,
                and date. Find what you're looking for quickly.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-success to-success/80 rounded-lg flex items-center justify-center mb-6">
                <CheckCircle className="h-7 w-7 text-success-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Reunite</h3>
              <p className="text-muted-foreground">
                Claim your item or mark it as returned. Staff verification ensures
                items reach their rightful owners safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-primary-glow rounded-2xl p-12 text-center shadow-xl">
            <Package className="h-16 w-16 mx-auto mb-6 text-primary-foreground" />
            <h2 className="text-4xl font-bold text-primary-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Students can report lost items without signing up! Staff can sign up to manage found items.
              It's free and easy to use!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="shadow-lg">
                <Link to="/report">Report Lost Item (No Login)</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild className="shadow-lg">
                <Link to="/auth">Staff Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Lost & Found. Built with care for campus communities.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
