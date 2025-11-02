import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import logoWK from "@/assets/logo-wk.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login - will be replaced with actual authentication
    setTimeout(() => {
      if (email === "denilson.nogueira@wk.com.br" && password === "WKsistemasKPI") {
        toast.success("Login realizado com sucesso!");
        localStorage.setItem("isAuthenticated", "true");
        navigate("/");
      } else {
        toast.error("Credenciais inválidas!");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
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

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Usuário MASTER para testes:</p>
          <p className="font-mono text-xs mt-1">denilson.nogueira@wk.com.br</p>
          <p className="font-mono text-xs">WKsistemasKPI</p>
        </div>
      </Card>
    </div>
  );
}
