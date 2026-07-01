import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, CheckCircle2, Truck, CreditCard, Sparkles, Smartphone, QrCode, Loader2, Copy, Check } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderPlaced: (
    customerName: string,
    customerEmail: string,
    address: string,
    city: string,
    upiId?: string,
    paymentStatus?: 'Pending' | 'Paid' | 'Failed'
  ) => void;
  theme: 'light' | 'dark';
  currentCustomer: { name: string; email: string } | null;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  onOrderPlaced,
  theme,
  currentCustomer,
}: CheckoutModalProps) {
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  // Prefill details if current customer is logged in
  useEffect(() => {
    if (isOpen) {
      if (currentCustomer) {
        setName(currentCustomer.name);
        setEmail(currentCustomer.email);
      } else {
        setName('');
        setEmail('');
      }
    }
  }, [isOpen, currentCustomer]);
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');

  // Animation / simulation states
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [orderId, setOrderId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid' | 'Failed'>('Pending');

  const totalAmount = cartItems.reduce((sum, item) => sum + item.fragrance.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !address || !city) return;
    if (paymentMethod === 'upi' && !upiId) return;

    // Transition to processing state to simulate approval
    setStep('processing');

    // Generate unique order ID
    const generatedId = 'ARV-' + Math.floor(100000 + Math.random() * 900000);
    setOrderId(generatedId);

    // Simulate 3 seconds UPI payment verification
    setTimeout(() => {
      setPaymentStatus('Paid');
      // Log order in parent state
      onOrderPlaced(name, email, address, city, paymentMethod === 'upi' ? upiId : undefined, 'Paid');
      setStep('success');
    }, 2800);
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
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 180 }}
            className={`relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl z-10 border ${
              theme === 'dark' ? 'bg-[#142042] border-[#C9A35A]/20 text-neutral-100' : 'bg-[#F8F5EE] border-[#D8CDBA] text-[#222222]'
            }`}
          >
            {/* Modal Header */}
            <div className={`p-6 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-[#C9A35A]/10' : 'border-[#D8CDBA]/60'
            }`}>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#C9A35A]" />
                <h3 className="font-serif italic text-lg font-bold">Secure Luxury Checkout</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {step === 'form' ? (
                /* --- CHECKOUT INPUT FORM STEP --- */
                <motion.form
                  key="form-step"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6"
                >
                  {/* Left Column: Shipping & Payment (7 cols) */}
                  <div className="col-span-1 md:col-span-7 space-y-4">
                    <h4 className="text-[10px] tracking-[0.2em] font-extrabold uppercase text-amber-500">
                      Shipping Destination
                    </h4>

                    {/* Name */}
                    <div className="grid grid-cols-1 gap-1">
                      <label className="text-[10px] font-semibold tracking-wider opacity-60 uppercase">Full Name</label>
                      <input
                        required
                        type="text"
                        placeholder="Aditya Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`p-2.5 rounded-xl text-xs outline-none border transition-all ${
                          theme === 'dark'
                            ? 'bg-neutral-950 border-neutral-900 text-white focus:border-amber-500/50'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-amber-500/50'
                        }`}
                      />
                    </div>

                    {/* Email */}
                    <div className="grid grid-cols-1 gap-1">
                      <label className="text-[10px] font-semibold tracking-wider opacity-60 uppercase">Email Address</label>
                      <input
                        required
                        type="email"
                        placeholder="aditya@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`p-2.5 rounded-xl text-xs outline-none border transition-all ${
                          theme === 'dark'
                            ? 'bg-neutral-950 border-neutral-900 text-white focus:border-amber-500/50'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-amber-500/50'
                        }`}
                      />
                    </div>

                    {/* Address */}
                    <div className="grid grid-cols-1 gap-1">
                      <label className="text-[10px] font-semibold tracking-wider opacity-60 uppercase">Street Address</label>
                      <input
                        required
                        type="text"
                        placeholder="74, Elegant Scent Residency"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`p-2.5 rounded-xl text-xs outline-none border transition-all ${
                          theme === 'dark'
                            ? 'bg-neutral-950 border-neutral-900 text-white focus:border-amber-500/50'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-amber-500/50'
                        }`}
                      />
                    </div>

                    {/* City */}
                    <div className="grid grid-cols-1 gap-1">
                      <label className="text-[10px] font-semibold tracking-wider opacity-60 uppercase">City / Pincode</label>
                      <input
                        required
                        type="text"
                        placeholder="New Delhi, 110001"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={`p-2.5 rounded-xl text-xs outline-none border transition-all ${
                          theme === 'dark'
                            ? 'bg-neutral-950 border-neutral-900 text-white focus:border-amber-500/50'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-amber-500/50'
                        }`}
                      />
                    </div>

                    {/* Payment Info Selection */}
                    <div className="pt-2 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] tracking-[0.2em] font-extrabold uppercase text-amber-500 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          Choose Payment Method
                        </h4>
                      </div>

                      {/* Segmented control tabs */}
                      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-neutral-900/10 dark:bg-black/20 border border-neutral-200 dark:border-neutral-900">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('upi')}
                          className={`py-2 px-3 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                            paymentMethod === 'upi'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          UPI Payment
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`py-2 px-3 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                            paymentMethod === 'card'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Credit / Debit Card
                        </button>
                      </div>

                      {/* Payment fields based on selection */}
                      {paymentMethod === 'upi' ? (
                        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900/10 space-y-3">
                          <div className="flex items-center gap-3 bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10">
                            <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800 text-white shrink-0">
                              <QrCode className="w-8 h-8 text-amber-500" />
                            </div>
                            <div className="text-left text-[10px] leading-relaxed">
                              <span className="font-bold text-amber-500 block">Scan QR Code or Enter UPI ID</span>
                              <span className="opacity-70 block">Transfer goes securely to the boutique owner with instant verified tracking.</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-1">
                            <label className="text-[9px] font-semibold opacity-60 uppercase">Your UPI ID (VPA)</label>
                            <input
                              required={paymentMethod === 'upi'}
                              type="text"
                              placeholder="e.g. customer@okaxis"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className={`p-2.5 rounded-xl text-xs outline-none border font-mono transition-all ${
                                theme === 'dark'
                                  ? 'bg-neutral-950 border-neutral-900 text-white focus:border-amber-500/50'
                                  : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-amber-500/50'
                              }`}
                            />
                            <p className="text-[8px] opacity-50">Support Google Pay, PhonePe, Paytm, BHIM, YBL, etc.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900/10 space-y-3">
                          <div className="grid grid-cols-1 gap-1">
                            <label className="text-[9px] font-semibold opacity-60 uppercase">Card Number</label>
                            <input
                              required={paymentMethod === 'card'}
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className={`p-2.5 rounded-xl text-xs outline-none border font-mono transition-all ${
                                theme === 'dark' ? 'bg-neutral-950 border-neutral-900 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                              }`}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid grid-cols-1 gap-1">
                              <label className="text-[9px] font-semibold opacity-60 uppercase">Expiry Date</label>
                              <input
                                required={paymentMethod === 'card'}
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className={`p-2.5 rounded-xl text-xs outline-none border font-mono transition-all ${
                                  theme === 'dark' ? 'bg-neutral-950 border-neutral-900 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                                }`}
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                              <label className="text-[9px] font-semibold opacity-60 uppercase">Secure CVV</label>
                              <input
                                required={paymentMethod === 'card'}
                                type="text"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                className={`p-2.5 rounded-xl text-xs outline-none border font-mono transition-all ${
                                  theme === 'dark' ? 'bg-neutral-950 border-neutral-900 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Order Summary (5 cols) */}
                  <div className="col-span-1 md:col-span-5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h4 className="text-[10px] tracking-[0.2em] font-extrabold uppercase text-amber-500">
                        Order Breakdown
                      </h4>

                      <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                        {cartItems.map((item) => (
                          <div key={item.fragrance.id} className="flex items-center gap-2.5 justify-between text-xs">
                            <div className="min-w-0">
                              <h5 className="font-serif italic font-bold truncate uppercase">{item.fragrance.name}</h5>
                              <span className="opacity-60 text-[10px]">Qty: {item.quantity} x {item.fragrance.volume}</span>
                            </div>
                            <span className="font-semibold text-neutral-400">
                              ₹{(item.fragrance.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-neutral-200 dark:border-neutral-900 pt-3.5 space-y-1.5 text-xs">
                        <div className="flex justify-between opacity-80">
                          <span>Subtotal:</span>
                          <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between opacity-80">
                          <span>Eco Packaging:</span>
                          <span className="text-emerald-500 font-semibold uppercase text-[9px]">FREE</span>
                        </div>
                        <div className="flex justify-between opacity-80">
                          <span>Carbon Neutral Shipping:</span>
                          <span className="text-emerald-500 font-semibold uppercase text-[9px]">FREE</span>
                        </div>
                        <div className="border-t border-[#D8CDBA]/30 dark:border-neutral-900 my-2 pt-2 flex justify-between font-bold text-sm">
                          <span className="font-serif italic text-[#C9A35A]">Grand Total:</span>
                          <span className="font-serif font-extrabold text-[#C9A35A] text-base">
                            ₹{totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4">
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-[#C9A35A] hover:bg-[#1F2F5C] hover:text-white text-white font-serif italic font-bold tracking-widest text-xs uppercase shadow-lg shadow-amber-500/10 active:scale-95 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                        {paymentMethod === 'upi' ? `Pay ₹${totalAmount.toLocaleString('en-IN')} via UPI` : 'Place My Order'}
                      </button>
                      <p className="text-[10px] opacity-65 text-center">
                        Encrypted SSL Checkout. Your organic essence is protected.
                      </p>
                    </div>
                  </div>
                </motion.form>
              ) : step === 'processing' ? (
                /* --- UPI / CARD PAYMENT PROCESSING STEP --- */
                <motion.div
                  key="processing-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-16 px-10 text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]"
                >
                  <div className="relative flex items-center justify-center">
                    <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
                    <Smartphone className="w-6 h-6 text-amber-400 absolute" />
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <h4 className="font-serif italic font-bold text-xl tracking-wide">
                      {paymentMethod === 'upi' ? 'Awaiting UPI App Approval...' : 'Processing Card Security check...'}
                    </h4>
                    {paymentMethod === 'upi' ? (
                      <p className="text-xs opacity-75">
                        We have sent a notification to <span className="font-mono font-bold text-amber-500">{upiId}</span>. Please open your UPI app (GPay, PhonePe, Paytm) to approve the transaction of <span className="font-bold">₹{totalAmount.toLocaleString('en-IN')}</span>.
                      </p>
                    ) : (
                      <p className="text-xs opacity-75">
                        Verifying 3D-Secure transaction with your bank. Do not close this window.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-1.5 text-[10px] opacity-50 font-mono">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secured by Unified Payments Interface
                    </span>
                    <span>Simulated security environment - auto approving shortly...</span>
                  </div>
                </motion.div>
              ) : (
                /* --- PURCHASE SUCCESS STEP --- */
                <SuccessStepView
                  orderId={orderId}
                  name={name}
                  address={address}
                  city={city}
                  upiId={paymentMethod === 'upi' ? upiId : undefined}
                  onClose={() => {
                    onClose();
                    setStep('form');
                  }}
                  theme={theme}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Subcomponent for Success Screen with nice features
interface SuccessStepViewProps {
  orderId: string;
  name: string;
  address: string;
  city: string;
  upiId?: string;
  onClose: () => void;
  theme: 'light' | 'dark';
}

function SuccessStepView({
  orderId,
  name,
  address,
  city,
  upiId,
  onClose,
  theme,
}: SuccessStepViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      key="success-step"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="p-10 text-center space-y-6 flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.6 }}
      >
        <CheckCircle2 className="w-16 h-16 text-emerald-500" />
      </motion.div>

      <div className="space-y-2">
        <h4 className="font-serif italic font-bold text-2xl tracking-wide">
          Thank You, Scent Explorer!
        </h4>
        <p className="text-xs opacity-70 max-w-sm mx-auto">
          Your Arvaiya order has been placed successfully. A hand-signed custom certificate of organic purity is being processed.
        </p>
      </div>

      <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900/10 space-y-2.5 max-w-md w-full text-xs">
        <div className="flex justify-between items-center">
          <span className="opacity-60">Transaction Reference:</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-amber-500">{orderId}</span>
            <button
              onClick={handleCopy}
              className="p-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-amber-500 active:scale-95 transition-all"
              title="Copy Order ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="opacity-60">Shipment Tracker:</span>
          <span className="font-semibold flex items-center gap-1 text-emerald-500">
            <Truck className="w-3.5 h-3.5" /> Eco-Courier Active
          </span>
        </div>
        {upiId && (
          <div className="flex justify-between items-center">
            <span className="opacity-60">UPI Transaction:</span>
            <span className="font-mono text-neutral-400 font-medium">{upiId}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="opacity-60">Recipient:</span>
          <span className="font-medium">{name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="opacity-60">Destination:</span>
          <span className="font-medium text-right truncate max-w-[200px]">{address}, {city}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[11px] text-amber-500/80 italic font-medium">
        <Sparkles className="w-4 h-4 shrink-0" />
        <span>Expect a custom packaging sensory experience with fresh dried botanicals inside the box!</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm justify-center pt-2">
        <button
          onClick={onClose}
          className="flex-1 py-2 px-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-[10px] tracking-widest font-extrabold uppercase text-neutral-300 transition-all"
        >
          Close Window
        </button>
      </div>
    </motion.div>
  );
}
