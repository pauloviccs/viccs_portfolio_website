import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

interface ProtectedRouteProps {
    children: ReactNode;
    adminOnly?: boolean;
}

type AuthState = 'loading' | 'authorized' | 'not-authenticated' | 'not-admin';

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
    const [authState, setAuthState] = useState<AuthState>('loading');

    useEffect(() => {
        let isMounted = true;
        let checkInProgress = false;

        const checkAuth = async () => {
            // Prevent concurrent checks
            if (checkInProgress) return;
            checkInProgress = true;

            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!isMounted) return;

                if (!session) {
                    setAuthState('not-authenticated');
                    return;
                }

                if (adminOnly) {
                    // Check profile role
                    const { data: profile, error } = await supabase
                        .from("profiles")
                        .select("role")
                        .eq("id", session.user.id)
                        .single();

                    if (error) {
                        console.error("Profile fetch error:", error);
                        // If profile fetch fails, assume not admin
                        if (isMounted) setAuthState('not-admin');
                        return;
                    }

                    if (isMounted) {
                        setAuthState(profile?.role === "admin" ? 'authorized' : 'not-admin');
                    }
                } else {
                    // Any authenticated user is allowed
                    if (isMounted) setAuthState('authorized');
                }
            } catch (error) {
                console.error("Auth check error:", error);
                if (isMounted) setAuthState('not-authenticated');
            } finally {
                checkInProgress = false;
            }
        };

        // Initial check
        checkAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
            if (!isMounted) return;

            // Only re-check on meaningful events
            if (event === 'SIGNED_OUT') {
                setAuthState('not-authenticated');
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                checkAuth();
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [adminOnly]);

    // Loading state
    if (authState === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                    <span className="text-muted-foreground text-sm">Verificando autenticação...</span>
                </div>
            </div>
        );
    }

    // Not authenticated - go to login
    if (authState === 'not-authenticated') {
        return <Navigate to="/auth" replace />;
    }

    // User is authenticated but not admin - redirect to client dashboard
    if (authState === 'not-admin') {
        return <Navigate to="/dashboard" replace />;
    }

    // Authorized
    return <>{children}</>;
}
