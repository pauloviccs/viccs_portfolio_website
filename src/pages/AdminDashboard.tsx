import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { AdminSidebar, type Section } from "../components/dashboard/AdminSidebar";
import { AdminHeader } from "../components/dashboard/AdminHeader";
import type { SiteSettings, Skill, Language, Tool, Order, Project, Profile } from "../types/supabase";
import {
    Plus, Trash2, Edit2, Save, X, Upload,
    Briefcase, Users, FolderOpen, Clock
} from "lucide-react";

// ========== SECTION TITLES ==========
const sectionTitles: Record<Section, { title: string; subtitle: string }> = {
    overview: { title: "Visão Geral", subtitle: "Métricas e resumo do site" },
    profile: { title: "Perfil do Site", subtitle: "Foto, bio e anos de experiência" },
    skills: { title: "Habilidades", subtitle: "Gerenciar skills exibidas no portfolio" },
    languages: { title: "Idiomas", subtitle: "Gerenciar idiomas e níveis" },
    tools: { title: "Ferramentas", subtitle: "Ferramentas dominadas (contador automático)" },
    orders: { title: "Pedidos", subtitle: "Gerenciar pedidos de clientes" },
    projects: { title: "Projetos", subtitle: "Portfólio de trabalhos" },
    clients: { title: "Clientes", subtitle: "Lista de clientes cadastrados" },
};

