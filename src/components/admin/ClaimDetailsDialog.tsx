import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

interface ClaimDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: any;
  onUpdate: () => void;
}

const ClaimDetailsDialog = ({ open, onOpenChange, claim, onUpdate }: ClaimDetailsDialogProps) => {
  const [staffNotes, setStaffNotes] = useState(claim?.staff_notes || "");
  const [verificationStatus, setVerificationStatus] = useState(claim?.verification_status || "pending");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("claims")
        .update({
          staff_notes: staffNotes,
          verification_status: verificationStatus,
        })
        .eq("id", claim.id);

      if (error) throw error;

      toast.success("Claim details updated");
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating claim:", error);
      toast.error("Failed to update claim");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClaim = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("claims")
        .update({
          status: "approved",
          verification_status: "verified",
        })
        .eq("id", claim.id);

      if (error) throw error;

      toast.success("Claim approved");
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error approving claim:", error);
      toast.error("Failed to approve claim");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClaim = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("claims")
        .update({
          status: "rejected",
          verification_status: "rejected",
        })
        .eq("id", claim.id);

      if (error) throw error;

      toast.success("Claim rejected");
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error rejecting claim:", error);
      toast.error("Failed to reject claim");
    } finally {
      setLoading(false);
    }
  };

  if (!claim) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Claim Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Claim Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Reference Number</Label>
              <p className="font-mono text-sm">{claim.reference_number}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Claim Date</Label>
              <p>{claim.claim_date ? format(new Date(claim.claim_date), "MMM d, yyyy HH:mm") : "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Item</Label>
              <p className="font-medium">{claim.items?.title}</p>
              <Badge variant="outline" className="mt-1">{claim.items?.category}</Badge>
            </div>
            <div>
              <Label className="text-muted-foreground">Current Status</Label>
              <Badge
                variant={
                  claim.status === "approved"
                    ? "default"
                    : claim.status === "rejected"
                    ? "destructive"
                    : "secondary"
                }
              >
                {claim.status}
              </Badge>
            </div>
          </div>

          {/* Claimant Information */}
          <div className="border-t pt-4">
            <Label className="text-base font-semibold">Claimant Information</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p>
                  {claim.first_name && claim.last_name
                    ? `${claim.first_name} ${claim.last_name}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Contact</Label>
                <p className="text-sm">{claim.email || claim.phone || "N/A"}</p>
              </div>
              {claim.lost_location && (
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Lost Location</Label>
                  <p>{claim.lost_location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          {claim.message && (
            <div className="border-t pt-4">
              <Label className="text-muted-foreground">Message</Label>
              <p className="mt-1 text-sm bg-muted/50 p-3 rounded">{claim.message}</p>
            </div>
          )}

          {/* Verification Status */}
          <div className="border-t pt-4 space-y-2">
            <Label htmlFor="verification-status">Verification Status</Label>
            <select
              id="verification-status"
              className="w-full border rounded-md px-3 py-2"
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Staff Notes */}
          <div className="border-t pt-4 space-y-2">
            <Label htmlFor="staff-notes">Staff Notes</Label>
            <Textarea
              id="staff-notes"
              placeholder="Add internal notes about this claim..."
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Save Details
          </Button>
          {claim.status === "pending" && (
            <>
              <Button onClick={handleRejectClaim} variant="destructive" disabled={loading}>
                Reject
              </Button>
              <Button onClick={handleApproveClaim} disabled={loading}>
                Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimDetailsDialog;
