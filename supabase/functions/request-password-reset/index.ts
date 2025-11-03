import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const requestResetSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo").trim(),
});

interface RequestResetRequest {
  email: string;
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

    // Parse and validate input
    const rawData = await req.json();
    const validatedData = requestResetSchema.parse(rawData);
    const { email } = validatedData;

    console.log(`Password reset requested for: ${email}`);

    // Check if user exists
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      throw new Error("Erro ao verificar usuário");
    }

    const userExists = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!userExists) {
      console.log(`User not found: ${email}`);
      return new Response(
        JSON.stringify({ 
          error: "Não existe nenhum usuário cadastrado com o e-mail informado."
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`User found, sending password reset email to: ${email}`);

    // Get the origin from request headers for redirect URL
    const origin = req.headers.get("origin") || Deno.env.get("SUPABASE_URL") || "";
    
    // Generate password reset link using Supabase native method
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/login`,
    });

    if (resetError) {
      console.error("Error sending reset email:", resetError);
      throw new Error("Erro ao enviar e-mail de recuperação");
    }

    console.log(`Password reset email sent successfully to: ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada e clique no link para redefinir sua senha."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in request-password-reset function:", error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: "Email inválido",
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao processar solicitação" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
