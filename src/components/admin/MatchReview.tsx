import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, Sparkles, Brain } from "lucide-react";
import { format } from "date-fns";

interface Match {
  id: string;
  match_score: number;
  status: string;
  notes: string | null;
  created_at: string;
  match_algorithm: string | null;
  match_date: string | null;
  lost_item: {
    id: string;
    title: string;
    category: string;
    color: string | null;
    location: string;
  };
  found_item: {
    id: string;
    title: string;
    category: string;
    color: string | null;
    location: string;
  };
}

const MatchReview = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          lost_item:items!matches_lost_item_id_fkey(id, title, category, color, location),
          found_item:items!matches_found_item_id_fkey(id, title, category, color, location)
        `)
        .eq("status", "pending")
        .order("match_score", { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error: any) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (matchId: string, status: "approved" | "rejected") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("matches")
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          notes: reviewNotes[matchId] || null,
        })
        .eq("id", matchId);

      if (error) throw error;

      toast.success(`Match ${status}`);
      fetchMatches();
      setReviewNotes((prev) => {
        const updated = { ...prev };
        delete updated[matchId];
        return updated;
      });
    } catch (error: any) {
      console.error("Error reviewing match:", error);
      toast.error("Failed to review match");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No pending matches to review</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Matches</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">Match Score: {match.match_score}%</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  {match.match_algorithm === "AI" && <Brain className="h-3 w-3" />}
                  {match.match_algorithm === "keyword" && <Sparkles className="h-3 w-3" />}
                  {match.match_algorithm || "manual"}
                </Badge>
                {match.match_date && (
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(match.match_date), "MMM d, yyyy")}
                  </span>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Lost Item</h4>
                <div className="bg-muted/50 p-3 rounded">
                  <p className="font-medium">{match.lost_item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {match.lost_item.category} • {match.lost_item.color || "No color"}
                  </p>
                  <p className="text-sm text-muted-foreground">📍 {match.lost_item.location}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Found Item</h4>
                <div className="bg-muted/50 p-3 rounded">
                  <p className="font-medium">{match.found_item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {match.found_item.category} • {match.found_item.color || "No color"}
                  </p>
                  <p className="text-sm text-muted-foreground">📍 {match.found_item.location}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Review Notes</label>
              <Textarea
                placeholder="Add any notes about this match..."
                value={reviewNotes[match.id] || ""}
                onChange={(e) =>
                  setReviewNotes((prev) => ({ ...prev, [match.id]: e.target.value }))
                }
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleReview(match.id, "approved")}
                className="flex-1"
                variant="default"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Match
              </Button>
              <Button
                onClick={() => handleReview(match.id, "rejected")}
                className="flex-1"
                variant="destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Match
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MatchReview;
