import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/supabaseClient';
import { format } from 'date-fns';
import { Send, Paperclip, Loader2, ArrowLeft } from 'lucide-react';

interface OrderDetailsProps {
    order: any;
    onClose?: () => void; // Mobile only
}

export function OrderDetails({ order, onClose }: OrderDetailsProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [orderTags, setOrderTags] = useState<{ id: string; name: string; color: string }[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (order?.id) {
            fetchMessages();
            fetchOrderTags();
            const channel = supabase
                .channel(`order-${order.id}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_messages', filter: `order_id=eq.${order.id}` }, payload => {
                    setMessages(prev => [...prev, payload.new]);
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'order_tag_assignments', filter: `order_id=eq.${order.id}` }, () => {
                    fetchOrderTags();
                })
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        }
    }, [order?.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async () => {
        const { data } = await supabase
            .from('order_messages')
            .select('*')
            .eq('order_id', order.id)
            .order('created_at', { ascending: true });

        if (data) setMessages(data);
    };

    const fetchOrderTags = async () => {
        const { data } = await supabase
            .from('order_tag_assignments')
            .select('tag_id, order_tags(id, name, color)')
            .eq('order_id', order.id);

        if (data) {
            const tags = data
                .map((a: any) => a.order_tags)
                .filter(Boolean);
            setOrderTags(tags);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        setSending(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase.from('order_messages').insert({
                order_id: order.id,
                user_id: user.id,
                content: newMessage,
                is_admin: false
            });

            setNewMessage('');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background/20 backdrop-blur-xl">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-black/20">
                {onClose && (
                    <button onClick={onClose} className="md:hidden p-2 hover:bg-white/10 rounded-full">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg leading-tight">{order.title}</h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>ID: #{order.id.slice(0, 8)}</span>
                        <span>•</span>
                        <span>{format(new Date(order.created_at), 'dd MMM yyyy')}</span>
                    </div>
                    {/* Tag pills */}
                    {orderTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {orderTags.map((tag) => (
                                <span key={tag.id} className="px-2 py-0.5 rounded-full text-[10px] font-bold border" style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' }}>
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="ml-auto shrink-0">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent/20 text-accent border border-accent/20">
                        {order.status}
                    </span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref={scrollRef}>

                {/* Initial Order Description as a message */}
                <div className="flex justify-end">
                    <div className="max-w-[80%] bg-accent/10 border border-accent/20 rounded-2xl rounded-tr-sm p-4 text-sm">
                        <p className="font-bold text-accent mb-1 text-xs">Você solicitou:</p>
                        <p className="whitespace-pre-wrap">{order.description}</p>
                    </div>
                </div>

                {messages.map((msg) => {
                    const isMe = !msg.is_admin; // Assuming current user is client
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[80%] rounded-2xl p-4 text-sm relative group
                                ${isMe
                                    ? 'bg-accent text-accent-foreground rounded-tr-sm'
                                    : 'bg-white/10 text-foreground rounded-tl-sm border border-white/5'}
                            `}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {msg.attachments.map((url: string, i: number) => (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-xs underline opacity-80 hover:opacity-100">
                                                Anexo {i + 1}
                                            </a>
                                        ))}
                                    </div>
                                )}
                                <span className="text-[10px] opacity-50 block mt-2 text-right">
                                    {format(new Date(msg.created_at), 'HH:mm')}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/20 border-t border-white/5">
                <form onSubmit={sendMessage} className="flex gap-2 items-end">
                    <button type="button" className="p-3 text-muted-foreground hover:bg-white/10 rounded-xl transition-colors">
                        <Paperclip size={20} />
                    </button>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-accent transition-colors">
                        <textarea
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            className="w-full bg-transparent p-3 outline-none resize-none max-h-[100px] text-sm"
                            rows={1}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage(e);
                                }
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-3 bg-accent text-accent-foreground rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
                    >
                        {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
