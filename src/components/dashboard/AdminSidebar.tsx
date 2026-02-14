import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    FolderOpen,
    Users,
    Settings,
    LogOut,
    Wrench,
    Languages,
    Image,
    ClipboardList
} from "lucide-react";

type Section = "overview" | "profile" | "skills" | "languages" | "orders" | "projects" | "clients";

interface AdminSidebarProps {
    activeSection: Section;
    onSectionChange: (section: Section) => void;
}

const menuItems = [
    { id: "overview" as Section, label: "Visão Geral", icon: LayoutDashboard },
    { id: "profile" as Section, label: "Perfil do Site", icon: Image },
    { id: "skills" as Section, label: "Habilidades", icon: Wrench },
    { id: "languages" as Section, label: "Idiomas", icon: Languages },

    { id: "orders" as Section, label: "Pedidos", icon: ClipboardList },
    { id: "projects" as Section, label: "Projetos", icon: FolderOpen },
    { id: "clients" as Section, label: "Clientes", icon: Users },
];

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
    const navigate = useNavigate();
    const [adminName, setAdminName] = useState<string>("");

    useEffect(() => {
        const fetchAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", user.id)
                    .single();
                setAdminName(profile?.full_name || user.email || "Admin");
            }
        };
        fetchAdmin();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/auth");
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    VICCS Admin
                </h1>
                <p className="text-xs text-muted-foreground mt-1 truncate">{adminName}</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onSectionChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                ? "bg-accent/20 text-accent border border-accent/30"
                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Settings & Logout */}
            <div className="p-4 border-t border-white/10 space-y-1">
                <button
                    onClick={() => onSectionChange("overview")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
                >
                    <Settings className="w-5 h-5" />
                    Configurações
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Sair
                </button>
            </div>
        </aside>
    );
}

export type { Section };
