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

        const checkAuth = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    if (isMounted) setAuthState('not-authenticated');
                    return;
                }

                if (!isMounted) return;

                if (!session) {
                    setAuthState('not-authenticated');
                    return;
                }

                if (adminOnly) {
                    // Check profile role
                    const { data: profile, error: profileError } = await supabase
                        .from("profiles")
                        .select("role")
                        .eq("id", session.user.id)
                        .single();

                    if (profileError) {
                        // If profile fetch fails, redirect to client dashboard
                        if (isMounted) setAuthState('not-admin');
                        return;
                    }

                    if (isMounted) {
                        if (profile?.role === "admin") {
                            setAuthState('authorized');
                        } else {
                            setAuthState('not-admin');
                        }
                    }
                } else {
                    // Any authenticated user is allowed
                    if (isMounted) setAuthState('authorized');
                }
            } catch (_error) {
                if (isMounted) setAuthState('not-authenticated');
            }
        };

        // Initial check
        checkAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
            if (!isMounted) return;

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
