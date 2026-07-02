import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  FlaskConical, 
  Check, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  Zap, 
  RotateCcw, 
  Sliders, 
  Award, 
  Heart,
  Layers,
  Feather,
  Droplet,
  Info
} from 'lucide-react';
import { Fragrance } from '../types';
import DigitalBottle from './DigitalBottle';

interface CustomPerfumeStudioProps {
  onAddToBag: (fragrance: Fragrance) => void;
  onBuyNow: (fragrance: Fragrance) => void;
  theme: 'light' | 'dark';
  wishlistIds?: string[];
  onToggleWishlist?: (id: string) => void;
}

export interface IngredientNote {
  id: string;
  name: string;
  category: 'top' | 'heart' | 'base';
  family: 'Floral' | 'Woody' | 'Fruity' | 'Citrus' | 'Vanilla' | 'Musk' | 'Amber' | 'Oud' | 'Spicy' | 'Fresh';
  description: string;
  color: string; // Tailwind bg or hex
}

export const INGREDIENT_CATALOG: IngredientNote[] = [
  // TOP NOTES
  { id: 'bergamot', name: 'Italian Bergamot', category: 'top', family: 'Citrus', description: 'Bright, zesty, sparkling citrus top note', color: '#FCD34D' },
  { id: 'pink_pepper', name: 'Pink Pepper', category: 'top', family: 'Spicy', description: 'Rosy, spicy, vibrant top note', color: '#FDA4AF' },
  { id: 'grapefruit', name: 'Ruby Grapefruit', category: 'top', family: 'Citrus', description: 'Crisp, refreshing, tangy burst', color: '#F87171' },
  { id: 'lavender', name: 'French Lavender', category: 'top', family: 'Fresh', description: 'Calming, aromatic, herbal refined accord', color: '#C084FC' },
  { id: 'cardamom', name: 'Green Cardamom', category: 'top', family: 'Spicy', description: 'Exotic, warm, aromatic spice', color: '#86EFAC' },
  { id: 'lychee', name: 'Sweet Lychee', category: 'top', family: 'Fruity', description: 'Juicy, exotic, sweet nectar tone', color: '#FB7185' },
  { id: 'green_apple', name: 'Crisp Green Apple', category: 'top', family: 'Fruity', description: 'Fresh, tangy, playful orchard note', color: '#4ADE80' },

  // HEART NOTES
  { id: 'turkish_rose', name: 'Turkish Damask Rose', category: 'heart', family: 'Floral', description: 'Opulent, velvety, romantic floral bouquet', color: '#F43F5E' },
  { id: 'jasmine_sambac', name: 'Royal Jasmine Sambac', category: 'heart', family: 'Floral', description: 'Intoxicating, sensual white blossom', color: '#F8FAFC' },
  { id: 'peony', name: 'Pink French Peony', category: 'heart', family: 'Floral', description: 'Soft, delicate, lush floral petal sweetness', color: '#F472B6' },
  { id: 'iris', name: 'Florentine Iris (Orris)', category: 'heart', family: 'Floral', description: 'Powdery, elegant, noble aristocratic root', color: '#A855F7' },
  { id: 'orange_blossom', name: 'Moroccan Orange Blossom', category: 'heart', family: 'Floral', description: 'Luminous, sweet, honeyed floral heart', color: '#FDBA74' },
  { id: 'saffron', name: 'Kashmiri Golden Saffron', category: 'heart', family: 'Spicy', description: 'Rich, leathery, golden spicy warmth', color: '#EAB308' },

  // BASE NOTES
  { id: 'vanilla', name: 'Madagascar Vanilla Pod', category: 'base', family: 'Vanilla', description: 'Warm, creamy, intoxicating sweet pod', color: '#FDE047' },
  { id: 'white_musk', name: 'Velvet White Musk', category: 'base', family: 'Musk', description: 'Clean, sensual, second-skin radiance', color: '#E2E8F0' },
  { id: 'sandalwood', name: 'Mysore Sandalwood', category: 'base', family: 'Woody', description: 'Creamy, rich, sacred meditative wood', color: '#CA8A04' },
  { id: 'agarwood_oud', name: 'Cambodian Agarwood (Oud)', category: 'base', family: 'Oud', description: 'Smoky, deep, mysterious royal resin', color: '#451A03' },
  { id: 'amber', name: 'Golden Baltic Amber', category: 'base', family: 'Amber', description: 'Resinous, glowing, warm honeyed resin', color: '#D97706' },
  { id: 'patchouli', name: 'Indonesian Patchouli', category: 'base', family: 'Woody', description: 'Earthy, dark, rich woody foundation', color: '#78350F' },
  { id: 'cedarwood', name: 'Atlas Cedarwood', category: 'base', family: 'Woody', description: 'Dry, noble, majestic aromatic wood', color: '#92400E' },
  { id: 'tonka_bean', name: 'Roasted Tonka Bean', category: 'base', family: 'Vanilla', description: 'Almond, tobacco, warm gourmand accord', color: '#B45309' },
];

