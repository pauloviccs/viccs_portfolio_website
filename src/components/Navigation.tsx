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
  const [userRole, setUserRole] = useState<'admin' | 'client' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Check auth and get user role
    const checkAuthAndRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);

        if (session?.user) {
          // Get user role from profiles table
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('[Navigation] Profile fetch error:', error);
            setUserRole('client'); // Default to client on error
          } else {
            console.log('[Navigation] User role:', profile?.role);
            setUserRole(profile?.role === 'admin' ? 'admin' : 'client');
          }
        } else {
          setUserRole(null);
        }
      } catch (err) {
        console.error('[Navigation] Auth check error:', err);
      }
    };

    checkAuthAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Navigation] Auth state changed:', event);
      setIsAuthenticated(!!session);

      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('[Navigation] Profile fetch error:', error);
          setUserRole('client');
        } else {
          console.log('[Navigation] User role:', profile?.role);
          setUserRole(profile?.role === 'admin' ? 'admin' : 'client');
        }
      } else {
        setUserRole(null);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  // Navigate to appropriate dashboard based on role
  const navigateToDashboard = () => {
    if (userRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? 'py-3 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/5'
          : 'py-6'
          }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <motion.a
            href="/"
            className="text-2xl font-bold text-gradient"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            VICCS Design
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

            {isAuthenticated ? (
              <>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={navigateToDashboard}
                  className="px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-2"
                >
                  <User size={16} />
                  <span className="text-sm font-medium">
                    {userRole === 'admin' ? 'Admin' : 'Dashboard'}
                  </span>
                </motion.button>
                <div className="h-6 w-px bg-white/10 mx-2" />
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setIsAuthenticated(false);
                    setUserRole(null);
                    navigate('/');
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-red-400 transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
                className="px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-2"
              >
                <User size={16} />
                <span className="text-sm font-medium">Entrar</span>
              </motion.button>
            )}
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
                  if (isAuthenticated) {
                    navigateToDashboard();
                  } else {
                    navigate('/auth');
                  }
                }}
                className="text-2xl font-medium text-accent text-left"
              >
                {isAuthenticated
                  ? (userRole === 'admin' ? 'Painel Admin' : 'Dashboard')
                  : 'Fazer Login'}
              </motion.button>

              {isAuthenticated && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await supabase.auth.signOut();
                    setUserRole(null);
                    navigate('/');
                  }}
                  className="text-lg font-medium text-red-400 text-left"
                >
                  Sair da Conta
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
