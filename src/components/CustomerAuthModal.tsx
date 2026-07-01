import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Unlock, Mail, User, Eye, EyeOff, ShoppingBag, Award, Shield, UserCheck, Key, History } from 'lucide-react';
import { Order } from '../types';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (customer: { name: string; email: string }) => void;
  onLogout: () => void;
  currentCustomer: { name: string; email: string } | null;
  orders: Order[];
  theme: 'light' | 'dark';
}

export default function CustomerAuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onLogout,
  currentCustomer,
  orders,
  theme,
}: CustomerAuthModalProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'account'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto switch mode to 'account' if already logged in
  useEffect(() => {
    if (currentCustomer) {
      setAuthMode('account');
    } else if (authMode === 'account') {
      setAuthMode('signin');
    }
  }, [currentCustomer]);

  // Clean inputs on toggle
  const switchMode = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Handle Sign In submission
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const storedUsersJson = localStorage.getItem('arvaiya_registered_customers');
    const users = storedUsersJson ? JSON.parse(storedUsersJson) : [];

    // Find user
    const user = users.find(
      (u: any) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) {
      setErrorMsg('No account found with this email address.');
      return;
    }

    if (user.password !== password) {
      setErrorMsg('Incorrect password. Please try again.');
      return;
    }

    // Success login
    onLoginSuccess({ name: user.name, email: user.email });
    setSuccessMsg(`Welcome back, ${user.name}!`);
    setTimeout(() => {
      onClose();
      // Clean up fields
      setEmail('');
      setPassword('');
      setSuccessMsg('');
    }, 1500);
  };

  // Handle Sign Up registration
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const storedUsersJson = localStorage.getItem('arvaiya_registered_customers');
    const users = storedUsersJson ? JSON.parse(storedUsersJson) : [];

    // Check if user already exists
    const userExists = users.some(
      (u: any) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (userExists) {
      setErrorMsg('An account with this email address already exists.');
      return;
    }

    // Create user
    const newUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      registeredAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('arvaiya_registered_customers', JSON.stringify(users));

    setSuccessMsg('Account registered successfully! Logging you in...');
    
    // Automatically log in
    setTimeout(() => {
      onLoginSuccess({ name: newUser.name, email: newUser.email });
      onClose();
      // Reset inputs
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSuccessMsg('');
    }, 1500);
  };

  // Filter orders by current customer email
  const customerOrders = currentCustomer
    ? orders.filter(o => o.customerEmail.toLowerCase() === currentCustomer.email.toLowerCase())
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 180 }}
            className={`relative w-full ${authMode === 'account' ? 'max-w-2xl' : 'max-w-md'} rounded-3xl overflow-hidden shadow-2xl z-10 border transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-[#142042] border-[#C9A35A]/20 text-neutral-100' 
                : 'bg-[#F8F5EE] border-[#D8CDBA] text-[#222222]'
            }`}
          >
            {/* Header */}
            <div className={`p-6 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-[#C9A35A]/10' : 'border-[#D8CDBA]/60'
            }`}>
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-[#C9A35A]" />
                <div>
                  <h3 className="font-serif italic text-lg font-bold">
                    {authMode === 'account' ? 'Your Eco-Luxury Lounge' : 'Arvaiya Customer Lounge'}
                  </h3>
                  <p className="text-[9px] tracking-wider text-[#C9A35A] font-extrabold uppercase">
                    {authMode === 'account' ? 'Personal Scent Record & Orders' : 'Certified Organic Perfumery'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-neutral-100/10 dark:hover:bg-neutral-900/40 transition-colors"
                id="close-customer-auth-modal"
              >
                <X className="w-4 h-4 text-neutral-400 hover:text-[#C9A35A]" />
              </button>
            </div>

            {/* Content Switcher */}
            <div className="p-6 md:p-8">
              {authMode === 'signin' && (
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <h4 className="font-serif italic text-base font-bold text-neutral-800 dark:text-white">Sign In to Your Account</h4>
                    <p className="text-[10px] text-neutral-400 font-sans max-w-xs mx-auto leading-relaxed">
                      Re-enter your private chamber to view orders and manage fragrance preferences.
                    </p>
                  </div>

                  <form onSubmit={handleSignInSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-1">
                      <label className="text-[9px] tracking-widest font-extrabold uppercase text-[#C9A35A] block">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="your.name@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full p-3 pl-10 rounded-xl text-xs outline-none border transition-all ${
                            theme === 'dark'
                              ? 'bg-neutral-950 border-[#D8CDBA]/10 text-white focus:border-[#C9A35A]/50'
                              : 'bg-white border-[#D8CDBA]/60 text-neutral-900 focus:border-[#C9A35A]/50'
                          }`}
                        />
                        <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#C9A35A]/60" />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] tracking-widest font-extrabold uppercase text-[#C9A35A] block">
                          Password
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full p-3 pl-10 pr-10 rounded-xl text-xs outline-none border transition-all ${
                            theme === 'dark'
                              ? 'bg-neutral-950 border-[#D8CDBA]/10 text-white focus:border-[#C9A35A]/50'
                              : 'bg-white border-[#D8CDBA]/60 text-neutral-900 focus:border-[#C9A35A]/50'
                          }`}
                        />
                        <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#C9A35A]/60" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-[#C9A35A] focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Message alerts */}
                    <AnimatePresence mode="wait">
                      {errorMsg && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-2.5 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-500 text-[10px] font-semibold"
                        >
                          {errorMsg}
                        </motion.div>
                      )}
                      {successMsg && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-2.5 rounded-xl border border-[#C9A35A]/10 bg-[#C9A35A]/5 text-[#C9A35A] text-[10px] font-semibold"
                        >
                          {successMsg}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-[#C9A35A] hover:bg-[#1F2F5C] hover:text-white text-white font-serif italic text-xs font-bold tracking-widest uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Unlock className="w-4 h-4" />
                      Enter Lounge
                    </button>
                  </form>

                  <div className="text-center pt-2">
                    <p className="text-[10px] text-neutral-400">
                      Don't have an Arvaiya profile yet?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className="text-[#C9A35A] font-extrabold hover:underline"
                      >
                        Register Now
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {authMode === 'signup' && (
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <h4 className="font-serif italic text-base font-bold text-neutral-800 dark:text-white">Register Scent Profile</h4>
                    <p className="text-[10px] text-neutral-400 font-sans max-w-xs mx-auto leading-relaxed">
                      Register with your password to track premium organic scent orders dynamically.
                    </p>
                  </div>

                  <form onSubmit={handleSignUpSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div className="space-y-1">
                      <label className="text-[9px] tracking-widest font-extrabold uppercase text-[#C9A35A] block">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Arjun Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`w-full p-3 pl-10 rounded-xl text-xs outline-none border transition-all ${
                            theme === 'dark'
                              ? 'bg-neutral-950 border-[#D8CDBA]/10 text-white focus:border-[#C9A35A]/50'
                              : 'bg-white border-[#D8CDBA]/60 text-neutral-900 focus:border-[#C9A35A]/50'
                          }`}
                        />
                        <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[#C9A35A]/60" />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1">
                      <label className="text-[9px] tracking-widest font-extrabold uppercase text-[#C9A35A] block">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="arjun.sharma@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full p-3 pl-10 rounded-xl text-xs outline-none border transition-all ${
                            theme === 'dark'
                              ? 'bg-neutral-950 border-[#D8CDBA]/10 text-white focus:border-[#C9A35A]/50'
                              : 'bg-white border-[#D8CDBA]/60 text-neutral-900 focus:border-[#C9A35A]/50'
                          }`}
                        />
                        <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#C9A35A]/60" />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                      <label className="text-[9px] tracking-widest font-extrabold uppercase text-[#C9A35A] block">
                        Choose Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full p-3 pl-10 pr-10 rounded-xl text-xs outline-none border transition-all ${
                            theme === 'dark'
                              ? 'bg-neutral-950 border-[#D8CDBA]/10 text-white focus:border-[#C9A35A]/50'
                              : 'bg-white border-[#D8CDBA]/60 text-neutral-900 focus:border-[#C9A35A]/50'
                          }`}
                        />
                        <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#C9A35A]/60" />
                      </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-1">
                      <label className="text-[9px] tracking-widest font-extrabold uppercase text-[#C9A35A] block">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Retype password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full p-3 pl-10 pr-10 rounded-xl text-xs outline-none border transition-all ${
                            theme === 'dark'
                              ? 'bg-neutral-950 border-[#D8CDBA]/10 text-white focus:border-[#C9A35A]/50'
                              : 'bg-white border-[#D8CDBA]/60 text-neutral-900 focus:border-[#C9A35A]/50'
                          }`}
                        />
                        <Key className="w-4 h-4 absolute left-3.5 top-3.5 text-[#C9A35A]/60" />
                      </div>
                    </div>

                    {/* Message alerts */}
                    <AnimatePresence mode="wait">
                      {errorMsg && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-2.5 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-500 text-[10px] font-semibold"
                        >
                          {errorMsg}
                        </motion.div>
                      )}
                      {successMsg && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-2.5 rounded-xl border border-[#C9A35A]/10 bg-[#C9A35A]/5 text-[#C9A35A] text-[10px] font-semibold"
                        >
                          {successMsg}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-[#C9A35A] hover:bg-[#1F2F5C] hover:text-white text-white font-serif italic text-xs font-bold tracking-widest uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      Create Account
                    </button>
                  </form>

                  <div className="text-center pt-2">
                    <p className="text-[10px] text-neutral-400">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('signin')}
                        className="text-[#C9A35A] font-extrabold hover:underline"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {authMode === 'account' && currentCustomer && (
                <div className="space-y-6">
                  {/* Account Welcome card */}
                  <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    theme === 'dark' ? 'bg-[#1F2F5C]/40 border-[#C9A35A]/10' : 'bg-[#FFFFFF] border-[#D8CDBA]/60'
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-[#C9A35A]/10 border border-[#C9A35A]/20 flex items-center justify-center text-[#C9A35A]">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-serif italic text-base font-bold">{currentCustomer.name}</h4>
                        <p className="text-[10px] text-[#C9A35A] font-mono tracking-wide">{currentCustomer.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={onLogout}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-500/20 text-rose-500 text-[10px] tracking-wider uppercase font-extrabold hover:bg-rose-500/5 transition-all self-start md:self-auto"
                    >
                      Sign Out
                    </button>
                  </div>

                  {/* Orders section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#C9A35A]">
                      <History className="w-4 h-4" />
                      <h4 className="font-serif italic text-sm font-bold">Your Olfactory Purchase History</h4>
                    </div>

                    {customerOrders.length === 0 ? (
                      <div className={`p-6 rounded-2xl border text-center space-y-2 ${
                        theme === 'dark' ? 'bg-neutral-950/20 border-[#D8CDBA]/10' : 'bg-white border-[#D8CDBA]/40'
                      }`}>
                        <ShoppingBag className="w-8 h-8 text-neutral-400 mx-auto opacity-50" />
                        <h5 className="font-serif italic font-bold text-xs">No orders on record</h5>
                        <p className="text-[10px] text-neutral-400 max-w-xs mx-auto leading-relaxed">
                          Your bespoke organic fragrances will be dynamically tracked here when you place orders with this email address.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {customerOrders.map((order) => (
                          <div
                            key={order.id}
                            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                              theme === 'dark' ? 'bg-[#1F2F5C]/20 border-[#D8CDBA]/10' : 'bg-white border-[#D8CDBA]/50'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-[#C9A35A]">
                                  {order.id}
                                </span>
                                <span className="text-[9px] text-neutral-400">
                                  {new Date(order.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                {order.items.map(item => `${item.name} (${item.quantity}x)`).join(', ')}
                              </p>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0">
                              <span className="text-xs font-bold text-[#C9A35A]">
                                ₹{order.total.toLocaleString()}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded text-[8px] tracking-wider uppercase font-bold ${
                                order.status === 'Delivered'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : order.status === 'Shipped'
                                    ? 'bg-blue-500/10 text-blue-500'
                                    : 'bg-amber-500/10 text-amber-500'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Certifications footer info */}
                  <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                    theme === 'dark' ? 'bg-[#142042]/50 border-[#C9A35A]/10' : 'bg-[#EFE6D3]/30 border-[#D8CDBA]/60'
                  }`}>
                    <Award className="w-5 h-5 text-[#C9A35A] shrink-0" />
                    <div>
                      <h5 className="font-serif italic text-xs font-bold">Arvaiya Organic Loyalty Guarantee</h5>
                      <p className="text-[10px] text-neutral-400 leading-relaxed">
                        Every fragrance ordered is registered with your account. We guarantee 100% biological botanical sourcing, bio-degradable glass mold casing, and carbon-neutral distribution.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
