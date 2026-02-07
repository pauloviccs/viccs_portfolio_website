import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-gradient"
          >
            VICCS Design
          </motion.div>

          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Feito com <Heart size={14} className="text-secondary" /> por Paulo Vinicios
          </p>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
};
