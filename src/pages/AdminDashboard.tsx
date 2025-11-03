import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/useUserRole";
import StatsCards from "@/components/admin/StatsCards";
import MatchReview from "@/components/admin/MatchReview";
import ClaimDetailsDialog from "@/components/admin/ClaimDetailsDialog";
import { toast } from "sonner";
import { Package, Search, BarChart, Database, Plus, Eye, FileText } from "lucide-react";
import { format } from "date-fns";

interface Item {
  id: string;
  title: string;
  category: string;
  status: string;
  location: string;
  venue: string | null;
  date_lost_found: string;
  created_at: string;
}

interface Claim {
  id: string;
  item_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  message: string;
  status: string;
  created_at: string;
  reference_number: string | null;
  claim_date: string | null;
  verification_status: string | null;
  staff_notes: string | null;
  items: {
    title: string;
    category: string;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingMatches, setPendingMatches] = useState(0);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);

  useEffect(() => {
    if (!roleLoading) {
      if (role !== "staff") {
        toast.error("Access denied. Staff only.");
        navigate("/");
        return;
      }
      fetchData();
    }
  }, [roleLoading, role, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [itemsRes, claimsRes, matchesRes] = await Promise.all([
        supabase.from("items").select("*").eq("is_active", true).order("created_at", { ascending: false }),
        supabase.from("claims").select("*, items(title, category)").order("created_at", { ascending: false }),
        supabase.from("matches").select("id").eq("status", "pending")
      ]);

      if (itemsRes.error) throw itemsRes.error;
      if (claimsRes.error) throw claimsRes.error;

      setItems(itemsRes.data || []);
      setClaims(claimsRes.data || []);
      setPendingMatches(matchesRes.data?.length || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const updateClaimStatus = async (claimId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("claims")
        .update({ status: newStatus })
        .eq("id", claimId);

      if (error) throw error;
      
      toast.success(`Claim ${newStatus}`);
      fetchData();
    } catch (error) {
      console.error("Error updating claim:", error);
      toast.error("Failed to update claim");
    }
  };

  const updateItemStatus = async (itemId: string, newStatus: "lost" | "found" | "claimed" | "returned") => {
    try {
      const { error } = await supabase
        .from("items")
        .update({ status: newStatus })
        .eq("id", itemId);

      if (error) throw error;
      
      toast.success(`Item status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClaims = claims.filter((claim) =>
    claim.items?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get items from this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const itemsThisWeek = items.filter(item => new Date(item.created_at) > oneWeekAgo).length;

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-32 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Staff Dashboard</h1>
            <p className="text-muted-foreground">Manage lost and found items, claims, and storage</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/report">
                <Plus className="mr-2 h-4 w-4" />
                Report Found Item
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/storage">
                <Database className="mr-2 h-4 w-4" />
                Storage
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/reports">
                <BarChart className="mr-2 h-4 w-4" />
                Reports
              </Link>
            </Button>
          </div>
        </div>

        {/* Staff Info Banner */}
        <div className="mb-8 bg-primary/10 border border-primary/20 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/20 p-3 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Welcome, Staff Member!</h3>
              <p className="text-muted-foreground mb-4">
                You're logged in with <strong>Staff privileges</strong>. Here's what you can do:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ <strong>Report Found Items</strong> - Click "Report Found Item" to log items you've found on campus</li>
                <li>✓ <strong>Manage Claims</strong> - Review and approve claims from students looking for their lost items</li>
                <li>✓ <strong>Track Storage</strong> - Assign physical storage locations to found items</li>
                <li>✓ <strong>Review Matches</strong> - AI-powered suggestions for matching lost and found items</li>
                <li>✓ <strong>View All Items</strong> - Access complete database of all lost and found items</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards
            totalItems={items.length}
            pendingClaims={claims.filter(c => c.status === "pending").length}
            pendingMatches={pendingMatches}
            itemsThisWeek={itemsThisWeek}
          />
        </div>

        {/* Match Review */}
        {pendingMatches > 0 && (
          <div className="mb-8">
            <MatchReview />
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items and claims..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="items">
              <Package className="mr-2 h-4 w-4" />
              Items
            </TabsTrigger>
            <TabsTrigger value="claims">
              <Eye className="mr-2 h-4 w-4" />
              Claims
            </TabsTrigger>
          </TabsList>

          {/* Items Tab */}
          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>All Items</CardTitle>
                <CardDescription>
                  Manage items reported as lost or found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.status === "found"
                                  ? "default"
                                  : item.status === "lost"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.venue || item.location}</TableCell>
                          <TableCell>
                            {format(new Date(item.date_lost_found), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/item/${item.id}`)}
                              >
                                View
                              </Button>
                              <select
                                className="text-sm border rounded px-2 py-1"
                                value={item.status}
                                onChange={(e) =>
                                  updateItemStatus(item.id, e.target.value as any)
                                }
                              >
                                <option value="found">Found</option>
                                <option value="lost">Lost</option>
                                <option value="claimed">Claimed</option>
                                <option value="returned">Returned</option>
                              </select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <CardTitle>Claims</CardTitle>
                <CardDescription>
                  Review and manage item claims
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Claimant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No claims found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClaims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-mono text-sm">
                            {claim.reference_number}
                          </TableCell>
                          <TableCell>{claim.items?.title}</TableCell>
                          <TableCell>
                            {claim.first_name && claim.last_name
                              ? `${claim.first_name} ${claim.last_name}`
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {claim.email || claim.phone || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                claim.status === "pending"
                                  ? "secondary"
                                  : claim.status === "approved"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {claim.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(claim.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  setClaimDialogOpen(true);
                                }}
                              >
                                <FileText className="mr-1 h-3 w-3" />
                                Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/item/${claim.item_id}`)}
                              >
                                View Item
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Claim Details Dialog */}
      {selectedClaim && (
        <ClaimDetailsDialog
          open={claimDialogOpen}
          onOpenChange={setClaimDialogOpen}
          claim={selectedClaim}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
};

export default AdminDashboard;