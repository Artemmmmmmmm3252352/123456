import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const HeroBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate particles
  const particles = [...Array(30)].map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            background: `radial-gradient(circle, rgba(59, 130, 246, ${0.3 + Math.random() * 0.4}), transparent)`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0.5, 1, 0],
            scale: [0, 1, 1.2, 1, 0],
            y: [0, -100, -200],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Primary aurora gradient - responds to mouse */}
      <motion.div
        className="absolute top-0 left-1/4 w-[800px] h-[800px]"
        animate={{
          x: mousePosition.x * 30,
          y: mousePosition.y * 30,
        }}
        transition={{ type: 'spring', damping: 50, stiffness: 100 }}
      >
        <motion.div
          className="w-full h-full rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            background: 'conic-gradient(from 0deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.15))',
          }}
        />
      </motion.div>

      {/* Secondary aurora */}
      <motion.div
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px]"
        animate={{
          x: mousePosition.x * -20,
          y: mousePosition.y * -20,
        }}
        transition={{ type: 'spring', damping: 50, stiffness: 100 }}
      >
        <motion.div
          className="w-full h-full rounded-full blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            background: 'conic-gradient(from 180deg, rgba(139, 92, 246, 0.12), rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.04), rgba(59, 130, 246, 0.12))',
          }}
        />
      </motion.div>

      {/* Glowing orb - left */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, x: -100 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-1/4 -left-20"
      >
        <motion.div
          animate={{ 
            y: [0, -40, 0],
            x: [0, 20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
          className="w-80 h-80 rounded-full relative"
        >
          {/* Outer glow */}
          <div 
            className="absolute inset-0 rounded-full blur-[60px]"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent 70%)',
            }}
          />
          {/* Inner sphere */}
          <div 
            className="absolute inset-8 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1), rgba(59, 130, 246, 0.1), transparent 60%)',
              boxShadow: 'inset 0 0 60px rgba(255, 255, 255, 0.1), 0 0 40px rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Glowing orb - right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, x: 100 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-1/3 -right-32"
      >
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            x: [0, -15, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
          className="w-[450px] h-[450px] rounded-full relative"
        >
          <div 
            className="absolute inset-0 rounded-full blur-[80px]"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25), transparent 70%)',
            }}
          />
          <div 
            className="absolute inset-12 rounded-full"
            style={{
              background: 'radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.08), rgba(139, 92, 246, 0.08), transparent 60%)',
              boxShadow: 'inset 0 0 80px rgba(255, 255, 255, 0.08), 0 0 60px rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.03)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Floating glass shapes */}
      <motion.div
        initial={{ opacity: 0, y: 100, rotateX: 45 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-[60%] right-20 md:right-40"
      >
        <motion.div
          animate={{ 
            y: [0, -25, 0],
            rotateY: [0, 10, 0],
            rotateX: [0, 5, 0],
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
          className="w-24 h-40 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05))',
            boxShadow: 'inset 0 0 40px rgba(255, 255, 255, 0.05), 0 0 60px rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
          }}
        />
      </motion.div>

      {/* Small floating cube */}
      <motion.div
        initial={{ opacity: 0, scale: 0, rotate: -45 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-[45%] left-[15%]"
      >
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ 
            y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          }}
          className="w-12 h-12 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.1))',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        />
      </motion.div>

      {/* Animated rings */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: 200 + i * 150,
              height: 200 + i * 150,
              left: -(100 + i * 75),
              top: -(100 + i * 75),
              borderColor: `rgba(59, 130, 246, ${0.05 - i * 0.01})`,
            }}
            animate={{
              rotate: i % 2 === 0 ? 360 : -360,
              scale: [1, 1.02, 1],
            }}
            transition={{
              rotate: { duration: 30 + i * 10, repeat: Infinity, ease: 'linear' },
              scale: { duration: 4 + i, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
        ))}
      </motion.div>

      {/* Star decorations */}
      {[
        { x: '85%', y: '20%', size: 40, delay: 1 },
        { x: '10%', y: '70%', size: 30, delay: 1.2 },
        { x: '75%', y: '75%', size: 25, delay: 1.4 },
      ].map((star, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: star.delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute"
          style={{ left: star.x, top: star.y }}
        >
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ 
              rotate: { duration: 20 + i * 5, repeat: Infinity, ease: 'linear' },
              scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <svg width={star.size} height={star.size} viewBox="0 0 40 40" fill="none">
              <path
                d="M20 0L23.5 16.5L40 20L23.5 23.5L20 40L16.5 23.5L0 20L16.5 16.5L20 0Z"
                fill="url(#starGradient)"
                fillOpacity="0.6"
              />
              <defs>
                <linearGradient id="starGradient" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#3B82F6" />
                  <stop offset="1" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </motion.div>
      ))}

      {/* Bottom gradient fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-40"
        style={{
          background: 'linear-gradient(to top, hsl(var(--background)), transparent)',
        }}
      />
    </div>
  );
};

export default HeroBackground;
