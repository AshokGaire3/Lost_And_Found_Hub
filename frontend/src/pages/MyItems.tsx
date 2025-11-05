import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ItemCard from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Package, MessageSquare, Trash2, CheckCircle, Shield, LayoutDashboard } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUserRole } from "@/hooks/useUserRole";

interface Item {
  id: string;
  title: string;
  description: string;
  status: "lost" | "found" | "claimed" | "returned";
  category: string;
  location: string;
  date_lost_found: string;
  image_url: string | null;
}

interface Claim {
  id: string;
  message: string;
  status: string;
  created_at: string;
  item_id: string;
  claimant_id: string;
}

const MyItems = () => {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const [user, setUser] = useState<any>(null);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [myClaims, setMyClaims] = useState<any[]>([]);
  const [receivedClaims, setReceivedClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in to view your items");
      navigate("/auth");
      return;
    }
    setUser(session.user);
    await fetchData(session.user.id);
  };

  const fetchData = async (userId: string) => {
    try {
      setLoading(true);

      // Fetch user's items
      const { data: items, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (itemsError) throw itemsError;
      setMyItems(items || []);

      // Fetch claims user made
      const { data: claims, error: claimsError } = await supabase
        .from("claims")
        .select(`
          *,
          items (*)
        `)
        .eq("claimant_id", userId)
        .order("created_at", { ascending: false });

      if (claimsError) throw claimsError;
      setMyClaims(claims || []);

      // Fetch claims received on user's items
      const { data: received, error: receivedError } = await supabase
        .from("claims")
        .select(`
          *,
          items!inner (*),
          profiles!claims_claimant_id_fkey (full_name, email)
        `)
        .eq("items.user_id", userId)
        .order("created_at", { ascending: false });

      if (receivedError) throw receivedError;
      setReceivedClaims(received || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load your items");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast.success("Item deleted successfully");
      setMyItems(myItems.filter((item) => item.id !== itemId));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    }
  };

  const handleUpdateClaimStatus = async (claimId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("claims")
        .update({ status })
        .eq("id", claimId);

      if (error) throw error;

      toast.success(`Claim ${status}`);
      if (user) await fetchData(user.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to update claim");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Staff Banner */}
        {role === "staff" && !roleLoading && (
          <div className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Staff Dashboard Available</p>
                  <p className="text-sm text-muted-foreground">
                    Access advanced features and management tools
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to Admin Dashboard
                </Link>
              </Button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your reported items and claims
          </p>
        </div>

        <Tabs defaultValue="items">
          <TabsList>
            <TabsTrigger value="items">My Items ({myItems.length})</TabsTrigger>
            <TabsTrigger value="claims">My Claims ({myClaims.length})</TabsTrigger>
            <TabsTrigger value="received">
              Received Claims ({receivedClaims.length})
            </TabsTrigger>
          </TabsList>

          {/* My Items Tab */}
          <TabsContent value="items" className="mt-6">
            {myItems.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No items yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by reporting a lost or found item
                </p>
                <Button onClick={() => navigate("/report")}>Report Item</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myItems.map((item) => (
                  <div key={item.id} className="relative group">
                    <ItemCard
                      id={item.id}
                      title={item.title}
                      description={item.description}
                      status={item.status}
                      category={item.category}
                      location={item.location}
                      dateLostFound={item.date_lost_found}
                      imageUrl={item.image_url || undefined}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete
                            your item and all associated claims.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Claims Tab */}
          <TabsContent value="claims" className="mt-6">
            {myClaims.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No claims yet</h3>
                <p className="text-muted-foreground">
                  Browse items and claim what's yours
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myClaims.map((claim: any) => (
                  <Card key={claim.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {claim.items?.title || "Item"}
                        </CardTitle>
                        <Badge
                          variant={
                            claim.status === "approved"
                              ? "default"
                              : claim.status === "rejected"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {claim.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {claim.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {format(new Date(claim.created_at), "MMM d, yyyy")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Received Claims Tab */}
          <TabsContent value="received" className="mt-6">
            {receivedClaims.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No claims received yet
                </h3>
                <p className="text-muted-foreground">
                  When someone claims your item, it will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedClaims.map((claim: any) => (
                  <Card key={claim.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {claim.items?.title || "Item"}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            From: {claim.profiles?.full_name || claim.profiles?.email || "Unknown"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            claim.status === "approved"
                              ? "default"
                              : claim.status === "rejected"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {claim.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{claim.message}</p>
                      <p className="text-xs text-muted-foreground">
                        Received {format(new Date(claim.created_at), "MMM d, yyyy")}
                      </p>
                      {claim.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateClaimStatus(claim.id, "approved")
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleUpdateClaimStatus(claim.id, "rejected")
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyItems;
