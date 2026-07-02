import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, TrendingDown, Tag } from 'lucide-react';
import { Fragrance } from '../types';
import DigitalBottle from './DigitalBottle';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  allFragrances: Fragrance[];
  onToggleWishlist: (id: string) => void;
  onAddToBag: (fragrance: Fragrance) => void;
  theme: 'light' | 'dark';
}

export default function WishlistModal({
  isOpen,
  onClose,
  wishlistIds,
  allFragrances,
  onToggleWishlist,
  onAddToBag,
  theme,
}: WishlistModalProps) {
  if (!isOpen) return null;

  // Find all fragrances matching wishlistIds
  const wishlistedItems = allFragrances.filter((f) => wishlistIds.includes(f.id));

  // Items with price reductions
  const discountedItems = wishlistedItems.filter((f) => f.originalPrice && f.originalPrice > f.price);
  const totalSavings = wishlistedItems.reduce(
    (acc, f) => acc + (f.originalPrice && f.originalPrice > f.price ? f.originalPrice - f.price : 0),
    0
  );

  const handleMoveToBag = (fragrance: Fragrance) => {
    onAddToBag(fragrance);
    onToggleWishlist(fragrance.id); // remove from wishlist after adding to bag
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden z-10 ${
            theme === 'dark'
              ? 'bg-[#13223f] border-neutral-800 text-white'
              : 'bg-white border-neutral-200 text-neutral-900'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold tracking-wide">Your Fragrance Wishlist</h3>
                <p className="text-xs text-neutral-400">
                  {wishlistedItems.length} {wishlistedItems.length === 1 ? 'saved scent' : 'saved scents'} in your private collection
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-500/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body List */}
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            {/* Price Drop Banner if any items have a lower price */}
            {discountedItems.length > 0 && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                    Price Drop Alert!
                  </h5>
                  <p className="text-xs text-neutral-300 dark:text-neutral-300 mt-0.5">
                    <strong>{discountedItems.length}</strong> {discountedItems.length === 1 ? 'perfume' : 'perfumes'} in your wishlist has a price reduction! Save up to <span className="font-mono text-emerald-400 font-bold">₹{totalSavings.toLocaleString()}</span> today.
                  </p>
                </div>
              </div>
            )}

            {wishlistedItems.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                  <Heart className="w-8 h-8 opacity-60" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold">Your Wishlist is Empty</h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                    Explore the boutique catalog or custom studio and tap the heart icon to save your favorite perfumes here.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C9A35A] text-black font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-md"
                >
                  <span>Browse Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              wishlistedItems.map((f) => {
                const hasPriceDrop = Boolean(f.originalPrice && f.originalPrice > f.price);
                const priceSavings = hasPriceDrop ? f.originalPrice! - f.price : 0;
                const percentDrop = hasPriceDrop ? Math.round((priceSavings / f.originalPrice!) * 100) : 0;

                return (
                  <div
                    key={f.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all relative ${
                      hasPriceDrop
                        ? theme === 'dark'
                          ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500/60'
                          : 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-400'
                        : theme === 'dark'
                        ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                        : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {/* Left: Bottle preview and info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-16 h-20 rounded-xl bg-black/20 flex items-center justify-center p-1 border border-amber-500/20 shrink-0 relative">
                        <DigitalBottle fragrance={f} size="sm" active={false} view="front" />
                        {hasPriceDrop && (
                          <div className="absolute -top-2 -left-2 p-1 rounded-full bg-emerald-500 text-black shadow-md" title="Price Dropped!">
                            <TrendingDown className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] uppercase font-bold tracking-widest text-amber-500 block">
                            {f.family}
                          </span>
                          {hasPriceDrop && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider animate-pulse">
                              <Tag className="w-2.5 h-2.5" />
                              Price Drop -{percentDrop}%
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif text-base font-bold">{f.name}</h4>
                        <p className="text-xs text-neutral-400 line-clamp-1">
                          {f.notes.slice(0, 3).join(' • ')}
                        </p>

                        <div className="flex items-center gap-2 text-xs font-mono font-bold mt-1">
                          {hasPriceDrop && (
                            <span className="line-through text-neutral-400 text-[11px]">
                              ₹{f.originalPrice!.toLocaleString()}
                            </span>
                          )}
                          <span className={`text-xs font-bold font-mono ${hasPriceDrop ? 'text-emerald-400 font-extrabold text-sm' : 'text-amber-500'}`}>
                            ₹{f.price.toLocaleString()}
                          </span>
                          <span className="text-neutral-500 text-[10px]">
                            • {f.volume}
                          </span>
                          {hasPriceDrop && (
                            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              Save ₹{priceSavings.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Actions: Remove & Move to Bag */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200 dark:border-neutral-800">
                      <button
                        onClick={() => onToggleWishlist(f.id)}
                        className="p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:border-rose-500/50 hover:bg-rose-500/10 text-neutral-400 hover:text-rose-500 transition-all"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleMoveToBag(f)}
                        className="px-4 py-2.5 rounded-xl bg-[#C9A35A] hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {wishlistedItems.length > 0 && (
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-500/5">
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400">
                  Total Value: <strong className="font-mono text-amber-500">₹{wishlistedItems.reduce((acc, i) => acc + i.price, 0).toLocaleString()}</strong>
                </span>
                {totalSavings > 0 && (
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Total Saved: ₹{totalSavings.toLocaleString()}
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  wishlistedItems.forEach((f) => onAddToBag(f));
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Move All to Bag</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

