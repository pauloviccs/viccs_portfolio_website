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
    const [debugInfo, setDebugInfo] = useState<string>('Iniciando...');

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            try {
                console.log('[ProtectedRoute] Checking auth...');
                setDebugInfo('Verificando sessão...');

                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('[ProtectedRoute] Session error:', sessionError);
                    if (isMounted) {
                        setDebugInfo(`Erro de sessão: ${sessionError.message}`);
                        setAuthState('not-authenticated');
                    }
                    return;
                }

                if (!isMounted) return;

                if (!session) {
                    console.log('[ProtectedRoute] No session found');
                    setDebugInfo('Sem sessão');
                    setAuthState('not-authenticated');
                    return;
                }

                console.log('[ProtectedRoute] Session found for user:', session.user.id);
                setDebugInfo(`Sessão OK. User: ${session.user.email}`);

                if (adminOnly) {
                    console.log('[ProtectedRoute] Checking admin role...');
                    setDebugInfo('Verificando permissões de admin...');

                    // Check profile role
                    const { data: profile, error: profileError } = await supabase
                        .from("profiles")
                        .select("role")
                        .eq("id", session.user.id)
                        .single();

                    if (profileError) {
                        console.error('[ProtectedRoute] Profile fetch error:', profileError);
                        setDebugInfo(`Erro ao buscar perfil: ${profileError.message}`);

                        // If profile doesn't exist or RLS blocks, redirect to dashboard
                        if (isMounted) setAuthState('not-admin');
                        return;
                    }

                    console.log('[ProtectedRoute] Profile role:', profile?.role);
                    setDebugInfo(`Role: ${profile?.role}`);

                    if (isMounted) {
                        if (profile?.role === "admin") {
                            console.log('[ProtectedRoute] Admin authorized');
                            setAuthState('authorized');
                        } else {
                            console.log('[ProtectedRoute] Not admin, redirecting to dashboard');
                            setAuthState('not-admin');
                        }
                    }
                } else {
                    // Any authenticated user is allowed
                    console.log('[ProtectedRoute] User authorized (non-admin route)');
                    if (isMounted) setAuthState('authorized');
                }
            } catch (error: any) {
                console.error("[ProtectedRoute] Auth check error:", error);
                if (isMounted) {
                    setDebugInfo(`Erro: ${error.message}`);
                    setAuthState('not-authenticated');
                }
            }
        };

        // Initial check
        checkAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
            console.log('[ProtectedRoute] Auth state changed:', event);
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

    // Loading state with debug info
    if (authState === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                    <span className="text-muted-foreground text-sm">Verificando autenticação...</span>
                    <span className="text-muted-foreground text-xs opacity-50">{debugInfo}</span>
                </div>
            </div>
        );
    }

    // Not authenticated - go to login
    if (authState === 'not-authenticated') {
        console.log('[ProtectedRoute] Redirecting to /auth');
        return <Navigate to="/auth" replace />;
    }

    // User is authenticated but not admin - redirect to client dashboard
    if (authState === 'not-admin') {
        console.log('[ProtectedRoute] Redirecting to /dashboard (not admin)');
        return <Navigate to="/dashboard" replace />;
    }

    // Authorized
    console.log('[ProtectedRoute] Rendering protected content');
    return <>{children}</>;
}
