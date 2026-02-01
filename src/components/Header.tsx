import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Process', href: '#process' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-card mx-4 mt-4 md:mx-8">
        <div className="container flex items-center justify-between h-16 px-6">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <img src="/xvexta_logo.jpg" alt="X-VEXTA Logo" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-medium tracking-tight text-foreground">X-VEXTA</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
               Войти
            </Link>
            <Button variant="hero" size="sm" asChild>
              <Link to="/auth/register">Регистрация</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden p-2 text-foreground hover:bg-white/5 rounded-lg transition-colors"
          >
            <List size={24} weight="bold" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-background z-50 md:hidden"
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">X</span>
                  </div>
                  <span className="font-medium tracking-tight text-foreground">CRAFT Studio — Premium Digital</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-foreground hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={24} weight="bold" />
                </button>
              </div>

              <nav className="flex flex-col gap-6">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-3xl font-light text-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-4">
                <Link 
                   to="/auth/login" 
                   onClick={() => setIsMenuOpen(false)}
                   className="text-center text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                   Войти
                </Link>
                <Button variant="hero" size="xl" className="w-full" asChild>
                  <Link to="/auth/register" onClick={() => setIsMenuOpen(false)}>Регистрация</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
