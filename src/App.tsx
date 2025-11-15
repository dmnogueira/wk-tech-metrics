import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Dashboard from "./pages/Dashboard";
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

const App = () => (
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
);

export default App;
