import { useState } from "react";
import { supabase } from "../supabaseClient";
import { LiquidLayout } from "../layouts/LiquidLayout";
import { useNavigate } from "react-router-dom";

export function AuthPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert("Check your email for the confirmation link!");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate("/dashboard");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LiquidLayout>
            <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
                <div className="glass-card w-full max-w-md p-8 md:p-12">
                    <h2 className="text-3xl font-display font-bold text-center mb-8">
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </h2>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-secondary/70 mb-2">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="glass-input w-full"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary/70 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-input w-full"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-full bg-accent text-primary font-bold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-secondary/60">
                        {isSignUp ? "Already have an account?" : "No account yet?"}{" "}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-accent hover:underline font-medium"
                        >
                            {isSignUp ? "Sign In" : "Create one"}
                        </button>
                    </div>
                </div>
            </div>
        </LiquidLayout>
    );
}
