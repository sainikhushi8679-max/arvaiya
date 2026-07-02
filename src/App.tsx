import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Compass, 
  MessageSquare, 
  Moon, 
  Sun, 
  RefreshCw, 
  Sliders, 
  Heart, 
  Info, 
  Send, 
  Check, 
  ChevronRight, 
  Droplet,
  Flower,
  Flame,
  Leaf,
  Layers,
  Sparkle,
  ShoppingBag,
  UserCheck,
  Truck,
  User,
  Zap,
  FlaskConical,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fragrances } from './data/fragrances';
import { Fragrance, UserProfile, ChatMessage, FragranceFamily, OccasionType, CartItem, Order, Review } from './types';
import DigitalBottle from './components/DigitalBottle';
import ShopCatalog from './components/ShopCatalog';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AdminPanel from './components/AdminPanel';
import OrderTrackerModal from './components/OrderTrackerModal';
import OrganicFAQ from './components/OrganicFAQ';
import CustomerAuthModal from './components/CustomerAuthModal';
import CustomPerfumeStudio from './components/CustomPerfumeStudio';
import WishlistModal from './components/WishlistModal';

export default function App() {
  // --- STATE ---
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [currentCustomer, setCurrentCustomer] = useState<{ name: string; email: string } | null>(null);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [activeFragrances, setActiveFragrances] = useState<Fragrance[]>(() => {
    try {
      const saved = localStorage.getItem('arvaiya_fragrances');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved fragrances', e);
    }
    return fragrances;
  });
  const [selectedFragrance, setSelectedFragrance] = useState<Fragrance>(activeFragrances[0] || fragrances[0]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('arvaiya_fragrances', JSON.stringify(activeFragrances));
    } catch (e) {
      console.error('Failed to save fragrances to localStorage', e);
    }
  }, [activeFragrances]);

  const handleSelectFragrance = (fragrance: Fragrance) => {
    setSelectedFragrance(fragrance);
    const element = document.getElementById('vanity-table');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // E-commerce & Admin State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [vanityViewMode, setVanityViewMode] = useState<'photo' | 'digital'>('photo');
  const [digitalView, setDigitalView] = useState<'front' | 'side' | 'perspective'>('front');
  const [activeNoteHighlight, setActiveNoteHighlight] = useState<string | null>(null);

  const getFragranceById = (id: string): Fragrance | undefined => {
    return activeFragrances.find(f => f.id === id);
  };

  // --- E-COMMERCE & ADMIN HANDLERS ---
  const handleAddToBag = (fragrance: Fragrance) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.fragrance.id === fragrance.id);
      if (existing) {
        return prev.map((item) =>
          item.fragrance.id === fragrance.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { fragrance, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.fragrance.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.fragrance.id !== id));
  };

  const handleDirectBuyNow = (fragrance: Fragrance) => {
    setCartItems([{ fragrance, quantity: 1 }]);
    setIsCheckoutOpen(true);
  };

  const handleAddReview = (
    fragranceId: string,
    author: string,
    rating: number,
    comment: string
  ) => {
    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      author: author.trim() || (currentCustomer ? currentCustomer.name : 'Fragrance Enthusiast'),
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    setActiveFragrances((prev) =>
      prev.map((f) => {
        if (f.id === fragranceId) {
          const updatedReviews = [newReview, ...(f.reviews || [])];
          const updatedFragrance = { ...f, reviews: updatedReviews };
          if (selectedFragrance.id === fragranceId) {
            setSelectedFragrance(updatedFragrance);
          }
          return updatedFragrance;
        }
        return f;
      })
    );
  };

  const handleOrderPlaced = (
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
  ) => {
    const generatedId = paymentDetails?.razorpayOrderId
      ? `ARV-${paymentDetails.razorpayOrderId.slice(-6).toUpperCase()}`
      : 'ARV-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder: Order = {
      id: generatedId,
      customerName,
      customerEmail,
      phone: paymentDetails?.phone || '',
      address,
      city,
      items: cartItems.map((item) => ({
        id: item.fragrance.id,
        name: item.fragrance.name,
        quantity: item.quantity,
        price: item.fragrance.price,
        liquidColor: item.fragrance.liquidColor,
      })),
      total: cartItems.reduce((sum, item) => sum + item.fragrance.price * item.quantity, 0),
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Pending',
      upiId,
      paymentStatus: paymentStatus || 'Paid',
      razorpayPaymentId: paymentDetails?.razorpayPaymentId,
      razorpayOrderId: paymentDetails?.razorpayOrderId,
      razorpaySignature: paymentDetails?.razorpaySignature,
      invoiceNumber: paymentDetails?.invoiceNumber || `INV-${Date.now()}`
    };

    // Store order in state
    setOrders((prev) => [newOrder, ...prev]);

    // Reduce product stock in active fragrances catalog
    if (paymentStatus === 'Paid') {
      setActiveFragrances((prev) =>
        prev.map((f) => {
          const purchasedInCart = cartItems.find((ci) => ci.fragrance.id === f.id);
          if (purchasedInCart) {
            // If fragrance has a stock count, reduce it
            return {
              ...f,
              stock: Math.max(0, ((f as any).stock ?? 50) - purchasedInCart.quantity)
            };
          }
          return f;
        })
      );
    }

    setCartItems([]); // Clear shopping bag on verified success
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'Pending' | 'Shipped' | 'Delivered') => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const handleAddFragrance = (newFragrance: Fragrance) => {
    setActiveFragrances((prev) => [...prev, newFragrance]);
  };

  const handleUpdateFragrance = (updatedFragrance: Fragrance) => {
    setActiveFragrances((prev) =>
      prev.map((f) => (f.id === updatedFragrance.id ? updatedFragrance : f))
    );
    if (selectedFragrance.id === updatedFragrance.id) {
      setSelectedFragrance(updatedFragrance);
    }
  };

  const handleDeleteFragrance = (id: string) => {
    setActiveFragrances((prev) => prev.filter((f) => f.id !== id));
    if (selectedFragrance.id === id) {
      const remaining = activeFragrances.filter((f) => f.id !== id);
      if (remaining.length > 0) {
        setSelectedFragrance(remaining[0]);
      }
    }
  };
  
  // Questionnaire Flow State
  const [questionStep, setQuestionStep] = useState<number>(1);
  const [qType, setQType] = useState<FragranceFamily | 'Not sure' | ''>('');
  const [qOccasion, setQOccasion] = useState<OccasionType | ''>('');
  const [qIntensity, setQIntensity] = useState<'Light & fresh' | 'Medium & balanced' | 'Strong & long-lasting' | ''>('');
  const [qGender, setQGender] = useState<'Women' | 'Men' | 'Unisex' | ''>('');

  // AI Recommendation State
  const [recommendations, setRecommendations] = useState<{
    bestMatch: string;
    bestMatchReason: string;
    alternativePick: string;
    alternativePickReason: string;
    trySomethingNew: string;
    trySomethingNewReason: string;
    personalityDescription: string;
  } | null>(null);
  const [isRecommending, setIsRecommending] = useState<boolean>(false);
  const [aiWarning, setAiWarning] = useState<string>('');

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Greetings. I am **Arvaiya’s Official Fragrance Expert AI**. I am delighted to welcome you to our sensory library of organic perfumes. I can help you find your signature fragrance, explain scent profiles, or answer questions about our brand identity. \n\nFeel free to ask me anything or fill out our scent profile questionnaire on the left to get your personalized recommendation!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatting, setIsChatting] = useState<boolean>(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- PERSISTENCE & INIT ---
  useEffect(() => {
    // Load local storage if available
    const savedTheme = localStorage.getItem('arvaiya-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
    const savedProfile = localStorage.getItem('arvaiya-profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setUserProfile(parsed);
        fetchRecommendations(parsed);
      } catch (e) {
        console.error("Error reading saved profile", e);
      }
    }
    const savedCustomer = localStorage.getItem('arvaiya-customer');
    if (savedCustomer) {
      try {
        setCurrentCustomer(JSON.parse(savedCustomer));
      } catch (e) {
        console.error("Error reading saved customer", e);
      }
    }
    const savedWishlist = localStorage.getItem('arvaiya-wishlist');
    if (savedWishlist) {
      try {
        setWishlistIds(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Error reading saved wishlist", e);
      }
    }
  }, []);

  const handleToggleWishlist = (id: string) => {
    setWishlistIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('arvaiya-wishlist', JSON.stringify(next));
      return next;
    });
  };

  // Sync scroll on chat update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('arvaiya-theme', nextTheme);
  };

  // --- HANDLERS ---
  const handleSelectOption = (step: number, value: any) => {
    if (step === 1) {
      setQType(value);
      setQuestionStep(2);
    } else if (step === 2) {
      setQOccasion(value);
      setQuestionStep(3);
    } else if (step === 3) {
      setQIntensity(value);
      setQuestionStep(4);
    } else if (step === 4) {
      setQGender(value);
      // Finalizing questionnaire
      const finalProfile: UserProfile = {
        fragranceType: qType || 'Not sure',
        occasion: value ? qOccasion as OccasionType : 'All occasions',
        intensity: qIntensity || 'Medium & balanced',
        gender: value
      };
      setUserProfile(finalProfile);
      localStorage.setItem('arvaiya-profile', JSON.stringify(finalProfile));
      fetchRecommendations(finalProfile);
    }
  };

  const fetchRecommendations = async (profile: UserProfile) => {
    setIsRecommending(true);
    setAiWarning('');
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });
      const data = await res.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
        if (data.warning) {
          setAiWarning(data.warning);
        }
      }
    } catch (e: any) {
      console.error("Error getting recommendations:", e);
      setAiWarning("Connecting with local scent library...");
    } finally {
      setIsRecommending(false);
    }
  };

  const handleResetProfile = () => {
    setUserProfile(null);
    setRecommendations(null);
    setQuestionStep(1);
    setQType('');
    setQOccasion('');
    setQIntensity('');
    setQGender('');
    localStorage.removeItem('arvaiya-profile');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsChatting(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map(m => ({ role: m.role, text: m.text })),
          profile: userProfile
        })
      });
      const data = await res.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, {
          id: Math.random().toString(),
          role: 'model',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (e) {
      console.error("Chat reply error:", e);
      setChatMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'model',
        text: "I apologize, my olfactory senses are momentarily overwhelmed. Let me assure you: every Arvaiya perfume is crafted with impeccable consistency—sharing the exact same elegant glass bottle design and gold cap. How can I guide your fragrance journey today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsChatting(false);
    }
  };

  const formatText = (text: string) => {
    // Basic bold **text** parsing
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-amber-500">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Quick prompt presets
  const quickPrompts = [
    { label: "Bottle Design", text: "Tell me about Arvaiya's unique bottle and logo consistency rule." },
    { label: "Oud Majesty", text: "Describe the notes and luxury vibe of Oud Majesty." },
    { label: "Midnight Orchid", text: "What occasion is Midnight Orchid best suited for?" },
    { label: "Organic Scent", text: "What makes Arvaiya perfumes truly organic?" }
  ];

  // Colors mapping for intensity dots to represent the exact visual design in Arvaiya image
  const getIntensityDots = (count: number) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <span 
        key={idx} 
        className={`inline-block w-2.5 h-2.5 rounded-full mx-0.5 transition-all duration-300 ${
          idx < count 
            ? 'bg-amber-500 scale-110 shadow-sm shadow-amber-500/50' 
            : 'bg-neutral-300 dark:bg-neutral-700 opacity-40'
        }`}
      />
    ));
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out ${
      theme === 'dark' 
        ? 'bg-[#1F2F5C] text-neutral-100 selection:bg-[#C9A35A]/30 selection:text-white' 
        : 'bg-[#F8F5EE] text-[#222222] selection:bg-[#EFE6D3] selection:text-[#222222]'
    }`}>
      {/* Background radial glowing ambient halos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top left navy/blue glow */}
        <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full filter blur-[180px] transition-all duration-1000 ${
          theme === 'dark' ? 'bg-[#1F2F5C]/40' : 'bg-[#EFE6D3]/40'
        }`} />
        
        {/* Center-right warm beige/gold glow */}
        <div className={`absolute top-1/4 right-10 w-[500px] h-[500px] rounded-full filter blur-[160px] transition-all duration-1000 ${
          theme === 'dark' ? 'bg-[#C9A35A]/20' : 'bg-[#C9A35A]/15'
        }`} />

        {/* Center-left subtle highlight */}
        <div className={`absolute top-1/2 left-10 w-[450px] h-[450px] rounded-full filter blur-[150px] transition-all duration-1000 ${
          theme === 'dark' ? 'bg-[#1F2F5C]/30' : 'bg-[#EFE6D3]/30'
        }`} />

        {/* Bottom right rich deep glow */}
        <div className={`absolute bottom-10 right-10 w-[600px] h-[600px] rounded-full filter blur-[200px] transition-all duration-1000 ${
          theme === 'dark' ? 'bg-[#142042]/50' : 'bg-[#C9A35A]/10'
        }`} />

        {/* Extra warm ambient light at the very bottom left */}
        <div className={`absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full filter blur-[180px] transition-all duration-1000 ${
          theme === 'dark' ? 'bg-[#C9A35A]/15' : 'bg-[#EFE6D3]/50'
        }`} />
      </div>

      {/* --- EXQUISITE BRAND HEADER --- */}
      <header className={`relative z-10 py-6 px-6 lg:px-12 border-b transition-colors duration-500 flex flex-col md:flex-row items-center justify-between gap-4 ${
        theme === 'dark' ? 'border-[#D8CDBA]/10 bg-[#142042]/80' : 'border-[#D8CDBA]/60 bg-[#FFFFFF]/70'
      } backdrop-blur-md`}>
        {/* Brand identity - Perfect match for Arvaiya branding */}
        <div className="text-center md:text-left flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
            theme === 'dark' ? 'border-[#C9A35A]/25 bg-[#142042]/50' : 'border-[#D8CDBA] bg-[#FFFFFF]'
          }`}>
            <Flower className={`w-5 h-5 ${theme === 'dark' ? 'text-[#C9A35A]' : 'text-[#222222]'}`} />
          </div>
          <div>
            <h1 className="text-3xl font-light tracking-[0.22em] font-serif uppercase leading-tight">
              ARVAIYA
            </h1>
            <p className="text-[10px] tracking-[0.3em] uppercase opacity-70 font-medium">
              Essence of Elegance • Organic Perfumes
            </p>
          </div>
        </div>

        {/* Info panel badge */}
        <div className={`hidden lg:flex items-center gap-2.5 px-4 py-2 rounded-full border text-xs font-medium tracking-wide ${
          theme === 'dark' ? 'border-[#C9A35A]/20 bg-[#C9A35A]/5 text-[#C9A35A]' : 'border-[#D8CDBA] bg-[#EFE6D3]/40 text-[#222222]'
        }`}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Active Fragrance Expert & AI Recommender Ready</span>
        </div>

        {/* Theme and Action Toggles */}
        <div className="flex items-center gap-3">
          {userProfile && (
            <button 
              onClick={handleResetProfile}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs tracking-wider uppercase font-medium transition-all ${
                theme === 'dark' 
                  ? 'border-[#C9A35A]/20 hover:bg-[#142042] text-neutral-300' 
                  : 'border-[#D8CDBA] hover:bg-[#EFE6D3]/30 text-neutral-700'
              }`}
              title="Reset scent preference"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Scent Profile
            </button>
          )}

          {/* Customer Lounge / Sign In launcher */}
          {(() => {
            const customerOrders = currentCustomer
              ? orders.filter(o => o.customerEmail.toLowerCase() === currentCustomer.email.toLowerCase())
              : [];
            const scentPts = currentCustomer ? 100 + Math.floor(customerOrders.reduce((acc, o) => acc + o.total, 0) / 50) : 0;
            return (
              <button 
                onClick={() => setIsCustomerOpen(true)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs tracking-wider uppercase font-medium transition-all ${
                  currentCustomer
                    ? theme === 'dark'
                      ? 'border-[#C9A35A]/50 bg-[#C9A35A]/10 text-[#C9A35A]'
                      : 'border-[#C9A35A] bg-[#EFE6D3]/60 text-[#222222]'
                    : theme === 'dark' 
                      ? 'border-[#C9A35A]/30 hover:bg-[#142042] text-[#C9A35A]' 
                      : 'border-[#D8CDBA] hover:bg-[#1F2F5C] hover:text-white text-[#C9A35A]'
                }`}
                title={currentCustomer ? `Logged in as ${currentCustomer.name} (${scentPts} Scent Points)` : "Customer Sign In & Lounge"}
                id="customer-auth-header-btn"
              >
                <User className="w-3.5 h-3.5" />
                <span>{currentCustomer ? currentCustomer.name : 'Sign In'}</span>
                {currentCustomer && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-extrabold font-mono shadow-sm ml-0.5">
                    <Sparkles className="w-2.5 h-2.5 fill-black" />
                    {scentPts} pts
                  </span>
                )}
              </button>
            );
          })()}

          {/* Admin Dashboard launcher */}
          <button 
            onClick={() => setIsAdminOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs tracking-wider uppercase font-medium transition-all ${
              theme === 'dark' 
                ? 'border-[#C9A35A]/30 hover:bg-[#142042] text-[#C9A35A]' 
                : 'border-[#D8CDBA] hover:bg-[#1F2F5C] hover:text-white text-[#C9A35A]'
            }`}
            title="Open Boutique Management Console"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Admin
          </button>

          {/* Custom Perfume Studio launcher */}
          <button 
            onClick={() => {
              const studio = document.getElementById('custom-perfume-studio');
              if (studio) studio.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-500/50 bg-amber-500/10 text-amber-400 font-bold text-xs uppercase tracking-wider hover:bg-amber-500/20 transition-all shadow-sm"
            title="Create Your Own Custom Perfume"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Blend Perfume</span>
          </button>

          {/* Order Shipment Tracker launcher */}
          <button 
            onClick={() => setIsTrackerOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs tracking-wider uppercase font-medium transition-all ${
              theme === 'dark' 
                ? 'border-[#C9A35A]/20 hover:bg-[#142042] text-teal-400' 
                : 'border-[#D8CDBA] hover:bg-[#EFE6D3]/30 text-teal-700'
            }`}
            title="Track Your Shipment"
          >
            <Truck className="w-3.5 h-3.5" />
            Track Order
          </button>

          {/* Wishlist badge launcher button */}
          <button 
            onClick={() => setIsWishlistOpen(true)}
            className={`relative p-2.5 rounded-full border transition-all duration-500 flex items-center justify-center ${
              theme === 'dark' 
                ? 'border-rose-500/30 bg-[#142042] text-rose-400 hover:bg-[#1F2F5C]' 
                : 'border-rose-300 bg-[#FFFFFF] text-rose-500 hover:bg-rose-50'
            }`}
            title={`View Wishlist (${wishlistIds.length} saved)`}
            id="header-wishlist-btn"
          >
            <Heart className={`w-4 h-4 ${wishlistIds.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'}`} />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {wishlistIds.length}
              </span>
            )}
          </button>

          {/* Persistent luxury shopping bag button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className={`relative p-2.5 rounded-full border transition-all duration-500 flex items-center justify-center ${
              theme === 'dark' 
                ? 'border-[#C9A35A]/20 bg-[#142042] text-neutral-200 hover:bg-[#1F2F5C]' 
                : 'border-[#D8CDBA] bg-[#FFFFFF] text-[#222222] hover:bg-[#EFE6D3]/40'
            }`}
            title="Open Your Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C9A35A] text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>

          {/* Theme Switcher with Beautiful Gold Halo */}
          <button 
            onClick={toggleTheme}
            className={`relative p-2.5 rounded-full border transition-all duration-500 flex items-center justify-center ${
              theme === 'dark' 
                ? 'border-[#C9A35A]/20 bg-[#142042] text-[#C9A35A] hover:bg-[#1F2F5C] hover:shadow-[0_0_15px_rgba(201,163,90,0.25)]' 
                : 'border-[#D8CDBA] bg-[#FFFFFF] text-[#222222] hover:bg-[#F8F5EE] hover:shadow-[0_0_15px_rgba(201,163,90,0.15)]'
            }`}
            title={theme === 'dark' ? 'Switch to Pearlescent Light Palette' : 'Switch to Obsidian Dark Palette'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* --- MAIN INTERACTIVE CORE PANEL --- */}
      <main className="relative z-10 max-w-[1700px] mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ================= COLUMN 1: AI SCENT DISCOVERY & DASHBOARD (Left 4 cols) ================= */}
        <section className="lg:col-span-4 flex flex-col h-full">
          <div className={`p-5 rounded-2xl border flex-1 flex flex-col transition-colors duration-500 ${
            theme === 'dark' ? 'bg-[#142042]/95 border-[#C9A35A]/20 shadow-xl' : 'bg-[#FFFFFF] border-[#D8CDBA] shadow-md'
          }`}>
            
            <AnimatePresence mode="wait">
              {!userProfile ? (
                // --- INACTIVE PROFILE: QUESTIONNAIRE ---
                <motion.div 
                  key="questionnaire"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col h-full justify-between"
                >
                  <div>
                    {/* Progress indicators */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] tracking-[0.2em] font-semibold text-amber-500 uppercase">
                        Scent Intelligence Discovery
                      </span>
                      <span className="text-xs font-semibold opacity-60">
                        Step {questionStep} of 4
                      </span>
                    </div>

                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-[3px] rounded-full overflow-hidden mb-6">
                      <motion.div 
                        className="bg-amber-500 h-full"
                        initial={{ width: '25%' }}
                        animate={{ width: `${questionStep * 25}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>

                    {/* Step 1: Preferred Fragrance Type */}
                    {questionStep === 1 && (
                      <div className="space-y-4">
                        <h2 className="text-2xl font-light font-serif tracking-wide">
                          Which fragrance family speaks to your senses?
                        </h2>
                        <p className="text-xs opacity-70 leading-relaxed mb-4">
                          Select a familiar direction or let the AI guide your journey.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Floral', icon: <Flower className="w-3.5 h-3.5" />, desc: 'Rose, jasmine, blossom' },
                            { label: 'Fresh / Citrus / Aquatic', icon: <Droplet className="w-3.5 h-3.5" />, desc: 'Sea breeze, mint, zest' },
                            { label: 'Woody', icon: <Leaf className="w-3.5 h-3.5" />, desc: 'Oud, cedar, patchouli' },
                            { label: 'Oriental / Spicy', icon: <Flame className="w-3.5 h-3.5" />, desc: 'Spices, warm amber' },
                            { label: 'Fruity', icon: <Sparkle className="w-3.5 h-3.5" />, desc: 'Peach, wild lychee' },
                            { label: 'Powdery', icon: <Layers className="w-3.5 h-3.5" />, desc: 'Iris, clean musk, cotton' },
                            { label: 'Sweet / Gourmand', icon: <Sparkles className="w-3.5 h-3.5" />, desc: 'Vanilla, praline, caramel' },
                            { label: 'Not sure', icon: <Compass className="w-3.5 h-3.5" />, desc: 'Expert curation' }
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={() => handleSelectOption(1, item.label)}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                theme === 'dark' 
                                  ? 'border-neutral-800 bg-neutral-900/40 hover:border-amber-500/40 hover:bg-neutral-900' 
                                  : 'border-neutral-200 bg-neutral-50/50 hover:border-amber-500/40 hover:bg-neutral-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-amber-500">{item.icon}</span>
                                <span className="text-xs font-semibold tracking-wide">{item.label}</span>
                              </div>
                              <span className="text-[10px] opacity-65 font-medium leading-none">{item.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Occasion */}
                    {questionStep === 2 && (
                      <div className="space-y-4">
                        <h2 className="text-2xl font-light font-serif tracking-wide">
                          Where do you intend to wear this scent most?
                        </h2>
                        <p className="text-xs opacity-70 leading-relaxed mb-4">
                          Occasions influence physical scent dissipation and projection.
                        </p>
                        <div className="space-y-2">
                          {[
                            { value: 'Daily / Office', label: '🏢 Office / Daily Wear', desc: 'Clean, professional, calming projection' },
                            { value: 'College', label: '🎓 College & Daytime', desc: 'Bright, welcoming, approachable character' },
                            { value: 'Dates', label: '💕 Dates & Romance', desc: 'Seductive, soft, unforgettable sillage' },
                            { value: 'Parties', label: '🎉 Party & Evening out', desc: 'Bold, confident, and magnetic scent envelope' },
                            { value: 'Festivals / Weddings', label: '👰 Festivals & Weddings', desc: 'Opulent, deep, royal traditional luxury' },
                            { value: 'All occasions', label: '✨ Versatile All-Rounder', desc: 'Perfect daily transition' }
                          ].map((item) => (
                            <button
                              key={item.value}
                              onClick={() => handleSelectOption(2, item.value)}
                              className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                                theme === 'dark' 
                                  ? 'border-neutral-800 bg-neutral-900/40 hover:border-amber-500/40 hover:bg-neutral-900' 
                                  : 'border-neutral-200 bg-neutral-50/50 hover:border-amber-500/40 hover:bg-neutral-50'
                              }`}
                            >
                              <div>
                                <span className="text-xs font-semibold tracking-wide block">{item.label}</span>
                                <span className="text-[10px] opacity-65 font-medium">{item.desc}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-amber-500 opacity-60" />
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => setQuestionStep(1)} 
                          className="text-xs text-neutral-500 hover:text-amber-500 flex items-center gap-1 mt-4 transition-colors"
                        >
                          ← Go Back
                        </button>
                      </div>
                    )}

                    {/* Step 3: Intensity */}
                    {questionStep === 3 && (
                      <div className="space-y-4">
                        <h2 className="text-2xl font-light font-serif tracking-wide">
                          What is your preferred fragrance intensity?
                        </h2>
                        <p className="text-xs opacity-70 leading-relaxed mb-4">
                          Stronger intensities rely heavily on base woods and rich resins.
                        </p>
                        <div className="space-y-2.5">
                          {[
                            { label: 'Light & fresh', desc: 'Subtle skin scent, elegant whispering presence' },
                            { label: 'Medium & balanced', desc: 'Generous projection, classic day-to-evening harmony' },
                            { label: 'Strong & long-lasting', desc: 'Commanding signature envelope with a lasting sillage' }
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={() => handleSelectOption(3, item.label)}
                              className={`w-full p-4 rounded-xl border text-left transition-all ${
                                theme === 'dark' 
                                  ? 'border-neutral-800 bg-neutral-900/40 hover:border-amber-500/40 hover:bg-neutral-900' 
                                  : 'border-neutral-200 bg-neutral-50/50 hover:border-amber-500/40 hover:bg-neutral-50'
                              }`}
                            >
                              <span className="text-xs font-semibold tracking-wide block mb-1">{item.label}</span>
                              <span className="text-[10px] opacity-65 block">{item.desc}</span>
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => setQuestionStep(2)} 
                          className="text-xs text-neutral-500 hover:text-amber-500 flex items-center gap-1 mt-4 transition-colors"
                        >
                          ← Go Back
                        </button>
                      </div>
                    )}

                    {/* Step 4: Gender */}
                    {questionStep === 4 && (
                      <div className="space-y-4">
                        <h2 className="text-2xl font-light font-serif tracking-wide">
                          Your gender preference?
                        </h2>
                        <p className="text-xs opacity-70 leading-relaxed mb-4">
                          All Arvaiya fragrances are organic, carrying a highly adaptive neutral base.
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Women', desc: 'Femme leaning' },
                            { label: 'Men', desc: 'Homme leaning' },
                            { label: 'Unisex', desc: 'Absolute fluid' }
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={() => handleSelectOption(4, item.label)}
                              className={`p-4 rounded-xl border text-center transition-all ${
                                theme === 'dark' 
                                  ? 'border-neutral-800 bg-neutral-900/40 hover:border-amber-500/40 hover:bg-neutral-900' 
                                  : 'border-neutral-200 bg-neutral-50/50 hover:border-amber-500/40 hover:bg-neutral-50'
                              }`}
                            >
                              <span className="text-xs font-semibold tracking-wide block mb-1">{item.label}</span>
                              <span className="text-[10px] opacity-60 leading-none">{item.desc}</span>
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => setQuestionStep(3)} 
                          className="text-xs text-neutral-500 hover:text-amber-500 flex items-center gap-1 mt-4 transition-colors"
                        >
                          ← Go Back
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={`mt-8 p-3.5 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2.5 ${
                    theme === 'dark' ? 'border-amber-500/10 bg-amber-500/5 text-amber-300/80' : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                  }`}>
                    <Info className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>
                      “All Arvaiya fragrances share a signature bottle and logo design, expressing individuality only through color and scent.”
                    </span>
                  </div>
                </motion.div>
              ) : (
                // --- ACTIVE PROFILE: SCENT REPORT & RECOMMENDATIONS ---
                <motion.div 
                  key="scent-report"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col h-full justify-between gap-4"
                >
                  <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
                    
                    {/* Header profile badge */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs tracking-[0.2em] font-semibold text-amber-500 uppercase flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" />
                        Scent Profile Report
                      </h3>
                      <button 
                        onClick={handleResetProfile}
                        className="text-[10px] tracking-wide text-neutral-500 hover:text-amber-500 hover:underline flex items-center gap-1"
                      >
                        Retake
                      </button>
                    </div>

                    {/* Scent personality description (AI Generated) */}
                    {isRecommending ? (
                      <div className="space-y-3 py-6">
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-full" />
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-5/6" />
                        <p className="text-xs italic text-center text-amber-500/80">AI Consultant is hand-blending your custom recommendation...</p>
                      </div>
                    ) : (
                      <>
                        <div className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-500 ${
                          theme === 'dark' ? 'border-amber-500/25 bg-amber-500/5' : 'border-amber-200 bg-amber-50/50'
                        }`}>
                          <div className="absolute top-2 right-2 opacity-10">
                            <Flower className="w-12 h-12 text-amber-600" />
                          </div>
                          <h4 className="font-serif italic text-base font-bold text-amber-600 dark:text-amber-400 mb-2">
                            Scent Personality Profile
                          </h4>
                          <p className="text-xs leading-relaxed opacity-90 italic">
                            “{recommendations?.personalityDescription || "You seek premium organic harmony, balancing modern luxury with emotional memories and pure natural ingredients."}”
                          </p>
                        </div>

                        {/* Top Recommendations (Best, Alternative, Surprise) */}
                        <div className="space-y-3">
                          <h4 className="text-xs tracking-[0.15em] font-bold uppercase opacity-80">
                            Your Personal Best Picks
                          </h4>

                          {/* 1. Best Match */}
                          {recommendations?.bestMatch && (() => {
                            const match = getFragranceById(recommendations.bestMatch);
                            if (!match) return null;
                            return (
                              <div 
                                onClick={() => handleSelectFragrance(match)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] ${
                                  selectedFragrance.id === match.id
                                    ? 'border-amber-500 bg-amber-500/10'
                                    : theme === 'dark' ? 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700' : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-300'
                                }`}
                              >
                                <div className="flex gap-4">
                                  <div className="w-20 h-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                    {match.imageUrl ? (
                                      <img 
                                        src={match.imageUrl} 
                                        alt={match.name} 
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div 
                                        className="w-full h-full" 
                                        style={{ backgroundColor: match.capColor }}
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold tracking-widest text-amber-500 uppercase">Best Match</span>
                                        <span className="text-[10px] opacity-60 font-semibold">{match.family}</span>
                                      </div>
                                      <h5 className="font-serif italic font-bold text-sm tracking-wide mt-0.5">{match.name}</h5>
                                      <p className="text-[10px] opacity-70 line-clamp-2 mt-1 leading-snug">{recommendations.bestMatchReason}</p>
                                    </div>
                                    <div className="text-xs font-bold text-amber-500 mt-1">
                                      ₹{match.price.toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDirectBuyNow(match);
                                  }}
                                  className="mt-3 w-full py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] tracking-widest font-extrabold uppercase transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/10 active:scale-95"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  Buy Now
                                </button>
                              </div>
                            );
                          })()}

                          {/* 2. Alternative Pick */}
                          {recommendations?.alternativePick && (() => {
                            const match = getFragranceById(recommendations.alternativePick);
                            if (!match) return null;
                            return (
                              <div 
                                onClick={() => handleSelectFragrance(match)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] ${
                                  selectedFragrance.id === match.id
                                    ? 'border-amber-500 bg-amber-500/10'
                                    : theme === 'dark' ? 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700' : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-300'
                                }`}
                              >
                                <div className="flex gap-4">
                                  <div className="w-20 h-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                    {match.imageUrl ? (
                                      <img 
                                        src={match.imageUrl} 
                                        alt={match.name} 
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div 
                                        className="w-full h-full" 
                                        style={{ backgroundColor: match.capColor }}
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold tracking-widest text-blue-400 uppercase">Alternative</span>
                                        <span className="text-[10px] opacity-60 font-semibold">{match.family}</span>
                                      </div>
                                      <h5 className="font-serif italic font-bold text-sm tracking-wide mt-0.5">{match.name}</h5>
                                      <p className="text-[10px] opacity-70 line-clamp-2 mt-1 leading-snug">{recommendations.alternativePickReason}</p>
                                    </div>
                                    <div className="text-xs font-bold text-amber-500 mt-1">
                                      ₹{match.price.toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDirectBuyNow(match);
                                  }}
                                  className="mt-3 w-full py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] tracking-widest font-extrabold uppercase transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/10 active:scale-95"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  Buy Now
                                </button>
                              </div>
                            );
                          })()}

                          {/* 3. Try Something New */}
                          {recommendations?.trySomethingNew && (() => {
                            const match = getFragranceById(recommendations.trySomethingNew);
                            if (!match) return null;
                            return (
                              <div 
                                onClick={() => handleSelectFragrance(match)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] ${
                                  selectedFragrance.id === match.id
                                    ? 'border-amber-500 bg-amber-500/10'
                                    : theme === 'dark' ? 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700' : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-300'
                                }`}
                              >
                                <div className="flex gap-4">
                                  <div className="w-20 h-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                    {match.imageUrl ? (
                                      <img 
                                        src={match.imageUrl} 
                                        alt={match.name} 
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div 
                                        className="w-full h-full" 
                                        style={{ backgroundColor: match.capColor }}
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold tracking-widest text-purple-400 uppercase">Try New Horizon</span>
                                        <span className="text-[10px] opacity-60 font-semibold">{match.family}</span>
                                      </div>
                                      <h5 className="font-serif italic font-bold text-sm tracking-wide mt-0.5">{match.name}</h5>
                                      <p className="text-[10px] opacity-70 line-clamp-2 mt-1 leading-snug">{recommendations.trySomethingNewReason}</p>
                                    </div>
                                    <div className="text-xs font-bold text-amber-500 mt-1">
                                      ₹{match.price.toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDirectBuyNow(match);
                                  }}
                                  className="mt-3 w-full py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] tracking-widest font-extrabold uppercase transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/10 active:scale-95"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  Buy Now
                                </button>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Seasonal Picks Block */}
                        <div className={`p-4 rounded-xl border space-y-2 ${
                          theme === 'dark' ? 'border-neutral-800 bg-neutral-900/20' : 'border-neutral-200 bg-neutral-50/50'
                        }`}>
                          <h4 className="text-[10px] tracking-[0.18em] font-extrabold text-neutral-400 uppercase block mb-1">
                            Seasonal Suggestions
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-neutral-100 dark:bg-neutral-900/50 rounded">
                              <span className="block text-[8px] font-bold tracking-widest text-orange-400 uppercase">☀️ Summer Pick</span>
                              <span className="font-serif italic font-semibold">Coastal Breeze</span>
                            </div>
                            <div className="p-2 bg-neutral-100 dark:bg-neutral-900/50 rounded">
                              <span className="block text-[8px] font-bold tracking-widest text-indigo-400 uppercase">❄️ Winter Pick</span>
                              <span className="font-serif italic font-semibold">Oud Majesty</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                  </div>

                  {aiWarning && (
                    <div className="p-2 text-center text-[10px] text-amber-500/80 bg-amber-500/5 rounded border border-amber-500/10">
                      {aiWarning}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </section>

        {/* ================= COLUMN 2: THE VANITY DISPLAY TABLE (Center 4 cols) ================= */}
        <section id="vanity-table" className="lg:col-span-4 flex flex-col h-full gap-6 scroll-mt-6">
          
          {/* A. Miniature Fragrance Shelf Collection (Exactly representing the grid list from the image) */}
          <div className={`p-4 rounded-2xl border transition-colors duration-500 ${
            theme === 'dark' ? 'bg-[#13223f]/95 border-neutral-900 shadow-xl' : 'bg-white border-neutral-100 shadow-md'
          }`}>
            <h3 className="text-xs tracking-[0.2em] font-semibold text-amber-500 uppercase mb-3 text-center">
              ARVAIYA FRAGRANCE COLLECTION
            </h3>
            
            {/* 12-perfume high-clarity miniature vanity list */}
            <div className="grid grid-cols-4 gap-2 max-h-[170px] overflow-y-auto pr-1">
              {activeFragrances.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFragrance(f)}
                  className={`p-1.5 rounded-lg border flex flex-col items-center justify-center transition-all ${
                    selectedFragrance.id === f.id
                      ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500'
                      : theme === 'dark' ? 'border-neutral-800 bg-neutral-950 hover:border-neutral-700' : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
                  }`}
                >
                  {/* Color swatch represents bottle cap color */}
                  <div 
                    className="w-5 h-5 rounded-[2px] shadow-sm mb-1 border border-white/15"
                    style={{ backgroundColor: f.capColor }}
                  />
                  <span className="text-[8px] font-bold tracking-wider truncate w-full text-center uppercase block leading-none">
                    {f.name.split(' ').pop()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* B. Focus Active Fragrance Details Card (Direct mirror of the cards in the image) */}
          <div className={`p-5 rounded-2xl border flex-1 flex flex-col justify-between transition-colors duration-500 ${
            theme === 'dark' ? 'bg-[#13223f]/95 border-neutral-900 shadow-xl' : 'bg-white border-neutral-100 shadow-md'
          }`}>
            
            {/* Scent Visual (Interactive 3D / Real Photo) */}
            <div className="relative py-2 flex flex-col items-center justify-center h-64">
              {vanityViewMode === 'photo' && selectedFragrance.imageUrl ? (
                <div className="relative w-44 h-56 rounded-2xl overflow-hidden shadow-lg border border-neutral-200/40 dark:border-neutral-800/40 bg-white/5">
                  <img 
                    src={selectedFragrance.imageUrl} 
                    alt={selectedFragrance.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-all duration-750 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              ) : (
                <DigitalBottle fragrance={selectedFragrance} size="sm" active={true} view={digitalView} />
              )}

              {/* View Switcher Controls Overlay */}
              <div className="absolute bottom-1.5 flex flex-col items-center gap-2 z-20 scale-90 select-none">
                {/* 3 Views Digital sub-tabs */}
                {vanityViewMode === 'digital' && (
                  <div className="flex gap-1 bg-neutral-900/95 dark:bg-neutral-950/95 p-0.5 rounded-md border border-neutral-800 shadow-lg backdrop-blur-md">
                    <button
                      onClick={() => setDigitalView('front')}
                      className={`px-2 py-0.5 rounded-[3px] text-[8px] tracking-wider uppercase font-bold transition-all ${
                        digitalView === 'front'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'text-neutral-400 hover:text-neutral-200 border border-transparent'
                      }`}
                    >
                      Front
                    </button>
                    <button
                      onClick={() => setDigitalView('side')}
                      className={`px-2 py-0.5 rounded-[3px] text-[8px] tracking-wider uppercase font-bold transition-all ${
                        digitalView === 'side'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'text-neutral-400 hover:text-neutral-200 border border-transparent'
                      }`}
                    >
                      Side
                    </button>
                    <button
                      onClick={() => setDigitalView('perspective')}
                      className={`px-2 py-0.5 rounded-[3px] text-[8px] tracking-wider uppercase font-bold transition-all ${
                        digitalView === 'perspective'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'text-neutral-400 hover:text-neutral-200 border border-transparent'
                      }`}
                    >
                      3D Perspective
                    </button>
                  </div>
                )}

                <div className="flex gap-1 bg-neutral-100/90 dark:bg-neutral-950/90 p-0.5 rounded-lg border border-neutral-200/40 dark:border-neutral-800/40 backdrop-blur-sm shadow-md">
                  <button
                    onClick={() => setVanityViewMode('photo')}
                    className={`px-2 py-1 rounded text-[9px] tracking-wider uppercase font-bold transition-all ${
                      vanityViewMode === 'photo'
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Photo
                  </button>
                  <button
                    onClick={() => setVanityViewMode('digital')}
                    className={`px-2 py-1 rounded text-[9px] tracking-wider uppercase font-bold transition-all ${
                      vanityViewMode === 'digital'
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Digital
                  </button>
                </div>
              </div>

            </div>

            {/* Scent notes & metadata breakdown mirroring the card from the image */}
            <div className="space-y-4 border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-2">
              <div className="text-center">
                <span className="text-[10px] tracking-[0.2em] font-bold text-amber-500 block uppercase mb-0.5">
                  {selectedFragrance.family}
                </span>
                <h3 className="font-serif italic font-bold text-xl tracking-wider">
                  {selectedFragrance.name}
                </h3>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const revs = selectedFragrance.reviews || [];
                      const avg = revs.length > 0 ? revs.reduce((a, b) => a + b.rating, 0) / revs.length : 5;
                      return (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-neutral-600'}`}
                        />
                      );
                    })}
                  </div>
                  <span className="font-mono text-xs text-amber-400 font-bold">
                    {selectedFragrance.reviews && selectedFragrance.reviews.length > 0
                      ? (selectedFragrance.reviews.reduce((a, b) => a + b.rating, 0) / selectedFragrance.reviews.length).toFixed(1)
                      : '5.0'}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    ({selectedFragrance.reviews ? selectedFragrance.reviews.length : 0} {selectedFragrance.reviews?.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>

              {/* Scent notes block with active interactive pills */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {selectedFragrance.notes.map((note) => {
                    const isActive = activeNoteHighlight === note;
                    return (
                      <button 
                        key={note} 
                        onClick={() => setActiveNoteHighlight(isActive ? null : note)}
                        className={`text-[9px] tracking-wider px-2.5 py-1 rounded-full font-bold transition-all transform active:scale-95 ${
                          isActive
                            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 border border-amber-400'
                            : theme === 'dark' 
                              ? 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-amber-500/50 hover:text-amber-400' 
                              : 'bg-neutral-100 text-neutral-700 border border-neutral-200 hover:border-amber-500 hover:text-amber-600'
                        }`}
                        title={`Explore ${note} note profile`}
                      >
                        {note} {isActive ? '✨' : ''}
                      </button>
                    );
                  })}
                </div>
                {activeNoteHighlight && (
                  <p className="text-[10px] text-amber-400 font-mono text-center animate-fade-in bg-amber-500/10 py-1 px-2 rounded-lg border border-amber-500/20">
                    Active Note Accord: <strong>{activeNoteHighlight}</strong> — Infused in organic cold-pressed oil base.
                  </p>
                )}
              </div>

              {/* Scent description & emotional Vibe */}
              <div className="text-center space-y-1">
                <p className="text-xs leading-relaxed opacity-85">
                  {selectedFragrance.description}
                </p>
                <p className="text-[11px] leading-relaxed italic text-amber-500">
                  {selectedFragrance.vibe}
                </p>
              </div>

              {/* Scent Intensity display dots exactly as shown on the official cards in the image */}
              <div className="flex items-center justify-center gap-3 bg-neutral-100 dark:bg-neutral-900/60 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <span className="text-[9px] font-extrabold tracking-widest text-neutral-400 uppercase">
                  INTENSITY:
                </span>
                <div className="flex items-center">
                  {getIntensityDots(selectedFragrance.intensity)}
                </div>
              </div>

              {/* Add to Bag and Buy Now Buttons for active showcased fragrance */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleAddToBag(selectedFragrance)}
                  className="py-2.5 px-3 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Add to Bag
                </button>
                <button
                  onClick={() => handleDirectBuyNow(selectedFragrance)}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  Buy Now
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ================= COLUMN 3: ARVAIYA FRAGRANCE AI EXPERT CHATBOT (Right 4 cols) ================= */}
        <section className="lg:col-span-4 flex flex-col h-full">
          <div className={`p-5 rounded-2xl border flex-1 flex flex-col justify-between transition-colors duration-500 h-[calc(100vh-200px)] lg:h-auto ${
            theme === 'dark' ? 'bg-[#13223f]/95 border-neutral-900 shadow-xl' : 'bg-white border-neutral-100 shadow-md'
          }`}>
            
            {/* Title & Status indicator */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <div>
                  <h3 className="font-serif italic font-bold text-base tracking-wide leading-none">
                    Arvaiya Expert Consultant
                  </h3>
                  <span className="text-[9px] tracking-wider text-neutral-500 uppercase font-semibold">
                    Luxury AI Guide
                  </span>
                </div>
              </div>
              <MessageSquare className="w-4 h-4 text-amber-500" />
            </div>

            {/* Chat Messages Feed container */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 max-h-[calc(100vh-420px)] lg:max-h-[380px]">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-amber-600 text-white rounded-tr-none'
                      : theme === 'dark'
                        ? 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none'
                        : 'bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-tl-none'
                  }`}>
                    {/* Parse bold text helper */}
                    <p className="whitespace-pre-line">{formatText(msg.text)}</p>
                  </div>
                  <span className="text-[9px] text-neutral-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
              
              {isChatting && (
                <div className="flex items-center gap-1.5 p-3 bg-neutral-100 dark:bg-neutral-900/50 rounded-2xl w-24">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Prompt presets / starters */}
            <div className="space-y-2 mb-3">
              <span className="text-[9px] tracking-wider font-extrabold text-neutral-400 uppercase block">
                Ask your Expert:
              </span>
              <div className="flex flex-wrap gap-1">
                {quickPrompts.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => handleSendMessage(q.text)}
                    className={`text-[9px] font-medium px-2 py-1.5 rounded border transition-all ${
                      theme === 'dark'
                        ? 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 hover:border-amber-500/30 text-neutral-300'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-amber-500/30 text-neutral-700'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form Bar */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                placeholder="Ask about ingredients, note layers, bottle design..."
                className={`flex-1 p-2.5 rounded-xl text-xs outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-neutral-950 border border-neutral-900 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 text-white'
                    : 'bg-neutral-50 border border-neutral-200 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 text-neutral-900'
                }`}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isChatting}
                className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-md shadow-amber-600/20 flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </section>

      </main>

      {/* Bespoke "Create Your Own Perfume" Atelier Studio */}
      <CustomPerfumeStudio 
        onAddToBag={handleAddToBag} 
        onBuyNow={handleDirectBuyNow} 
        theme={theme} 
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Interactive Boutique Product Catalog */}
      <div id="perfume-catalog">
        <ShopCatalog 
          fragrances={activeFragrances}
          onAddToBag={handleAddToBag}
          onBuyNow={handleDirectBuyNow}
          onSelect={handleSelectFragrance}
          selectedFragrance={selectedFragrance}
          theme={theme}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          onAddReview={handleAddReview}
        />
      </div>

      {/* Slide-out Shopping Bag Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        theme={theme}
      />

      {/* Saved Fragrances Wishlist Modal */}
      <WishlistModal 
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlistIds}
        allFragrances={activeFragrances}
        onToggleWishlist={handleToggleWishlist}
        onAddToBag={handleAddToBag}
        theme={theme}
      />

      {/* Transaction & Secure Payment Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderPlaced={handleOrderPlaced}
        theme={theme}
        currentCustomer={currentCustomer}
      />

      {/* Customer Lounge Sign In & Auth Modal */}
      <CustomerAuthModal
        isOpen={isCustomerOpen}
        onClose={() => setIsCustomerOpen(false)}
        onLoginSuccess={(customer) => {
          setCurrentCustomer(customer);
          localStorage.setItem('arvaiya-customer', JSON.stringify(customer));
        }}
        onLogout={() => {
          setCurrentCustomer(null);
          localStorage.removeItem('arvaiya-customer');
        }}
        currentCustomer={currentCustomer}
        orders={orders}
        theme={theme}
      />

      {/* Administrative Business Operations Console */}
      <AdminPanel 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        fragrances={activeFragrances}
        onAddFragrance={handleAddFragrance}
        onUpdateFragrance={handleUpdateFragrance}
        onDeleteFragrance={handleDeleteFragrance}
        theme={theme}
      />

      {/* Customer Order Tracker Console */}
      <OrderTrackerModal 
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        orders={orders}
        theme={theme}
      />

      {/* Organic FAQ Section */}
      <OrganicFAQ theme={theme} />

      {/* --- PREMIUM LUXURY FOOTER --- */}
      <footer className={`py-6 px-6 text-center text-[11px] tracking-wider transition-colors duration-500 border-t ${
        theme === 'dark' ? 'border-neutral-900 bg-black/60 text-neutral-500' : 'border-neutral-200 bg-white/40 text-neutral-600'
      }`}>
        <p className="font-serif italic font-semibold text-xs text-amber-500 mb-1">ARVAIYA ORGANIC HARMONY</p>
        <p>© 2026 Arvaiya Perfumes. Crafted with certified organic essential oils. All rights reserved.</p>
        <p className="mt-1 opacity-50">"All Arvaiya fragrances share a signature bottle and logo design, expressing individuality only through color and scent."</p>
      </footer>
    </div>
  );
}
