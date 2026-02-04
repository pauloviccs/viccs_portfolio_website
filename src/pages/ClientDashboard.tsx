import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { LiquidLayout } from "../layouts/LiquidLayout";
import type { Database } from "../types/supabase";

type Order = Database["public"]["Tables"]["orders"]["Row"];

export function ClientDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("orders")
            .select("*")
            .eq("client_id", user.id)
            .order("created_at", { ascending: false });

        if (data) setOrders(data);
    };

    const createOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase.from("orders").insert({
                client_id: user.id,
                title,
                description: desc,
                status: 'pending'
            });

            if (error) throw error;

            alert("Order requested successfully!");
            setShowForm(false);
            setTitle("");
            setDesc("");
            fetchOrders();
        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <LiquidLayout>
            <div className="min-h-screen p-6 pt-24 relative z-10 max-w-7xl mx-auto">
                <h1 className="text-4xl font-display font-bold mb-8">My Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* New Order Section */}
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-bold mb-4">New Order</h2>
                        {!showForm ? (
                            <>
                                <p className="text-secondary/70 mb-6">Start a new project with Viccs Design.</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="w-full py-3 rounded-full bg-accent text-primary font-bold hover:brightness-110 transition"
                                >
                                    Create Request
                                </button>
                            </>
                        ) : (
                            <form onSubmit={createOrder} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Project Title</label>
                                    <input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="glass-input w-full"
                                        placeholder="E.g. Logo Redesign"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={desc}
                                        onChange={e => setDesc(e.target.value)}
                                        className="glass-input w-full h-32"
                                        placeholder="Describe your vision..."
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 py-2 rounded-full border border-white/10 hover:bg-white/5 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 py-2 rounded-full bg-accent text-primary font-bold hover:brightness-110 transition disabled:opacity-50"
                                    >
                                        {creating ? "Sending..." : "Submit"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Active Orders Section */}
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-bold mb-4">Active Orders</h2>
                        {orders.length === 0 ? (
                            <p className="text-secondary/70">No active orders found.</p>
                        ) : (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {orders.map(order => (
                                    <div key={order.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold">{order.title}</h3>
                                            <span className="text-xs uppercase px-2 py-1 rounded bg-white/10 text-secondary/80">
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-secondary/70 line-clamp-2">{order.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </LiquidLayout>
    );
}
