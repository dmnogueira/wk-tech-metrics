import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logoWK from "@/assets/logo-wk.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Check if user must change password
        if (session.user.user_metadata?.must_change_password) {
          setShowChangePassword(true);
        } else {
          navigate("/");
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        if (session.user.user_metadata?.must_change_password) {
          setShowChangePassword(true);
        } else {
          navigate("/");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user?.user_metadata?.must_change_password) {
        setShowChangePassword(true);
      } else {
        toast.success("Login realizado com sucesso!");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };


  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error("Digite seu e-mail");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;

      toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Erro ao enviar e-mail:", error);
      toast.error(error.message || "Erro ao enviar e-mail de recuperação");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        data: {
          must_change_password: false,
        }
      });

      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      setShowChangePassword(false);
      navigate("/");
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast.error(error.message || "Erro ao alterar senha");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary/90 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-card/95 backdrop-blur-sm border-border/50">
          <div className="flex flex-col items-center mb-8">
            <img
              src={logoWK}
              alt="WK"
              className="h-12 w-auto mb-4 drop-shadow-[0_0_12px_rgba(0,0,0,0.45)]"
            />
            <h1 className="text-2xl font-bold text-foreground">Tech Metrics</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Dashboard Executivo de Métricas Técnicas
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@wk.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-4">
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
            >
              Esqueceu sua senha?
            </button>
          </div>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar senha</DialogTitle>
            <DialogDescription>
              Digite seu e-mail para receber um link de recuperação de senha.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">E-mail</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="seu.email@wk.com.br"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForgotPassword(false)}>
              Cancelar
            </Button>
            <Button onClick={handleForgotPassword} disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar e-mail"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showChangePassword} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Alterar senha obrigatória</DialogTitle>
            <DialogDescription>
              Por segurança, você deve alterar sua senha temporária antes de continuar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Digite sua nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar senha</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirme sua nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleChangePassword} disabled={isLoading} className="w-full">
              {isLoading ? "Alterando..." : "Alterar senha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
