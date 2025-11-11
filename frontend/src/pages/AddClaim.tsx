import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { ArrowLeft, Package } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string;
  date_lost_found: string;
}

const AddClaim = () => {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    message: "",
    lost_date: "",
    lost_location: "",
    venue: "",
  });

  useEffect(() => {
    if (!roleLoading) {
      if (role !== "staff") {
        toast.error("Access denied. Staff only.");
        navigate("/admin");
        return;
      }
      fetchItems();
    }
  }, [roleLoading, role, navigate]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("items")
        .select("id, title, description, category, status, location, date_lost_found")
        .eq("is_active", true)
        .eq("status", "found")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedItemId) {
      toast.error("Please select an item");
      return;
    }

    if (!formData.first_name || !formData.last_name) {
      toast.error("Please enter claimant's first and last name");
      return;
    }

    if (!formData.email && !formData.phone) {
      toast.error("Please enter either email or phone number");
      return;
    }

    if (!formData.message) {
      toast.error("Please enter a message describing the claim");
      return;
    }

    try {
      setSubmitting(true);

      // Get current user for claimant_id (if logged in)
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("claims")
        .insert({
          item_id: selectedItemId,
          claimant_id: user?.id || null,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
          email: formData.email || null,
          message: formData.message,
          lost_date: formData.lost_date || null,
          lost_location: formData.lost_location || null,
          venue: formData.venue || null,
          status: "pending",
          verification_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Claim created successfully");
      navigate("/admin?tab=claims");
    } catch (error: any) {
      console.error("Error creating claim:", error);
      toast.error(error.message || "Failed to create claim");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
            <div className="h-96 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  const selectedItem = items.find((item) => item.id === selectedItemId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin?tab=claims")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Add New Claim</h1>
              <p className="text-muted-foreground mt-1">
                Create a new claim for a found item
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Claim Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Item Selection */}
                <div className="space-y-2">
                  <Label htmlFor="item">Select Item *</Label>
                  <Select
                    value={selectedItemId}
                    onValueChange={setSelectedItemId}
                  >
                    <SelectTrigger id="item">
                      <SelectValue placeholder="Select an item to claim" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.length === 0 ? (
                        <SelectItem value="no-items" disabled>
                          No found items available
                        </SelectItem>
                      ) : (
                        items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              <span>{item.title}</span>
                              <span className="text-xs text-muted-foreground">
                                ({item.category})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedItem && (
                    <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm">
                      <p className="font-medium">{selectedItem.title}</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {selectedItem.description}
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Location: {selectedItem.location} | Found:{" "}
                        {new Date(selectedItem.date_lost_found).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Claimant Information */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold">Claimant Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => handleChange("first_name", e.target.value)}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => handleChange("last_name", e.target.value)}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    * At least one contact method (email or phone) is required
                  </p>
                </div>

                {/* Claim Details */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold">Claim Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Describe how you can identify this item..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lost_date">Lost Date</Label>
                      <Input
                        id="lost_date"
                        type="date"
                        value={formData.lost_date}
                        onChange={(e) => handleChange("lost_date", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lost_location">Lost Location</Label>
                      <Input
                        id="lost_location"
                        value={formData.lost_location}
                        onChange={(e) => handleChange("lost_location", e.target.value)}
                        placeholder="e.g., Student Union, Library"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => handleChange("venue", e.target.value)}
                      placeholder="e.g., Main Building, Room 101"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin?tab=claims")}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating Claim..." : "Create Claim"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClaim;



