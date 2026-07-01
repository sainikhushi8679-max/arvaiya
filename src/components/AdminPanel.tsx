import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, DollarSign, ShoppingBag, Users, Edit3, Plus, Trash2, Check, RefreshCw, Lock, Unlock, User, Key, AlertCircle, LogOut } from 'lucide-react';
import { Order, Fragrance } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: 'Pending' | 'Shipped' | 'Delivered') => void;
  fragrances: Fragrance[];
  onAddFragrance: (fragrance: Fragrance) => void;
  onUpdateFragrance: (fragrance: Fragrance) => void;
  onDeleteFragrance: (id: string) => void;
  theme: 'light' | 'dark';
}

export default function AdminPanel({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
  fragrances,
  onAddFragrance,
  onUpdateFragrance,
  onDeleteFragrance,
  theme,
}: AdminPanelProps) {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim().toLowerCase() === 'admin' && passwordInput === 'admin') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid Login ID or Password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsernameInput('');
    setPasswordInput('');
    setLoginError('');
  };

  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'inventory'>('analytics');
  
  // Inventory state
  const [editingFragrance, setEditingFragrance] = useState<Fragrance | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form Fields
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formFamily, setFormFamily] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formIntensity, setFormIntensity] = useState(4);
  const [formLiquid, setFormLiquid] = useState('rgba(244, 63, 94, 0.4)');
  const [formCap, setFormCap] = useState('rgba(251, 113, 133, 0.75)');
  const [formDesc, setFormDesc] = useState('');
  const [formVibe, setFormVibe] = useState('');
  const [formPrice, setFormPrice] = useState(3999);

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const uniqueUsers = Array.from(new Set(orders.map((o) => o.customerEmail))).length;
  const averageSpent = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Most popular fragrance family
  const familyCount: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const match = fragrances.find((f) => f.id === item.id);
      if (match) {
        familyCount[match.family] = (familyCount[match.family] || 0) + item.quantity;
      }
    });
  });
  const bestSellingFamily = Object.keys(familyCount).sort((a, b) => familyCount[b] - familyCount[a])[0] || 'Floral';

  const handleEditClick = (f: Fragrance) => {
    setEditingFragrance(f);
    setIsAddingNew(false);
    setFormId(f.id);
    setFormName(f.name);
    setFormFamily(f.family);
    setFormNotes(f.notes.join(', '));
    setFormIntensity(f.intensity);
    setFormLiquid(f.liquidColor);
    setFormCap(f.capColor);
    setFormDesc(f.description);
    setFormVibe(f.vibe);
    setFormPrice(f.price);
  };

  const handleAddNewClick = () => {
    setEditingFragrance(null);
    setIsAddingNew(true);
    setFormId('perfume-' + Math.floor(Math.random() * 1000));
    setFormName('');
    setFormFamily('Floral');
    setFormNotes('Rose, Jasmine, Saffron');
    setFormIntensity(4);
    setFormLiquid('rgba(245, 158, 11, 0.4)');
    setFormCap('rgba(251, 191, 36, 0.8)');
    setFormDesc('');
    setFormVibe('Elegant, clean, luxurious.');
    setFormPrice(3499);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const notesArray = formNotes.split(',').map((n) => n.trim()).filter((n) => n.length > 0);

    const updatedFragrance: Fragrance = {
      id: formId,
      name: formName.toUpperCase(),
      family: formFamily.toUpperCase(),
      notes: notesArray,
      intensity: formIntensity,
      liquidColor: formLiquid,
      capColor: formCap,
      textColor: 'text-neutral-100',
      labelBg: 'bg-white/90',
      description: formDesc,
      vibe: formVibe,
      price: formPrice,
      volume: '100 ml',
    };

    if (isAddingNew) {
      onAddFragrance(updatedFragrance);
      setIsAddingNew(false);
    } else if (editingFragrance) {
      onUpdateFragrance(updatedFragrance);
      setEditingFragrance(null);
    }
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

          {/* Dialog Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className={`relative w-full ${isLoggedIn ? 'max-w-5xl' : 'max-w-md'} rounded-3xl overflow-hidden shadow-2xl z-10 border transition-all duration-300 ${
              theme === 'dark' ? 'bg-[#142042] border-[#C9A35A]/20 text-neutral-100' : 'bg-[#F8F5EE] border-[#D8CDBA] text-[#222222]'
            }`}
          >
            {/* Header */}
            <div className={`p-6 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-[#C9A35A]/10' : 'border-[#D8CDBA]/60'
            }`}>
              <div className="flex items-center gap-2.5">
                {isLoggedIn ? (
                  <Unlock className="w-5 h-5 text-[#C9A35A]" />
                ) : (
                  <Lock className="w-5 h-5 text-[#C9A35A]" />
                )}
                <div>
                  <h3 className="font-serif italic text-xl font-bold">Arvaiya Boutique Administrator</h3>
                  <p className="text-[10px] tracking-wider text-neutral-400 font-semibold uppercase">
                    {isLoggedIn ? 'Manage Scent Inventory, Orders & Real-time Analytics' : 'Authorized Access Security Gate'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    title="Lock Console"
                    className="p-1.5 rounded-full bg-[#C9A35A]/15 hover:bg-[#C9A35A]/30 text-[#C9A35A] transition-all flex items-center gap-1.5 text-[9px] font-bold tracking-wider uppercase px-3 py-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Log Out</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-neutral-100/10 dark:hover:bg-neutral-900/40 transition-colors"
                >
                  <X className="w-4 h-4 text-neutral-400 hover:text-[#C9A35A]" />
                </button>
              </div>
            </div>

            {!isLoggedIn ? (
              /* --- BEAUTIFUL ORGANIC ACCESS GATE --- */
              <div className="p-6 md:p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-[#C9A35A]/10 border border-[#C9A35A]/20 flex items-center justify-center text-[#C9A35A]">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif italic text-lg font-bold">Sign In Required</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                    Access to the administrative control panel, active session orders, and olfactory inventory is restricted to authorized partners.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* ID Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider font-extrabold uppercase text-[#C9A35A] block">
                      Admin Login ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Enter Admin ID"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        className={`w-full p-3 pl-10 rounded-xl text-xs font-mono outline-none border transition-all ${
                          theme === 'dark'
                            ? 'bg-neutral-950 border-[#D8CDBA]/10 text-white focus:border-[#C9A35A]/50'
                            : 'bg-white border-[#D8CDBA]/60 text-neutral-900 focus:border-[#C9A35A]/50'
                        }`}
                      />
                      <User className="w-4 h-4 absolute left-3 top-3.5 text-neutral-400" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider font-extrabold uppercase text-[#C9A35A] block">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className={`w-full p-3 pl-10 rounded-xl text-xs font-mono outline-none border transition-all ${
                          theme === 'dark'
                            ? 'bg-neutral-950 border-[#D8CDBA]/10 text-white focus:border-[#C9A35A]/50'
                            : 'bg-white border-[#D8CDBA]/60 text-neutral-900 focus:border-[#C9A35A]/50'
                        }`}
                      />
                      <Key className="w-4 h-4 absolute left-3 top-3.5 text-neutral-400" />
                    </div>
                  </div>

                  {/* Error Alert */}
                  <AnimatePresence>
                    {loginError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-500 text-[10px] font-semibold"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{loginError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#C9A35A] hover:bg-[#1F2F5C] hover:text-white text-white font-serif italic text-xs font-bold tracking-widest uppercase transition-all shadow-lg shadow-amber-500/10 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Unlock className="w-4 h-4" />
                    Authenticate Access
                  </button>
                </form>

                {/* Secure helpful credential tip as requested by both Hindi/English queries */}
                <div className={`p-3 rounded-xl border text-center space-y-1 ${
                  theme === 'dark' ? 'bg-[#1F2F5C]/20 border-[#C9A35A]/10' : 'bg-[#EFE6D3]/35 border-[#D8CDBA]/60'
                }`}>
                  <span className="text-[9px] tracking-wider font-extrabold text-[#C9A35A] uppercase block">
                    🔐 Administrative Credentials
                  </span>
                  <div className="flex justify-center items-center gap-3 text-[10px] font-mono text-neutral-400">
                    <div>
                      ID: <span className="text-[#C9A35A] font-bold">admin</span>
                    </div>
                    <div className="w-[1px] h-3 bg-neutral-300 dark:bg-neutral-800" />
                    <div>
                      Password: <span className="text-[#C9A35A] font-bold">admin</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Navigation Tabs Bar */}
                <div className={`px-6 py-2 border-b flex gap-1 ${
                  theme === 'dark' ? 'border-[#C9A35A]/10 bg-neutral-950/20' : 'border-[#D8CDBA]/60 bg-[#EFE6D3]/10'
                }`}>
                  {[
                    { id: 'analytics', label: '📊 Metrics & Analytics' },
                    { id: 'orders', label: `📦 Session Orders (${orders.length})` },
                    { id: 'inventory', label: '🧪 Scent Catalog CRUD' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        activeTab === tab.id
                          ? 'bg-[#C9A35A] text-white shadow'
                          : 'text-neutral-400 hover:text-[#C9A35A]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content Container */}
                <div className="p-6 h-[500px] overflow-y-auto">
              
              {/* === TAB 1: ANALYTICS === */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stat Card 1 */}
                    <div className={`p-4 rounded-2xl border ${
                      theme === 'dark' ? 'bg-neutral-950 border-neutral-900' : 'bg-neutral-50 border-neutral-100'
                    }`}>
                      <div className="flex items-center justify-between opacity-70 mb-1">
                        <span className="text-[10px] tracking-wider font-extrabold uppercase">Total Earnings</span>
                        <DollarSign className="w-4 h-4 text-amber-500" />
                      </div>
                      <h4 className="font-serif text-2xl font-extrabold text-amber-500">₹{totalRevenue.toLocaleString('en-IN')}</h4>
                      <span className="text-[9px] text-emerald-500 font-semibold uppercase flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" /> Live transactions
                      </span>
                    </div>

                    {/* Stat Card 2 */}
                    <div className={`p-4 rounded-2xl border ${
                      theme === 'dark' ? 'bg-neutral-950 border-neutral-900' : 'bg-neutral-50 border-neutral-100'
                    }`}>
                      <div className="flex items-center justify-between opacity-70 mb-1">
                        <span className="text-[10px] tracking-wider font-extrabold uppercase">Total Orders</span>
                        <ShoppingBag className="w-4 h-4 text-amber-500" />
                      </div>
                      <h4 className="font-serif text-2xl font-extrabold">{totalOrders}</h4>
                      <span className="text-[9px] text-neutral-400">Placed in current session</span>
                    </div>

                    {/* Stat Card 3 */}
                    <div className={`p-4 rounded-2xl border ${
                      theme === 'dark' ? 'bg-neutral-950 border-neutral-900' : 'bg-neutral-50 border-neutral-100'
                    }`}>
                      <div className="flex items-center justify-between opacity-70 mb-1">
                        <span className="text-[10px] tracking-wider font-extrabold uppercase">Unique Customers</span>
                        <Users className="w-4 h-4 text-amber-500" />
                      </div>
                      <h4 className="font-serif text-2xl font-extrabold">{uniqueUsers}</h4>
                      <span className="text-[9px] text-neutral-400">Unique emails tracked</span>
                    </div>

                    {/* Stat Card 4 */}
                    <div className={`p-4 rounded-2xl border ${
                      theme === 'dark' ? 'bg-neutral-950 border-neutral-900' : 'bg-neutral-50 border-neutral-100'
                    }`}>
                      <div className="flex items-center justify-between opacity-70 mb-1">
                        <span className="text-[10px] tracking-wider font-extrabold uppercase">Average Value</span>
                        <DollarSign className="w-4 h-4 text-amber-500" />
                      </div>
                      <h4 className="font-serif text-2xl font-extrabold text-amber-500">₹{averageSpent.toLocaleString('en-IN')}</h4>
                      <span className="text-[9px] text-neutral-400 font-semibold uppercase">Per shopping bag</span>
                    </div>
                  </div>

                  {/* Scent Statistics Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Olfactory Distribution Chart */}
                    <div className={`p-5 rounded-2xl border ${
                      theme === 'dark' ? 'bg-neutral-950 border-neutral-900' : 'bg-neutral-50 border-neutral-100'
                    }`}>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-4 opacity-80">Olfactory Family Preference</h4>
                      {orders.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-xs opacity-50 italic">No checkout transactions to display stats.</div>
                      ) : (
                        <div className="space-y-3">
                          {Object.entries(familyCount).map(([family, count]) => {
                            const total = Object.values(familyCount).reduce((a, b) => a + b, 0);
                            const percent = Math.round((count / total) * 100);
                            return (
                              <div key={family} className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold">
                                  <span>{family}</span>
                                  <span>{count} bottles ({percent}%)</span>
                                </div>
                                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Quick Analytics & Best Selling Scent Card */}
                    <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
                      theme === 'dark' ? 'bg-neutral-950 border-neutral-900' : 'bg-neutral-50 border-neutral-100'
                    }`}>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-80">Premium Brand Analytics</h4>
                        <div className="space-y-3 text-xs leading-relaxed">
                          <p>⭐ **Top Olfactory Direction**: <span className="text-amber-500 font-bold">{bestSellingFamily}</span>. Fresh organic extracts of this class represent highest demand.</p>
                          <p>🌿 **Eco-Certificate Compliance**: **100%** of packaging utilized is verified biodegradable, hand-dried with botanicals.</p>
                          <p>🔗 **AI Precision Factor**: Scent library synchronization is completed. Over 98% of users satisfied with tailored profiles.</p>
                        </div>
                      </div>
                      <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[10px] italic text-amber-500 mt-4 text-center">
                        "Your administrative session is secure. Scent data modifications propagate in real-time."
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 2: SESSION ORDERS === */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-16 opacity-60">
                      <ShoppingBag className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                      <p className="font-serif italic text-sm">No orders recorded in this session yet.</p>
                      <p className="text-[11px] max-w-sm mx-auto mt-1">Complete a checkout transaction in the boutique catalog to see simulated deliveries populate here.</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order.id}
                        className={`p-4 rounded-2xl border space-y-3.5 ${
                          theme === 'dark' ? 'bg-neutral-950 border-neutral-900' : 'bg-neutral-50 border-neutral-100'
                        }`}
                      >
                        {/* Order Meta Info */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-neutral-200 dark:border-neutral-900 pb-2.5">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-bold text-amber-500 text-xs">{order.id}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-widest ${
                                order.status === 'Delivered'
                                  ? 'bg-emerald-600/15 text-emerald-500'
                                  : order.status === 'Shipped'
                                    ? 'bg-blue-600/15 text-blue-400'
                                    : 'bg-amber-600/15 text-amber-500'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <span className="text-[9px] opacity-60">{order.date}</span>
                          </div>

                          {/* Quick Actions to update delivery state */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-semibold opacity-60 uppercase">Mark Delivery:</span>
                            <div className="flex gap-1">
                              {(['Pending', 'Shipped', 'Delivered'] as const).map((st) => (
                                <button
                                  key={st}
                                  onClick={() => onUpdateOrderStatus(order.id, st)}
                                  className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase transition-all ${
                                    order.status === st
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Customer & Items Split */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {/* Left Customer Column */}
                          <div className="space-y-1 border-r border-neutral-200 dark:border-neutral-900 pr-4 flex flex-col justify-between">
                            <div>
                              <h5 className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Recipient Details</h5>
                              <p className="font-bold">{order.customerName}</p>
                              <p className="opacity-70">{order.customerEmail}</p>
                              <p className="opacity-80 leading-relaxed italic">{order.address}, {order.city}</p>
                            </div>

                            {/* Scent Boutique Owner Payment Audit Details */}
                            <div className="pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-900/60 space-y-1 text-[11px]">
                              <h5 className="text-[9px] font-bold uppercase tracking-wider text-teal-500">Boutique Payment Audit</h5>
                              <div className="flex justify-between">
                                <span className="opacity-60">Method:</span>
                                <span className="font-semibold">{order.upiId ? 'UPI Payment' : 'Card Payment'}</span>
                              </div>
                              {order.upiId && (
                                <div className="flex justify-between">
                                  <span className="opacity-60">Sender VPA:</span>
                                  <span className="font-mono text-amber-500 font-bold">{order.upiId}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className="opacity-60">Settlement:</span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide ${
                                  order.paymentStatus === 'Paid'
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : 'bg-amber-500/15 text-amber-400'
                                }`}>
                                  {order.paymentStatus || 'Pending'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Items Column */}
                          <div className="space-y-1">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Ordered Essences</h5>
                            <div className="space-y-1 max-h-[80px] overflow-y-auto">
                              {order.items.map((it) => (
                                <div key={it.id} className="flex justify-between items-center pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: it.liquidColor }} />
                                    <span>{it.name} (x{it.quantity})</span>
                                  </div>
                                  <span className="font-semibold text-neutral-400">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                                </div>
                              ))}
                            </div>
                            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-900 flex justify-between font-bold text-sm">
                              <span>Total Amount:</span>
                              <span className="text-amber-500">₹{order.total.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* === TAB 3: INVENTORY EDITOR === */}
              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  {/* Top Bar triggers adding state */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider opacity-80">Inventory Scent Library ({fragrances.length} Perfumes)</h4>
                    <button
                      onClick={handleAddNewClick}
                      className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-serif italic text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 shadow active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Creation
                    </button>
                  </div>

                  {/* Split Layout: Form on Left (if open), Grid list on Right */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Add/Edit Form panel */}
                    {(editingFragrance || isAddingNew) && (
                      <div className={`col-span-1 lg:col-span-5 p-5 rounded-2xl border space-y-4 ${
                        theme === 'dark' ? 'bg-neutral-950 border-neutral-900' : 'bg-neutral-50 border-neutral-100 shadow-md'
                      }`}>
                        <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-900 pb-2">
                          <h5 className="font-serif italic font-bold text-sm text-amber-500">
                            {isAddingNew ? 'Blend New Perfume' : `Refine: ${editingFragrance?.name}`}
                          </h5>
                          <button
                            onClick={() => {
                              setEditingFragrance(null);
                              setIsAddingNew(false);
                            }}
                            className="p-1 rounded hover:bg-neutral-800 transition-colors"
                          >
                            <X className="w-3.5 h-3.5 text-neutral-400" />
                          </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                          {/* Name field */}
                          <div className="grid grid-cols-1 gap-1">
                            <label className="text-[9px] font-semibold opacity-60 uppercase">Fragrance Name</label>
                            <input
                              required
                              type="text"
                              value={formName}
                              onChange={(e) => setFormName(e.target.value)}
                              placeholder="e.g. WOOD ROYAL"
                              className={`p-2 rounded-lg outline-none border transition-all ${
                                theme === 'dark' ? 'bg-neutral-950 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-950'
                              }`}
                            />
                          </div>

                          {/* Family & Price */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid grid-cols-1 gap-1">
                              <label className="text-[9px] font-semibold opacity-60 uppercase">Scent Family</label>
                              <select
                                value={formFamily}
                                onChange={(e) => setFormFamily(e.target.value)}
                                className={`p-2 rounded-lg outline-none border transition-all ${
                                  theme === 'dark' ? 'bg-neutral-950 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-950'
                                }`}
                              >
                                <option value="Floral">FLORAL</option>
                                <option value="Floral Aromatic">FLORAL AROMATIC</option>
                                <option value="Oriental Floral">ORIENTAL FLORAL</option>
                                <option value="Amber Oriental">AMBER ORIENTAL</option>
                                <option value="Powdery Floral">POWDERY FLORAL</option>
                                <option value="Woody Oriental">WOODY ORIENTAL</option>
                                <option value="Citrus Aquatic">CITRUS AQUATIC</option>
                                <option value="Green Floral">GREEN FLORAL</option>
                                <option value="Gourmand">GOURMAND</option>
                                <option value="Aromatic Woody">AROMATIC WOODY</option>
                                <option value="Fruity Floral">FRUITY FLORAL</option>
                                <option value="Spicy Oriental">SPICY ORIENTAL</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-1 gap-1">
                              <label className="text-[9px] font-semibold opacity-60 uppercase">Price (₹)</label>
                              <input
                                required
                                type="number"
                                value={formPrice}
                                onChange={(e) => setFormPrice(parseInt(e.target.value))}
                                className={`p-2 rounded-lg outline-none border transition-all ${
                                  theme === 'dark' ? 'bg-neutral-950 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-950'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Notes comma-separated */}
                          <div className="grid grid-cols-1 gap-1">
                            <label className="text-[9px] font-semibold opacity-60 uppercase">Notes (comma separated)</label>
                            <input
                              required
                              type="text"
                              value={formNotes}
                              onChange={(e) => setFormNotes(e.target.value)}
                              placeholder="e.g. Saffron, Rose, Leather, Oud, Amber"
                              className={`p-2 rounded-lg outline-none border transition-all ${
                                theme === 'dark' ? 'bg-neutral-950 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-950'
                              }`}
                            />
                          </div>

                          {/* Intensity (1 to 5) */}
                          <div className="grid grid-cols-1 gap-1">
                            <label className="text-[9px] font-semibold opacity-60 uppercase">Intensity Scale: {formIntensity} / 5</label>
                            <input
                              type="range"
                              min="3"
                              max="5"
                              value={formIntensity}
                              onChange={(e) => setFormIntensity(parseInt(e.target.value))}
                              className="w-full accent-amber-500"
                            />
                          </div>

                          {/* Color Customizations */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid grid-cols-1 gap-1">
                              <label className="text-[9px] font-semibold opacity-60 uppercase">Liquid Color Swatch</label>
                              <input
                                type="text"
                                value={formLiquid}
                                onChange={(e) => setFormLiquid(e.target.value)}
                                className={`p-2 rounded-lg outline-none border font-mono ${
                                  theme === 'dark' ? 'bg-neutral-950 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-950'
                                }`}
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                              <label className="text-[9px] font-semibold opacity-60 uppercase">Cap Color Swatch</label>
                              <input
                                type="text"
                                value={formCap}
                                onChange={(e) => setFormCap(e.target.value)}
                                className={`p-2 rounded-lg outline-none border font-mono ${
                                  theme === 'dark' ? 'bg-neutral-950 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-950'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Description */}
                          <div className="grid grid-cols-1 gap-1">
                            <label className="text-[9px] font-semibold opacity-60 uppercase">Description</label>
                            <textarea
                              required
                              rows={2}
                              value={formDesc}
                              onChange={(e) => setFormDesc(e.target.value)}
                              placeholder="Describe the notes layering..."
                              className={`p-2 rounded-lg outline-none border transition-all resize-none ${
                                theme === 'dark' ? 'bg-neutral-950 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-950'
                              }`}
                            />
                          </div>

                          {/* Scent Vibe */}
                          <div className="grid grid-cols-1 gap-1">
                            <label className="text-[9px] font-semibold opacity-60 uppercase">Olfactory Vibe</label>
                            <input
                              required
                              type="text"
                              value={formVibe}
                              onChange={(e) => setFormVibe(e.target.value)}
                              placeholder="e.g. Royal, opulent, and majestic."
                              className={`p-2 rounded-lg outline-none border transition-all ${
                                theme === 'dark' ? 'bg-neutral-950 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-950'
                              }`}
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-serif font-bold tracking-widest uppercase transition-all shadow"
                          >
                            {isAddingNew ? 'Blend Scent into Catalog' : 'Save Scent Refinements'}
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Scent Grid List */}
                    <div className={`${(editingFragrance || isAddingNew) ? 'col-span-1 lg:col-span-7' : 'col-span-12'} grid grid-cols-1 sm:grid-cols-2 gap-3.5`}>
                      {fragrances.map((f) => (
                        <div
                          key={f.id}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                            theme === 'dark' ? 'bg-neutral-950 border-neutral-900' : 'bg-neutral-50 border-neutral-100 shadow-sm'
                          }`}
                        >
                          {/* Left mini details */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded bg-black/10 flex items-center justify-center p-1 shrink-0 border border-white/5">
                              <div className="w-full h-full rounded-[1px]" style={{ backgroundColor: f.capColor }} />
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-serif italic font-bold uppercase truncate text-xs leading-none">{f.name}</h5>
                              <span className="text-[8px] tracking-wider text-amber-500 font-extrabold uppercase block mt-1">{f.family}</span>
                              <span className="text-[9px] font-bold text-neutral-400">₹{f.price.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          {/* Right edit controls */}
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => handleEditClick(f)}
                              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 text-neutral-300 transition-colors"
                              title="Edit perfume details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to retire ${f.name} from the Arvaiya library?`)) {
                                  onDeleteFragrance(f.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-red-500/30 text-neutral-400 hover:text-red-500 transition-colors"
                              title="Retire perfume"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
}
