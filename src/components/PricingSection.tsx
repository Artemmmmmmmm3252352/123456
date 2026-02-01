import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Check, Lightning } from '@phosphor-icons/react';
import { Button } from './ui/button';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for trying out',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      '3 bot commands',
      'Basic automation',
      '1 beat per month',
      'Email support',
    ],
    popular: false,
  },
  {
    name: 'Pro',
    description: 'Best for growing businesses',
    monthlyPrice: 149,
    yearlyPrice: 119,
    features: [
      'Unlimited commands',
      'Advanced automation',
      '5 beats per month',
      'Priority support',
      'Custom integrations',
      'Analytics dashboard',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large scale operations',
    monthlyPrice: 399,
    yearlyPrice: 319,
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Unlimited beats',
      'White-label solutions',
      'SLA guarantee',
      'Custom development',
    ],
    popular: false,
  },
];

const PricingSection = () => {
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
            Simple <span className="text-gradient">Pricing</span>
          </h2>
          <p className="body-text max-w-xl mx-auto mb-10">
            Choose the plan that fits your needs. All plans include core features.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
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
              Yearly
              <span className="ml-2 text-xs text-primary">Save 20%</span>
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
                  <span className="text-xs font-medium text-white">Most Popular</span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-medium text-foreground mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-light text-foreground">
                  ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <span className="text-muted-foreground">/month</span>
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
              >
                Get Started
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
