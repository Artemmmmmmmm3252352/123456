import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { EnvelopeSimple } from '@phosphor-icons/react';

const ProductDock = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section className="py-20 relative" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <div className="glass-card px-10 py-8 inline-flex flex-col items-center gap-4">
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg mb-2"
            >
              <EnvelopeSimple size={32} className="text-white" weight="fill" />
            </motion.div>

            <div className="text-center">
              <h3 className="text-2xl font-medium text-foreground mb-1">Напишите нам</h3>
              <p className="text-muted-foreground mb-6">Мы открыты к предложениям</p>
              
              <a 
                href="mailto:ernestartem@outlook.com"
                className="text-xl md:text-2xl font-light text-foreground hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-0.5"
              >
                ernestartem@outlook.com
              </a>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductDock;
