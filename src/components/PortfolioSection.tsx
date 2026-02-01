import { motion, useInView } from 'framer-motion';
import { useRef, MouseEvent } from 'react';
import { ArrowUpRight, TrendUp, Cube, Headset, MapTrifold, BellRinging } from '@phosphor-icons/react';

const portfolioItems = [
  {
    title: 'Telegram Trading Bot',
    category: 'Backend Development',
    description: 'Automated cryptocurrency trading with real-time signals',
    icon: TrendUp,
    gradient: 'from-emerald-500 to-cyan-500',
    size: 'large',
  },
  {
    title: 'RPG Inventory System',
    category: 'Game Development',
    description: 'Complex item management logic',
    icon: Cube,
    gradient: 'from-purple-500 to-pink-500',
    size: 'small',
  },
  {
    title: 'Support Bot System',
    category: 'Backend Development',
    description: 'Smart customer service automation',
    icon: Headset,
    gradient: 'from-blue-500 to-indigo-500',
    size: 'small',
  },
  {
    title: 'Procedural Map Generator',
    category: 'Game Development',
    description: 'Infinite world generation algorithm',
    icon: MapTrifold,
    gradient: 'from-orange-500 to-red-500',
    size: 'large',
  },
  {
    title: 'Notification Service',
    category: 'Backend Development',
    description: 'Multi-channel system alerts',
    icon: BellRinging,
    gradient: 'from-pink-500 to-rose-500',
    size: 'medium',
  },
];

const PortfolioCard = ({ item, index }: { item: typeof portfolioItems[0], index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty('--mouse-x', `${x}%`);
    cardRef.current.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      className={`spotlight-card glass-card-hover p-6 cursor-pointer group ${
        item.size === 'large' ? 'md:col-span-2 md:row-span-2' : 
        item.size === 'medium' ? 'md:col-span-2' : ''
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <item.icon size={24} className="text-white" weight="fill" />
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ArrowUpRight size={20} className="text-foreground" />
          </div>
        </div>
        
        <div className="mt-auto">
          <span className="text-xs text-primary uppercase tracking-wider mb-2 block">
            {item.category}
          </span>
          <h3 className={`font-light text-foreground mb-2 ${item.size === 'large' ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
            {item.title}
          </h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const PortfolioSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="portfolio" className="py-32 relative" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="heading-lg text-foreground mb-6">
            Selected <span className="text-gradient">Works</span>
          </h2>
          <p className="body-text max-w-xl mx-auto">
            A curated collection of our best projects across music and development.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {portfolioItems.map((item, index) => (
            <PortfolioCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
