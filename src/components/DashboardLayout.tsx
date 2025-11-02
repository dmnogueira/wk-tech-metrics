import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import logoWK from "@/assets/logo-wk.png";
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

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoWK} alt="WK" className="h-8 w-auto" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">Tech Metrics</span>
              </div>
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
              <Link to="/import">
                <Button 
                  variant={location.pathname === "/import" ? "secondary" : "ghost"} 
                  size="sm"
                >
                  Importar Métricas
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
                    <Link to="/users" className="cursor-pointer">Usuários</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">Configurações</Link>
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
                    DN
                  </div>
                  <span className="hidden md:inline">Denilson Nogueira</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem className="cursor-pointer">
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
