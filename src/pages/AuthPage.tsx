import { useState } from "react";
import { supabase } from "../supabaseClient";
import { LiquidLayout } from "../layouts/LiquidLayout";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

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
                    options: {
                        emailRedirectTo: `${window.location.origin}/dashboard`,
                    },
                });
                if (error) throw error;
                alert("Verifique seu email para o link de confirmação!");
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

    const handleSocialLogin = async (provider: 'google' | 'discord') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <LiquidLayout>
            <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
                <div className="glass-card w-full max-w-md p-8 md:p-12 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-display font-bold mb-2 tracking-tight">
                            {isSignUp ? "Criar Conta" : "Bem-vindo"}
                        </h2>
                        <p className="text-secondary/60 text-sm">
                            {isSignUp ? "Junte-se ao espaço VICCS." : "Acesse seu painel de controle."}
                        </p>
                    </div>

                    <div className="space-y-4 mb-8">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className="w-full py-3 px-4 rounded-xl glass bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-3 transition-all group"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            <span className="font-medium text-sm">Continuar com Google</span>
                        </button>
                        <button
                            onClick={() => handleSocialLogin('discord')}
                            className="w-full py-3 px-4 rounded-xl glass bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/20 flex items-center justify-center gap-3 transition-all group"
                        >
                            <img src="https://assets-global.website-files.com/6257adef93867e56f84d3092/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" className="w-5 h-5" alt="Discord" />
                            <span className="font-medium text-sm">Continuar com Discord</span>
                        </button>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0a0a0a]/80 backdrop-blur px-2 text-secondary/40">Ou use seu email</span>
                        </div>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-secondary/70 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="glass-input w-full pl-10 py-3 text-sm"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-secondary/70 ml-1">Senha</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-input w-full py-3 text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-full bg-accent text-primary font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--accent),0.3)] hover:shadow-[0_0_30px_rgba(var(--accent),0.5)]"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    {isSignUp ? "Criar Conta" : "Entrar"}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-secondary/60">
                        {isSignUp ? "Já tem uma conta?" : "Não tem conta ainda?"}{" "}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-accent hover:underline font-medium hover:text-accent-foreground transition-colors"
                        >
                            {isSignUp ? "Fazer Login" : "Cadastre-se"}
                        </button>
                    </div>
                </div>
            </div>
        </LiquidLayout>
    );
}
