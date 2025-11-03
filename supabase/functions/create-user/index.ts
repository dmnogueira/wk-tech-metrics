import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  full_name: string;
  is_admin: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Sem autorização");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Não autorizado");
    }

    // Check if user has admin role
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some(r => r.role === "admin" || r.role === "master");
    if (!isAdmin) {
      throw new Error("Permissão negada. Apenas administradores podem criar usuários.");
    }

    const { email, full_name, is_admin }: CreateUserRequest = await req.json();

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10).toUpperCase();

    // Create user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { 
        full_name,
        must_change_password: true,
        created_by_admin: true
      }
    });

    if (createError) {
      console.error("Erro ao criar usuário:", createError);
      throw new Error(createError.message);
    }

    if (!newUser.user) {
      throw new Error("Falha ao criar usuário");
    }

    // Wait a bit for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update profile with full name
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ full_name })
      .eq("id", newUser.user.id);

    if (profileError) {
      console.error("Erro ao atualizar perfil:", profileError);
    }

    // Add role if admin
    if (is_admin) {
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: newUser.user.id,
          role: "admin",
        });

      if (roleError) {
        console.error("Erro ao adicionar role:", roleError);
      }
    } else {
      // Add default user role
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: newUser.user.id,
          role: "usuario",
        });

      if (roleError) {
        console.error("Erro ao adicionar role:", roleError);
      }
    }

    // Send welcome email with credentials
    const emailResponse = await resend.emails.send({
      from: "Tech Metrics <onboarding@resend.dev>",
      to: [email],
      subject: "Bem-vindo ao Tech Metrics",
      html: `
        <h2>Olá ${full_name},</h2>
        <p>Sua conta no Tech Metrics foi criada com sucesso!</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Senha temporária:</strong></p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; margin: 20px 0;">
          ${tempPassword}
        </div>
        <p><strong>IMPORTANTE:</strong> Por segurança, você será obrigado a trocar esta senha no primeiro login.</p>
        <p>Acesse o sistema em: ${Deno.env.get("SUPABASE_URL")?.replace("/v1", "")}</p>
        <br>
        <p>Atenciosamente,<br>Equipe Tech Metrics</p>
      `,
    });

    console.log("Email enviado:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Usuário criado com sucesso",
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          full_name
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Erro na função create-user:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
