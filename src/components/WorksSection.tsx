import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { ExternalLink, FolderOpen } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { ProjectModal } from './ProjectModal';

interface Project {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  image_urls?: string[] | null;
  client_name?: string | null;
  tags?: string[] | null;
  completion_date?: string | null;
}

export const WorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      setProjects((data as Project[]) || []);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  return (
    <section id="trabalhos" className="py-20 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-6 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium tracking-[0.3em] text-primary mb-4 block">PORTFÓLIO</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Trabalhos</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conheça um pouco do meu trabalho e projetos realizados ao longo da carreira.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum projeto cadastrado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative"
              >
                <motion.div
                  animate={{
                    scale: hoveredIndex === index ? 1.02 : 1,
                    rotateY: hoveredIndex === index ? 5 : 0,
                    rotateX: hoveredIndex === index ? -5 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="glass rounded-3xl overflow-hidden"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="aspect-square relative overflow-hidden">
                    {project.image_urls?.[0] ? (
                      <img
                        src={project.image_urls[0]}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/0 flex items-center justify-center">
                        <FolderOpen size={48} className="text-muted-foreground" />
                      </div>
                    )}

                    {/* Overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                      className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex flex-col justify-end p-6"
                    >
                      <span className="text-xs font-medium tracking-widest text-primary mb-2">
                        {project.category || 'Projeto'}
                      </span>
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      {project.client_name && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Cliente: {project.client_name}
                        </p>
                      )}
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-white/10 rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenProject(project)}
                        className="inline-flex items-center gap-2 text-sm font-medium glass px-4 py-2 rounded-xl w-fit cursor-pointer"
                      >
                        Ver Projeto <ExternalLink size={14} />
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};