const LIQUID_COLORS = [
  { id: 'rose_gold', name: 'Rose Gold', hex: '#F43F5E', bgStyle: 'rgba(244, 63, 94, 0.45)' },
  { id: 'amber_gold', name: 'Imperial Amber', hex: '#D97706', bgStyle: 'rgba(217, 119, 6, 0.5)' },
  { id: 'crystal_champagne', name: 'Champagne Spark', hex: '#EAB308', bgStyle: 'rgba(234, 179, 8, 0.35)' },
  { id: 'emerald_mist', name: 'Emerald Forest', hex: '#10B981', bgStyle: 'rgba(16, 185, 129, 0.4)' },
  { id: 'sapphire_night', name: 'Sapphire Elixir', hex: '#3B82F6', bgStyle: 'rgba(59, 130, 246, 0.45)' },
  { id: 'onyx_velvet', name: 'Midnight Onyx', hex: '#1E293B', bgStyle: 'rgba(30, 41, 59, 0.75)' },
];

const CAP_FINISHES = [
  { id: 'gold_24k', name: '24K Polished Gold', hex: '#EAB308' },
  { id: 'brushed_silver', name: 'Brushed Platinum', hex: '#94A3B8' },
  { id: 'smoked_obsidian', name: 'Smoked Quartz', hex: '#334155' },
  { id: 'rose_copper', name: 'Rose Copper', hex: '#FB7185' },
];

