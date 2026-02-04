import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { LiquidLayout } from "../layouts/LiquidLayout";
import { OrderList } from "@/components/dashboard/OrderList";
import { OrderComposer } from "@/components/dashboard/OrderComposer";
import { OrderDetails } from "@/components/dashboard/OrderDetails";

export function ClientDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [isComposing, setIsComposing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();

        // Subscribe to new orders
        const channel = supabase
            .channel('orders-list')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchOrders();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchOrders = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("orders")
            .select("*")
            .eq("client_id", user.id) // Assuming schema uses client_id
            .order("created_at", { ascending: false });

        if (data) {
            setOrders(data);
            // Auto-select first order if none selected and not composing
            if (!selectedOrder && !isComposing && data.length > 0) {
                setSelectedOrder(data[0]);
            }
        }
        setLoading(false);
    };

    const handleNewOrder = () => {
        setSelectedOrder(null);
        setIsComposing(true);
    };

    const handleOrderSelect = (order: any) => {
        setIsComposing(false);
        setSelectedOrder(order);
    };

    return (
        <LiquidLayout>
            <div className="h-screen pt-20 pb-6 px-4 md:px-6 flex gap-6 max-w-[1600px] mx-auto relative z-10">
                {/* Sidebar / List */}
                <div className={`
                    absolute inset-0 z-20 md:static md:z-auto bg-background/95 md:bg-transparent md:block w-full md:w-auto
                    ${selectedOrder || isComposing ? 'hidden md:block' : 'block'}
                `}>
                    <div className="h-full glass-card overflow-hidden rounded-2xl flex flex-col">
                        <OrderList
                            orders={orders}
                            selectedId={selectedOrder?.id}
                            onSelect={handleOrderSelect}
                            onNewOrder={handleNewOrder}
                            loading={loading}
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className={`
                    flex-1 glass-card rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300
                    ${!selectedOrder && !isComposing ? 'hidden md:flex md:items-center md:justify-center' : 'block'}
                `}>
                    {isComposing ? (
                        <OrderComposer
                            onCancel={() => {
                                setIsComposing(false);
                                if (orders.length > 0) setSelectedOrder(orders[0]);
                            }}
                            onSuccess={() => {
                                setIsComposing(false);
                                fetchOrders();
                            }}
                        />
                    ) : selectedOrder ? (
                        <OrderDetails
                            order={selectedOrder}
                            onClose={() => setSelectedOrder(null)}
                        />
                    ) : (
                        <div className="text-center text-muted-foreground p-8 hidden md:block">
                            <p>Selecione um pedido ou crie um novo para começar.</p>
                        </div>
                    )}
                </div>
            </div>
        </LiquidLayout>
    );
}

