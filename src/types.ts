export type FragranceFamily =
  | 'Floral'
  | 'Floral Aromatic'
  | 'Oriental Floral'
  | 'Amber Oriental'
  | 'Powdery Floral'
  | 'Woody Oriental'
  | 'Citrus Aquatic'
  | 'Green Floral'
  | 'Gourmand'
  | 'Aromatic Woody'
  | 'Fruity Floral'
  | 'Spicy Oriental'
  | 'Floral'
  | 'Fruity'
  | 'Woody'
  | 'Oriental / Spicy'
  | 'Fresh / Citrus / Aquatic'
  | 'Sweet / Gourmand'
  | 'Powdery';

export type OccasionType =
  | 'Daily / Office'
  | 'College'
  | 'Dates'
  | 'Parties'
  | 'Festivals / Weddings'
  | 'Evening / Night'
  | 'All occasions';

export interface UserProfile {
  fragranceType: FragranceFamily | 'Not sure';
  occasion: OccasionType;
  intensity: 'Light & fresh' | 'Medium & balanced' | 'Strong & long-lasting';
  gender?: 'Women' | 'Men' | 'Unisex' | '';
}

export interface Review {
  id: string;
  author: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface Fragrance {
  id: string;
  name: string;
  family: string;
  notes: string[];
  intensity: number; // 1 to 5
  liquidColor: string; // Tailwind color hex or rgba
  capColor: string; // Hex for the transparent cap
  textColor: string; // For text on the label
  labelBg: string; // Label background color (e.g., 'white' or 'black')
  description: string;
  vibe: string;
  price: number; // e.g., 4999 (INR) or 95 (USD)
  originalPrice?: number; // Previous/original price before reduction
  volume: string; // e.g., '100 ml'
  imageUrl?: string; // Optional realistic perfume image URL
  reviews?: Review[];
}

export interface CartItem {
  fragrance: Fragrance;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  address: string;
  city: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    liquidColor: string;
  }[];
  total: number;
  date: string;
  status: 'Pending' | 'Shipped' | 'Delivered';
  upiId?: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed' | 'Processing' | 'Cancelled';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  invoiceNumber?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface RecommendationResponse {
  recommendations: {
    bestMatch: string; // Fragrance name/id
    alternativePick: string; // Fragrance name/id
    trySomethingNew: string; // Fragrance name/id
    bestMatchReason: string;
    alternativePickReason: string;
    trySomethingNewReason: string;
    personalityDescription: string;
  };
}
