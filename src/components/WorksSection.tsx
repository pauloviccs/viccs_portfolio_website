import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';

const works = [
  {
    title: 'VTT - Vector Two Technology',
    image: 'https://static.wixstatic.com/media/3c6fc6_644b6a832756449fa98a2c665cbb4481~mv2.png/v1/fill/w_400,h_400,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/imagem_2022-01-30_142330.png',
    category: 'Branding',
    link: '#'
  },
  {
    title: 'Konica Minolta',
    image: 'https://static.wixstatic.com/media/3c6fc6_7d91a8bcbbd94451a8a56bf7f160ab06~mv2.jpg/v1/fill/w_400,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Konica.jpg',
    category: 'Design Corporativo',
    link: '#'
  },
  {
    title: "Bob's",
    image: 'https://static.wixstatic.com/media/3c6fc6_48cf35ff16fa49e2b64834c4bf073eb6~mv2.png/v1/fill/w_400,h_400,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/bobs.png',
    category: 'Marketing',
    link: '#'
  },
  {
    title: 'Giraffas',
    image: 'https://static.wixstatic.com/media/3c6fc6_e6b22cabbc124d6d88249cfdb78b623c~mv2.png/v1/fill/w_400,h_400,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Giraffas.png',
    category: 'Identidade Visual',
    link: '#'
  },
  {
    title: 'Modelagem 3D',
    image: 'https://static.wixstatic.com/media/3c6fc6_a41a995ca1454d1b9a8c02aa6d2a37f9~mv2.jpg/v1/fill/w_400,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/3.jpg',
    category: '3D Art',
    link: '#'
  },
  {
    title: 'Arquitetura 3D',
    image: 'https://static.wixstatic.com/media/3c6fc6_cc8025a71d5e4f7cbdc3391d79e4ce61~mv2.jpg/v1/fill/w_400,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/old-house.jpg',
    category: '3D Visualization',
    link: '#'
  },
  {
    title: "L'Occitane",
    image: 'https://static.wixstatic.com/media/3c6fc6_1d5c3790a80d4a32a0dcba14b644e117~mv2.png/v1/fill/w_400,h_400,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Loccitane.png',
    category: 'Design de Produto',
    link: '#'
  },
  {
    title: 'Almaany Seguros',
    image: 'https://static.wixstatic.com/media/3c6fc6_6bfab41a9403428fbddce3feb88ecf6c~mv2.jpg/v1/fill/w_400,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Almaany2.jpg',
    category: 'Branding',
    link: '#'
  },
  {
    title: '1Up Party',
    image: 'https://static.wixstatic.com/media/3c6fc6_53d45accc4ac4dd1bcbf3379005058fb~mv2.png/v1/fill/w_400,h_400,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1Up%20-%20Whats%20Icon.png',
    category: 'Social Media',
    link: '#'
  },
];

export const WorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((work, index) => (
            <motion.div
              key={work.title}
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
                  <img
                    src={work.image}
                    alt={work.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                    className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex flex-col justify-end p-6"
                  >
                    <span className="text-xs font-medium tracking-widest text-primary mb-2">{work.category}</span>
                    <h3 className="text-xl font-bold mb-3">{work.title}</h3>
                    <motion.a
                      href={work.link}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 text-sm font-medium glass px-4 py-2 rounded-xl w-fit"
                    >
                      Ver Projeto <ExternalLink size={14} />
                    </motion.a>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
