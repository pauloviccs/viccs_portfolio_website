import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export function AuthCallback() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the current session (established after OAuth redirect)
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    throw sessionError;
                }

                if (!session) {
                    // No session yet, might still be loading
                    // Wait a bit and try again
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const { data: { session: retrySession } } = await supabase.auth.getSession();

                    if (!retrySession) {
                        navigate('/auth');
                        return;
                    }
                }

                const currentSession = session || (await supabase.auth.getSession()).data.session;

                if (!currentSession) {
                    navigate('/auth');
                    return;
                }

                // Check user role from profiles table
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", currentSession.user.id)
                    .single();

                if (profileError) {
                    console.error("Profile fetch error:", profileError);
                    // Default to client dashboard if profile doesn't exist
                    navigate('/dashboard');
                    return;
                }

                // Redirect based on role
                if (profile?.role === "admin") {
                    navigate('/admin', { replace: true });
                } else {
                    navigate('/dashboard', { replace: true });
                }
            } catch (err: any) {
                console.error("Auth callback error:", err);
                setError(err.message);
                // Wait a bit then redirect to auth
                setTimeout(() => navigate('/auth'), 2000);
            }
        };

        handleCallback();
    }, [navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Erro de autenticação: {error}</p>
                    <p className="text-muted-foreground">Redirecionando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                <span className="text-muted-foreground text-sm">Verificando autenticação...</span>
            </div>
        </div>
    );
}
