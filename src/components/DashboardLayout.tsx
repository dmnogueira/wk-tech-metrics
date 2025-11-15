import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Usuário");

  useEffect(() => {
    // Get current user info
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      } else if (user?.email) {
        setUserName(user.email.split('@')[0]);
      }
    });
  }, []);

  const handleLogout = async () => {
    try {
      const { clearRoleCache } = await import("@/lib/auth");
      clearRoleCache();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Sessão encerrada com sucesso!");
      navigate("/login");
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao encerrar sessão");
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-foreground">Tech Metrics</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/">
                <Button 
                  variant={location.pathname === "/" ? "secondary" : "ghost"} 
                  size="sm"
                >
                  Dashboard
                </Button>
              </Link>
              <Link to="/indicadores">
                <Button
                  variant={location.pathname === "/indicadores" ? "secondary" : "ghost"}
                  size="sm"
                >
                  Indicadores
                </Button>
              </Link>
              <Link to="/import">
                <Button
                  variant={location.pathname === "/import" ? "secondary" : "ghost"}
                  size="sm"
                >
                  Importação
                </Button>
              </Link>
              <Link to="/organogram">
                <Button
                  variant={location.pathname === "/organogram" ? "secondary" : "ghost"}
                  size="sm"
                >
                  Organograma
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Cadastros <Menu className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-popover border-border">
                  <DropdownMenuItem asChild>
                    <Link to="/squads" className="cursor-pointer">Squads</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/professionals" className="cursor-pointer">Profissionais</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/job-roles" className="cursor-pointer">Cargos e Funções</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/users" className="cursor-pointer">Usuários</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dados" className="cursor-pointer">Base Dashboard</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold">
                    {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <span className="hidden md:inline">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(event) => {
                    event.preventDefault();
                    handleLogout();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
