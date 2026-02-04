import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const skills = [
  { name: 'Adobe Photoshop', level: 95, category: 'design' },
  { name: 'Adobe After Effects', level: 90, category: 'motion' },
  { name: 'Adobe Illustrator', level: 92, category: 'design' },
  { name: 'Adobe Premiere', level: 88, category: 'motion' },
  { name: 'Adobe InDesign', level: 85, category: 'design' },
  { name: 'Adobe Lightroom', level: 80, category: 'design' },
  { name: 'Cinema 4D', level: 85, category: '3d' },
  { name: 'Blender', level: 82, category: '3d' },
  { name: '3DS Max', level: 75, category: '3d' },
  { name: 'Figma', level: 88, category: 'design' },
  { name: 'Adobe XD', level: 80, category: 'design' },
  { name: 'Cursor', level: 70, category: 'dev' },
];

const languages = [
  { name: 'Português', level: 100, flag: '🇧🇷' },
  { name: 'Inglês', level: 75, flag: '🇺🇸' },
];

const categoryColors: Record<string, string> = {
  design: 'from-primary to-primary',
  motion: 'from-secondary to-secondary',
  '3d': 'from-accent to-accent',
  dev: 'from-primary via-secondary to-accent',
};

export const SkillsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="skills" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium tracking-[0.3em] text-primary mb-4 block">O QUE OFEREÇO</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Habilidades & Idiomas</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Uma coleção diversificada de ferramentas e tecnologias que domino para criar experiências visuais incríveis.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Skills Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="glass rounded-2xl p-5 group hover:border-primary/30 transition-colors"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-sm text-muted-foreground">{skill.level}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${skill.level}%` } : {}}
                    transition={{ duration: 1, delay: 0.5 + index * 0.05, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${categoryColors[skill.category]}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Languages */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h3 className="text-2xl font-bold mb-6 text-center">Idiomas</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {languages.map((lang) => (
                <motion.div
                  key={lang.name}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="glass rounded-2xl p-6 min-w-[200px] text-center"
                >
                  <span className="text-4xl mb-3 block">{lang.flag}</span>
                  <h4 className="font-medium mb-2">{lang.name}</h4>
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${i < Math.floor(lang.level / 20)
                          ? 'bg-gradient-to-r from-primary to-secondary'
                          : 'bg-muted'
                          }`}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
