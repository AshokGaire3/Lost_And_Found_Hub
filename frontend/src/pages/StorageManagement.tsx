import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Package, AlertTriangle } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { format } from "date-fns";

interface StorageItem {
  id: string;
  title: string;
  category: string;
  storage_location: string | null;
  storage_date: string | null;
  expiry_date: string | null;
  status: string;
  created_at: string;
}

const StorageManagement = () => {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const [items, setItems] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!roleLoading && role !== "staff") {
      toast.error("Access denied. Staff only.");
      navigate("/");
      return;
    }
    if (role === "staff") {
      fetchItems();
    }
  }, [role, roleLoading, navigate]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("id, title, category, storage_location, storage_date, expiry_date, status, created_at")
        .eq("is_active", true)
        .order("storage_date", { ascending: false, nullsFirst: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const updateStorage = async (
    itemId: string,
    storageLocation: string,
    expiryDate: string
  ) => {
    try {
      const { error } = await supabase
        .from("items")
        .update({
          storage_location: storageLocation,
          storage_date: new Date().toISOString(),
          expiry_date: expiryDate,
        })
        .eq("id", itemId);

      if (error) throw error;
      toast.success("Storage information updated");
      fetchItems();
    } catch (error: any) {
      console.error("Error updating storage:", error);
      toast.error("Failed to update storage");
    }
  };

  const disposeItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to dispose of this item?")) return;

    try {
      const { error } = await supabase
        .from("items")
        .update({ status: "returned" as const, is_active: false })
        .eq("id", itemId);

      if (error) throw error;
      toast.success("Item marked as disposed");
      fetchItems();
    } catch (error: any) {
      console.error("Error disposing item:", error);
      toast.error("Failed to dispose item");
    }
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.storage_location &&
        item.storage_location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (roleLoading || (role === "staff" && loading)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Storage Management</h1>
          <p className="text-muted-foreground">
            Track physical storage locations and manage item expiry
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items in Storage</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {items.filter((i) => i.storage_location).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {items.filter((i) => isExpired(i.expiry_date)).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">No Storage Info</CardTitle>
              <Package className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {items.filter((i) => !i.storage_location).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Storage Tracking</CardTitle>
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Storage Location</TableHead>
                  <TableHead>Storage Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                        {item.storage_location ? (
                          item.storage_location
                        ) : (
                          <span className="text-muted-foreground italic">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.storage_date
                          ? format(new Date(item.storage_date), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {item.expiry_date ? (
                          <span
                            className={
                              isExpired(item.expiry_date)
                                ? "text-destructive font-medium"
                                : ""
                            }
                          >
                            {format(new Date(item.expiry_date), "MMM d, yyyy")}
                            {isExpired(item.expiry_date) && " (Expired)"}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "found"
                              ? "default"
                              : item.status === "claimed"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const location = prompt(
                                "Enter storage location:",
                                item.storage_location || ""
                              );
                              if (!location) return;

                              const expiry = prompt(
                                "Enter expiry date (YYYY-MM-DD):",
                                item.expiry_date || ""
                              );
                              if (!expiry) return;

                              updateStorage(item.id, location, expiry);
                            }}
                          >
                            Update
                          </Button>
                          {isExpired(item.expiry_date) && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => disposeItem(item.id)}
                            >
                              Dispose
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StorageManagement;
