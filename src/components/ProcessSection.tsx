import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Check, Cursor, Play } from '@phosphor-icons/react';

const codeSnippet = `import asyncio
from telegram import Bot
from handlers import message_handler

class TradingBot:
    def __init__(self, token: str):
        self.bot = Bot(token)
        self.running = True
        
    async def start(self):
        print("🤖 Bot started...")
        while self.running:
            await self.check_signals()
            await asyncio.sleep(1)
            
    async def check_signals(self):
        # Analyze market data
        signal = await self.analyze()
        if signal.is_bullish:
            await self.notify_users()`;

// Pre-tokenize the code snippet for stable rendering
const codeLines = codeSnippet.split('\n').map(line => {
  const tokens: { text: string; color: string }[] = [];
  
  if (!line) return [{ text: ' ', color: '' }];

  let remaining = line;
  
  // Very basic tokenizer helper
  // We'll process the string and extract tokens. 
  // Since we want to preserve order, we'll use a simplified approach:
  // Split by expected tokens and map them to colors.
  
  // To keep it robust without a full parser, we will use the same regex strategy 
  // but applied to the whole line to generate a list of typed segments.
  // This is tricky to do perfectly with just regex replace. 
  // Alternative: visual consistency is more important than 100% stable color logic here.
  // We will simply render the FULLY colored line, but hide characters using CSS masking or opacity.
  
  return line;
});

const HighlightedChar = ({ char, color, isVisible }: { char: string, color: string, isVisible: boolean }) => (
  <span className={color} style={{ opacity: isVisible ? 1 : 0 }}>{char}</span>
);

const ProcessSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [charIndex, setCharIndex] = useState(0);

  // Pre-calculate the HTML content for stable coloring
  const linesWithColors = useRef(codeSnippet.split('\n').map(line => {
    // Re-use logic to get color classes, but return an array of {char, className}
    const chars: { char: string; className: string }[] = [];
    
    // We'll use a temporary placeholder strategy to map colors to ranges
    // For simplicity in this "visual" component, let's map known words to colors
    // and default others to white.
    
    let processedLine = line;
    const colorMap = new Array(line.length).fill("text-foreground");
    
    const applyColor = (regex: RegExp, className: string) => {
      let match;
      while ((match = regex.exec(line)) !== null) {
        for (let i = match.index; i < match.index + match[0].length; i++) {
          colorMap[i] = className;
        }
      }
    };

    // 1. Strings
    applyColor(/(".*?"|'.*?')/g, "text-green-400");
    // 2. Comments
    applyColor(/(#.*)/g, "text-muted-foreground italic");
    // 3. Keywords
    const keywords = ["import", "from", "class", "def", "async", "await", "while", "if", "return"];
    keywords.forEach(kw => applyColor(new RegExp(`\\b${kw}\\b`, 'g'), "text-pink-500"));
    // 4. Built-ins
    const builtins = ["self", "True", "False", "None"];
    builtins.forEach(kw => applyColor(new RegExp(`\\b${kw}\\b`, 'g'), "text-cyan-400 italic"));
     // 5. Classes
    const classes = ["TradingBot", "Bot"];
    classes.forEach(cls => applyColor(new RegExp(`\\b${cls}\\b`, 'g'), "text-yellow-400"));
    // 6. Functions
    const functions = ["print", "__init__", "start", "check_signals", "sleep", "analyze", "notify_users"];
    functions.forEach(fn => applyColor(new RegExp(`\\b${fn}\\b`, 'g'), "text-blue-400"));

    return line.split('').map((char, i) => ({ char, className: colorMap[i] }));
  })).current;

  // Calculate total length
  const totalChars = linesWithColors.reduce((acc, line) => acc + line.length + 1, 0); // +1 for newlines

  useEffect(() => {
    if (isInView) {
      const interval = setInterval(() => {
        setCharIndex(prev => {
          if (prev >= totalChars) {
            clearInterval(interval);
            return prev;
          }
           // Add a small randomization to speed to feel human? 
           // For now, fixed slow speed to fix "jerky" complaint.
          return prev + 1;
        });
      }, 75); // 75ms is comfortably slow reading speed
      return () => clearInterval(interval);
    }
  }, [isInView, totalChars]);

  return (
    <section id="process" className="py-32 relative overflow-hidden" ref={ref}>
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="heading-lg text-foreground mb-6">
            Engineering & <span className="text-gradient">Game Design</span>
          </h2>
          <p className="body-text max-w-xl mx-auto">
            Мы объединяем строгую логику алгоритмов с безграничной фантазией игровых миров. 
            От высоконагруженных ботов и микросервисов до проработки уникальных игровых механик — каждый байт кода работает на результат.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto items-center">
          
          {/* Code Window (Left) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card overflow-hidden h-full min-h-[500px] flex flex-col"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
              <span className="text-xs text-muted-foreground font-mono">trading_bot.py</span>
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto flex-1 bg-black/20">
              <div className="flex flex-col">
                {linesWithColors.map((lineChars, lineIdx) => {
                  // Calculate range of global indices for this line
                  // previous lines lengths + previous newlines
                  const startIdx = linesWithColors.slice(0, lineIdx).reduce((acc, l) => acc + l.length + 1, 0);
                  
                  return (
                    <div key={lineIdx} className="flex min-h-[1.5em] w-full">
                       {/* Line Number */}
                      <span className="w-8 text-muted-foreground/30 select-none block text-right pr-3 shrink-0">{lineIdx + 1}</span>
                      
                      {/* Code Content */}
                      <span className="whitespace-pre flex-1 relative flex items-center">
                        {lineChars.map((charObj, charIdx) => {
                          const globalIdx = startIdx + charIdx;
                          const isVisible = globalIdx < charIndex;
                          const isCursorPos = globalIdx === charIndex;

                          return (
                            <span key={charIdx} className="relative">
                               {isCursorPos && (
                                 <motion.span
                                   animate={{ opacity: [1, 0, 1] }}
                                   transition={{ duration: 1, repeat: Infinity, ease: "steps(2)" }}
                                   className="absolute left-0 -top-[2px] bottom-0 w-[2px] h-[1.2em] bg-primary z-10"
                                 />
                               )}
                               <span 
                                 className={charObj.className} 
                                 style={{ opacity: isVisible ? 1 : 0 }}
                               >
                                 {charObj.char}
                               </span>
                            </span>
                          );
                        })}
                        
                        {/* Cursor at the exact end of the line (before newline) */}
                        {charIndex === startIdx + lineChars.length && (
                             <motion.span
                             animate={{ opacity: [1, 0, 1] }}
                             transition={{ duration: 1, repeat: Infinity, ease: "steps(2)" }}
                             className="inline-block w-[2px] h-[1.2em] bg-primary align-middle"
                             style={{ marginLeft: -1 }} // Small adjust to overlap last char gap if any
                           />
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Automation Window (Right) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card overflow-hidden w-full h-full min-h-[500px] flex flex-col"
          >
            {/* Window header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-muted-foreground ml-4">gui_automation.spec</span>
            </div>
            
            {/* Cursor Automation Visualization */}
            <div className="flex-1 relative overflow-hidden group select-none flex items-center justify-center bg-black/40">
              
              {/* Background Grid */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                  backgroundSize: '32px 32px'
                }} 
              />

              {/* Interface Elements */}
              <div className="flex flex-col gap-8 w-full max-w-sm px-8 relative z-10 justify-center h-full">
                {/* Button 1: Build */}
                <motion.div
                  className="flex items-center justify-between border border-white/10 px-6 py-5 rounded-2xl shadow-xl bg-card/80 backdrop-blur-xl"
                  animate={isInView ? {
                    borderColor: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)', 'rgba(var(--primary), 1)', 'rgba(var(--primary), 1)', 'rgba(255,255,255,0.1)'],
                    boxShadow: ['0 0 0 rgba(0,0,0,0)', '0 0 0 rgba(0,0,0,0)', '0 0 30px rgba(var(--primary), 0.3)', '0 0 30px rgba(var(--primary), 0.3)', '0 0 0 rgba(0,0,0,0)'],
                    scale: [1, 1, 0.98, 1, 1]
                  } : {}}
                  transition={{ 
                    duration: 8,
                    times: [0, 0.2, 0.25, 0.8, 1],
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <span className="text-lg font-medium tracking-tight">Build Core System</span>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: [0, 0, 1, 1, 0] } : {}}
                    transition={{ 
                      duration: 8,
                      times: [0, 0.2, 0.25, 0.8, 1],
                      repeat: Infinity
                    }}
                  >
                    <Check weight="bold" className="text-primary w-6 h-6" />
                  </motion.div>
                </motion.div>

                {/* Button 2: Launch */}
                <motion.div
                  className="flex items-center justify-between border border-white/10 px-6 py-5 rounded-2xl shadow-xl bg-card/80 backdrop-blur-xl"
                  animate={isInView ? {
                    borderColor: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)', 'rgba(var(--accent), 1)', 'rgba(var(--accent), 1)', 'rgba(255,255,255,0.1)'],
                     boxShadow: ['0 0 0 rgba(0,0,0,0)', '0 0 0 rgba(0,0,0,0)', '0 0 30px rgba(var(--accent), 0.3)', '0 0 30px rgba(var(--accent), 0.3)', '0 0 0 rgba(0,0,0,0)'],
                    opacity: [0.6, 0.6, 1, 1, 0.6],
                    scale: [1, 1, 0.98, 1, 1]
                  } : {}}
                  transition={{ 
                    duration: 8,
                    times: [0, 0.45, 0.5, 0.8, 1],
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <span className="text-lg font-medium tracking-tight">Launch Sequence</span>
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={isInView ? { opacity: [0, 0, 1, 1, 0] } : {}}
                     transition={{ 
                       duration: 8,
                       times: [0, 0.45, 0.5, 0.8, 1],
                       repeat: Infinity
                     }}
                  >
                     <Play weight="fill" className="text-accent w-6 h-6" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Cursor Animation - Centered Relative to Container */}
              <motion.div
                className="absolute top-1/2 left-1/2 text-white pointer-events-none drop-shadow-2xl z-[100]"
                initial={{ x: 100, y: 150 }} 
                animate={isInView ? {
                  x: [100, 0, 0, 0, 0, 0, 0, 100], 
                  y: [150, -45, -45, -45, 45, 45, 45, 150],
                  scale: [1, 1, 0.9, 1, 1, 0.9, 1, 1]
                } : {}}
                transition={{
                  duration: 8,
                  times: [0, 0.2, 0.25, 0.3, 0.45, 0.5, 0.55, 1],
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Cursor size={32} weight="fill" className="transform -rotate-12 drop-shadow-lg" />
              </motion.div>

              {/* Click Ripples - Centered Relative to Container */}
              <motion.div 
                className="absolute w-16 h-16 border-2 border-primary rounded-full top-1/2 left-1/2 -ml-8 -mt-8"
                style={{ y: -45 }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: [0, 1, 0, 0], scale: [0.5, 1.5, 1.5, 0.5] } : {}}
                transition={{ duration: 8, times: [0.25, 0.28, 0.35, 1], repeat: Infinity }}
              />
              <motion.div 
                className="absolute w-16 h-16 border-2 border-accent rounded-full top-1/2 left-1/2 -ml-8 -mt-8"
                style={{ y: 45 }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: [0, 0, 1, 0], scale: [0.5, 0.5, 1.5, 0.5] } : {}}
                transition={{ duration: 8, times: [0, 0.5, 0.53, 1], repeat: Infinity }}
              />
              
            </div>
          </motion.div>
        
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