export function AdminDashboard() {
    const [activeSection, setActiveSection] = useState<Section>("overview");

    // Data states
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [tools, setTools] = useState<Tool[]>([]);
    const [orders, setOrders] = useState<(Order & { profiles: Profile | null })[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Profile[]>([]);

    // Counts for overview
    const [counts, setCounts] = useState({ projects: 0, tools: 0, orders: 0, clients: 0 });

    // Loading
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);

        // Site Settings
        const { data: settings } = await supabase.from("site_settings").select("*").single();
        setSiteSettings(settings);

        // Skills
        const { data: skillsData } = await supabase.from("skills").select("*").order("sort_order");
        setSkills(skillsData || []);

        // Languages
        const { data: langData } = await supabase.from("languages").select("*").order("sort_order");
        setLanguages(langData || []);

        // Tools
        const { data: toolsData } = await supabase.from("tools").select("*").order("name");
        setTools(toolsData || []);

        // Orders
        const { data: ordersData } = await supabase.from("orders").select("*, profiles(*)").order("created_at", { ascending: false });
        setOrders(ordersData as any || []);

        // Projects
        const { data: projectsData } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
        setProjects(projectsData || []);

        // Clients
        const { data: clientsData } = await supabase.from("profiles").select("*").eq("role", "client");
        setClients(clientsData || []);

        // Counts
        setCounts({
            projects: projectsData?.length || 0,
            tools: toolsData?.length || 0,
            orders: ordersData?.length || 0,
            clients: clientsData?.length || 0,
        });

        setLoading(false);
    };

    const currentSection = sectionTitles[activeSection];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

            <main className="ml-64">
                <AdminHeader title={currentSection.title} subtitle={currentSection.subtitle} />

                <div className="p-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                        </div>
                    ) : (
                        <>
                            {activeSection === "overview" && (
                                <OverviewSection counts={counts} settings={siteSettings} />
                            )}
                            {activeSection === "profile" && (
                                <ProfileSection settings={siteSettings} onUpdate={fetchAllData} />
                            )}
                            {activeSection === "skills" && (
                                <SkillsSection skills={skills} onUpdate={fetchAllData} />
                            )}
                            {activeSection === "languages" && (
                                <LanguagesSection languages={languages} onUpdate={fetchAllData} />
                            )}
                            {activeSection === "tools" && (
                                <ToolsSection tools={tools} onUpdate={fetchAllData} />
                            )}
                            {activeSection === "orders" && (
                                <OrdersSection orders={orders} onUpdate={fetchAllData} />
                            )}
                            {activeSection === "projects" && (
                                <ProjectsSection projects={projects} onUpdate={fetchAllData} />
                            )}
                            {activeSection === "clients" && (
                                <ClientsSection clients={clients} />
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

// ========== OVERVIEW SECTION ==========
function OverviewSection({ counts, settings }: { counts: any; settings: SiteSettings | null }) {
    const stats = [
        { label: "Anos de Experiência", value: `${settings?.years_experience || 0}+`, icon: Clock, color: "text-primary" },
        { label: "Projetos Completos", value: `${counts.projects}+`, icon: FolderOpen, color: "text-secondary" },
        { label: "Ferramentas", value: `${counts.tools}+`, icon: Briefcase, color: "text-accent" },
        { label: "Clientes", value: counts.clients, icon: Users, color: "text-green-400" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div key={stat.label} className="glass rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ========== PROFILE SECTION ==========
function ProfileSection({ settings, onUpdate }: { settings: SiteSettings | null; onUpdate: () => void }) {
    const [bio, setBio] = useState(settings?.bio_text || "");
    const [years, setYears] = useState(settings?.years_experience || 15);
    const [imageUrl, setImageUrl] = useState(settings?.profile_image_url || "");
    // Social media
    const [instagramUrl, setInstagramUrl] = useState(settings?.instagram_url || "");
    const [linkedinUrl, setLinkedinUrl] = useState(settings?.linkedin_url || "");
    const [githubUrl, setGithubUrl] = useState(settings?.github_url || "");
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate minimum size 556x556
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => { img.onload = resolve; });
        if (img.width < 556 || img.height < 556) {
            alert("A imagem deve ter no mínimo 556x556 pixels.");
            return;
        }

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `profile-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("profile-images")
            .upload(fileName, file, { upsert: true });

        if (!uploadError) {
            const { data } = supabase.storage.from("profile-images").getPublicUrl(fileName);
            setImageUrl(data.publicUrl);
        } else {
            alert("Erro no upload: " + uploadError.message);
        }
        setUploading(false);
    };

    const handleSave = async () => {
        if (!settings?.id) return;
        setSaving(true);
        await supabase.from("site_settings").update({
            bio_text: bio,
            years_experience: years,
            profile_image_url: imageUrl,
            instagram_url: instagramUrl || null,
            linkedin_url: linkedinUrl || null,
            github_url: githubUrl || null,
            updated_at: new Date().toISOString(),
        }).eq("id", settings.id);
        setSaving(false);
        onUpdate();
    };

    return (
        <div className="max-w-4xl space-y-8">
            {/* Image Upload */}
            <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Foto de Perfil</h3>
                <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden bg-muted">
                        {imageUrl && <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                        <label className="cursor-pointer">
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors">
                                <Upload className="w-4 h-4" />
                                {uploading ? "Enviando..." : "Upload Nova Foto"}
                            </div>
                        </label>
                        <p className="text-xs text-muted-foreground mt-2">Recomendado: 544x544px</p>
                    </div>
                </div>
            </div>

            {/* Bio */}
            <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Biografia</h3>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm resize-none focus:border-accent focus:outline-none"
                    placeholder="Escreva sua bio..."
                />
            </div>

            {/* Years */}
            <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Anos de Experiência</h3>
                <input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(parseInt(e.target.value) || 0)}
                    className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center focus:border-accent focus:outline-none"
                />
            </div>

            {/* Social Media Links */}
            <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Redes Sociais</h3>
                <p className="text-sm text-muted-foreground mb-4">Links exibidos na seção de contato</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Instagram</label>
                        <input
                            type="url"
                            value={instagramUrl}
                            onChange={(e) => setInstagramUrl(e.target.value)}
                            placeholder="https://instagram.com/seu_usuario"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">LinkedIn</label>
                        <input
                            type="url"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            placeholder="https://linkedin.com/in/seu_usuario"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">GitHub</label>
                        <input
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/seu_usuario"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-accent focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 rounded-full bg-accent text-primary font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
            >
                <Save className="w-4 h-4" />
                {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
        </div>
    );
}

// ========== SKILLS SECTION ==========
function SkillsSection({ skills, onUpdate }: { skills: Skill[]; onUpdate: () => void }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newSkill, setNewSkill] = useState({ name: "", level: 80, category: "design" });
    const [editData, setEditData] = useState({ name: "", level: 80, category: "design" });

    const categoryColors: Record<string, string> = {
        design: "bg-primary",
        motion: "bg-secondary",
        "3d": "bg-accent",
        dev: "bg-gradient-to-r from-primary to-accent",
    };

    const handleAdd = async () => {
        if (!newSkill.name.trim()) return;
        await supabase.from("skills").insert({
            name: newSkill.name,
            level: newSkill.level,
            category: newSkill.category,
            sort_order: skills.length,
        });
        setNewSkill({ name: "", level: 80, category: "design" });
        onUpdate();
    };

    const handleDelete = async (id: string) => {
        await supabase.from("skills").delete().eq("id", id);
        onUpdate();
    };

    const handleEdit = (skill: Skill) => {
        setEditingId(skill.id);
        setEditData({ name: skill.name, level: skill.level || 80, category: skill.category || "design" });
    };

    const handleSaveEdit = async (id: string) => {
        await supabase.from("skills").update(editData).eq("id", id);
        setEditingId(null);
        onUpdate();
    };

    return (
        <div className="space-y-6">
            {/* Add New */}
            <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Adicionar Habilidade</h3>
                <div className="flex flex-wrap gap-4">
                    <input
                        type="text"
                        placeholder="Nome da skill"
                        value={newSkill.name}
                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                        className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-accent focus:outline-none"
                    />
                    <input
                        type="number"
                        placeholder="Nível %"
                        value={newSkill.level}
                        onChange={(e) => setNewSkill({ ...newSkill, level: parseInt(e.target.value) || 0 })}
                        className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center focus:border-accent focus:outline-none"
                        min={0}
                        max={100}
                    />
                    <select
                        value={newSkill.category}
                        onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-accent focus:outline-none"
                    >
                        <option value="design">Design</option>
                        <option value="motion">Motion</option>
                        <option value="3d">3D</option>
                        <option value="dev">Dev</option>
                    </select>
                    <button onClick={handleAdd} className="px-4 py-2 bg-accent text-primary rounded-xl font-bold hover:brightness-110 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Adicionar
                    </button>
                </div>
            </div>

            {/* Skills List */}
            <div className="grid gap-4">
                {skills.map((skill) => (
                    <div key={skill.id} className="glass rounded-xl p-4">
                        {editingId === skill.id ? (
                            <div className="flex flex-wrap gap-4 items-center">
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="flex-1 min-w-[150px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-accent focus:outline-none"
                                />
                                <input
                                    type="number"
                                    value={editData.level}
                                    onChange={(e) => setEditData({ ...editData, level: parseInt(e.target.value) || 0 })}
                                    className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center focus:border-accent focus:outline-none"
                                    min={0}
                                    max={100}
                                />
                                <select
                                    value={editData.category}
                                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-accent focus:outline-none"
                                >
                                    <option value="design">Design</option>
                                    <option value="motion">Motion</option>
                                    <option value="3d">3D</option>
                                    <option value="dev">Dev</option>
                                </select>
                                <button onClick={() => handleSaveEdit(skill.id)} className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg">
                                    <Save className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingId(null)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium">{skill.name}</span>
                                        <span className="text-sm text-muted-foreground">{skill.level}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${categoryColors[skill.category || "design"]}`}
                                            style={{ width: `${skill.level}%` }}
                                        />
                                    </div>
                                </div>
                                <button onClick={() => handleEdit(skill)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(skill.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ========== LANGUAGES SECTION ==========
function LanguagesSection({ languages, onUpdate }: { languages: Language[]; onUpdate: () => void }) {
    const [newLang, setNewLang] = useState({ name: "", level: 50, flag: "🌐" });

    const handleAdd = async () => {
        if (!newLang.name.trim()) return;
        await supabase.from("languages").insert({
            name: newLang.name,
            level: newLang.level,
            flag: newLang.flag,
            sort_order: languages.length,
        });
        setNewLang({ name: "", level: 50, flag: "🌐" });
        onUpdate();
    };

    const handleDelete = async (id: string) => {
        await supabase.from("languages").delete().eq("id", id);
        onUpdate();
    };

    return (
        <div className="space-y-6">
            {/* Add */}
            <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Adicionar Idioma</h3>
                <div className="flex flex-wrap gap-4">
                    <input
                        type="text"
                        placeholder="Nome do idioma"
                        value={newLang.name}
                        onChange={(e) => setNewLang({ ...newLang, name: e.target.value })}
                        className="flex-1 min-w-[150px] bg-white/5 border border-white/10 rounded-xl px-4 py-2"
                    />
                    <input
                        type="number"
                        placeholder="Nível %"
                        value={newLang.level}
                        onChange={(e) => setNewLang({ ...newLang, level: parseInt(e.target.value) || 0 })}
                        className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center"
                        min={0}
                        max={100}
                    />
                    <input
                        type="text"
                        placeholder="Flag emoji"
                        value={newLang.flag}
                        onChange={(e) => setNewLang({ ...newLang, flag: e.target.value })}
                        className="w-20 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center"
                    />
                    <button onClick={handleAdd} className="px-4 py-2 bg-accent text-primary rounded-xl font-bold flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Adicionar
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="grid md:grid-cols-2 gap-4">
                {languages.map((lang) => (
                    <div key={lang.id} className="glass rounded-xl p-4 flex items-center gap-4">
                        <span className="text-3xl">{lang.flag}</span>
                        <div className="flex-1">
                            <div className="font-medium">{lang.name}</div>
                            <div className="flex gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full ${i < Math.floor((lang.level || 0) / 20) ? "bg-gradient-to-r from-primary to-secondary" : "bg-muted"}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <button onClick={() => handleDelete(lang.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ========== TOOLS SECTION ==========
function ToolsSection({ tools, onUpdate }: { tools: Tool[]; onUpdate: () => void }) {
    const [newTool, setNewTool] = useState("");

    const handleAdd = async () => {
        if (!newTool.trim()) return;
        await supabase.from("tools").insert({ name: newTool });
        setNewTool("");
        onUpdate();
    };

    const handleDelete = async (id: string) => {
        await supabase.from("tools").delete().eq("id", id);
        onUpdate();
    };

    return (
        <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Adicionar Ferramenta</h3>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Nome da ferramenta"
                        value={newTool}
                        onChange={(e) => setNewTool(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2"
                    />
                    <button onClick={handleAdd} className="px-4 py-2 bg-accent text-primary rounded-xl font-bold flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Adicionar
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                {tools.map((tool) => (
                    <div key={tool.id} className="glass rounded-full px-4 py-2 flex items-center gap-2 group">
                        <span className="text-sm">{tool.name}</span>
                        <button onClick={() => handleDelete(tool.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>

            <p className="text-sm text-muted-foreground">
                Total: <strong>{tools.length}</strong> ferramentas (exibido automaticamente no portfolio)
            </p>
        </div>
    );
}

// ========== ORDERS SECTION ==========
function OrdersSection({ orders, onUpdate }: { orders: (Order & { profiles: Profile | null })[]; onUpdate: () => void }) {
    const updateStatus = async (id: string, status: "pending" | "approved" | "in_progress" | "completed" | "cancelled") => {
        await supabase.from("orders").update({ status }).eq("id", id);
        onUpdate();
    };

    const statusColors: Record<string, string> = {
        pending: "bg-yellow-500/20 text-yellow-500",
        approved: "bg-blue-500/20 text-blue-500",
        in_progress: "bg-purple-500/20 text-purple-500",
        completed: "bg-green-500/20 text-green-500",
        cancelled: "bg-red-500/20 text-red-500",
    };

    return (
        <div className="space-y-4">
            {orders.length === 0 ? (
                <p className="text-muted-foreground">Nenhum pedido ainda.</p>
            ) : (
                orders.map((order) => (
                    <div key={order.id} className="glass rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{order.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Cliente: {order.profiles?.full_name || "Desconhecido"}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColors[order.status || "pending"]}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-sm mb-4">{order.description}</p>
                        <div className="flex gap-2">
                            <button onClick={() => updateStatus(order.id, "in_progress")} className="text-xs px-3 py-1 bg-white/5 rounded border border-white/10 hover:bg-white/10">
                                Em Andamento
                            </button>
                            <button onClick={() => updateStatus(order.id, "completed")} className="text-xs px-3 py-1 bg-green-500/10 text-green-500 rounded border border-green-500/20 hover:bg-green-500/20">
                                Concluído
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

// ========== PROJECTS SECTION (PORTFOLIO) ==========
function ProjectsSection({ projects, onUpdate }: { projects: Project[]; onUpdate: () => void }) {
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Design");
    const [clientName, setClientName] = useState("");
    const [tags, setTags] = useState("");
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCategory("Design");
        setClientName("");
        setTags("");
        setMediaFiles([]);
        setMediaPreviews([]);
        setIsCreating(false);
    };

    const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setMediaFiles([...mediaFiles, ...files]);

        // Generate previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setMediaPreviews([...mediaPreviews, ...newPreviews]);
    };

    const removeMedia = (index: number) => {
        const newFiles = [...mediaFiles];
        const newPreviews = [...mediaPreviews];
        URL.revokeObjectURL(newPreviews[index]);
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setMediaFiles(newFiles);
        setMediaPreviews(newPreviews);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        setUploading(true);

        // Upload media files
        const uploadedUrls: string[] = [];
        for (const file of mediaFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("project-media")
                .upload(fileName, file);

            if (!uploadError) {
                const { data } = supabase.storage.from("project-media").getPublicUrl(fileName);
                uploadedUrls.push(data.publicUrl);
            }
        }

        // Insert project
        await supabase.from("projects").insert({
            title,
            description,
            category,
            client_name: clientName || null,
            tags: tags ? tags.split(",").map(t => t.trim()) : [],
            image_urls: uploadedUrls,
            completion_date: new Date().toISOString().split('T')[0],
        });

        resetForm();
        setUploading(false);
        onUpdate();
    };

    const handleDelete = async (id: string, imageUrls: string[]) => {
        // Delete media files from storage
        for (const url of imageUrls) {
            const fileName = url.split('/').pop();
            if (fileName) {
                await supabase.storage.from("project-media").remove([fileName]);
            }
        }

        await supabase.from("projects").delete().eq("id", id);
        onUpdate();
    };

    return (
        <div className="space-y-8">
            {/* Header with Counter */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold">Portfólio de Trabalhos</h3>
                    <p className="text-muted-foreground">Projetos exibidos na landing page e contabilizados na seção "Sobre"</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="glass rounded-2xl px-6 py-3 text-center">
                        <div className="text-3xl font-bold text-gradient">{projects.length}</div>
                        <div className="text-xs text-muted-foreground">Projetos</div>
                    </div>
                    {!isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="px-6 py-3 bg-accent text-primary rounded-full font-bold flex items-center gap-2 hover:bg-accent/80 transition-colors"
                        >
                            <Plus size={18} />
                            Novo Projeto
                        </button>
                    )}
                </div>
            </div>

            {/* Create/Edit Form */}
            {isCreating && (
                <form onSubmit={handleCreate} className="glass rounded-2xl p-8 space-y-6 border border-white/10">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xl font-bold">Cadastrar Projeto do Portfólio</h4>
                        <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Título do Projeto *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Rebranding Konica Minolta"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
                                required
                            />
                        </div>

                        {/* Client Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Nome do Cliente</label>
                            <input
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Ex: Konica Minolta Brasil"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Categoria</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
                            >
                                <option value="Design">Design Gráfico</option>
                                <option value="Motion">Motion Graphics</option>
                                <option value="3D">Arte 3D</option>
                                <option value="Branding">Branding</option>
                                <option value="UI/UX">UI/UX Design</option>
                            </select>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Tags (separadas por vírgula)</label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="Ex: logo, identidade, minimalista"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Description / Concept */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Conceito / Descrição do Projeto</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva o conceito por trás do projeto, os desafios, a solução criativa e os resultados..."
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 resize-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
                        />
                    </div>

                    {/* Media Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Mídias do Projeto (Imagens/Vídeos)</label>
                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-accent/30 transition-colors">
                            <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                onChange={handleMediaSelect}
                                className="hidden"
                                id="media-upload"
                            />
                            <label htmlFor="media-upload" className="cursor-pointer">
                                <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Clique para adicionar ou arraste mídias aqui</p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, MP4, WebM (máx. 50MB cada)</p>
                            </label>
                        </div>

                        {/* Media Previews */}
                        {mediaPreviews.length > 0 && (
                            <div className="grid grid-cols-4 gap-4 mt-4">
                                {mediaPreviews.map((preview, index) => (
                                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-white/5">
                                        <img src={preview} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeMedia(index)}
                                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={uploading || !title}
                            className="px-8 py-3 bg-accent text-primary rounded-full font-bold disabled:opacity-50 flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Salvar Projeto
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-full font-medium hover:bg-white/10 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* Projects Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div key={project.id} className="glass rounded-2xl overflow-hidden group hover:border-accent/30 border border-transparent transition-all">
                        {/* Project Thumbnail */}
                        <div className="aspect-square bg-gradient-to-br from-white/5 to-white/0 relative">
                            {project.image_urls?.[0] ? (
                                <img
                                    src={project.image_urls[0]}
                                    alt={project.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <FolderOpen size={48} />
                                </div>
                            )}

                            {/* Media count badge */}
                            {(project.image_urls?.length || 0) > 1 && (
                                <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs">
                                    +{(project.image_urls?.length || 0) - 1} mídias
                                </div>
                            )}

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDelete(project.id, project.image_urls || [])}
                                        className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs flex items-center gap-1 hover:bg-red-500/30 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                        Remover
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Project Info */}
                        <div className="p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium">
                                    {project.category}
                                </span>
                                {project.client_name && (
                                    <span className="text-xs text-muted-foreground">
                                        • {project.client_name}
                                    </span>
                                )}
                            </div>
                            <h4 className="font-bold text-lg">{project.title}</h4>
                            {project.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {project.description}
                                </p>
                            )}
                            {project.tags && project.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-2">
                                    {project.tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-white/5 rounded-full text-xs text-muted-foreground">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {projects.length === 0 && !isCreating && (
                    <div className="col-span-full text-center py-16">
                        <FolderOpen size={48} className="mx-auto mb-4 text-muted-foreground" />
                        <h4 className="text-lg font-medium mb-2">Nenhum projeto cadastrado</h4>
                        <p className="text-muted-foreground mb-4">Adicione projetos do seu portfólio para exibir na landing page.</p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="px-6 py-3 bg-accent text-primary rounded-full font-bold inline-flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Criar Primeiro Projeto
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ========== CLIENTS SECTION ==========
function ClientsSection({ clients }: { clients: Profile[] }) {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.length === 0 ? (
                <p className="text-muted-foreground col-span-full">Nenhum cliente cadastrado.</p>
            ) : (
                clients.map((client) => (
                    <div key={client.id} className="glass rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold">
                            {client.full_name?.charAt(0) || "?"}
                        </div>
                        <div>
                            <div className="font-medium">{client.full_name || "Sem nome"}</div>
                            <div className="text-xs text-muted-foreground">
                                {new Date(client.created_at || "").toLocaleDateString("pt-BR")}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
