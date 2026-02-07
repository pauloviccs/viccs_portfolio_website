import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, User, Tag, Maximize2 } from 'lucide-react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from './ui/carousel';
import type { CarouselApi } from './ui/carousel';

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

interface ProjectModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ProjectModal = ({ project, isOpen, onClose }: ProjectModalProps) => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);
    const [fullscreenMedia, setFullscreenMedia] = useState<string | null>(null);

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());

        api.on('select', () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    // Reset carousel when modal opens
    useEffect(() => {
        if (isOpen && api) {
            api.scrollTo(0);
            setCurrent(0);
        }
    }, [isOpen, api]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const isVideo = (url: string) => {
        return url.match(/\.(mp4|webm|mov)$/i);
    };

    const mediaItems = project?.image_urls || [];

    return (
        <>
            <AnimatePresence>
                {isOpen && project && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={onClose}
                            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{
                                type: 'spring',
                                damping: 25,
                                stiffness: 300,
                                duration: 0.4
                            }}
                            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex items-center justify-center"
                        >
                            <div className="w-full h-full max-w-6xl max-h-[90vh] glass rounded-3xl overflow-hidden flex flex-col lg:flex-row">

                                {/* Media Section */}
                                <div className="relative w-full lg:w-3/5 h-[40vh] lg:h-full bg-black/20 flex-shrink-0">
                                    {mediaItems.length > 0 ? (
                                        <>
                                            <Carousel setApi={setApi} className="h-full">
                                                <CarouselContent className="h-full -ml-0">
                                                    {mediaItems.map((url, index) => (
                                                        <CarouselItem key={index} className="h-full pl-0">
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                {isVideo(url) ? (
                                                                    <video
                                                                        src={url}
                                                                        controls
                                                                        className="max-w-full max-h-full object-contain"
                                                                    />
                                                                ) : (
                                                                    <img
                                                                        src={url}
                                                                        alt={`${project.title} - ${index + 1}`}
                                                                        className="max-w-full max-h-full object-contain"
                                                                    />
                                                                )}
                                                            </div>
                                                        </CarouselItem>
                                                    ))}
                                                </CarouselContent>
                                            </Carousel>

                                            {/* Navigation Arrows */}
                                            {mediaItems.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={() => api?.scrollPrev()}
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass hover:bg-white/20 transition-colors"
                                                        aria-label="Anterior"
                                                    >
                                                        <ChevronLeft size={24} />
                                                    </button>
                                                    <button
                                                        onClick={() => api?.scrollNext()}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass hover:bg-white/20 transition-colors"
                                                        aria-label="Próximo"
                                                    >
                                                        <ChevronRight size={24} />
                                                    </button>
                                                </>
                                            )}

                                            {/* Slide Indicators */}
                                            {mediaItems.length > 1 && (
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                    {mediaItems.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => api?.scrollTo(index)}
                                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${current === index
                                                                ? 'bg-white w-6'
                                                                : 'bg-white/40 hover:bg-white/60'
                                                                }`}
                                                            aria-label={`Ir para slide ${index + 1}`}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* Slide Counter */}
                                            <div className="absolute top-4 left-4 px-3 py-1 rounded-full glass text-sm">
                                                {current + 1} / {count}
                                            </div>

                                            {/* Fullscreen Button */}
                                            {mediaItems.length > 0 && (
                                                <button
                                                    onClick={() => setFullscreenMedia(mediaItems[current])}
                                                    className="absolute top-4 right-4 p-3 rounded-full glass hover:bg-white/20 transition-colors"
                                                    aria-label="Ver em tela cheia"
                                                >
                                                    <Maximize2 size={20} />
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/0">
                                            <div className="text-center text-muted-foreground">
                                                <div className="text-6xl mb-4">📁</div>
                                                <p>Sem mídia disponível</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                                    {/* Close Button */}
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 p-2 rounded-full glass hover:bg-white/20 transition-colors z-10"
                                        aria-label="Fechar"
                                    >
                                        <X size={20} />
                                    </button>

                                    {/* Category Badge */}
                                    {project.category && (
                                        <motion.span
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="inline-block px-3 py-1 text-xs font-medium tracking-wider text-primary bg-primary/10 rounded-full mb-4"
                                        >
                                            {project.category.toUpperCase()}
                                        </motion.span>
                                    )}

                                    {/* Title */}
                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4"
                                    >
                                        {project.title}
                                    </motion.h2>

                                    {/* Meta Info */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground"
                                    >
                                        {project.client_name && (
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-secondary" />
                                                <span>{project.client_name}</span>
                                            </div>
                                        )}
                                        {project.completion_date && (
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-accent" />
                                                <span>
                                                    {new Date(project.completion_date).toLocaleDateString('pt-BR', {
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Tags */}
                                    {project.tags && project.tags.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.25 }}
                                            className="flex flex-wrap gap-2 mb-6"
                                        >
                                            {project.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-white/10 text-white/80"
                                                >
                                                    <Tag size={12} />
                                                    {tag}
                                                </span>
                                            ))}
                                        </motion.div>
                                    )}

                                    {/* Divider */}
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 0.3, duration: 0.4 }}
                                        className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"
                                    />

                                    {/* Description */}
                                    {project.description && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.35 }}
                                        >
                                            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                                                Sobre o Projeto
                                            </h3>
                                            <p className="text-base leading-relaxed text-white/80 whitespace-pre-wrap">
                                                {project.description}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Fullscreen Lightbox */}
            <AnimatePresence>
                {fullscreenMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-lg flex items-center justify-center"
                        onClick={() => setFullscreenMedia(null)}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setFullscreenMedia(null)}
                            className="absolute top-6 right-6 p-3 rounded-full glass hover:bg-white/20 transition-colors z-10"
                            aria-label="Fechar tela cheia"
                        >
                            <X size={24} />
                        </button>

                        {/* Media */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="max-w-[95vw] max-h-[95vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isVideo(fullscreenMedia) ? (
                                <video
                                    src={fullscreenMedia}
                                    controls
                                    autoPlay
                                    className="max-w-full max-h-[95vh] rounded-lg shadow-2xl"
                                />
                            ) : (
                                <img
                                    src={fullscreenMedia}
                                    alt="Fullscreen view"
                                    className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
                                />
                            )}
                        </motion.div>

                        {/* Navigation hint */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/50">
                            Clique fora ou pressione X para fechar
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
