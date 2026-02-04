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
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

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

                setAuthorized(profile?.role === "admin");
            } else {
                setAuthorized(true);
            }

            setLoading(false);
        };

        checkAuth();
    }, [adminOnly]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-white">Loading Auth...</div>;
    }

    if (!authorized) {
        return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
}
