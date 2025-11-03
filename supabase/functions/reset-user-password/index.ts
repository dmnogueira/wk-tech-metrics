import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const resetPasswordSchema = z.object({
  userId: z.string().uuid("ID de usuário inválido"),
  userEmail: z.string().email("Email inválido").max(255, "Email muito longo"),
  userName: z.string().min(1, "Nome obrigatório").max(100, "Nome muito longo").trim()
});

interface ResetPasswordRequest {
  userId: string;
  userEmail: string;
  userName: string;
}

// Strong temporary password generator ensuring complexity and cryptographic randomness
function generateStrongTempPassword(length: number = 16): string {
  const LOWER = "abcdefghijklmnopqrstuvwxyz";
  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const DIGITS = "0123456789";
  const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/";
  const ALL = LOWER + UPPER + DIGITS + SYMBOLS;

  const getRandomInt = (max: number) => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  };

  // Ensure at least one of each required class
  const result: string[] = [
    LOWER[getRandomInt(LOWER.length)],
    UPPER[getRandomInt(UPPER.length)],
    DIGITS[getRandomInt(DIGITS.length)],
    SYMBOLS[getRandomInt(SYMBOLS.length)],
  ];

  for (let i = result.length; i < length; i++) {
    result.push(ALL[getRandomInt(ALL.length)]);
  }

  // Shuffle to avoid predictable positions
  for (let i = result.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join("");
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
      throw new Error("Permissão negada. Apenas administradores podem resetar senhas.");
    }

    // Parse and validate input
    const rawData = await req.json();
    const validatedData = resetPasswordSchema.parse(rawData);
    const { userId, userEmail, userName } = validatedData;

    // Generate cryptographically-strong temporary password
    const tempPassword = generateStrongTempPassword(16);

    // Update user password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: tempPassword }
    );

    if (updateError) {
      console.error("Erro ao atualizar senha:", updateError);
      throw new Error("Erro ao resetar senha");
    }

    // Send email with temporary password
    const emailResponse = await resend.emails.send({
      from: "Tech Metrics <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Sua senha foi resetada - Tech Metrics",
      html: `
        <h2>Olá ${userName},</h2>
        <p>Sua senha foi resetada por um administrador do sistema.</p>
        <p>Sua senha temporária é:</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; margin: 20px 0;">
          ${tempPassword}
        </div>
        <p><strong>IMPORTANTE:</strong> Por segurança, você será obrigado a trocar esta senha no primeiro login.</p>
        <p>Acesse o sistema e faça login com esta senha temporária.</p>
        <br>
        <p>Atenciosamente,<br>Equipe Tech Metrics</p>
      `,
    });

    console.log("Email enviado:", emailResponse);

    // Mark user as requiring password change
    const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { 
        user_metadata: { 
          must_change_password: true,
          password_reset_at: new Date().toISOString()
        }
      }
    );

    if (metaError) {
      console.error("Erro ao atualizar metadados:", metaError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Senha resetada e email enviado com sucesso"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Erro na função reset-user-password:", error);
    
    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: "Dados inválidos",
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
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
