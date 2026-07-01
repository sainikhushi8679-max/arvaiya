import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag, CreditCard, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  theme: 'light' | 'dark';
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  theme,
}: CartDrawerProps) {
  const totalAmount = cartItems.reduce((sum, item) => sum + item.fragrance.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 190 }}
            className={`fixed top-0 right-0 bottom-0 w-full sm:w-[420px] z-50 shadow-2xl flex flex-col justify-between ${
              theme === 'dark' ? 'bg-[#142042] border-l border-[#C9A35A]/10 text-neutral-100' : 'bg-[#F8F5EE] border-l border-[#D8CDBA]/60 text-[#222222]'
            }`}
          >
            {/* Drawer Header */}
            <div className={`p-5 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-[#C9A35A]/10' : 'border-[#D8CDBA]/60'
            }`}>
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#C9A35A]" />
                <div>
                  <h3 className="font-serif italic text-lg font-bold">Your Shopping Bag</h3>
                  <span className="text-[10px] tracking-wider text-neutral-400 font-semibold uppercase">
                    {cartItems.length === 0 ? 'Empty' : `${cartItems.length} Signature Item(s)`}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-neutral-100/10 dark:hover:bg-neutral-900 transition-colors"
              >
                <X className="w-4 h-4 text-neutral-400 hover:text-[#C9A35A]" />
              </button>
            </div>

            {/* Drawer Body - Items Feed */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <ShoppingBag className="w-12 h-12 text-neutral-400 mb-3 animate-pulse" />
                  <p className="font-serif italic text-sm mb-1">Your bag is empty.</p>
                  <p className="text-[11px] max-w-xs">Explore our boutique and choose an organic scent tailored to your chemistry.</p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-4 py-1.5 rounded-full bg-[#C9A35A] hover:bg-[#1F2F5C] text-white text-[10px] uppercase font-bold tracking-widest transition-all"
                  >
                    Boutique Catalog
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.fragrance.id}
                    className={`p-3 rounded-xl border flex gap-3.5 items-center justify-between ${
                      theme === 'dark' ? 'border-[#D8CDBA]/10 bg-[#1F2F5C]/40' : 'border-[#D8CDBA]/40 bg-white'
                    }`}
                  >
                    {/* Bottle Swatch Indicator */}
                    <div className="w-12 h-12 rounded-lg bg-black/10 flex items-center justify-center p-1 border border-white/5 relative shrink-0">
                      <div
                        className="w-full h-full rounded-[2px]"
                        style={{ backgroundColor: item.fragrance.capColor }}
                      />
                      {/* Floating volume indicator */}
                      <span className="absolute bottom-0 right-0 bg-neutral-950/80 text-[8px] px-1 rounded font-mono text-white scale-90">
                        {item.fragrance.volume}
                      </span>
                    </div>

                    {/* Meta Info */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] tracking-wider text-[#C9A35A] uppercase font-bold">
                        {item.fragrance.family}
                      </span>
                      <h4 className="font-serif italic font-bold text-sm tracking-wide truncate uppercase leading-tight">
                        {item.fragrance.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs font-serif font-extrabold text-[#C9A35A]">
                          ₹{item.fragrance.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] opacity-60">• 100ml Eau de Parfum</span>
                      </div>
                    </div>

                    {/* Actions and Quantity Adjustment */}
                    <div className="flex flex-col items-end justify-between gap-2.5 shrink-0">
                      <button
                        onClick={() => onRemoveItem(item.fragrance.id)}
                        className="p-1 rounded text-neutral-400 hover:text-red-500 transition-colors"
                        title="Remove product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg p-0.5 border border-neutral-200 dark:border-neutral-800">
                        <button
                          onClick={() => onUpdateQuantity(item.fragrance.id, item.quantity - 1)}
                          className="p-1 rounded text-neutral-500 hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1.5 w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.fragrance.id, item.quantity + 1)}
                          className="p-1 rounded text-neutral-500 hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer - Summary and Checkout Trigger */}
            {cartItems.length > 0 && (
              <div className={`p-5 border-t space-y-4 ${
                theme === 'dark' ? 'border-[#C9A35A]/10 bg-[#142042]' : 'border-[#D8CDBA]/60 bg-white'
              }`}>
                {/* Summary lines */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between opacity-80">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between opacity-80">
                    <span>Eco Shipping (Certified Carbon Neutral):</span>
                    <span className="text-emerald-500 font-semibold tracking-wide uppercase">FREE</span>
                  </div>
                  <div className="w-full h-[1px] bg-neutral-200 dark:bg-neutral-800 my-1" />
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="font-serif italic font-bold">Total Amount:</span>
                    <span className="font-serif text-[#C9A35A] font-extrabold text-base">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Assurance note */}
                <div className="flex items-center gap-2 p-2 bg-emerald-500/5 rounded border border-emerald-500/10 text-[10px] leading-relaxed text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Secure Arvaiya direct checkout with encrypted checkout portals.</span>
                </div>

                {/* Primary CTA */}
                <button
                  onClick={onCheckout}
                  className="w-full py-3 rounded-xl bg-[#C9A35A] hover:bg-[#1F2F5C] hover:text-white text-white font-serif italic text-sm font-bold tracking-widest uppercase transition-all shadow-lg shadow-amber-500/10 active:scale-95 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Proceed to Checkout
                </button>
              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