export default function CustomPerfumeStudio({ 
  onAddToBag, 
  onBuyNow, 
  theme,
  wishlistIds = [],
  onToggleWishlist,
}: CustomPerfumeStudioProps) {
  const [perfumeName, setPerfumeName] = useState<string>('Royal Elixir');
  const [concoctedFor, setConcoctedFor] = useState<string>('Bespoke Client');
  const [selectedNotes, setSelectedNotes] = useState<IngredientNote[]>([
    INGREDIENT_CATALOG.find(n => n.id === 'turkish_rose')!,
    INGREDIENT_CATALOG.find(n => n.id === 'lychee')!,
    INGREDIENT_CATALOG.find(n => n.id === 'vanilla')!,
    INGREDIENT_CATALOG.find(n => n.id === 'white_musk')!,
  ]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'top' | 'heart' | 'base'>('all');
  const [activeFamilyFilter, setActiveFamilyFilter] = useState<string>('All');
  
  const [selectedColor, setSelectedColor] = useState(LIQUID_COLORS[0]);
  const [selectedCap, setSelectedCap] = useState(CAP_FINISHES[0]);
  const [concentration, setConcentration] = useState<'Extrait de Parfum' | 'Eau de Parfum'>('Extrait de Parfum');
  const [volume, setVolume] = useState<'50 ml' | '100 ml'>('100 ml');

  // Blending animation status
  const [isBlending, setIsBlending] = useState<boolean>(false);
  const [blendProgress, setBlendProgress] = useState<number>(0);
  const [blendStepText, setBlendStepText] = useState<string>('');
  const [isGenerated, setIsGenerated] = useState<boolean>(true);

  // Toggle note selection
  const handleToggleNote = (note: IngredientNote) => {
    setIsGenerated(false);
    if (selectedNotes.some(n => n.id === note.id)) {
      if (selectedNotes.length <= 1) return; // keep at least 1 note
      setSelectedNotes(prev => prev.filter(n => n.id !== note.id));
    } else {
      if (selectedNotes.length >= 7) return; // max 7 notes
      setSelectedNotes(prev => [...prev, note]);
    }
  };

  // Derive dominant fragrance family based on selected notes
  const derivedFamily = useMemo(() => {
    const counts: Record<string, number> = {};
    selectedNotes.forEach(n => {
      counts[n.family] = (counts[n.family] || 0) + 1;
    });
    let topFamily = 'Floral';
    let max = 0;
    Object.entries(counts).forEach(([fam, count]) => {
      if (count > max) {
        max = count;
        topFamily = fam;
      }
    });
    return `${topFamily} Bespoke`;
  }, [selectedNotes]);

  // Derive custom perfume description
  const derivedDescription = useMemo(() => {
    const topNames = selectedNotes.filter(n => n.category === 'top').map(n => n.name).join(', ') || 'Sparkling Citrus';
    const heartNames = selectedNotes.filter(n => n.category === 'heart').map(n => n.name).join(', ') || 'Velvety Floral Bouquet';
    const baseNames = selectedNotes.filter(n => n.category === 'base').map(n => n.name).join(', ') || 'Warm Precious Amber & Musk';

    return `A masterfully crafted bespoke creation opening with radiant notes of ${topNames}, blossoming into a captivating heart of ${heartNames}, anchored in a long-lasting luxurious trail of ${baseNames}.`;
  }, [selectedNotes]);

  // Derive calculated price
  const calculatedPrice = useMemo(() => {
    let base = volume === '100 ml' ? 3999 : 2499;
    if (concentration === 'Extrait de Parfum') base += 500;
    if (selectedNotes.length > 4) base += (selectedNotes.length - 4) * 200;
    return base;
  }, [volume, concentration, selectedNotes]);

  // Derived Fragrance Object for Digital Bottle and Shopping Bag
  const customFragranceObject: Fragrance = useMemo(() => {
    return {
      id: `custom-${perfumeName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: perfumeName.trim() || 'Royal Elixir',
      family: derivedFamily,
      notes: selectedNotes.map(n => n.name),
      intensity: Math.min(5, Math.max(3, Math.ceil(selectedNotes.length * 0.7) + (concentration === 'Extrait de Parfum' ? 1 : 0))),
      liquidColor: selectedColor.bgStyle,
      capColor: selectedCap.hex,
      textColor: '#FFFFFF',
      labelBg: 'bg-neutral-900',
      description: derivedDescription,
      vibe: `Handcrafted for ${concoctedFor || 'You'} • Bespoke Blend`,
      price: calculatedPrice,
      volume: volume,
    };
  }, [perfumeName, derivedFamily, selectedNotes, selectedColor, selectedCap, concentration, derivedDescription, concoctedFor, calculatedPrice, volume]);

  // Simulate Blending Animation when clicking "Generate Perfume"
  const handleGeneratePerfume = () => {
    setIsBlending(true);
    setBlendProgress(0);
    setBlendStepText('Analyzing Olfactory Notes...');

    const steps = [
      { pct: 20, text: 'Extracting Fresh Top Notes...' },
      { pct: 45, text: 'Infusing Heart Floral & Spice Bouquet...' },
      { pct: 75, text: 'Anchoring Precious Oud, Amber & Base Resins...' },
      { pct: 90, text: 'Engraving Golden ARVAIYA Label & Sealing Flacon...' },
      { pct: 100, text: 'Bespoke Elixir Complete!' },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setBlendProgress(steps[i].pct);
        setBlendStepText(steps[i].text);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsBlending(false);
          setIsGenerated(true);
        }, 400);
      }
    }, 450);
  };

  // Filtered ingredients
  const filteredIngredients = INGREDIENT_CATALOG.filter(n => {
    const matchesCat = activeCategoryFilter === 'all' || n.category === activeCategoryFilter;
    const matchesFam = activeFamilyFilter === 'All' || n.family === activeFamilyFilter;
    return matchesCat && matchesFam;
  });

  const families = ['All', 'Floral', 'Woody', 'Fruity', 'Citrus', 'Vanilla', 'Musk', 'Amber', 'Oud', 'Spicy', 'Fresh'];

  return (
    <section id="custom-perfume-studio" className="py-16 px-4 md:px-8 max-w-7xl mx-auto scroll-mt-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs tracking-[0.2em] uppercase font-bold mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          ARVAIYA BESPOKE BLENDER STUDIO
        </div>
        <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-wide mb-4">
          Create Your Own Signature Perfume
        </h2>
        <p className={`text-sm md:text-base leading-relaxed ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'}`}>
          Select rare olfactory ingredients, formulate your custom scent pyramid, give your elixir a royal title, and watch ARVAIYA craft your custom branded perfume bottle in real time.
        </p>
      </div>

      {/* Main Grid Layout: Left Control Panel (6 cols) & Right 3D Visualizer (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: SCENT BLENDING CONTROLS (7 Cols) */}
        <div className={`lg:col-span-7 p-6 md:p-8 rounded-3xl border transition-all duration-500 space-y-8 ${
          theme === 'dark' 
            ? 'bg-[#13223f]/90 border-neutral-800 shadow-2xl' 
            : 'bg-white border-neutral-200/80 shadow-xl'
        }`}>
          
          {/* STEP 1: PERFUME TITLE & CLIENT NAME */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-amber-500/20 pb-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-black font-extrabold text-xs flex items-center justify-center">1</span>
              <h3 className="font-serif font-bold text-lg tracking-wide">Name Your Perfume & Engraving</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase font-extrabold tracking-widest text-neutral-400 block mb-1.5">
                  Perfume Name (Label Title)
                </label>
                <input 
                  type="text" 
                  value={perfumeName}
                  onChange={(e) => {
                    setPerfumeName(e.target.value);
                    setIsGenerated(false);
                  }}
                  placeholder="e.g. Royal Rose Velvet"
                  maxLength={25}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-serif font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    theme === 'dark'
                      ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-600'
                      : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs uppercase font-extrabold tracking-widest text-neutral-400 block mb-1.5">
                  Concocted For (Custom Engraving)
                </label>
                <input 
                  type="text" 
                  value={concoctedFor}
                  onChange={(e) => {
                    setConcoctedFor(e.target.value);
                    setIsGenerated(false);
                  }}
                  placeholder="e.g. Your Name"
                  maxLength={30}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-sans font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    theme === 'dark'
                      ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-600'
                      : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* STEP 2: SELECT SCENT NOTES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-black font-extrabold text-xs flex items-center justify-center">2</span>
                <h3 className="font-serif font-bold text-lg tracking-wide">Select Fragrance Ingredients</h3>
              </div>
              <span className="text-xs font-mono text-amber-500 font-bold">
                {selectedNotes.length}/7 Notes Selected
              </span>
            </div>

            {/* Selected Notes Active Bar */}
            <div className={`p-3.5 rounded-2xl border min-h-[50px] flex flex-wrap gap-2 items-center ${
              theme === 'dark' ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}>
              {selectedNotes.length === 0 ? (
                <span className="text-xs text-neutral-400 italic">No notes selected yet. Click ingredients below to blend.</span>
              ) : (
                selectedNotes.map((note) => (
                  <span
                    key={note.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-amber-500/30 bg-amber-500/10 text-amber-400"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: note.color }} />
                    {note.name}
                    <button 
                      onClick={() => handleToggleNote(note)}
                      className="ml-1 hover:text-rose-400 transition-colors"
                      title="Remove note"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Category Filter Tabs (Top, Heart, Base) */}
            <div className="flex flex-wrap gap-2 items-center justify-between pt-1">
              <div className="flex gap-1 p-1 rounded-xl bg-neutral-900/60 border border-neutral-800">
                {(['all', 'top', 'heart', 'base'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
                      activeCategoryFilter === cat
                        ? 'bg-amber-500 text-black shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'All Pyramid' : `${cat} Notes`}
                  </button>
                ))}
              </div>

              {/* Family Filter Dropdown/Pills */}
              <div className="flex gap-1 overflow-x-auto max-w-full pb-1">
                {families.slice(0, 6).map((fam) => (
                  <button
                    key={fam}
                    onClick={() => setActiveFamilyFilter(fam)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap ${
                      activeFamilyFilter === fam
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {fam}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredients Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
              {filteredIngredients.map((ing) => {
                const isSelected = selectedNotes.some(n => n.id === ing.id);
                return (
                  <button
                    key={ing.id}
                    onClick={() => handleToggleNote(ing)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all group ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 ring-1 ring-amber-500/50'
                        : theme === 'dark'
                          ? 'border-neutral-800 bg-neutral-900/80 hover:border-neutral-700 hover:bg-neutral-800/80'
                          : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        ing.category === 'top' ? 'bg-amber-500/20 text-amber-400' :
                        ing.category === 'heart' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-700/20 text-amber-300'
                      }`}>
                        {ing.category}
                      </span>
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-neutral-500 flex items-center justify-center opacity-40 group-hover:opacity-100">
                          <Plus className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    <span className="font-semibold text-xs leading-snug tracking-wide block truncate">
                      {ing.name}
                    </span>

                    <span className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                      {ing.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: BOTTLE AESTHETICS (Liquid Shade, Cap, Size, Concentration) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-amber-500/20 pb-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-black font-extrabold text-xs flex items-center justify-center">3</span>
              <h3 className="font-serif font-bold text-lg tracking-wide">Bottle & Concentrate Customization</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Liquid Color Selector */}
              <div>
                <label className="text-xs uppercase font-extrabold tracking-widest text-neutral-400 block mb-2">
                  Elixir Liquid Shade
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LIQUID_COLORS.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => {
                        setSelectedColor(col);
                        setIsGenerated(false);
                      }}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                        selectedColor.id === col.id
                          ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                          : theme === 'dark' ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-neutral-50'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full shadow-inner border border-white/20" style={{ backgroundColor: col.hex }} />
                      <span className="text-[10px] font-bold truncate">{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cap Finish Selector */}
              <div>
                <label className="text-xs uppercase font-extrabold tracking-widest text-neutral-400 block mb-2">
                  Heavy Metallic Cap Finish
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CAP_FINISHES.map((cap) => (
                    <button
                      key={cap.id}
                      onClick={() => {
                        setSelectedCap(cap);
                        setIsGenerated(false);
                      }}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                        selectedCap.id === cap.id
                          ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                          : theme === 'dark' ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-neutral-50'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: cap.hex }} />
                      <span className="text-[10px] font-bold truncate">{cap.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Volume & Concentration */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs uppercase font-extrabold tracking-widest text-neutral-400 block mb-1.5">
                  Concentration Grade
                </label>
                <div className="flex gap-2">
                  {(['Extrait de Parfum', 'Eau de Parfum'] as const).map((conc) => (
                    <button
                      key={conc}
                      onClick={() => {
                        setConcentration(conc);
                        setIsGenerated(false);
                      }}
                      className={`flex-1 py-2 px-2 rounded-xl border text-xs font-bold transition-all ${
                        concentration === conc
                          ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                          : theme === 'dark' ? 'border-neutral-800 bg-neutral-900 text-neutral-400' : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                      }`}
                    >
                      {conc}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase font-extrabold tracking-widest text-neutral-400 block mb-1.5">
                  Flacon Volume
                </label>
                <div className="flex gap-2">
                  {(['50 ml', '100 ml'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => {
                        setVolume(v);
                        setIsGenerated(false);
                      }}
                      className={`flex-1 py-2 px-2 rounded-xl border text-xs font-bold transition-all ${
                        volume === v
                          ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                          : theme === 'dark' ? 'border-neutral-800 bg-neutral-900 text-neutral-400' : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON: GENERATE PERFUME */}
          <div className="pt-4 border-t border-amber-500/20">
            <button
              onClick={handleGeneratePerfume}
              disabled={isBlending}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black font-extrabold tracking-wider uppercase text-sm shadow-xl hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <FlaskConical className={`w-5 h-5 ${isBlending ? 'animate-spin' : ''}`} />
              <span>{isBlending ? 'Blending Bespoke Elixir...' : 'Generate Custom Perfume Bottle'}</span>
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: 3D REALISTIC BOTTLE MOCKUP & SCENT PROFILE CARD (5 Cols) */}
        <div className={`lg:col-span-5 p-6 md:p-8 rounded-3xl border transition-all duration-500 flex flex-col justify-between relative overflow-hidden ${
          theme === 'dark'
            ? 'bg-[#13223f]/95 border-neutral-800 shadow-2xl'
            : 'bg-white border-neutral-200 shadow-xl'
        }`}>
          
          {/* Ambient Lighting Glow behind Bottle */}
          <div 
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[70px] opacity-25 pointer-events-none transition-all duration-1000"
            style={{ backgroundColor: selectedColor.hex }}
          />

          {/* Top Status Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4 relative z-10">
            <div>
              <span className="text-[10px] tracking-[0.2em] font-extrabold text-amber-500 uppercase block">
                ARVAIYA ATELIER PREVIEW
              </span>
              <h3 className="font-serif italic font-bold text-xl truncate max-w-[220px]">
                {perfumeName || 'Royal Elixir'}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-amber-500 block">
                ₹{calculatedPrice.toLocaleString()}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold block">
                {volume} • {concentration}
              </span>
            </div>
          </div>

          {/* BOTTLE DISPLAY STAGE */}
          <div className="relative py-8 flex flex-col items-center justify-center min-h-[340px] z-10">
            
            {/* Blending Overlay Modal / Progress bar */}
            <AnimatePresence>
              {isBlending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg text-white mb-1">
                      Crafting {perfumeName}
                    </h4>
                    <p className="text-xs text-amber-400 font-mono tracking-wider animate-pulse">
                      {blendStepText}
                    </p>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden border border-neutral-700">
                    <motion.div 
                      className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full"
                      animate={{ width: `${blendProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Realistic Digital Flacon Mockup */}
            <DigitalBottle 
              fragrance={customFragranceObject}
              size="lg"
              active={true}
              view="front"
            />

            {/* Label watermark badge */}
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/60 text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
              <Award className="w-3 h-3 text-amber-500" />
              ARVAIYA BESPOKE BOTTLE ENGRAVED
            </div>
          </div>

          {/* SCENT PYRAMID & DESCRIPTION DETAILS */}
          <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 relative z-10">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-neutral-400 block mb-1">
                Fragrance Description & Notes
              </span>
              <p className="text-xs leading-relaxed opacity-85">
                {derivedDescription}
              </p>
            </div>

            {/* Scent Pyramid Breakdown */}
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-neutral-200/60 dark:border-neutral-800/60 text-center">
              <div>
                <span className="text-[9px] uppercase font-bold text-amber-500 tracking-wider block">Top Notes</span>
                <span className="text-[10px] font-semibold block truncate opacity-90">
                  {selectedNotes.filter(n => n.category === 'top').map(n => n.name).join(', ') || 'Fresh Citrus'}
                </span>
              </div>
              <div className="border-x border-neutral-200/60 dark:border-neutral-800/60">
                <span className="text-[9px] uppercase font-bold text-rose-400 tracking-wider block">Heart Notes</span>
                <span className="text-[10px] font-semibold block truncate opacity-90">
                  {selectedNotes.filter(n => n.category === 'heart').map(n => n.name).join(', ') || 'Floral Bouquet'}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-amber-600 tracking-wider block">Base Notes</span>
                <span className="text-[10px] font-semibold block truncate opacity-90">
                  {selectedNotes.filter(n => n.category === 'base').map(n => n.name).join(', ') || 'Amber & Musk'}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS: ADD TO BAG, BUY NOW & WISHLIST */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => onAddToBag(customFragranceObject)}
                className={`flex-1 py-3 px-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  theme === 'dark'
                    ? 'border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white'
                    : 'border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-neutral-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                Add to Bag
              </button>

              <button
                onClick={() => onBuyNow(customFragranceObject)}
                className="flex-1 py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Zap className="w-4 h-4 fill-black" />
                Buy Now
              </button>

              {onToggleWishlist && (
                <button
                  onClick={() => onToggleWishlist(customFragranceObject.id)}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-center active:scale-95 shrink-0 ${
                    wishlistIds.includes(customFragranceObject.id)
                      ? 'border-rose-500 bg-rose-500/20 text-rose-500'
                      : theme === 'dark'
                        ? 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-rose-500 hover:border-rose-500/50'
                        : 'border-neutral-300 bg-neutral-100 text-neutral-400 hover:text-rose-500 hover:border-rose-500/50'
                  }`}
                  title={wishlistIds.includes(customFragranceObject.id) ? "Remove from Wishlist" : "Save to Wishlist"}
                >
                  <Heart className={`w-4 h-4 ${wishlistIds.includes(customFragranceObject.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
