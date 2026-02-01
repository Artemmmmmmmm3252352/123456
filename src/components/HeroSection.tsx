import { motion, useScroll, useTransform, type Transition } from 'framer-motion';
import { ArrowRight } from '@phosphor-icons/react';
import { Button } from './ui/button';
import HeroBackground from './HeroBackground';
import { useRef } from 'react';

// Custom easing as typed tuple
const customEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: customEase,
      } as Transition,
    },
  };

  const title1 = 'X-VEXTA //';
  const title2 = 'MULTI-DIGITAL STUDIO ⚡️';

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24"
    >
      {/* Background */}
      <HeroBackground />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      
      {/* Content with parallax */}
      <motion.div 
        className="container relative z-10 text-center px-4"
        style={{ y, opacity, scale }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8"
          >
            <motion.span 
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <span className="text-sm text-muted-foreground">Premium Digital Solutions Studio</span>
          </motion.div>

          {/* Main Heading with letter animation */}
          <div className="mb-8" style={{ perspective: '1000px' }}>
             {/* Title 1 */}
            <h1 className="heading-xl text-foreground block overflow-hidden mb-2">
              <span className="inline-flex">
                {title1.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 50, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.3 + i * 0.03,
                      ease: customEase,
                    }}
                    className={char === ' ' ? 'w-4' : ''}
                    style={{ display: 'inline-block', transformStyle: 'preserve-3d' }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </span>
            </h1>
            
            {/* Title 2 */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground block overflow-hidden">
              <span className="inline-flex text-gradient">
                {title2.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 50, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.3 + (title1.length + i) * 0.03,
                      ease: customEase,
                    }}
                    style={{ display: 'inline-block', transformStyle: 'preserve-3d' }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            </h2>
          </div>

          {/* Subtitle with blur reveal */}
          <motion.p
            variants={itemVariants}
            className="body-text max-w-xl mx-auto mb-8"
          >
            Две стороны одной медали: от высокотехнологичного софта до иммерсивных игровых миров. 
            Мы создаем цифровую экосистему, где код встречается с искусством.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button variant="hero" size="lg" className="group relative overflow-hidden">
                <motion.span
                  className="absolute inset-0 bg-white/10"
                  initial={{ x: '-100%', skewX: '-15deg' }}
                  whileHover={{ x: '200%' }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Explore Projects
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ArrowRight size={20} weight="bold" />
                  </motion.span>
                </span>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button variant="hero-outline" size="lg" className="relative overflow-hidden group">
                <motion.span
                  className="absolute inset-0 bg-white/5"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ borderRadius: 'inherit' }}
                />
                <span className="relative z-10">Enter X-VEXTA Games</span>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-6 h-10 rounded-full border-2 border-white/10 flex justify-center pt-2 backdrop-blur-sm bg-background/10">
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
            </div>
            <span className="text-xs text-muted-foreground/70 uppercase tracking-widest font-medium">Scroll</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Side decorative lines */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 1, duration: 1, ease: customEase }}
        className="absolute left-8 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent origin-top hidden lg:block"
      />
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 1.2, duration: 1, ease: customEase }}
        className="absolute right-8 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent origin-top hidden lg:block"
      />
    </section>
  );
};

export default HeroSection;
