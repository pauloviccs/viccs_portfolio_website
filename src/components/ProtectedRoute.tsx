import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

interface ProtectedRouteProps {
    children: ReactNode;
    adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!isMounted) return;

                if (!session) {
                    setAuthorized(false);
                    setLoading(false);
                    return;
                }

                if (adminOnly) {
                    // Check profile role
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("role")
                        .eq("id", session.user.id)
                        .single();

                    if (isMounted) {
                        setAuthorized(profile?.role === "admin");
                    }
                } else {
                    if (isMounted) {
                        setAuthorized(true);
                    }
                }

                if (isMounted) {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Auth check error:", error);
                if (isMounted) {
                    setAuthorized(false);
                    setLoading(false);
                }
            }
        };

        // Initial check
        checkAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;

            if (!session) {
                setAuthorized(false);
                setLoading(false);
                return;
            }

            // Re-check authorization when auth state changes
            checkAuth();
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [adminOnly]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                    <span className="text-muted-foreground text-sm">Verificando autenticação...</span>
                </div>
            </div>
        );
    }

    if (!authorized) {
        return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
}
