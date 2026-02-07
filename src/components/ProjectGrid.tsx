import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type { Database } from "../types/supabase";
import { motion } from "framer-motion";
import { useUIStore } from "../store/uiStore";
import { pt } from "../i18n/pt";
import { en } from "../i18n/en";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export function ProjectGrid() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 6;

    const { language } = useUIStore();
    const t = language === 'pt' ? pt : en;

    const fetchProjects = async (pageIndex: number) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .order("created_at", { ascending: false })
                .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1);

            if (error) throw error;

            if (data) {
                if (data.length < PAGE_SIZE) {
                    setHasMore(false);
                }
                setProjects((prev) => (pageIndex === 0 ? data : [...prev, ...data]));
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects(0);
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProjects(nextPage);
    }

    return (
        <section id="projects" className="min-h-screen px-6 py-24 relative z-10">
            <div className="max-w-7xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-5xl font-display font-bold mb-16 text-center"
                >
                    Selected <span className="text-gradient">Work</span>
                </motion.h2>

                {projects.length === 0 && !loading ? (
                    <div className="text-center py-20">
                        <p className="text-secondary/40 text-lg uppercase tracking-widest font-medium">{t.projects.empty}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, index) => (
                            <ProjectCard key={project.id} project={project} index={index} />
                        ))}
                    </div>
                )}

                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!loading && hasMore && (
                    <div className="text-center mt-16">
                        <button
                            onClick={loadMore}
                            className="px-8 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/50 transition backdrop-blur-md"
                        >
                            Load More Works
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer"
        >
            {/* Image Placeholder or Actual Image */}
            <div className="absolute inset-0 bg-neutral-900">
                {(project.thumbnail_url || (project.image_urls && project.image_urls[0])) ? (
                    <img src={project.thumbnail_url || project.image_urls![0]} alt={project.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 font-display text-4xl font-bold bg-gradient-to-br from-white/5 to-transparent">
                        VICCS
                    </div>
                )}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition duration-300">
                <div className="text-accent text-sm font-medium mb-1 uppercase tracking-wider">{project.category || "Design"}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                <div className="h-0 group-hover:h-auto overflow-hidden transition-all">
                    <p className="text-secondary/80 text-sm line-clamp-2">{project.description}</p>
                </div>
            </div>

            {/* Border Glow */}
            <div className="absolute inset-0 border border-white/10 rounded-2xl group-hover:border-accent/40 transition pointer-events-none" />
        </motion.div>
    )
}
