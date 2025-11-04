import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const deleteUserSchema = z.object({
  userId: z.string().uuid(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Extract and verify JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication failed:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify admin role
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (rolesError || !userRoles?.some(r => r.role === "admin" || r.role === "master")) {
      console.error("Permission denied for user:", user.id);
      return new Response(
        JSON.stringify({ error: "Permission denied. Admin access required." }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate input
    const body = await req.json();
    const { userId } = deleteUserSchema.parse(body);

    console.log(`Delete request for user ${userId} by admin ${user.email}`);

    // Prevent self-deletion
    if (userId === user.id) {
      return new Response(
        JSON.stringify({ error: "Cannot delete your own account" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if target user has master role (protect master users)
    const { data: targetRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (targetRoles?.some(r => r.role === "master")) {
      return new Response(
        JSON.stringify({ error: "Cannot delete master users" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check for dependencies - professionals
    const { data: professionals } = await supabaseAdmin
      .from("professionals")
      .select("id")
      .eq("profile_id", userId)
      .limit(1);

    if (professionals && professionals.length > 0) {
      return new Response(
        JSON.stringify({ error: "Cannot delete user with professional records. Remove professional records first." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check for dependencies - managed squads
    const { data: managedSquads } = await supabaseAdmin
      .from("squads")
      .select("id")
      .eq("manager_id", userId)
      .limit(1);

    if (managedSquads && managedSquads.length > 0) {
      return new Response(
        JSON.stringify({ error: "Cannot delete user who manages squads. Reassign squad management first." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Delete in correct order: roles -> profile -> auth user
    console.log(`Deleting user_roles for ${userId}`);
    const { error: rolesDeleteError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (rolesDeleteError) {
      console.error("Error deleting user roles:", rolesDeleteError);
      throw rolesDeleteError;
    }

    console.log(`Deleting profile for ${userId}`);
    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      console.error("Error deleting profile:", profileDeleteError);
      throw profileDeleteError;
    }

    console.log(`Deleting auth user ${userId}`);
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error("Error deleting auth user:", authDeleteError);
      throw authDeleteError;
    }

    console.log(`User ${userId} successfully deleted by admin ${user.email}`);

    return new Response(
      JSON.stringify({ success: true, message: "User deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in delete-user function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
