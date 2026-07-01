import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Recycle, Sparkles, ChevronDown, Award, Trees, GlassWater } from 'lucide-react';

interface OrganicFAQProps {
  theme: 'light' | 'dark';
}

interface FAQItem {
  id: string;
  icon: React.ReactNode;
  category: string;
  question: string;
  answer: string;
}

export default function OrganicFAQ({ theme }: OrganicFAQProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: 'ingredients',
      icon: <Leaf className="w-4 h-4 text-[#C9A35A]" />,
      category: 'Organic Purity',
      question: "What defines Arvaiya's organic ingredients?",
      answer: "Each fragrance is compounded using 100% certified organic ingredients sourced directly from biodynamic estates. Our natural essential oils are extracted via gentle cold-press or steam distillation to protect their raw botanical essence. Unlike mainstream brands, we use clean organic grape-based alcohol and strictly exclude synthetic phthalates, nitro-musks, or artificial fixatives, ensuring a clean, hypoallergenic scent trail that reacts beautifully with your body chemistry."
    },
    {
      id: 'sustainability',
      icon: <Recycle className="w-4 h-4 text-[#C9A35A]" />,
      category: 'Sustainable Sourcing',
      question: "How does the brand uphold ecological and sustainable luxury?",
      answer: "We believe luxury shouldn't cost the Earth. Arvaiya works with zero-carbon transport partnerships, fair-trade certified local growers, and raw, biodegradable packaging. Our custom presentation cases are handcrafted from certified sustainable organic wood blocks, reducing plastic waste to absolute zero. Each shipment supports carbon-offset initiatives, ensuring a nature-aligned olfactory experience from the forest floor directly to your vanity."
    },
    {
      id: 'bottle-design',
      icon: <GlassWater className="w-4 h-4 text-[#C9A35A]" />,
      category: 'Aesthetic Philosophy',
      question: "Why do all Arvaiya fragrances share a signature bottle design?",
      answer: "We deliberately unify our signature bottle and logo design to focus entirely on the artistic value of the liquid inside. In our pursuit of ultimate minimalism, individuality is expressed strictly through the bespoke color of the organic elixir and the distinct scent profile it casts. This unified approach also dramatically reduces glass mold manufacturing waste, embodying a cohesive, eco-luxury statement of timeless sophistication and modern responsibility."
    }
  ];

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section 
      id="organic-faq-section"
      className={`relative py-16 px-6 lg:px-12 border-t transition-colors duration-500 overflow-hidden ${
        theme === 'dark' 
          ? 'bg-[#142042] border-[#C9A35A]/10 text-neutral-100' 
          : 'bg-[#F8F5EE] border-[#D8CDBA] text-[#222222]'
      }`}
    >
      {/* Background radial soft ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full filter blur-[120px] transition-all duration-1000 ${
          theme === 'dark' ? 'bg-[#C9A35A]/5' : 'bg-[#EFE6D3]/60'
        }`} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A35A]/20 bg-[#C9A35A]/5 text-[9px] tracking-[0.2em] font-extrabold uppercase mb-3">
            <Award className="w-3.5 h-3.5 text-[#C9A35A]" />
            <span>Eco-Luxury Philosophy</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-light tracking-[0.18em] uppercase leading-tight">
            ORGANIC <span className="italic font-normal text-[#C9A35A]">FAQ</span>
          </h2>
          <div className="w-12 h-[1px] bg-[#C9A35A] mx-auto mt-4 opacity-60" />
          <p className="text-xs max-w-md mx-auto mt-3 text-neutral-500 font-sans leading-relaxed">
            Addressing common inquiries regarding our biological ingredients, ethical harvesting, and minimalist bottle aesthetics.
          </p>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                id={`faq-item-${faq.id}`}
                className={`rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? 'border-[#C9A35A] shadow-[0_4px_25px_rgba(201,163,90,0.06)]'
                    : theme === 'dark'
                      ? 'border-[#D8CDBA]/10 bg-[#1F2F5C]/40 hover:border-[#C9A35A]/40'
                      : 'border-[#D8CDBA]/60 bg-[#FFFFFF] hover:border-[#C9A35A]/60 hover:shadow-sm'
                }`}
              >
                {/* Trigger Button */}
                <button
                  id={`faq-trigger-${faq.id}`}
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full py-4.5 px-5 flex items-center justify-between gap-4 text-left outline-none"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2 rounded-xl transition-colors ${
                      isOpen 
                        ? 'bg-[#C9A35A]/15 text-[#C9A35A]' 
                        : theme === 'dark' ? 'bg-[#142042] text-[#C9A35A]' : 'bg-[#EFE6D3]/40 text-[#222222]'
                    }`}>
                      {faq.icon}
                    </div>
                    <div>
                      <span className="text-[9px] tracking-widest font-extrabold text-[#C9A35A] uppercase block mb-0.5">
                        {faq.category}
                      </span>
                      <h4 className="font-serif italic font-bold text-xs md:text-sm tracking-wide text-[#222222] dark:text-neutral-200">
                        {faq.question}
                      </h4>
                    </div>
                  </div>
                  
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="shrink-0"
                  >
                    <ChevronDown className="w-4 h-4 text-[#C9A35A]" />
                  </motion.div>
                </button>

                {/* Answer Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-[#D8CDBA]/10 dark:border-neutral-900/40">
                        <p className="text-xs leading-relaxed opacity-85 text-[#222222] dark:text-neutral-300 font-sans">
                          {faq.answer}
                        </p>
                        
                        {/* Interactive Highlight Sub-Badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#D8CDBA]/10">
                          {faq.id === 'ingredients' && (
                            <>
                              <span className="inline-flex items-center gap-1 text-[8px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded bg-[#C9A35A]/5 text-[#C9A35A] border border-[#C9A35A]/10">
                                100% Biodynamic
                              </span>
                              <span className="inline-flex items-center gap-1 text-[8px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded bg-[#C9A35A]/5 text-[#C9A35A] border border-[#C9A35A]/10">
                                Phthalate-Free
                              </span>
                              <span className="inline-flex items-center gap-1 text-[8px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded bg-[#C9A35A]/5 text-[#C9A35A] border border-[#C9A35A]/10">
                                Grape Sourced Alcohol
                              </span>
                            </>
                          )}
                          {faq.id === 'sustainability' && (
                            <>
                              <span className="inline-flex items-center gap-1 text-[8px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/5 text-emerald-500 border border-emerald-500/10">
                                Carbon Neutral Transport
                              </span>
                              <span className="inline-flex items-center gap-1 text-[8px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/5 text-emerald-500 border border-emerald-500/10">
                                Zero Plastic Cases
                              </span>
                              <span className="inline-flex items-center gap-1 text-[8px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/5 text-emerald-500 border border-emerald-500/10">
                                Fair-Trade Botanical Sourcing
                              </span>
                            </>
                          )}
                          {faq.id === 'bottle-design' && (
                            <>
                              <span className="inline-flex items-center gap-1 text-[8px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded bg-[#C9A35A]/5 text-[#C9A35A] border border-[#C9A35A]/10">
                                Glass Waste Reduction
                              </span>
                              <span className="inline-flex items-center gap-1 text-[8px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded bg-[#C9A35A]/5 text-[#C9A35A] border border-[#C9A35A]/10">
                                Pure Elixir Focus
                              </span>
                              <span className="inline-flex items-center gap-1 text-[8px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded bg-[#C9A35A]/5 text-[#C9A35A] border border-[#C9A35A]/10">
                                Timeless Minimalism
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Dynamic call to action badge */}
        <div className={`mt-10 p-4.5 rounded-2xl border text-center ${
          theme === 'dark' 
            ? 'bg-[#1F2F5C]/30 border-[#C9A35A]/10' 
            : 'bg-[#EFE6D3]/35 border-[#D8CDBA]/60'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 bg-[#C9A35A]/10 rounded-full text-[#C9A35A] shrink-0">
                <Trees className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-serif italic font-bold text-xs tracking-wide">Want to know more about our sustainable farms?</h5>
                <p className="text-[10px] text-neutral-400 font-sans">Our botanical experts compile complete harvesting records for transparency.</p>
              </div>
            </div>
            <a 
              href="#boutique-catalog"
              className="px-4 py-2 rounded-xl bg-[#C9A35A] hover:bg-[#1F2F5C] hover:text-white text-white font-serif italic text-[10px] font-bold tracking-wider uppercase transition-all shadow-md shadow-amber-500/10 shrink-0"
            >
              Explore Scent Profiles
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
