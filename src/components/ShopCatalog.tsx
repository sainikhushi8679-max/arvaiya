import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, ShoppingBag, Check, Eye, X } from 'lucide-react';
import { Fragrance } from '../types';
import DigitalBottle from './DigitalBottle';

interface ShopCatalogProps {
  fragrances: Fragrance[];
  onAddToBag: (fragrance: Fragrance) => void;
  onSelect: (fragrance: Fragrance) => void;
  selectedFragrance: Fragrance;
  theme: 'light' | 'dark';
}

export default function ShopCatalog({
  fragrances,
  onAddToBag,
  onSelect,
  selectedFragrance,
  theme,
}: ShopCatalogProps) {
  const [search, setSearch] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('All');
  const [selectedIntensity, setSelectedIntensity] = useState<number | 'All'>('All');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'photo' | 'digital'>('photo');
  const [selectedDetailFragrance, setSelectedDetailFragrance] = useState<Fragrance | null>(null);
  const [modalViewMode, setModalViewMode] = useState<'photo' | 'digital'>('photo');

  // Get unique fragrance families from active list
  const families = ['All', ...Array.from(new Set(fragrances.map((f) => f.family)))];

  // Filters
  const filteredFragrances = fragrances.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.family.toLowerCase().includes(search.toLowerCase()) ||
      f.notes.some((note) => note.toLowerCase().includes(search.toLowerCase()));

    const matchesFamily = selectedFamily === 'All' || f.family === selectedFamily;
    const matchesIntensity = selectedIntensity === 'All' || f.intensity === selectedIntensity;

    return matchesSearch && matchesFamily && matchesIntensity;
  });

  const handleAdd = (fragrance: Fragrance) => {
    onAddToBag(fragrance);
    setAddedIds((prev) => ({ ...prev, [fragrance.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [fragrance.id]: false }));
    }, 1500);
  };

  return (
    <section className="mt-12 py-10 border-t border-neutral-200 dark:border-neutral-900">
      <div className="max-w-[1700px] mx-auto px-4 md:px-6">
        
        {/* Section Heading */}
        <div className="text-center mb-10">
          <span className="text-xs tracking-[0.3em] font-bold text-amber-500 uppercase block mb-1">
            ARVAIYA BOUTIQUE
          </span>
          <h2 className="text-3xl md:text-4xl font-light font-serif tracking-wider uppercase mb-3">
            Explore All Fragrances
          </h2>
          <div className="w-16 h-[1px] bg-amber-500/50 mx-auto" />
          <p className="text-xs opacity-75 mt-3 max-w-xl mx-auto leading-relaxed">
            Every Arvaiya creation is hand-poured into our signature architectural heavy glass bottle with a clear rectangular cap, capturing pure organic luxury.
          </p>
        </div>

        {/* Search, Filter & Controls Bar */}
        <div className={`p-4 rounded-2xl border mb-8 flex flex-col md:flex-row items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-[#142042]/95 border-[#D8CDBA]/10' : 'bg-white border-[#D8CDBA]/60 shadow-sm'
        }`}>
          {/* Live Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, notes, family..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-neutral-950 border border-neutral-800 text-white focus:border-amber-500/50'
                  : 'bg-neutral-50 border border-[#D8CDBA]/40 text-[#222222] focus:border-[#C9A35A]'
              }`}
            />
          </div>

          {/* Scent View Toggle */}
          <div className="flex items-center gap-1 bg-[#EFE6D3]/30 dark:bg-neutral-950 p-1 rounded-xl border border-[#D8CDBA]/40 dark:border-[#D8CDBA]/10 shrink-0 select-none">
            <button
              onClick={() => setViewMode('photo')}
              className={`px-3 py-1.5 rounded-lg text-[10px] tracking-wider uppercase font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'photo'
                  ? 'bg-amber-500 text-white shadow'
                  : 'text-neutral-500 hover:text-neutral-200'
              }`}
            >
              <span>📸 Photos</span>
            </button>
            <button
              onClick={() => setViewMode('digital')}
              className={`px-3 py-1.5 rounded-lg text-[10px] tracking-wider uppercase font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'digital'
                  ? 'bg-amber-500 text-white shadow'
                  : 'text-neutral-500 hover:text-neutral-200'
              }`}
            >
              <span>🧪 3D Bottles</span>
            </button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
            <div className="flex items-center gap-1.5 text-xs font-semibold opacity-70 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Families:</span>
            </div>
            
            {/* Family Buttons */}
            <div className="flex flex-wrap gap-1">
              {families.map((fam) => (
                <button
                  key={fam}
                  onClick={() => setSelectedFamily(fam)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] tracking-wider uppercase font-semibold transition-all ${
                    selectedFamily === fam
                      ? 'bg-amber-500 hover:bg-amber-700 text-white shadow-md shadow-amber-500/10'
                      : theme === 'dark'
                        ? 'bg-[#142042] hover:bg-[#1F2F5C] border border-[#D8CDBA]/10 text-neutral-300'
                        : 'bg-[#EFE6D3]/40 hover:bg-[#EFE6D3]/70 border border-[#D8CDBA]/40 text-[#222222]'
                  }`}
                >
                  {fam}
                </button>
              ))}
            </div>

            {/* Intensity filter */}
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[10px] tracking-wider font-semibold opacity-70 uppercase">Intensity:</span>
              <select
                value={selectedIntensity.toString()}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedIntensity(val === 'All' ? 'All' : parseInt(val));
                }}
                className={`text-[10px] tracking-wider py-1.5 px-2 rounded-lg font-semibold uppercase border outline-none ${
                  theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                }`}
              >
                <option value="All">All Levels</option>
                <option value="1">1 - Gentle & Whisper Soft</option>
                <option value="2">2 - Light & Fresh</option>
                <option value="3">3 - Delicate & Balanced</option>
                <option value="4">4 - Rich & Intense</option>
                <option value="5">5 - Bold & Majestic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shop Grid */}
        {filteredFragrances.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <ShoppingBag className="w-8 h-8 text-neutral-400 mx-auto mb-3 opacity-60" />
            <p className="text-sm font-serif italic opacity-70">No matching fragrances found.</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedFamily('All');
                setSelectedIntensity('All');
              }}
              className="mt-3 text-xs text-amber-500 hover:underline font-medium"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFragrances.map((f) => {
              const isSelected = selectedFragrance.id === f.id;
              const isAdded = addedIds[f.id];
              return (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-500 ${
                    isSelected
                      ? 'border-[#C9A35A] shadow-[0_10px_30px_rgba(201,163,90,0.12)] ring-1 ring-[#C9A35A]/30'
                      : theme === 'dark'
                        ? 'bg-[#142042]/90 border-[#D8CDBA]/10 hover:border-[#C9A35A]/50 hover:shadow-lg'
                        : 'bg-white border-[#D8CDBA]/60 hover:border-[#C9A35A] hover:shadow-xl'
                  }`}
                >
                  {/* Subtle Family Ribbon */}
                  <span className={`absolute top-4 left-4 text-[8px] tracking-[0.2em] font-extrabold uppercase px-2 py-0.5 rounded ${
                    theme === 'dark' ? 'bg-[#1F2F5C] text-[#C9A35A]' : 'bg-[#EFE6D3] text-[#222222]'
                  }`}>
                    {f.family}
                  </span>

                  {/* Bottle Showcase Stage */}
                  <div 
                    onClick={() => onSelect(f)}
                    className="h-56 flex items-center justify-center cursor-pointer relative overflow-hidden rounded-xl bg-gradient-to-b from-neutral-50/50 to-neutral-100/50 dark:from-neutral-950/20 dark:to-neutral-950/60 border border-neutral-200/40 dark:border-neutral-800/20 p-2 group"
                  >
                    {viewMode === 'photo' && f.imageUrl ? (
                      <div className="w-full h-full rounded-lg overflow-hidden relative">
                        <img 
                          src={f.imageUrl} 
                          alt={f.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60 pointer-events-none" />
                      </div>
                    ) : (
                      <DigitalBottle fragrance={f} size="xs" active={isSelected} />
                    )}
                    
                    {/* Hover Quick View Guide */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="px-3.5 py-1.5 rounded-full bg-white text-neutral-950 text-[10px] tracking-wider uppercase font-extrabold flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <Eye className="w-3.5 h-3.5" />
                        Vanity Preview
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="mt-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-baseline justify-between mb-1">
                        <h4 className="font-serif italic text-lg font-bold tracking-wide group-hover:text-[#C9A35A] transition-colors uppercase">
                          {f.name}
                        </h4>
                        <span className="text-xs font-serif font-extrabold text-[#C9A35A]">
                          ₹{f.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      
                      <p className="text-[11px] leading-relaxed opacity-75 line-clamp-3 h-12 mb-3">
                        {f.description}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          onSelect(f);
                          setSelectedDetailFragrance(f);
                          setModalViewMode(viewMode);
                        }}
                        className={`flex-1 py-2 rounded-xl text-[10px] tracking-widest font-extrabold uppercase transition-all border ${
                          theme === 'dark'
                            ? 'border-[#D8CDBA]/10 hover:bg-[#1F2F5C]/40 hover:border-[#C9A35A]/55 text-neutral-300'
                            : 'border-[#D8CDBA]/60 hover:bg-[#EFE6D3]/30 hover:border-[#C9A35A] text-[#222222]'
                        }`}
                      >
                        Details
                      </button>

                      <button
                        onClick={() => handleAdd(f)}
                        disabled={isAdded}
                        className={`flex-1 py-2 px-3 rounded-xl text-[10px] tracking-widest font-extrabold uppercase transition-all flex items-center justify-center gap-1.5 ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#C9A35A] hover:bg-[#1F2F5C] hover:text-white text-white shadow-md shadow-amber-500/15 active:scale-95'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 animate-bounce" />
                            Added
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Add To Bag
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fragrance Details Modal */}
      <AnimatePresence>
        {selectedDetailFragrance && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetailFragrance(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 15 }}
              transition={{ type: 'spring', damping: 28, stiffness: 180 }}
              className={`relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl z-10 border ${
                theme === 'dark' ? 'bg-[#142042] border-[#C9A35A]/20 text-neutral-100' : 'bg-[#F8F5EE] border-[#D8CDBA] text-[#222222]'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDetailFragrance(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100/10 dark:hover:bg-neutral-900/40 transition-colors z-20"
              >
                <X className="w-5 h-5 text-neutral-400 hover:text-[#C9A35A]" />
              </button>

              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                {/* Left side: Premium bottle presentation */}
                <div className="col-span-1 md:col-span-5 flex flex-col items-center justify-center bg-gradient-to-b from-neutral-50/50 to-neutral-100/50 dark:from-neutral-950/20 dark:to-neutral-950/60 border border-neutral-200/40 dark:border-neutral-800/20 rounded-2xl p-4 min-h-[280px]">
                  {modalViewMode === 'photo' && selectedDetailFragrance.imageUrl ? (
                    <div className="relative w-40 h-52 rounded-xl overflow-hidden shadow-lg border border-neutral-200/40 dark:border-neutral-800/40 bg-white/5">
                      <img
                        src={selectedDetailFragrance.imageUrl}
                        alt={selectedDetailFragrance.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-all duration-750 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
                    </div>
                  ) : (
                    <DigitalBottle fragrance={selectedDetailFragrance} size="sm" active={true} />
                  )}

                  {/* Switcher */}
                  <div className="mt-4 flex gap-1 bg-[#EFE6D3]/40 dark:bg-neutral-950/90 p-0.5 rounded-lg border border-[#D8CDBA]/40 dark:border-neutral-850 scale-90 select-none">
                    <button
                      onClick={() => setModalViewMode('photo')}
                      className={`px-3 py-1 rounded text-[9px] tracking-wider uppercase font-bold transition-all ${
                        modalViewMode === 'photo'
                          ? 'bg-[#C9A35A] text-white shadow'
                          : 'text-neutral-500 hover:text-neutral-200'
                      }`}
                    >
                      Photo
                    </button>
                    <button
                      onClick={() => setModalViewMode('digital')}
                      className={`px-3 py-1 rounded text-[9px] tracking-wider uppercase font-bold transition-all ${
                        modalViewMode === 'digital'
                          ? 'bg-[#C9A35A] text-white shadow'
                          : 'text-neutral-500 hover:text-neutral-200'
                      }`}
                    >
                      Digital
                    </button>
                  </div>
                </div>

                {/* Right side: Detailed fragrance properties */}
                <div className="col-span-1 md:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="mb-2">
                      <span className="text-[10px] tracking-[0.25em] font-extrabold text-[#C9A35A] uppercase block mb-0.5">
                        {selectedDetailFragrance.family}
                      </span>
                      <h3 className="font-serif italic font-bold text-2xl md:text-3xl tracking-wide uppercase">
                        {selectedDetailFragrance.name}
                      </h3>
                    </div>

                    {/* Price and size */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xl font-serif font-extrabold text-[#C9A35A]">
                        ₹{selectedDetailFragrance.price.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-[10px] tracking-wider px-2.5 py-0.5 rounded font-extrabold ${
                        theme === 'dark' ? 'bg-[#1F2F5C] text-[#C9A35A]' : 'bg-[#EFE6D3] text-[#222222]'
                      }`}>
                        {selectedDetailFragrance.volume}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Vibe & Description */}
                      <div className="space-y-1">
                        <p className={`text-xs leading-relaxed opacity-80 ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'}`}>
                          {selectedDetailFragrance.description}
                        </p>
                        <p className="text-xs leading-relaxed italic text-[#C9A35A] font-medium">
                          Vibe: {selectedDetailFragrance.vibe}
                        </p>
                      </div>

                      {/* Fragrance Notes */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block">
                          Scent Notes:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedDetailFragrance.notes.map((note) => (
                            <span
                              key={note}
                              className={`text-[9px] tracking-wider px-2.5 py-1 rounded-lg font-semibold border ${
                                theme === 'dark'
                                  ? 'bg-neutral-900 text-neutral-300 border-neutral-800'
                                  : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                              }`}
                            >
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Intensity */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block">
                          Intensity:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`w-2 h-2 rounded-full mx-0.5 transition-all ${
                                  i < selectedDetailFragrance.intensity
                                    ? 'bg-amber-500 scale-110 shadow-sm shadow-amber-500/20'
                                    : 'bg-neutral-300 dark:bg-neutral-800'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-semibold opacity-60">
                            {selectedDetailFragrance.intensity}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add to Bag action */}
                  <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-900 flex gap-3">
                    <button
                      onClick={() => handleAdd(selectedDetailFragrance)}
                      disabled={addedIds[selectedDetailFragrance.id]}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs tracking-widest font-extrabold uppercase transition-all flex items-center justify-center gap-2 ${
                        addedIds[selectedDetailFragrance.id]
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-[#C9A35A] hover:bg-[#1F2F5C] hover:text-white text-white shadow-lg shadow-amber-500/15 active:scale-95'
                      }`}
                    >
                      {addedIds[selectedDetailFragrance.id] ? (
                        <>
                          <Check className="w-4 h-4 animate-bounce" />
                          Added to Bag
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          Add To Bag
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
