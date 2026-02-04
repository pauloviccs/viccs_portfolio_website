import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { LiquidLayout } from "../layouts/LiquidLayout";
import type { Database } from "../types/supabase";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function AdminDashboard() {
    const [orders, setOrders] = useState<(Order & { profiles: Profile | null })[]>([]);
    const [loading, setLoading] = useState(true);

    // Project Upload State
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [category, setCategory] = useState("Design");
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // Join queries in Supabase via separate fetching usually or using joins if types allow
            // For now, simpler fetch
            const { data, error } = await supabase
                .from("orders")
                .select(`*, profiles(*)`)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setOrders(data as any);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: Database["public"]["Enums"]["order_status"]) => {
        const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
        if (!error) fetchOrders();
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return alert("Please select a file");

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload Image
            const { error: uploadError } = await supabase.storage.from('projects').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('projects').getPublicUrl(filePath);

            // Insert Record
            const { error: dbError } = await supabase.from('projects').insert({
                title,
                description: desc,
                category,
                image_urls: [publicUrl]
            });

            if (dbError) throw dbError;

            alert("Project uploaded successfully!");
            setTitle("");
            setDesc("");
            setFile(null);
        } catch (error: any) {
            alert("Error uploading: " + error.message);
        } finally {
            setUploading(false);
        }
    }

    return (
        <LiquidLayout>
            <div className="min-h-screen p-6 pt-24 relative z-10 max-w-7xl mx-auto">
                <h1 className="text-4xl font-display font-bold mb-8">Admin Dashboard</h1>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Order Management */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Incoming Orders</h2>
                        <div className="space-y-4">
                            {loading ? <p>Loading...</p> : orders.length === 0 ? <p className="text-secondary/60">No orders yet.</p> : orders.map(order => (
                                <div key={order.id} className="glass-card p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{order.title}</h3>
                                            <p className="text-sm text-secondary/70">From: {order.profiles?.full_name || "Unknown"}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                                order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                                    'bg-blue-500/20 text-blue-500'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm mb-4">{order.description}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => updateStatus(order.id, 'in_progress')} className="text-xs px-3 py-1 bg-white/5 rounded border border-white/10 hover:bg-white/10">Mark In Progress</button>
                                        <button onClick={() => updateStatus(order.id, 'completed')} className="text-xs px-3 py-1 bg-green-500/10 text-green-500 rounded border border-green-500/20 hover:bg-green-500/20">Mark Completed</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Project Upload */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Upload Project</h2>
                        <form onSubmit={handleUpload} className="glass-card p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Project Title</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} className="glass-input w-full" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} className="glass-input w-full bg-transparent">
                                    <option value="Design">Design</option>
                                    <option value="Motion">Motion</option>
                                    <option value="3D">3D</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea value={desc} onChange={e => setDesc(e.target.value)} className="glass-input w-full h-32" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Cover Image</label>
                                <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="glass-input w-full" accept="image/*" required />
                            </div>
                            <button disabled={uploading} className="w-full py-3 rounded-full bg-accent text-primary font-bold hover:brightness-110 transition disabled:opacity-50">
                                {uploading ? "Uploading..." : "Publish Project"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </LiquidLayout>
    );
}
