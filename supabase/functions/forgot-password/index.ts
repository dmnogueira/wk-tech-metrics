import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
});

interface ForgotPasswordRequest {
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
    const validatedData = forgotPasswordSchema.parse(rawData);
    const { email } = validatedData;

    console.log(`Password reset requested for email: ${email}`);

    // Check if user exists
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error listing users:", userError);
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Se o e-mail existir em nosso sistema, você receberá um link de recuperação."
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
      console.log(`User not found for email: ${email}`);
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Se o e-mail existir em nosso sistema, você receberá um link de recuperação."
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate password recovery link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${req.headers.get("origin") || Deno.env.get("SUPABASE_URL")}/login`,
      }
    });

    if (linkError) {
      console.error("Error generating recovery link:", linkError);
      throw new Error("Erro ao gerar link de recuperação");
    }

    console.log("Recovery link generated successfully");

    // Send email with recovery link
    const emailResponse = await resend.emails.send({
      from: "Tech Metrics <onboarding@resend.dev>",
      to: [email],
      subject: "Recuperação de senha - Tech Metrics",
      html: `
        <h2>Olá,</h2>
        <p>Você solicitou a recuperação de senha no Tech Metrics.</p>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <div style="margin: 30px 0;">
          <a href="${linkData.properties.action_link}" 
             style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Recuperar Senha
          </a>
        </div>
        <p>Este link é válido por 1 hora.</p>
        <p>Se você não solicitou esta recuperação, pode ignorar este e-mail com segurança.</p>
        <br>
        <p>Atenciosamente,<br>Equipe Tech Metrics</p>
      `,
    });

    console.log("Recovery email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in forgot-password function:", error);
    
    // Handle validation errors specifically
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
