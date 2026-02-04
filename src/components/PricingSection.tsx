import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Check, Lightning } from '@phosphor-icons/react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const plans = [
  {
    name: 'Стартовый',
    description: 'Идеально для начала',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      '3 команды бота',
      'Базовая автоматизация',
      '1 бит в месяц',
      'Поддержка по email',
    ],
    popular: false,
  },
  {
    name: 'Профессиональный',
    description: 'Лучший для растущего бизнеса',
    monthlyPrice: 149,
    yearlyPrice: 119,
    features: [
      'Неограниченные команды',
      'Продвинутая автоматизация',
      '5 битов в месяц',
      'Приоритетная поддержка',
      'Индивидуальные интеграции',
      'Аналитическая панель',
    ],
    popular: true,
  },
  {
    name: 'Корпоративный',
    description: 'Для крупных операций',
    monthlyPrice: 399,
    yearlyPrice: 319,
    features: [
      'Всё из Профессионального',
      'Выделенная поддержка',
      'Неограниченные биты',
      'White-label решения',
      'Гарантия SLA',
      'Индивидуальная разработка',
    ],
    popular: false,
  },
];

const PricingSection = () => {
  const { user } = useAuth();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-32 relative" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="heading-lg text-foreground mb-6">
            Простые <span className="text-gradient">тарифы</span>
          </h2>
          <p className="body-text max-w-xl mx-auto mb-10">
            Выберите план, который подходит вашим потребностям. Все планы включают основные функции.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Месячно
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-8 rounded-full bg-secondary p-1 transition-colors"
            >
              <motion.div
                layout
                className="w-6 h-6 rounded-full bg-primary"
                style={{ marginLeft: isYearly ? 'auto' : 0 }}
              />
            </button>
            <span className={`text-sm transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Годовой
              <span className="ml-2 text-xs text-primary">Экономия 20%</span>
            </span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              className={`relative ${plan.popular ? 'border-gradient' : 'glass-card'} p-8`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gradient-to-r from-primary to-accent px-3 py-1 rounded-full">
                  <Lightning size={14} weight="fill" className="text-white" />
                  <span className="text-xs font-medium text-white">Популярный</span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-medium text-foreground mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-light text-foreground">
                  {isYearly ? plan.yearlyPrice : plan.monthlyPrice}₽
                </span>
                <span className="text-muted-foreground">/месяц</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check size={18} weight="bold" className="text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'hero' : 'outline'}
                className="w-full"
                asChild
              >
                <Link to={user ? '/dashboard/subscription' : '/auth/register'}>
                  {user ? 'Выбрать план' : 'Начать'}
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
