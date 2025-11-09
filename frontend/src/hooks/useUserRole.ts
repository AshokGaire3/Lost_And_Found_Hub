import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "staff" | "student" | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRole(null);
        setLoading(false);
        try {
          sessionStorage.removeItem("user_role");
        } catch {}
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
        try {
          sessionStorage.removeItem("user_role");
        } catch {}
      } else {
        const userRole = data?.role as UserRole;
        setRole(userRole);
        // Cache role for faster navigation between pages
        try {
          if (userRole) {
            sessionStorage.setItem("user_role", userRole);
          } else {
            sessionStorage.removeItem("user_role");
          }
        } catch {}
      }
      
      setLoading(false);
    };

    fetchRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { role, loading };
};
