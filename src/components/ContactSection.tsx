import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Linkedin, Instagram, Github } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface SocialLink {
  icon: typeof Instagram;
  label: string;
  href: string;
}

export const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
    { icon: Github, label: 'GitHub', href: '#' },
  ]);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('instagram_url, linkedin_url, github_url')
        .single();

      if (data) {
        const links: SocialLink[] = [];
        if (data.instagram_url) {
          links.push({ icon: Instagram, label: 'Instagram', href: data.instagram_url });
        }
        if (data.linkedin_url) {
          links.push({ icon: Linkedin, label: 'LinkedIn', href: data.linkedin_url });
        }
        if (data.github_url) {
          links.push({ icon: Github, label: 'GitHub', href: data.github_url });
        }
        if (links.length > 0) {
          setSocialLinks(links);
        }
      }
    };
    fetchSocialLinks();

    // Realtime subscription for automatic updates
    const channel = supabase
      .channel('contact-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
        fetchSocialLinks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section id="contato" className="py-20 relative overflow-hidden">
      {/* Background Orbs Removed */}

      <div className="container mx-auto px-6 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium tracking-[0.3em] text-primary mb-4 block">CONTATO</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Vamos Conversar</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tem um projeto em mente? Vamos trabalhar juntos para criar algo incrível.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <motion.a
                href="mailto:pauloviccsdesign@gmail.com"
                whileHover={{ scale: 1.02, x: 10 }}
                className="glass rounded-2xl p-6 flex items-center gap-4 group cursor-pointer block"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 transition-colors">
                  <Mail className="text-primary" size={24} />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Email</h4>
                  <p className="text-muted-foreground text-sm">pauloviccsdesign@gmail.com</p>
                </div>
              </motion.a>

              <motion.a
                href="tel:+5575998432564"
                whileHover={{ scale: 1.02, x: 10 }}
                className="glass rounded-2xl p-6 flex items-center gap-4 group cursor-pointer block"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center group-hover:from-secondary/30 transition-colors">
                  <Phone className="text-secondary" size={24} />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Telefone</h4>
                  <p className="text-muted-foreground text-sm">(75) 99843-2564</p>
                </div>
              </motion.a>

              <motion.div
                whileHover={{ scale: 1.02, x: 10 }}
                className="glass rounded-2xl p-6 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                  <MapPin className="text-accent" size={24} />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Localização</h4>
                  <p className="text-muted-foreground text-sm">Bahia, Brasil</p>
                </div>
              </motion.div>

              {/* Social Links */}
              <div className="flex gap-4 pt-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="glass w-12 h-12 rounded-xl flex items-center justify-center hover:border-primary/50 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon size={20} />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.form
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass rounded-3xl p-8 space-y-6"
            >
              <div>
                <label className="text-sm font-medium mb-2 block">Nome</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Mensagem</label>
                <textarea
                  rows={4}
                  placeholder="Conte sobre seu projeto..."
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium py-4 rounded-xl flex items-center justify-center gap-2"
              >
                Enviar Mensagem <Send size={18} />
              </motion.button>
            </motion.form>
          </div>
        </div>
      </div>
    </section>
  );
};
