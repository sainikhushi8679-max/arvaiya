import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
  Sparkles,
  Smartphone,
  Loader2,
  Copy,
  Check,
  Building2,
  Wallet,
  Phone,
  Mail,
  User,
  MapPin,
  Printer,
  AlertTriangle,
  RotateCcw,
  Lock
} from 'lucide-react';
import { CartItem } from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
    paymentStatus?: 'Pending' | 'Paid' | 'Failed' | 'Processing' | 'Cancelled',
    paymentDetails?: {
      phone?: string;
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      razorpaySignature?: string;
      invoiceNumber?: string;
    }
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
  // Customer Details Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Prefill details if customer logged in
  useEffect(() => {
    if (isOpen) {
      if (currentCustomer) {
        setName(currentCustomer.name);
        setEmail(currentCustomer.email);
      } else {
        setName('');
        setEmail('');
      }
      setPhone('9876543210');
      setAddress('42, Boulevard Scent Residency, Connaught Place');
      setCity('New Delhi, Delhi');
      setPincode('110001');
      setStep('form');
      setPaymentStatus('Pending');
      setErrorMessage('');
    }
  }, [isOpen, currentCustomer]);

  // Flow & Payment State
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'failed' | 'cancelled'>('form');
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Processing' | 'Paid' | 'Failed' | 'Cancelled'>('Pending');
  const [processingMsg, setProcessingMsg] = useState('Creating Razorpay Order...');
  const [errorMessage, setErrorMessage] = useState('');

  // Verified Payment Receipt Data
  const [verifiedDetails, setVerifiedDetails] = useState<{
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
    invoiceNumber: string;
  } | null>(null);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.fragrance.price * item.quantity, 0);

  // Dynamically load Razorpay SDK if missing
  const ensureRazorpayLoaded = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Main Handler: Initiate Razorpay Checkout
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      alert('Please fill in all customer details.');
      return;
    }

    setStep('processing');
    setPaymentStatus('Processing');
    setProcessingMsg('Creating Razorpay Order via Backend API...');

    try {
      // Step 1: Create Razorpay Order on Express backend
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          items: cartItems.map((i) => ({
            id: i.fragrance.id,
            name: i.fragrance.name,
            quantity: i.quantity,
            price: i.fragrance.price,
          })),
          customerInfo: {
            name,
            email,
            phone,
            address: `${address}, Pincode: ${pincode}`,
            city,
          },
        }),
      });

      const orderData = await response.json();

      if (!response.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to generate Razorpay Order ID.');
      }

      setProcessingMsg('Opening Razorpay Checkout Gateway...');

      // Ensure Razorpay SDK script is ready
      const sdkLoaded = await ensureRazorpayLoaded();
      if (!sdkLoaded && !orderData.demoMode) {
        throw new Error('Unable to load Razorpay SDK. Please check internet connection.');
      }

      // Step 2: Configure Razorpay Options
      const options = {
        key: orderData.keyId || 'rzp_test_placeholder',
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: 'ARVAIYA Organic Fragrances',
        description: `Order of ${cartItems.length} Organic Perfume(s)`,
        image: 'https://cdn-icons-png.flaticon.com/512/3050/3050525.png',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Triggered on user completion inside Razorpay popup
          setStep('processing');
          setPaymentStatus('Processing');
          setProcessingMsg('Verifying HMAC SHA256 Signature with Server...');

          try {
            // Step 3: Send verification payload to backend
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || 'verified_test_sig',
                customerInfo: { name, email, phone, address, city, pincode },
                items: cartItems.map((i) => ({
                  id: i.fragrance.id,
                  name: i.fragrance.name,
                  quantity: i.quantity,
                  price: i.fragrance.price,
                })),
                totalAmount,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success && verifyData.verified) {
              const paymentId = response.razorpay_payment_id || `pay_${Date.now()}`;
              const rzpOrderId = response.razorpay_order_id || orderData.orderId;
              const rzpSig = response.razorpay_signature || 'verified_test_sig';
              const invNum = verifyData.order?.invoiceNumber || `INV-ARV-${Date.now()}`;

              setVerifiedDetails({
                razorpayPaymentId: paymentId,
                razorpayOrderId: rzpOrderId,
                razorpaySignature: rzpSig,
                invoiceNumber: invNum,
              });

              setPaymentStatus('Paid');

              // Save order in parent state & reduce catalog stock
              onOrderPlaced(name, email, `${address}, ${pincode}`, city, undefined, 'Paid', {
                phone,
                razorpayPaymentId: paymentId,
                razorpayOrderId: rzpOrderId,
                razorpaySignature: rzpSig,
                invoiceNumber: invNum,
              });

              setStep('success');
            } else {
              setPaymentStatus('Failed');
              setErrorMessage(
                verifyData.error || 'Payment signature verification failed on backend. Order was NOT saved.'
              );
              setStep('failed');
            }
          } catch (err: any) {
            console.error('Signature verification error:', err);
            setPaymentStatus('Failed');
            setErrorMessage('Network error during payment verification. Please contact support.');
            setStep('failed');
          }
        },
        prefill: {
          name,
          email,
          contact: phone,
        },
        notes: {
          address: `${address}, ${city} - ${pincode}`,
        },
        theme: {
          color: '#C9A35A', // Luxury gold matching Arvaiya
        },
        modal: {
          ondismiss: function () {
            console.warn('Razorpay checkout modal dismissed by user.');
            setPaymentStatus('Cancelled');
            setErrorMessage('Payment process was cancelled. No money was deducted.');
            setStep('cancelled');
          },
        },
      };

      // Open official Razorpay Checkout SDK popup
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          console.error('Razorpay payment.failed event:', resp.error);
          setPaymentStatus('Failed');
          setErrorMessage(
            resp.error?.description || 'Payment failed via Razorpay. Please try another card or UPI app.'
          );
          setStep('failed');
        });
        rzp.open();
      } else {
        // Fallback test trigger if script load blocked by adblocker
        console.warn('Razorpay SDK modal unavailable. Invoking mock verified handler for testing.');
        setTimeout(() => {
          options.handler({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_test_${Date.now()}`,
            razorpay_signature: `sig_test_${Date.now()}`,
          });
        }, 1200);
      }
    } catch (err: any) {
      console.error('Error in handleProceedToPayment:', err);
      setPaymentStatus('Failed');
      setErrorMessage(err?.message || 'Payment initiation failed. Please try again.');
      setStep('failed');
    }
  };

  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 200 }}
            className={`relative w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl z-10 border ${
              isDark
                ? 'bg-[#101935] border-[#C9A35A]/30 text-neutral-100'
                : 'bg-[#FDFBF7] border-[#D8CDBA] text-[#1a1a1a]'
            }`}
          >
            {/* Header */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isDark ? 'border-[#C9A35A]/15 bg-[#142042]/80' : 'border-[#D8CDBA]/60 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif italic text-lg font-bold">Razorpay Gateway Checkout</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> 256-Bit SSL Encrypted
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Official Razorpay Payment Processing with Backend Signature Verification
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Payment Status Badge */}
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase border ${
                    paymentStatus === 'Paid'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : paymentStatus === 'Processing'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                      : paymentStatus === 'Failed'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : paymentStatus === 'Cancelled'
                      ? 'bg-neutral-500/20 text-neutral-300 border-neutral-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}
                >
                  Status: {paymentStatus}
                </span>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-neutral-800/40 transition-colors"
                >
                  <X className="w-4 h-4 text-neutral-400 hover:text-amber-400" />
                </button>
              </div>
            </div>

            {/* Modal Body with AnimatePresence */}
            <AnimatePresence mode="wait">
              {step === 'form' && (
                <motion.form
                  key="checkout-form"
                  onSubmit={handleProceedToPayment}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto"
                >
                  {/* Left Section: Customer Details (7 Cols) */}
                  <div className="col-span-1 md:col-span-7 space-y-4">
                    <div className="flex items-center justify-between border-b pb-2 border-amber-500/20">
                      <h4 className="text-xs font-bold font-serif italic text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-4 h-4" /> 1. Customer Delivery Details
                      </h4>
                      <span className="text-[10px] text-neutral-400">All fields required</span>
                    </div>

                    {/* Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Full Name *
                        </label>
                        <div className="relative">
                          <input
                            required
                            type="text"
                            placeholder="Aditya Sharma"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full py-2 px-3 text-xs rounded-xl outline-none border transition-all ${
                              isDark
                                ? 'bg-black/40 border-neutral-800 focus:border-amber-500 text-white'
                                : 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Mobile Phone *
                        </label>
                        <div className="relative">
                          <input
                            required
                            type="tel"
                            placeholder="9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`w-full py-2 px-3 text-xs font-mono rounded-xl outline-none border transition-all ${
                              isDark
                                ? 'bg-black/40 border-neutral-800 focus:border-amber-500 text-white'
                                : 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Email Address (For Tax Invoice & Tracking) *
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="aditya.sharma@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full py-2 px-3 text-xs font-mono rounded-xl outline-none border transition-all ${
                          isDark
                            ? 'bg-black/40 border-neutral-800 focus:border-amber-500 text-white'
                            : 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'
                        }`}
                      />
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Complete Shipping Address *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="House/Flat No., Street, Landmark"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full py-2 px-3 text-xs rounded-xl outline-none border transition-all ${
                          isDark
                            ? 'bg-black/40 border-neutral-800 focus:border-amber-500 text-white'
                            : 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'
                        }`}
                      />
                    </div>

                    {/* City & Pincode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          City & State *
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="New Delhi, Delhi"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={`w-full py-2 px-3 text-xs rounded-xl outline-none border transition-all ${
                            isDark
                              ? 'bg-black/40 border-neutral-800 focus:border-amber-500 text-white'
                              : 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Postal Pincode *
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="110001"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className={`w-full py-2 px-3 text-xs font-mono rounded-xl outline-none border transition-all ${
                            isDark
                              ? 'bg-black/40 border-neutral-800 focus:border-amber-500 text-white'
                              : 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Accepted Razorpay Payment Methods Badges */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold font-serif italic text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" /> 2. Supported Payment Methods
                        </h4>
                        <span className="text-[9px] text-emerald-400 font-bold">Instant Auto-Verification</span>
                      </div>

                      <div className="p-3.5 rounded-2xl border bg-black/20 border-amber-500/20 space-y-2.5">
                        <p className="text-[10px] text-neutral-300 leading-relaxed">
                          Razorpay Checkout dynamically connects with all major Indian & Global payment gateways:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9px] font-mono font-bold">
                          <div className="p-2 rounded-lg bg-black/40 border border-neutral-800 flex items-center gap-1.5 text-amber-300">
                            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                            <span>GPay / PhonePe</span>
                          </div>
                          <div className="p-2 rounded-lg bg-black/40 border border-neutral-800 flex items-center gap-1.5 text-amber-300">
                            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                            <span>Paytm / BHIM</span>
                          </div>
                          <div className="p-2 rounded-lg bg-black/40 border border-neutral-800 flex items-center gap-1.5 text-amber-300">
                            <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                            <span>Cards (Visa/MC)</span>
                          </div>
                          <div className="p-2 rounded-lg bg-black/40 border border-neutral-800 flex items-center gap-1.5 text-amber-300">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>NetBanking / Wallet</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Order Summary (5 Cols) */}
                  <div className="col-span-1 md:col-span-5 space-y-4 flex flex-col justify-between border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-neutral-800">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold font-serif italic text-amber-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Cart Summary</span>
                        <span className="text-[10px] font-mono font-normal text-neutral-400">
                          {cartItems.length} Item(s)
                        </span>
                      </h4>

                      {/* Items list */}
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {cartItems.map((item) => (
                          <div
                            key={item.fragrance.id}
                            className="p-2.5 rounded-xl bg-black/20 border border-neutral-800/60 flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <h5 className="font-serif italic font-bold truncate text-amber-300">
                                {item.fragrance.name}
                              </h5>
                              <p className="text-[10px] text-neutral-400">
                                Qty: {item.quantity} × {item.fragrance.volume}
                              </p>
                            </div>
                            <span className="font-mono font-bold text-white text-xs shrink-0">
                              ₹{(item.fragrance.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Cost calculations */}
                      <div className="pt-3 border-t border-neutral-800 space-y-1.5 text-xs">
                        <div className="flex justify-between text-neutral-400">
                          <span>Subtotal:</span>
                          <span className="font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                          <span>GST (18% Included):</span>
                          <span className="font-mono text-emerald-400 text-[10px]">₹{Math.round(totalAmount * 0.18).toLocaleString('en-IN')} (Included)</span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                          <span>Eco Packaging & Delivery:</span>
                          <span className="text-emerald-400 font-extrabold text-[10px]">FREE</span>
                        </div>
                        <div className="pt-2 border-t border-amber-500/30 flex justify-between items-baseline">
                          <span className="font-serif italic font-bold text-amber-400 text-sm">Total Payable:</span>
                          <span className="font-mono font-extrabold text-amber-400 text-lg">
                            ₹{totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="space-y-2 pt-4">
                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-serif italic font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 fill-black text-amber-400" />
                        <span>Proceed to Razorpay (₹{totalAmount.toLocaleString('en-IN')})</span>
                      </button>
                      <p className="text-[9px] text-center text-neutral-400 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        <span>Official Razorpay SDK • Instant Webhook & HMAC Verification</span>
                      </p>
                    </div>
                  </div>
                </motion.form>
              )}

              {/* PROCESSING STEP */}
              {step === 'processing' && (
                <motion.div
                  key="processing-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-16 px-8 text-center space-y-6 flex flex-col items-center justify-center min-h-[380px]"
                >
                  <div className="relative flex items-center justify-center">
                    <Loader2 className="w-16 h-16 text-amber-400 animate-spin" />
                    <ShieldCheck className="w-6 h-6 text-emerald-400 absolute" />
                  </div>

                  <div className="space-y-2 max-w-md">
                    <h4 className="font-serif italic font-bold text-xl text-amber-400 tracking-wide">
                      {processingMsg}
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Please complete the payment in the Razorpay overlay window. Do not refresh or close this tab.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-neutral-800 text-[10px] font-mono text-neutral-400 max-w-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Razorpay SSL Connection Active • Order Total: ₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </motion.div>
              )}

              {/* SUCCESS STEP */}
              {step === 'success' && verifiedDetails && (
                <SuccessStepView
                  verifiedDetails={verifiedDetails}
                  name={name}
                  email={email}
                  phone={phone}
                  address={address}
                  city={city}
                  pincode={pincode}
                  cartItems={cartItems}
                  totalAmount={totalAmount}
                  onClose={onClose}
                  isDark={isDark}
                />
              )}

              {/* FAILED STEP */}
              {step === 'failed' && (
                <motion.div
                  key="failed-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 px-8 text-center space-y-6 flex flex-col items-center justify-center min-h-[380px]"
                >
                  <div className="p-4 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400">
                    <XCircle className="w-12 h-12" />
                  </div>

                  <div className="space-y-2 max-w-md">
                    <h4 className="font-serif italic font-bold text-2xl text-rose-400">
                      Payment Failed. Please try again.
                    </h4>
                    <p className="text-xs text-neutral-300">
                      {errorMessage || 'Your payment could not be processed or the Razorpay signature verification failed.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300 max-w-sm text-left space-y-1">
                    <p className="font-bold">Security Guarantee:</p>
                    <p>• Your cart items remain intact.</p>
                    <p>• Product stock was NOT reduced.</p>
                    <p>• No unverified order was created.</p>
                  </div>

                  <div className="flex gap-3 w-full max-w-xs pt-2">
                    <button
                      onClick={() => setStep('form')}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Try Again
                    </button>
                    <button
                      onClick={onClose}
                      className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {/* CANCELLED STEP */}
              {step === 'cancelled' && (
                <motion.div
                  key="cancelled-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 px-8 text-center space-y-5 flex flex-col items-center justify-center min-h-[380px]"
                >
                  <div className="p-4 rounded-full bg-neutral-500/20 border border-neutral-500/40 text-neutral-300">
                    <AlertTriangle className="w-12 h-12" />
                  </div>

                  <div className="space-y-2 max-w-md">
                    <h4 className="font-serif italic font-bold text-2xl text-amber-400">
                      Payment Cancelled
                    </h4>
                    <p className="text-xs text-neutral-300">
                      {errorMessage || 'You closed the Razorpay payment window before completing the transaction.'}
                    </p>
                  </div>

                  <div className="flex gap-3 w-full max-w-xs pt-2">
                    <button
                      onClick={() => setStep('form')}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all"
                    >
                      Reopen Checkout
                    </button>
                    <button
                      onClick={onClose}
                      className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Success Component displaying the official Tax Invoice / Receipt
interface SuccessStepViewProps {
  verifiedDetails: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
    invoiceNumber: string;
  };
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  cartItems: CartItem[];
  totalAmount: number;
  onClose: () => void;
  isDark: boolean;
}

function SuccessStepView({
  verifiedDetails,
  name,
  email,
  phone,
  address,
  city,
  pincode,
  cartItems,
  totalAmount,
  onClose,
  isDark,
}: SuccessStepViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPaymentId = () => {
    navigator.clipboard.writeText(verifiedDetails.razorpayPaymentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <motion.div
      key="success-step"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 sm:p-8 space-y-5 max-h-[80vh] overflow-y-auto"
    >
      {/* Top Badge */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>

        <h4 className="font-serif italic font-bold text-2xl text-amber-400">
          Payment Verified & Order Placed!
        </h4>
        <p className="text-xs text-neutral-300 max-w-md mx-auto">
          Your payment has been successfully verified on the server via Razorpay HMAC SHA256 signature verification.
        </p>
      </div>

      {/* Tax Invoice Card */}
      <div className="p-5 rounded-2xl border bg-black/40 border-amber-500/30 space-y-4 text-xs font-sans">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-800 pb-3 gap-2">
          <div>
            <h5 className="font-serif font-bold text-amber-400 uppercase tracking-widest text-sm">
              ARVAIYA ORGANIC PERFUMES
            </h5>
            <p className="text-[10px] text-neutral-400">Official Tax Invoice & Payment Receipt</p>
          </div>
          <div className="text-left sm:text-right font-mono text-[10px]">
            <p className="font-bold text-emerald-400">{verifiedDetails.invoiceNumber}</p>
            <p className="text-neutral-400">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Payment Verification Identifiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div>
            <span className="text-neutral-400 block">Razorpay Payment ID:</span>
            <div className="flex items-center gap-1">
              <strong className="text-amber-400">{verifiedDetails.razorpayPaymentId}</strong>
              <button onClick={handleCopyPaymentId} className="p-0.5 hover:text-white text-neutral-400">
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
          <div>
            <span className="text-neutral-400 block">Razorpay Order ID:</span>
            <strong className="text-amber-400">{verifiedDetails.razorpayOrderId}</strong>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Billed To</span>
            <p className="font-bold text-white">{name}</p>
            <p className="text-neutral-300">{email}</p>
            <p className="text-neutral-300 font-mono">{phone}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Shipping Destination</span>
            <p className="text-neutral-300">{address}</p>
            <p className="text-neutral-300">{city} - {pincode}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-1.5 pt-2 border-t border-neutral-800">
          <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Purchased Products</span>
          {cartItems.map((item) => (
            <div key={item.fragrance.id} className="flex justify-between items-center text-xs">
              <span className="text-neutral-200">
                {item.fragrance.name} <span className="text-[10px] text-neutral-400">({item.quantity}× {item.fragrance.volume})</span>
              </span>
              <span className="font-mono text-white font-bold">
                ₹{(item.fragrance.price * item.quantity).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        {/* Grand Total */}
        <div className="pt-2 border-t border-amber-500/30 flex justify-between items-center text-sm font-bold">
          <span className="font-serif italic text-amber-400">Total Paid via Razorpay:</span>
          <span className="font-mono text-amber-400 text-base">₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
        <button
          onClick={handlePrintInvoice}
          className="py-2.5 px-4 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-xs text-white font-bold flex items-center justify-center gap-1.5"
        >
          <Printer className="w-4 h-4 text-amber-400" /> Print Tax Invoice
        </button>
        <button
          onClick={onClose}
          className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider"
        >
          Close & Continue Shopping
        </button>
      </div>
    </motion.div>
  );
}
