import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Bell } from "lucide-react";

interface AdminHeaderProps {
    title: string;
    subtitle?: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
    const [pendingOrders, setPendingOrders] = useState(0);

    useEffect(() => {
        const fetchPending = async () => {
            const { count } = await supabase
                .from("orders")
                .select("*", { count: "exact", head: true })
                .eq("status", "pending");
            setPendingOrders(count || 0);
        };
        fetchPending();
    }, []);

    return (
        <header className="h-16 bg-black/20 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-8">
            <div>
                <h1 className="text-xl font-bold">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    {pendingOrders > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {pendingOrders}
                        </span>
                    )}
                </button>

                {/* Time */}
                <div className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long"
                    })}
                </div>
            </div>
        </header>
    );
}
