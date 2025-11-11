import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { Package, Search, Plus, RefreshCw, ChevronDown, Eye, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string;
  venue: string | null;
  container: string | null;
  date_lost_found: string;
  created_at: string;
  expiry_date: string | null;
  color: string | null;
  image_url: string | null;
}

interface Claim {
  id: string;
  item_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  message: string;
  status: string | null;
  created_at: string | null;
  reference_number: string | null;
  lost_date: string | null;
  lost_location: string | null;
  venue: string | null;
  items: {
    title: string;
    category: string;
  } | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role, loading: roleLoading } = useUserRole();
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const getInitialTab = (): "items" | "claims" => {
    const tabParam = searchParams.get("tab");
    return (tabParam === "claims" || tabParam === "items") ? tabParam : "items";
  };

  const [activeTab, setActiveTab] = useState<"items" | "claims">(getInitialTab());
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    if (!roleLoading) {
      if (role !== "staff") {
        toast.error("Access denied. Staff only.");
        navigate("/");
        return;
      }
      fetchData();
      fetchUserEmail();
    }
  }, [roleLoading, role, navigate]);

  // Update tab when URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "claims" || tabParam === "items") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const fetchUserEmail = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserEmail(user?.email || "");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [itemsRes, claimsRes] = await Promise.all([
        supabase.from("items").select("*").eq("is_active", true).order("created_at", { ascending: false }),
        supabase.from("claims").select("*, items(title, category)").order("created_at", { ascending: false })
      ]);

      if (itemsRes.error) throw itemsRes.error;
      if (claimsRes.error) throw claimsRes.error;

      setItems(itemsRes.data || []);
      setClaims(claimsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return { days: "30", label: "30 days", expired: false };
    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const expired = diffDays < 0;
    return {
      days: diffDays > 0 ? diffDays.toString() : "0",
      label: expired ? `Expired ${Math.abs(diffDays)} days ago` : `${diffDays} days`,
      expired
    };
  };

  const filteredItems = items.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.container?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClaims = claims.filter((claim) =>
    claim.items?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="min-h-screen bg-background transition-opacity duration-150">
      <Navbar />

      {/* RepoApp-style Navigation Bar */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <button
                onClick={() => {
                  setActiveTab("items");
                  navigate("/admin?tab=items", { replace: true });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === "items"
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Package className="h-4 w-4" />
                Items
              </button>
              <button
                onClick={() => {
                  setActiveTab("claims");
                  navigate("/admin?tab=claims", { replace: true });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === "claims"
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="h-4 w-4" />
                Claims
              </button>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/reports">Reports</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    {userEmail || "User"} <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground">
              {activeTab === "items" ? "Items" : "Claims"}
            </h1>
            <Badge variant="outline" className="text-sm">
              {activeTab === "items" ? filteredItems.length : filteredClaims.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "items" && (
              <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
                <Link to="/report">
                  Add item <span className="ml-1">&gt;&gt;</span>
                </Link>
              </Button>
            )}
            {activeTab === "claims" && (
              <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
                <Link to="/admin/claims/add">
                  Add Claim <span className="ml-1">&gt;&gt;</span>
                </Link>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={fetchData}>Refresh</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Keyword(s)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline">Advanced Search</Button>
        </div>

        {/* Items Table */}
        {activeTab === "items" && (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary">
                    <TableHead className="font-semibold whitespace-nowrap">Item ID</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Item Title</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Description</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Status</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">After Expire</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Container</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Venue</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Category</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Found Loc</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Date Found</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                        No items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => {
                      const expiryInfo = calculateDaysUntilExpiry(item.expiry_date);
                      return (
                        <TableRow key={item.id} className="hover:bg-secondary/50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-nku-gold hover:text-nku-gold font-mono text-sm p-0 h-auto"
                              onClick={() => navigate(`/item/${item.id}`)}
                            >
                              {item.id.substring(0, 8)}
                              <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px]">
                            <p className="truncate" title={item.title || "Untitled"}>
                              {item.title || "Untitled"}
                            </p>
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <p className="truncate text-sm text-muted-foreground" title={item.description || ""}>
                              {item.description || "No description"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                item.status === "found"
                                  ? "bg-success/10 text-success border-success/20"
                                  : item.status === "claimed"
                                  ? "bg-warning/10 text-warning border-warning/20"
                                  : item.status === "returned"
                                  ? "bg-accent/10 text-accent border-accent/20"
                                  : "bg-destructive/10 text-destructive border-destructive/20"
                              }`}
                            >
                              {item.status?.toUpperCase() || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-sm font-medium ${
                                expiryInfo.expired
                                  ? "text-destructive"
                                  : parseInt(expiryInfo.days) <= 7
                                  ? "text-warning"
                                  : "text-muted-foreground"
                              }`}
                              title={expiryInfo.label}
                            >
                              {expiryInfo.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {item.container || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {item.venue || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">
                              {item.category || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[150px]">
                            <p className="truncate" title={item.location || ""}>
                              {item.location || "N/A"}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(item.date_lost_found), "yyyy-MM-dd")}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/item/${item.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/item/${item.id}?edit=true`)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Item
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={async () => {
                                    if (confirm("Are you sure you want to delete this item?")) {
                                      try {
                                        const { error } = await supabase
                                          .from("items")
                                          .update({ is_active: false })
                                          .eq("id", item.id);
                                        if (error) throw error;
                                        toast.success("Item deleted successfully");
                                        fetchData();
                                      } catch (error) {
                                        console.error("Error deleting item:", error);
                                        toast.error("Failed to delete item");
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Item
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Claims Table */}
        {activeTab === "claims" && (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary">
                  <TableHead className="font-semibold">Claim ID</TableHead>
                  <TableHead className="font-semibold">First Name</TableHead>
                  <TableHead className="font-semibold">Last Name</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Lost Date</TableHead>
                  <TableHead className="font-semibold">Lost Location</TableHead>
                  <TableHead className="font-semibold">Venue</TableHead>
                  <TableHead className="font-semibold">Phone</TableHead>
                  <TableHead className="font-semibold">Reference Number</TableHead>
                  <TableHead className="font-semibold">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      No claims found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClaims.map((claim) => (
                    <TableRow key={claim.id} className="hover:bg-secondary/50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-nku-gold hover:text-nku-gold font-mono text-sm"
                          onClick={() => navigate(`/admin/claims/${claim.id}`)}
                        >
                          {claim.id.substring(0, 6)}
                          <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{claim.first_name || "N/A"}</TableCell>
                      <TableCell className="font-medium">{claim.last_name || "N/A"}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate text-sm text-muted-foreground">
                          {claim.message || claim.items?.title || "N/A"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {claim.lost_date ? format(new Date(claim.lost_date), "yyyy-MM-dd") : "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {claim.lost_location || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {claim.venue || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {claim.phone || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {claim.reference_number || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {claim.created_at ? format(new Date(claim.created_at), "yyyy-MM-dd") : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
