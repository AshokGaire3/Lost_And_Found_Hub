import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ItemCard from "@/components/ItemCard";
import SearchFilters from "@/components/SearchFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Shield } from "lucide-react";
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
  color?: string | null;
  venue?: string | null;
  container?: string | null;
}

const Browse = () => {
  const { role, loading: roleLoading } = useUserRole();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchItems();
  }, [role, roleLoading]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      
      // Staff can see all items, public users see found items only
      let query = supabase
        .from("items")
        .select("*")
        .eq("is_active", true);

      if (role !== "staff") {
        query = query.eq("status", "found");
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.color && item.color.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesColor = !colorFilter || (item.color && item.color.toLowerCase().includes(colorFilter.toLowerCase()));
    const matchesLocation = !locationFilter || item.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const itemDate = new Date(item.date_lost_found);
      if (dateFrom) matchesDate = matchesDate && itemDate >= new Date(dateFrom);
      if (dateTo) matchesDate = matchesDate && itemDate <= new Date(dateTo);
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesColor && matchesLocation && matchesDate;
  });

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
          <h1 className="text-4xl font-bold mb-2">
            {role === "staff" && !roleLoading ? "Browse All Items" : "Browse Found Items"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {role === "staff" && !roleLoading
              ? "View all lost and found items. Manage and track everything in the system."
              : "Browse items found on campus. Search by category, color, and location to find your lost item."
            }
          </p>
        </div>

        <SearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
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
        />

        <div className="mt-8">
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
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
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
