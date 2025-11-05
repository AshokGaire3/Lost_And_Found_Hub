import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { MapPin, Calendar, Package, User, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface ItemDetail {
  id: string;
  title: string;
  description: string;
  status: "lost" | "found" | "claimed" | "returned";
  category: string;
  location: string;
  date_lost_found: string;
  image_url: string | null;
  contact_info: string | null;
  user_id: string;
  created_at: string;
  color?: string | null;
  venue?: string | null;
  container?: string | null;
  identifying_details?: string | null;
}

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [claimMessage, setClaimMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItem();
    checkUser();
  }, [id]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user || null);
  };

  const fetchItem = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setItem(data);
    } catch (error) {
      console.error("Error fetching item:", error);
      toast.error("Failed to load item details");
      navigate("/browse");
    } finally {
      setLoading(false);
    }
  };

  const [claimData, setClaimData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const handleClaim = async () => {
    if (!claimMessage.trim()) {
      toast.error("Please provide a message explaining why this is yours");
      return;
    }

    if (!claimData.email && !claimData.phone) {
      toast.error("Please provide either email or phone number");
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from("claims").insert([{
        item_id: id!,
        claimant_id: currentUser?.id || null,
        message: claimMessage.trim(),
        first_name: claimData.firstName || null,
        last_name: claimData.lastName || null,
        phone: claimData.phone || null,
        email: claimData.email || null,
      }]);

      if (error) throw error;
      
      toast.success("Claim submitted successfully! Staff will review your request.");
      setClaimMessage("");
      setClaimData({ firstName: "", lastName: "", phone: "", email: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit claim");
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = {
    lost: "bg-destructive/10 text-destructive border-destructive/20",
    found: "bg-accent/10 text-accent border-accent/20",
    claimed: "bg-warning/10 text-warning border-warning/20",
    returned: "bg-success/10 text-success border-success/20",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return null;
  }

  const isOwner = currentUser?.id === item.user_id;
  const canClaim = !isOwner && (item.status === "lost" || item.status === "found");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/browse")}
            className="mb-6"
          >
            ← Back to Browse
          </Button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-24 w-24 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
                    <div className="flex gap-2">
                      <Badge className={statusColors[item.status]}>
                        {item.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                  </div>
                </div>

                <p className="text-lg text-muted-foreground mb-6">
                  {item.description}
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <span>
                      {item.status === "lost" ? "Lost on" : "Found on"}{" "}
                      {format(new Date(item.date_lost_found), "MMMM d, yyyy")}
                    </span>
                  </div>
                  {item.venue && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Package className="h-5 w-5" />
                      <span><strong>Venue:</strong> {item.venue}</span>
                    </div>
                  )}
                  {item.color && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="h-5 w-5 rounded-full border" style={{backgroundColor: item.color.toLowerCase()}} />
                      <span><strong>Color:</strong> {item.color}</span>
                    </div>
                  )}
                  {item.container && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Package className="h-5 w-5" />
                      <span><strong>Storage:</strong> {item.container}</span>
                    </div>
                  )}
                  {item.identifying_details && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm"><strong>Identifying Details:</strong></p>
                      <p className="text-sm text-muted-foreground mt-1">{item.identifying_details}</p>
                    </div>
                  )}
                  {item.contact_info && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <User className="h-5 w-5" />
                      <span>{item.contact_info}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Claim Section */}
              {canClaim && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <MessageSquare className="h-5 w-5" />
                      <h3 className="font-semibold">Claim This Item</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={claimData.firstName}
                          onChange={(e) => setClaimData({ ...claimData, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={claimData.lastName}
                          onChange={(e) => setClaimData({ ...claimData, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={claimData.email}
                        onChange={(e) => setClaimData({ ...claimData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(123) 456-7890"
                        value={claimData.phone}
                        onChange={(e) => setClaimData({ ...claimData, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="claim-message">
                        Describe identifying details *
                      </Label>
                      <Textarea
                        id="claim-message"
                        placeholder="Provide specific details to verify ownership (e.g., unique marks, contents, serial number)..."
                        value={claimMessage}
                        onChange={(e) => setClaimMessage(e.target.value)}
                        rows={4}
                        required
                      />
                    </div>
                    <Button
                      onClick={handleClaim}
                      disabled={submitting || !claimMessage.trim() || !claimData.email}
                      className="w-full"
                    >
                      {submitting ? "Submitting..." : "Submit Claim"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {isOwner && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      This is your item. You can manage it from{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => navigate("/my-items")}
                      >
                        My Items
                      </Button>
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
