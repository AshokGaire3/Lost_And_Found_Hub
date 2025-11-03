import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Download, TrendingUp, Package, CheckCircle } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CategoryStats {
  category: string;
  count: number;
}

const Reports = () => {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<CategoryStats[]>([]);
  const [claimStats, setClaimStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [matchAlgorithmStats, setMatchAlgorithmStats] = useState<any[]>([]);
  const [verificationStats, setVerificationStats] = useState<any[]>([]);

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(var(--destructive))",
    "hsl(var(--secondary))",
  ];

  useEffect(() => {
    if (!roleLoading && role !== "staff") {
      toast.error("Access denied. Staff only.");
      navigate("/");
      return;
    }
    if (role === "staff") {
      fetchReportData();
    }
  }, [role, roleLoading, navigate]);

  const fetchReportData = async () => {
    try {
      // Category distribution
      const { data: items, error: itemsError } = await supabase
        .from("items")
        .select("category")
        .eq("is_active", true);

      if (itemsError) throw itemsError;

      const categoryCounts = items?.reduce((acc: any, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      const categoryStats = Object.entries(categoryCounts || {}).map(([category, count]) => ({
        category,
        count: count as number,
      }));

      setCategoryData(categoryStats);

      // Claim statistics
      const { data: claims, error: claimsError } = await supabase
        .from("claims")
        .select("status");

      if (claimsError) throw claimsError;

      const stats = claims?.reduce(
        (acc: any, claim) => {
          acc.total++;
          if (claim.status === "approved") acc.approved++;
          else if (claim.status === "pending") acc.pending++;
          else if (claim.status === "rejected") acc.rejected++;
          return acc;
        },
        { total: 0, approved: 0, pending: 0, rejected: 0 }
      );

      setClaimStats(stats || { total: 0, approved: 0, pending: 0, rejected: 0 });

      // Monthly stats (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: monthlyItems, error: monthlyError } = await supabase
        .from("items")
        .select("created_at")
        .gte("created_at", sixMonthsAgo.toISOString());

      if (monthlyError) throw monthlyError;

      const monthlyGroups = monthlyItems?.reduce((acc: any, item) => {
        const month = new Date(item.created_at).toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      const monthlyData = Object.entries(monthlyGroups || {}).map(([month, count]) => ({
        month,
        items: count,
      }));

      setMonthlyStats(monthlyData);

      // Match algorithm statistics
      const { data: matches, error: matchesError } = await supabase
        .from("matches")
        .select("match_algorithm, status");

      if (matchesError) throw matchesError;

      const algorithmCounts = matches?.reduce((acc: any, match) => {
        const algo = match.match_algorithm || "manual";
        acc[algo] = (acc[algo] || 0) + 1;
        return acc;
      }, {});

      const algorithmData = Object.entries(algorithmCounts || {}).map(([algorithm, count]) => ({
        algorithm,
        count: count as number,
      }));

      setMatchAlgorithmStats(algorithmData);

      // Verification status statistics
      const { data: claimsFull, error: claimsFullError } = await supabase
        .from("claims")
        .select("verification_status");

      if (claimsFullError) throw claimsFullError;

      const verificationCounts = claimsFull?.reduce((acc: any, claim) => {
        const status = claim.verification_status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const verificationData = Object.entries(verificationCounts || {}).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count: count as number,
      }));

      setVerificationStats(verificationData);
    } catch (error: any) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Category", "Count"],
      ...categoryData.map((item) => [item.category, item.count]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lost-and-found-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Report exported");
  };

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

  const successRate =
    claimStats.total > 0 ? ((claimStats.approved / claimStats.total) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              Track performance and insights
            </p>
          </div>
          <Button onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categoryData.reduce((sum, item) => sum + item.count, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claimStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground">Claims approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Package className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claimStats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Items by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) =>
                      `${category}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="items" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Claim Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Claim Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { status: "Approved", count: claimStats.approved },
                    { status: "Pending", count: claimStats.pending },
                    { status: "Rejected", count: claimStats.rejected },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="hsl(var(--accent))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Match Algorithm & Verification Stats */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Matches by Algorithm</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={matchAlgorithmStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ algorithm, percent }) =>
                      `${algorithm}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {matchAlgorithmStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={verificationStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="hsl(var(--success))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  export default Reports;
