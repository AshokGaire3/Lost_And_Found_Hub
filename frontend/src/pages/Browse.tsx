import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ItemCard from "@/components/ItemCard";
import SearchFilters from "@/components/SearchFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Package, Shield, X, Search as SearchIcon } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useSearchParams } from "react-router-dom";

interface Item {
  id: string;
  title: string;
  description: string;
  status: "lost" | "found" | "claimed" | "returned";
  category: string;
  location: string;
  date_lost_found: string;
  image_url: string | null;
  color?: string | null;
  venue?: string | null;
  container?: string | null;
}

const Browse = () => {
  const { role, loading: roleLoading } = useUserRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize state from URL parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all");
  const [colorFilter, setColorFilter] = useState(searchParams.get("color") || "");
  const [locationFilter, setLocationFilter] = useState(searchParams.get("location") || "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");

  // Update URL parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
    if (categoryFilter && categoryFilter !== "all") params.set("category", categoryFilter);
    if (colorFilter) params.set("color", colorFilter);
    if (locationFilter) params.set("location", locationFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    
    setSearchParams(params, { replace: true });
  }, [searchTerm, statusFilter, categoryFilter, colorFilter, locationFilter, dateFrom, dateTo, setSearchParams]);

  useEffect(() => {
    fetchItems();
  }, [role, roleLoading]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Staff can see all items, public users see found items only
      let query = supabase
        .from("items")
        .select("*")
        .eq("is_active", true);

      if (role !== "staff") {
        query = query.eq("status", "found");
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching items:", error);
        setError("Failed to load items. Please try again later.");
        throw error;
      }
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to load items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced search with debouncing and better matching
  const filteredItems = useMemo(() => {
    if (!searchTerm && statusFilter === "all" && categoryFilter === "all" && !colorFilter && !locationFilter && !dateFrom && !dateTo) {
      return items;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    
    return items.filter((item) => {
      // Enhanced search - search in multiple fields
      const matchesSearch = !searchLower || 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        (item.color && item.color.toLowerCase().includes(searchLower)) ||
        item.location.toLowerCase().includes(searchLower) ||
        (item.venue && item.venue.toLowerCase().includes(searchLower)) ||
        (item.container && item.container.toLowerCase().includes(searchLower));
      
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesColor = !colorFilter || (item.color && item.color.toLowerCase().includes(colorFilter.toLowerCase()));
      const matchesLocation = !locationFilter || 
        item.location.toLowerCase().includes(locationFilter.toLowerCase()) ||
        (item.venue && item.venue.toLowerCase().includes(locationFilter.toLowerCase()));
      
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const itemDate = new Date(item.date_lost_found);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && itemDate >= fromDate;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && itemDate <= toDate;
        }
      }

      return matchesSearch && matchesStatus && matchesCategory && matchesColor && matchesLocation && matchesDate;
    });
  }, [items, searchTerm, statusFilter, categoryFilter, colorFilter, locationFilter, dateFrom, dateTo]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setColorFilter("");
    setLocationFilter("");
    setDateFrom("");
    setDateTo("");
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || statusFilter !== "all" || categoryFilter !== "all" || colorFilter || locationFilter || dateFrom || dateTo;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Staff Banner */}
        {role === "staff" && !roleLoading && (
          <div className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold">Staff View - All Items</p>
                <p className="text-sm text-muted-foreground">
                  As staff, you can see both lost and found items. Public users only see found items.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {role === "staff" && !roleLoading ? "Browse All Items" : "Search Found Items"}
              </h1>
              <p className="text-muted-foreground text-lg">
                {role === "staff" && !roleLoading
                  ? "View all lost and found items. Manage and track everything in the system."
                  : "Search items found on campus. Use filters to find your lost item quickly."
                }
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="shrink-0"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <SearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={role === "staff" && !roleLoading ? statusFilter : "all"}
          onStatusChange={role === "staff" && !roleLoading ? setStatusFilter : () => {}}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          colorFilter={colorFilter}
          onColorChange={setColorFilter}
          locationFilter={locationFilter}
          onLocationChange={setLocationFilter}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          showStatusFilter={role === "staff" && !roleLoading}
        />

        {/* Results count and status */}
        {!loading && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <SearchIcon className="h-4 w-4" />
              <span className="text-sm">
                {filteredItems.length === items.length
                  ? `Showing all ${filteredItems.length} item${filteredItems.length !== 1 ? "s" : ""}`
                  : `Found ${filteredItems.length} of ${items.length} item${items.length !== 1 ? "s" : ""}`
                }
              </span>
            </div>
            {hasActiveFilters && filteredItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
        )}

        <div className="mt-6">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchItems}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          )}
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {hasActiveFilters ? "No items match your search" : "No items found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "Try adjusting your filters or search terms to see more results."
                  : "Check back later for new items."
                }
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearAllFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  status={item.status}
                  category={item.category}
                  location={item.location}
                  dateLostFound={item.date_lost_found}
                  imageUrl={item.image_url || undefined}
                  color={item.color}
                  venue={item.venue}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse;
