import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  FileText, 
  Package, 
  Shield, 
  User, 
  Eye, 
  CheckCircle, 
  BarChart3, 
  Users, 
  Database,
  Lock,
  Unlock,
  MessageSquare,
  LayoutDashboard,
  FolderOpen,
  FileCheck,
  TrendingUp
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  access: {
    guest: boolean;
    student: boolean;
    staff: boolean;
  };
  dataAccess: string;
  route: string;
  requiresAuth: boolean;
}

const Features = () => {
  const { role, loading: roleLoading } = useUserRole();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
  }, []);

  const currentRole = roleLoading ? "loading" : (role || "guest");
  const isAuthenticated = !!user;

  const features: Feature[] = [
    {
      id: "browse",
      name: "Browse Found Items",
      description: "Search and browse through all found items on campus. Filter by category, color, location, and date. No login required!",
      icon: <Search className="h-6 w-6" />,
      access: {
        guest: true,
        student: true,
        staff: true,
      },
      dataAccess: "Public: Can view all items with status='found' and is_active=true. Staff can view all items (lost, found, claimed, returned).",
      route: "/browse",
      requiresAuth: false,
    },
    {
      id: "report-lost",
      name: "Report Lost Item",
      description: "Report a lost item without logging in. Students can submit anonymous reports with contact information. Staff will review and contact you if found.",
      icon: <FileText className="h-6 w-6" />,
      access: {
        guest: true,
        student: true,
        staff: false, // Staff report found items, not lost
      },
      dataAccess: "Stored in 'items' table with status='lost', is_anonymous=true (if guest), user_id=null (if guest) or user_id (if logged in student).",
      route: "/report",
      requiresAuth: false,
    },
    {
      id: "report-found",
      name: "Report Found Item",
      description: "Staff only: Report items you've found on campus. Requires staff authentication. Items are stored with detailed information for matching.",
      icon: <Shield className="h-6 w-6" />,
      access: {
        guest: false,
        student: false,
        staff: true,
      },
      dataAccess: "Stored in 'items' table with status='found', user_id=staff_id, is_anonymous=false. Only staff can create found items.",
      route: "/report",
      requiresAuth: true,
    },
    {
      id: "claim-item",
      name: "Claim an Item",
      description: "Found your lost item? Claim it by providing identifying details. Staff will verify and approve your claim. Requires email contact.",
      icon: <CheckCircle className="h-6 w-6" />,
      access: {
        guest: false, // Guests cannot claim (need contact info)
        student: true,
        staff: true,
      },
      dataAccess: "Stored in 'claims' table with item_id, claimant_id (user_id if logged in, null if guest), message, contact info, status='pending'.",
      route: "/browse", // Navigate to browse, then claim from item detail
      requiresAuth: false, // Can claim without login, but need email
    },
    {
      id: "my-items",
      name: "My Items Dashboard",
      description: "View all your reported items (lost or found), track claims you've made, and manage claims received on your items. Requires login.",
      icon: <Package className="h-6 w-6" />,
      access: {
        guest: false,
        student: true,
        staff: true,
      },
      dataAccess: "Queries 'items' table filtered by user_id. Shows user's items, claims made (from 'claims' table), and claims received on user's items.",
      route: "/my-items",
      requiresAuth: true,
    },
    {
      id: "admin-items",
      name: "Manage Items (Admin)",
      description: "Staff dashboard to view, edit, and manage all items in the system. View both lost and found items with full details and status.",
      icon: <LayoutDashboard className="h-6 w-6" />,
      access: {
        guest: false,
        student: false,
        staff: true,
      },
      dataAccess: "Full access to 'items' table. Can view all items regardless of status. Can update item status, edit details, mark as inactive.",
      route: "/admin?tab=items",
      requiresAuth: true,
    },
    {
      id: "admin-claims",
      name: "Manage Claims (Admin)",
      description: "Staff dashboard to review, approve, or reject item claims. View claim details, verify ownership, and update claim status.",
      icon: <MessageSquare className="h-6 w-6" />,
      access: {
        guest: false,
        student: false,
        staff: true,
      },
      dataAccess: "Full access to 'claims' table. Can view all claims, update status (pending/approved/rejected), view claimant contact info.",
      route: "/admin?tab=claims",
      requiresAuth: true,
    },
    {
      id: "reports",
      name: "Reports & Analytics",
      description: "Staff only: View comprehensive analytics, statistics, and reports about items, claims, categories, and system performance.",
      icon: <BarChart3 className="h-6 w-6" />,
      access: {
        guest: false,
        student: false,
        staff: true,
      },
      dataAccess: "Aggregated data from 'items' and 'claims' tables. Category distribution, claim success rates, monthly trends, match algorithm stats.",
      route: "/admin/reports",
      requiresAuth: true,
    },
    {
      id: "bulk-release",
      name: "Bulk Release",
      description: "Staff only: Release multiple items at once in bulk operations. Streamline the process of returning multiple items to owners.",
      icon: <Users className="h-6 w-6" />,
      access: {
        guest: false,
        student: false,
        staff: true,
      },
      dataAccess: "Bulk operations on 'items' table. Update multiple items' status to 'returned' simultaneously. Requires staff authentication.",
      route: "/admin/bulk-release",
      requiresAuth: true,
    },
    {
      id: "storage",
      name: "Storage Management",
      description: "Staff only: Manage physical storage locations, containers, and organize items by storage location for easy retrieval.",
      icon: <FolderOpen className="h-6 w-6" />,
      access: {
        guest: false,
        student: false,
        staff: true,
      },
      dataAccess: "Access to 'items' table with container and venue fields. Can update storage locations, organize items by physical location.",
      route: "/admin/storage",
      requiresAuth: true,
    },
    {
      id: "audit",
      name: "Audit Log",
      description: "Staff only: View system audit logs, track all changes to items and claims, and maintain a complete history of actions.",
      icon: <FileCheck className="h-6 w-6" />,
      access: {
        guest: false,
        student: false,
        staff: true,
      },
      dataAccess: "Access to audit log table (if exists) or 'items' and 'claims' tables with created_at, updated_at timestamps. Full system history.",
      route: "/admin/audit",
      requiresAuth: true,
    },
  ];

  const getAccessBadge = (feature: Feature) => {
    if (feature.access.staff && feature.access.student && feature.access.guest) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Everyone</Badge>;
    } else if (feature.access.staff && feature.access.student) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Logged In Users</Badge>;
    } else if (feature.access.staff) {
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Staff Only</Badge>;
    } else if (feature.access.student) {
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Students & Guests</Badge>;
    } else {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Guests Only</Badge>;
    }
  };

  const canAccess = (feature: Feature) => {
    if (currentRole === "loading") return false;
    if (currentRole === "staff") return feature.access.staff;
    if (currentRole === "student") return feature.access.student;
    return feature.access.guest;
  };

  const filteredFeatures = features.filter(feature => {
    // Show all features, but indicate access
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Features & Access Control</h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive guide to all available features, data access, and role-based permissions
          </p>
        </div>

        {/* Current User Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Access Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant={currentRole === "staff" ? "default" : currentRole === "student" ? "secondary" : "outline"} className="text-lg px-4 py-2">
                {currentRole === "loading" ? "Loading..." : currentRole === "staff" ? "Staff Member" : currentRole === "student" ? "Student" : "Guest"}
              </Badge>
              {!isAuthenticated && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth">Sign In for More Features</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredFeatures.map((feature) => {
            const hasAccess = canAccess(feature);
            const needsAuth = feature.requiresAuth && !isAuthenticated;
            
            return (
              <Card key={feature.id} className={`relative ${!hasAccess ? "opacity-60" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {feature.icon}
                    </div>
                    {getAccessBadge(feature)}
                  </div>
                  <CardTitle className="text-xl">{feature.name}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Data Access Info */}
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">Data Access:</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{feature.dataAccess}</p>
                  </div>

                  {/* Access Status */}
                  <div className="flex items-center gap-2">
                    {hasAccess ? (
                      <Unlock className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${hasAccess ? "text-green-600" : "text-red-600"}`}>
                      {hasAccess ? "You have access" : "Access restricted"}
                    </span>
                  </div>

                  {/* Action Button */}
                  {hasAccess ? (
                    <Button asChild className="w-full" variant={needsAuth ? "outline" : "default"}>
                      <Link to={feature.route}>
                        {needsAuth ? "Sign In Required" : "Access Feature"}
                      </Link>
                    </Button>
                  ) : (
                    <Button disabled className="w-full" variant="outline">
                      Access Restricted
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Data Storage Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Storage & Access Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Items Table
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                  <li><strong>Public Access:</strong> Can view items with status='found' and is_active=true</li>
                  <li><strong>Student Access:</strong> Can create items with status='lost', view own items, view found items</li>
                  <li><strong>Staff Access:</strong> Full CRUD access to all items regardless of status</li>
                  <li><strong>Fields:</strong> id, title, description, status, category, location, date_lost_found, image_url, user_id, is_anonymous, contact_info, color, venue, container, identifying_details, is_active, created_at, updated_at</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Claims Table
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                  <li><strong>Public Access:</strong> Can create claims (with contact info), but cannot view other claims</li>
                  <li><strong>Student Access:</strong> Can create claims, view own claims, view claims on own items</li>
                  <li><strong>Staff Access:</strong> Full CRUD access to all claims, can approve/reject claims</li>
                  <li><strong>Fields:</strong> id, item_id, claimant_id, message, status, first_name, last_name, phone, email, verification_status, created_at, updated_at</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  User Roles Table
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                  <li><strong>Access:</strong> Only system can read user roles. Users cannot directly query this table.</li>
                  <li><strong>Fields:</strong> user_id, role (staff/student), created_at</li>
                  <li><strong>Purpose:</strong> Determines access level and available features for each user</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Control Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Access Control Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Feature</th>
                    <th className="text-center p-2">Guest</th>
                    <th className="text-center p-2">Student</th>
                    <th className="text-center p-2">Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature) => (
                    <tr key={feature.id} className="border-b">
                      <td className="p-2 font-medium">{feature.name}</td>
                      <td className="text-center p-2">
                        {feature.access.guest ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                      <td className="text-center p-2">
                        {feature.access.student ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                      <td className="text-center p-2">
                        {feature.access.staff ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Features;

