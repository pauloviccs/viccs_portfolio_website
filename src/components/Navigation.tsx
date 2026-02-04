import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Home', href: '/#home' },
  { label: 'Sobre', href: '/#sobre' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Trabalhos', href: '/#trabalhos' },
  { label: 'Contato', href: '/#contato' },
];

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'glass-strong py-3' : 'py-6'
          }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <motion.a
            href="/"
            className="text-2xl font-bold text-gradient"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            VICCS
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </motion.a>
            ))}

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
              className="px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-2"
            >
              <User size={16} />
              <span className="text-sm font-medium">
                {isAuthenticated ? 'Dashboard' : 'Entrar'}
              </span>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 glass rounded-xl"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 glass-strong pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-medium text-foreground"
                >
                  {item.label}
                </motion.a>
              ))}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(isAuthenticated ? '/dashboard' : '/auth');
                }}
                className="text-2xl font-medium text-accent text-left"
              >
                {isAuthenticated ? 'Ir para Dashboard' : 'Fazer Login'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
