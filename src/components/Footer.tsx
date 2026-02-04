import { motion } from 'framer-motion';
import { EnvelopeSimple, TelegramLogo, InstagramLogo, TwitterLogo } from '@phosphor-icons/react';

const navLinks = [
  { label: 'О нас', href: '#about' },
  { label: 'Портфолио', href: '#portfolio' },
  { label: 'Процесс', href: '#process' },
  { label: 'Тарифы', href: '#pricing' },
];

const socialLinks = [
  { icon: TelegramLogo, href: '#', label: 'Telegram' },
  { icon: InstagramLogo, href: '#', label: 'Instagram' },
  { icon: TwitterLogo, href: '#', label: 'Twitter' },
  { icon: EnvelopeSimple, href: 'mailto:ernestartem@outlook.com', label: 'Email' },
];

const Footer = () => {
  return (
    <footer id="contact" className="py-16 border-t border-white/10">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/xvexta_logo.jpg" alt="X-VEXTA Logo" className="w-7 h-7 rounded-full object-cover" />
            <span className="text-xl font-medium tracking-tight text-foreground flex items-center gap-2">
              X-VEXTA
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Contact */}
          <div className="flex items-center gap-4">
            <a 
              href="mailto:ernestartem@outlook.com" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <EnvelopeSimple size={18} className="text-primary group-hover:scale-110 transition-transform" />
              <span>ernestartem@outlook.com</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <p className="text-sm text-muted-foreground">
            © 2026 X-VEXTA. Все права защищены.
          </p>
          <p className="text-sm text-muted-foreground">
            ernestartem@outlook.com
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
