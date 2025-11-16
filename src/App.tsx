import { useEffect, useState, Component, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Dashboard from "./pages/Dashboard";
import DashboardNew from "./pages/DashboardNew";
import Login from "./pages/Login";
import Import from "./pages/Import";
import Squads from "./pages/Squads";
import Professionals from "./pages/Professionals";
import JobRolesPage from "./pages/JobRoles";
import Organogram from "./pages/Organogram";
import Users from "./pages/Users";
import DataPage from "./pages/Data";
import Indicators from "./pages/Indicators";
import DataImport from "./pages/DataImport";
import NotFound from "./pages/NotFound";
import { DashboardDataProvider } from "./contexts/dashboard-data-context";

const queryClient = new QueryClient();

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🔴 ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🔴 ErrorBoundary componentDidCatch:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          color: 'white', 
          background: '#1a1a1a',
          minHeight: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '30px',
            background: '#dc2626',
            borderRadius: '8px'
          }}>
            <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>
              ❌ Erro na Aplicação React
            </h1>
            <p style={{ fontSize: '16px', marginBottom: '15px' }}>
              <strong>Erro:</strong> {this.state.error?.message || 'Erro desconhecido'}
            </p>
            <pre style={{
              background: '#000',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              lineHeight: '1.5'
            }}>
              {this.state.error?.stack || 'Sem stack trace'}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#fff',
                color: '#dc2626',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🔄 Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import("@/integrations/supabase/client").then(({ supabase }) => {
      // Check initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsAuthenticated(!!session);
        setIsLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setIsAuthenticated(!!session);
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  console.log('✅ App component rendering...');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <DashboardDataProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/"
                    element={
                      <RequireAuth>
                        <DashboardNew />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/dashboard-legacy"
                    element={
                      <RequireAuth>
                        <Dashboard />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/import"
                    element={
                      <RequireAuth>
                        <Import />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/squads"
                    element={
                      <RequireAuth>
                        <Squads />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/professionals"
                    element={
                      <RequireAuth>
                        <Professionals />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/job-roles"
                    element={
                      <RequireAuth>
                        <JobRolesPage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/organogram"
                    element={
                      <RequireAuth>
                        <Organogram />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <RequireAuth>
                        <Users />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/dados"
                    element={
                      <RequireAuth>
                        <DataPage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/indicadores"
                    element={
                      <RequireAuth>
                        <Indicators />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/importacao"
                    element={
                      <RequireAuth>
                        <DataImport />
                      </RequireAuth>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </DashboardDataProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
