import { useState, useRef } from 'react';
import { supabase } from '@/supabaseClient';
import { Paperclip, X, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface OrderComposerProps {
    onCancel: () => void;
    onSuccess: () => void;
}

export function OrderComposer({ onCancel, onSuccess }: OrderComposerProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('normal');
    const [whatsapp, setWhatsapp] = useState('');
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario não autenticado');

            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    client_id: user.id, // Using client_id as per existing schema
                    title,
                    description,
                    priority,
                    whatsapp,
                    status: 'pending'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Upload Files
            if (files.length > 0 && order) {
                const uploadedUrls = [];
                for (const file of files) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${order.id}/${Math.random()}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage
                        .from('attachments')
                        .upload(fileName, file);

                    if (uploadError) throw uploadError;

                    // Get Public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('attachments')
                        .getPublicUrl(fileName);

                    uploadedUrls.push(publicUrl);
                }

                // 3. Create initial message with attachments if any
                if (uploadedUrls.length > 0) {
                    await supabase.from('order_messages').insert({
                        order_id: order.id,
                        user_id: user.id,
                        content: 'Arquivos anexados no pedido.',
                        attachments: uploadedUrls
                    });
                }
            }

            toast.success('Pedido criado com sucesso!');
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error('Erro ao criar pedido: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-black/20 p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Novo Pedido</h3>
                <button onClick={onCancel} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 gap-4 overflow-y-auto">
                <input
                    placeholder="Assunto (ex: E-commerce de Sapatos)"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="bg-transparent text-xl font-medium placeholder:text-muted-foreground outline-none border-b border-white/10 pb-2 focus:border-accent transition-colors"
                    required
                    autoFocus
                />

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground ml-1">Prioridade</label>
                        <select
                            value={priority}
                            onChange={e => setPriority(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm outline-none focus:border-accent"
                        >
                            <option value="low">Baixa</option>
                            <option value="normal">Normal</option>
                            <option value="high">Alta</option>
                            <option value="urgent">Urgente</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground ml-1">WhatsApp</label>
                        <input
                            placeholder="(11) 99999-9999"
                            value={whatsapp}
                            onChange={e => setWhatsapp(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm outline-none focus:border-accent"
                        />
                    </div>
                </div>

                <textarea
                    placeholder="Descreva seu projeto detalhadamente..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="flex-1 bg-transparent resize-none outline-none placeholder:text-muted-foreground min-h-[200px]"
                    required
                />

                {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 py-2">
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-md px-3 py-1 text-sm">
                                <span className="truncate max-w-[150px]">{file.name}</span>
                                <button type="button" onClick={() => removeFile(i)} className="hover:text-red-400">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </form>

            <div className="p-4 border-t border-white/5 flex justify-between items-center bg-black/20">
                <div className="flex gap-2">
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                        title="Anexar arquivos"
                    >
                        <Paperclip size={20} />
                    </button>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 hover:bg-white/5 rounded-lg text-sm transition-colors"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                        Enviar Pedido
                    </button>
                </div>
            </div>
        </div>
    );
}
