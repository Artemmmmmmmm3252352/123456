import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { GameController, Code, Lightning, Sparkle } from '@phosphor-icons/react';

const services = [
  {
    icon: Code,
    title: '💼 Working Projects',
    description: 'Проектирование и разработка сложных систем автоматизации. Мы специализируемся на создании умных Telegram-ботов и кроссплатформенного софта, который берет на себя рутину и масштабирует ваш бизнес.',
    tags: ['#Backend', '#Automation', '#API_Integration', '#Bots'],
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: GameController,
    title: '🎮 X-VEXTA Games',
    description: 'Лаборатория игровых миров. Наша творческая площадка, где мы создаем уникальный геймплей. Здесь рождаются игры, в которые мы сами хотим играть.',
    tags: ['#GameDev', '#IndieGames', '#LevelDesign', '#X_VEXTA_Games'],
    gradient: 'from-purple-500 to-pink-500',
  },
];

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" className="py-32 relative" ref={ref}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6">
            <Sparkle size={16} className="text-primary" weight="fill" />
            <span className="text-sm text-muted-foreground">О нас</span>
          </div>
          <h2 className="heading-lg text-foreground mb-6">
            Две стороны медали<br />
            <span className="text-gradient">X-VEXTA</span>
          </h2>
          <p className="body-text max-w-2xl mx-auto">
            От высокотехнологичного софта до иммерсивных игровых миров.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="glass-card-hover p-8 group h-full flex flex-col"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon size={28} className="text-white" weight="fill" />
              </div>
              <h3 className="heading-md text-foreground mb-4">{service.title}</h3>
              <p className="text-muted-foreground mb-6 flex-grow">{service.description}</p>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                   <span key={tag} className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                     {tag}
                   </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto"
        >
          {[
            { value: '50+', label: 'Проектов выполнено' },
            { value: '100+', label: 'Битов создано' },
            { value: '24/7', label: 'Работа ботов' },
            { value: '5★', label: 'Рейтинг клиентов' },
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-light text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
