import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Plus, Search, PackageOpen } from 'lucide-react';

interface Order {
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
    priority: string;
}

interface OrderListProps {
    orders: Order[];
    selectedId?: string;
    onSelect: (order: Order) => void;
    onNewOrder: () => void;
    loading: boolean;
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20',
    in_progress: 'bg-blue-500/20 text-blue-500 border-blue-500/20',
    completed: 'bg-green-500/20 text-green-500 border-green-500/20',
    cancelled: 'bg-red-500/20 text-red-500 border-red-500/20',
    default: 'bg-white/10 text-white/50 border-white/10'
};

export function OrderList({ orders, selectedId, onSelect, onNewOrder, loading }: OrderListProps) {
    const [orderTagMap, setOrderTagMap] = useState<Record<string, { id: string; name: string; color: string }[]>>({});

    useEffect(() => {
        fetchAllTags();

        const channel = supabase
            .channel('client-order-tags')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'order_tag_assignments' }, () => {
                fetchAllTags();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchAllTags = async () => {
        const { data } = await supabase
            .from('order_tag_assignments')
            .select('order_id, order_tags(id, name, color)');

        if (data) {
            const map: Record<string, { id: string; name: string; color: string }[]> = {};
            data.forEach((a: any) => {
                if (!a.order_tags) return;
                if (!map[a.order_id]) map[a.order_id] = [];
                map[a.order_id].push(a.order_tags);
            });
            setOrderTagMap(map);
        }
    };

    if (orders.length === 0 && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center animate-pulse">
                    <PackageOpen size={40} className="text-accent" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Nenhum pedido</h3>
                    <p className="text-muted-foreground max-w-[200px] mx-auto text-sm mt-2">
                        Sua caixa de entrada está limpa. Que tal começar um novo projeto?
                    </p>
                </div>
                <button
                    onClick={onNewOrder}
                    className="px-6 py-2 bg-accent text-accent-foreground rounded-full font-medium shadow-lg shadow-accent/20 hover:scale-105 transition-transform"
                >
                    Criar Pedido
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-black/10 backdrop-blur-md border-r border-white/5 w-full md:w-[350px] lg:w-[400px]">
            <div className="p-4 border-b border-white/5 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                        placeholder="Buscar..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-accent transition-colors"
                    />
                </div>
                <button
                    onClick={onNewOrder}
                    className="p-2 bg-accent text-accent-foreground rounded-lg hover:brightness-110 transition-all shadow-lg shadow-accent/10"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {orders.map((order, i) => {
                            const tags = orderTagMap[order.id] || [];
                            return (
                                <motion.button
                                    key={order.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => onSelect(order)}
                                    className={`p-4 text-left border-b border-white/5 hover:bg-white/5 transition-colors group ${selectedId === order.id ? 'bg-white/5 border-l-2 border-l-accent' : 'border-l-2 border-l-transparent'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-medium truncate pr-2 ${selectedId === order.id ? 'text-accent' : 'text-foreground'}`}>
                                            {order.title}
                                        </h4>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {format(new Date(order.created_at), 'd MMM', { locale: ptBR })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2 h-10">
                                        {order.description}
                                    </p>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${statusColors[order.status] || statusColors.default}`}>
                                            {order.status}
                                        </span>
                                        {order.priority !== 'normal' && (
                                            <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 bg-white/5 text-muted-foreground">
                                                {order.priority}
                                            </span>
                                        )}
                                        {tags.map((tag) => (
                                            <span key={tag.id} className="px-1.5 py-0.5 rounded-full text-[9px] font-bold border" style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' }}>
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
