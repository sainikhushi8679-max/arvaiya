import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Truck, CheckCircle2, Package, Clock, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  theme: 'light' | 'dark';
}

export default function OrderTrackerModal({
  isOpen,
  onClose,
  orders,
  theme,
}: OrderTrackerModalProps) {
  const [searchId, setSearchId] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [searchError, setSearchError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearchedOrder(null);

    if (!searchId.trim()) return;

    const trimmedId = searchId.trim().toUpperCase();
    const found = orders.find((o) => o.id.toUpperCase() === trimmedId);

    if (found) {
      setSearchedOrder(found);
    } else {
      setSearchError('No order found with this ID. Please check and try again.');
    }
  };

  // Quick select an order from session memory
  const handleQuickSelect = (order: Order) => {
    setSearchedOrder(order);
    setSearchId(order.id);
    setSearchError('');
  };

  const getStatusSteps = (status: 'Pending' | 'Shipped' | 'Delivered') => {
    const steps = [
      {
        title: 'Order Placed & Paid',
        desc: 'UPI payment verified. Hand-bottling initiated.',
        icon: Clock,
        completed: true,
        active: status === 'Pending',
      },
      {
        title: 'Dispatched via Eco-Courier',
        desc: 'Carbon-neutral air transport in progress.',
        icon: Truck,
        completed: status === 'Shipped' || status === 'Delivered',
        active: status === 'Shipped',
      },
      {
        title: 'Delivered',
        desc: 'Scent safely delivered with custom botanical card.',
        icon: CheckCircle2,
        completed: status === 'Delivered',
        active: status === 'Delivered',
      },
    ];
    return steps;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className={`relative w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl z-10 border flex flex-col ${
              theme === 'dark' ? 'bg-[#142042] border-[#C9A35A]/20 text-neutral-100' : 'bg-[#F8F5EE] border-[#D8CDBA] text-[#222222]'
            }`}
          >
            {/* Header */}
            <div className={`p-6 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-[#C9A35A]/10' : 'border-[#D8CDBA]/60'
            }`}>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#C9A35A]" />
                <h3 className="font-serif italic text-lg font-bold">Luxury Scent Shipment Tracker</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-neutral-100/10 dark:hover:bg-neutral-900/40 transition-colors"
              >
                <X className="w-4 h-4 text-neutral-400 hover:text-[#C9A35A]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* Form Input for search */}
              <form onSubmit={handleSearch} className="space-y-3">
                <label className="text-[10px] tracking-wider font-bold uppercase opacity-65 block">
                  Search by Order Transaction ID
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="e.g. ARV-102943"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      className={`w-full p-3 pl-10 rounded-xl text-xs font-mono outline-none border transition-all ${
                        theme === 'dark'
                          ? 'bg-neutral-950 border-neutral-900 text-white focus:border-[#C9A35A]/50'
                          : 'bg-white border-[#D8CDBA]/60 text-neutral-900 focus:border-[#C9A35A]/50'
                      }`}
                    />
                    <Search className="w-4 h-4 absolute left-3 top-3.5 text-neutral-400" />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-[#C9A35A] hover:bg-[#1F2F5C] hover:text-white text-white text-xs font-bold uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-amber-500/10"
                  >
                    Track
                  </button>
                </div>
                {searchError && (
                  <p className="text-[11px] text-rose-400 font-medium">{searchError}</p>
                )}
              </form>

              {/* Quick Session Orders (if available) */}
              {orders.length > 0 && !searchedOrder && (
                <div className="space-y-2">
                  <span className="text-[10px] tracking-widest font-extrabold uppercase opacity-65 block">
                    Recent Orders (Active Session)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {orders.slice(0, 4).map((o) => (
                      <button
                        key={o.id}
                        onClick={() => handleQuickSelect(o)}
                        className={`p-3 rounded-xl text-left border transition-all text-xs flex justify-between items-center ${
                          theme === 'dark'
                            ? 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                            : 'bg-neutral-50/50 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <div>
                          <p className="font-mono font-bold text-[#C9A35A]">{o.id}</p>
                          <p className="text-[10px] opacity-60 truncate max-w-[120px]">{o.customerName}</p>
                        </div>
                        <span className={`text-[8px] tracking-wider px-2 py-0.5 rounded font-extrabold uppercase ${
                          o.status === 'Delivered'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : o.status === 'Shipped'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-[#C9A35A]/10 text-[#C9A35A]'
                        }`}>
                          {o.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Track Status Section */}
              {searchedOrder ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Status Summary Banner */}
                  <div className={`p-4 rounded-2xl border ${
                    theme === 'dark' ? 'bg-neutral-900/40 border-neutral-800' : 'bg-neutral-50/50 border-neutral-200'
                  } flex items-center justify-between`}>
                    <div>
                      <span className="text-[9px] font-mono opacity-50 block uppercase">Tracking ID: {searchedOrder.id}</span>
                      <h4 className="font-serif italic font-bold text-base mt-0.5">
                        Status: <span className="text-[#C9A35A] font-sans not-italic font-extrabold uppercase ml-1">{searchedOrder.status}</span>
                      </h4>
                      <p className="text-[10px] opacity-70 mt-1">Placed on {searchedOrder.date}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono opacity-50 block uppercase">Payment Method</span>
                      <span className="text-[10px] text-emerald-500 font-bold tracking-wider uppercase block mt-0.5 flex items-center gap-1 justify-end">
                        <ShieldCheck className="w-3.5 h-3.5" /> UPI Paid
                      </span>
                      {searchedOrder.upiId && (
                        <span className="text-[9px] font-mono text-neutral-400 block mt-0.5">{searchedOrder.upiId}</span>
                      )}
                    </div>
                  </div>

                  {/* Delivery Timeline Progress */}
                  <div className="relative pl-6 space-y-6 border-l border-neutral-200 dark:border-neutral-800 ml-4 py-2">
                    {getStatusSteps(searchedOrder.status).map((step, idx) => {
                      const IconComponent = step.icon;
                      return (
                        <div key={idx} className="relative">
                          {/* Circle Icon Indicator */}
                          <div className={`absolute -left-10 top-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                            step.active
                              ? 'bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-950/20'
                              : step.completed
                                ? 'bg-emerald-600/15 border-emerald-500 text-emerald-400'
                                : theme === 'dark' ? 'bg-neutral-950 border-neutral-800 text-neutral-500' : 'bg-neutral-100 border-neutral-200 text-neutral-400'
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>

                          <div className="pl-4">
                            <h5 className={`font-serif text-sm font-bold tracking-wide ${
                              step.active ? 'text-teal-400' : step.completed ? 'text-neutral-200 dark:text-neutral-100' : 'opacity-40'
                            }`}>
                              {step.title}
                            </h5>
                            <p className="text-[11px] opacity-60 leading-relaxed mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Shipment Recipient details */}
                  <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
                    theme === 'dark' ? 'bg-neutral-900/40 border-neutral-800' : 'bg-neutral-50/50 border-neutral-200'
                  }`}>
                    <div className="flex justify-between border-b border-[#D8CDBA]/10 pb-1.5 mb-1.5">
                      <span className="font-serif italic font-bold text-[#C9A35A] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Destination Address
                      </span>
                      <span className="opacity-50 font-mono text-[9px]">Carbon Neutral Eco-Delivery</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="opacity-50 text-[10px] block">Customer Name</span>
                        <span className="font-semibold">{searchedOrder.customerName}</span>
                      </div>
                      <div>
                        <span className="opacity-50 text-[10px] block">Contact Email</span>
                        <span className="font-semibold truncate block">{searchedOrder.customerEmail}</span>
                      </div>
                    </div>
                    <div>
                      <span className="opacity-50 text-[10px] block">Shipping Address</span>
                      <span className="font-medium">{searchedOrder.address}, {searchedOrder.city}</span>
                    </div>
                  </div>

                  {/* Ordered details summary inside track */}
                  <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
                    theme === 'dark' ? 'bg-neutral-900/40 border-neutral-800' : 'bg-neutral-50/50 border-neutral-200'
                  }`}>
                    <span className="font-serif italic font-bold text-[#C9A35A] block">Package Contents</span>
                    <div className="space-y-1.5">
                      {searchedOrder.items.map((it) => (
                        <div key={it.id} className="flex justify-between items-center">
                          <span>{it.name} <span className="opacity-50">x{it.quantity}</span></span>
                          <span className="font-bold">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-[#D8CDBA]/10 pt-2 flex justify-between font-bold text-sm">
                      <span className="font-serif text-[#C9A35A]">Paid Grand Total:</span>
                      <span className="text-[#C9A35A]">₹{searchedOrder.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 p-2 bg-[#C9A35A]/5 rounded-xl border border-[#C9A35A]/10 text-[10px] text-[#C9A35A] font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Your order is packed in local, certified sustainable organic wooden boxes!</span>
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => {
                        setSearchedOrder(null);
                        setSearchId('');
                      }}
                      className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-[10px] tracking-wider uppercase font-bold text-neutral-400 transition-all"
                    >
                      Search Another Order
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-10 opacity-60 space-y-2">
                  <Package className="w-12 h-12 text-neutral-400 mx-auto" />
                  <p className="font-serif italic text-sm">Enter your Order ID above to track live shipping</p>
                  <p className="text-[10px] max-w-xs mx-auto">
                    The Order ID can be copied from the final checkout confirmation window.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
