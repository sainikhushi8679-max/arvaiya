import { Fragrance } from '../types';

import journeyRoseImg from '../assets/images/journey_rose_1782920019902.jpg';
import journeyLavenderImg from '../assets/images/journey_lavender_1782920038604.jpg';
import midnightOrchidImg from '../assets/images/midnight_orchid_1782920048954.jpg';
import sunlitAmberImg from '../assets/images/sunlit_amber_1782920061294.jpg';
import lumiereBlushImg from '../assets/images/lumiere_blush_1782920072148.jpg';
import oudMajestyImg from '../assets/images/oud_majesty_1782920085355.jpg';
import coastalBreezeImg from '../assets/images/coastal_breeze_1782920097334.jpg';
import freshVerdeImg from '../assets/images/fresh_verde_1782920109895.jpg';
import vanillaKissImg from '../assets/images/vanilla_kiss_1782920121256.jpg';
import bleuIntenseImg from '../assets/images/bleu_intense_1782920135834.jpg';
import peachBlossomImg from '../assets/images/peach_blossom_1782920147868.jpg';
import noirDesireImg from '../assets/images/noir_desire_1782920158637.jpg';

export const fragrances: Fragrance[] = [
  {
    id: 'journey-rose',
    name: 'JOURNEY ROSE',
    family: 'FLORAL',
    notes: ['Rose', 'Peony', 'Lychee', 'Vanilla', 'Musk'],
    intensity: 4,
    liquidColor: 'rgba(244, 63, 94, 0.4)', // Soft pinkish rose
    capColor: 'rgba(251, 113, 133, 0.75)',
    textColor: 'text-rose-950',
    labelBg: 'bg-white/90',
    description: 'A romantic and timeless bouquet of fresh Turkish roses combined with sweet lychee and warm vanilla.',
    vibe: 'Sophisticated, romantic, and velvety.',
    price: 3499,
    volume: '100 ml',
    imageUrl: journeyRoseImg
  },
  {
    id: 'journey-lavender',
    name: 'JOURNEY LAVENDER',
    family: 'FLORAL AROMATIC',
    notes: ['Lavender', 'Bergamot', 'Vetiver', 'White Musk'],
    intensity: 3,
    liquidColor: 'rgba(168, 85, 247, 0.35)', // Lavender purple
    capColor: 'rgba(192, 132, 252, 0.75)',
    textColor: 'text-purple-950',
    labelBg: 'bg-white/90',
    description: 'An elegant, powdery combination of soothing French lavender and invigorating bergamot over rich vetiver.',
    vibe: 'Peaceful, clean, and classic.',
    price: 3299,
    volume: '100 ml',
    imageUrl: journeyLavenderImg
  },
  {
    id: 'midnight-orchid',
    name: 'MIDNIGHT ORCHID',
    family: 'ORIENTAL FLORAL',
    notes: ['Orchid', 'Patchouli', 'Vanilla', 'Amber'],
    intensity: 5,
    liquidColor: 'rgba(107, 33, 168, 0.5)', // Deep violet purple
    capColor: 'rgba(126, 34, 206, 0.85)',
    textColor: 'text-violet-100',
    labelBg: 'bg-neutral-900/90',
    description: 'A luxurious, mysterious sensory experience featuring dark purple orchid and warm patchouli.',
    vibe: 'Bold, mysterious, and captivating.',
    price: 4599,
    volume: '100 ml',
    imageUrl: midnightOrchidImg
  },
  {
    id: 'sunlit-amber',
    name: 'SUNLIT AMBER',
    family: 'AMBER ORIENTAL',
    notes: ['Amber', 'Tonka Bean', 'Sandalwood', 'Musk'],
    intensity: 4,
    liquidColor: 'rgba(245, 158, 11, 0.45)', // Golden amber
    capColor: 'rgba(251, 191, 36, 0.8)',
    textColor: 'text-amber-950',
    labelBg: 'bg-white/90',
    description: 'A glowing, majestic scent reflecting golden hour resin warmth, rich sandalwood, and tonka bean.',
    vibe: 'Rich, luxurious, and warm.',
    price: 3999,
    volume: '100 ml',
    imageUrl: sunlitAmberImg
  },
  {
    id: 'lumiere-blush',
    name: 'LUMIÈRE BLUSH',
    family: 'POWDERY FLORAL',
    notes: ['Jasmine', 'Magnolia', 'White Musk', 'Powdery Notes'],
    intensity: 1,
    liquidColor: 'rgba(244, 63, 94, 0.25)', // Ultra soft blush pink
    capColor: 'rgba(244, 63, 94, 0.4)',
    textColor: 'text-neutral-800',
    labelBg: 'bg-white/90',
    description: 'A soft, powdered dahlia skin whisper featuring glowing magnolia petals and immaculate white musk.',
    vibe: 'Clean, light, and graceful.',
    price: 3799,
    volume: '100 ml',
    imageUrl: lumiereBlushImg
  },
  {
    id: 'oud-majesty',
    name: 'OUD MAJESTY',
    family: 'WOODY ORIENTAL',
    notes: ['Oud', 'Saffron', 'Cedarwood', 'Leather', 'Musk'],
    intensity: 5,
    liquidColor: 'rgba(40, 20, 5, 0.75)', // Rich dark charcoal amber
    capColor: 'rgba(28, 25, 23, 0.9)',
    textColor: 'text-amber-100',
    labelBg: 'bg-stone-900/90',
    description: 'An absolute masterpiece of premium organic Cambodian oud, fiery saffron threads, and warm leather.',
    vibe: 'Royal, opulent, and majestic.',
    price: 4999,
    volume: '100 ml',
    imageUrl: oudMajestyImg
  },
  {
    id: 'coastal-breeze',
    name: 'COASTAL BREEZE',
    family: 'CITRUS AQUATIC',
    notes: ['Bergamot', 'Sea Notes', 'Jasmine', 'Cedarwood'],
    intensity: 2,
    liquidColor: 'rgba(14, 165, 233, 0.35)', // Sea sky blue
    capColor: 'rgba(56, 189, 248, 0.75)',
    textColor: 'text-sky-950',
    labelBg: 'bg-white/90',
    description: 'A refreshing ocean splash balanced with sun-drenched Italian bergamot and calming driftwood cedar.',
    vibe: 'Fresh, exhilarating, and crisp.',
    price: 3499,
    volume: '100 ml',
    imageUrl: coastalBreezeImg
  },
  {
    id: 'fresh-verde',
    name: 'FRESH VERDE',
    family: 'GREEN FLORAL',
    notes: ['Green Tea', 'Neroli', 'Lily of the Valley', 'Musk'],
    intensity: 2,
    liquidColor: 'rgba(16, 185, 129, 0.35)', // Vibrant green
    capColor: 'rgba(52, 211, 153, 0.75)',
    textColor: 'text-emerald-950',
    labelBg: 'bg-white/90',
    description: 'A clean, crisp, botanical walk through dew-covered morning meadows with green tea leaves.',
    vibe: 'Clarifying, focus-driven, and botanical.',
    price: 2999,
    volume: '100 ml',
    imageUrl: freshVerdeImg
  },
  {
    id: 'vanilla-kiss',
    name: 'VANILLA KISS',
    family: 'GOURMAND',
    notes: ['Vanilla', 'Praline', 'Caramel', 'Musk'],
    intensity: 3,
    liquidColor: 'rgba(217, 119, 6, 0.45)', // Warm honey-gold
    capColor: 'rgba(245, 158, 11, 0.75)',
    textColor: 'text-amber-950',
    labelBg: 'bg-white/90',
    description: 'A decadent, mouthwatering cloud of organic bourbon vanilla bean, praline sugar, and melted caramel.',
    vibe: 'Sweet, comforting, and delicious.',
    price: 3699,
    volume: '100 ml',
    imageUrl: vanillaKissImg
  },
  {
    id: 'bleu-intense',
    name: 'BLEU INTENSE',
    family: 'AROMATIC WOODY',
    notes: ['Grapefruit', 'Lavender', 'Cedarwood', 'Amber'],
    intensity: 5,
    liquidColor: 'rgba(29, 78, 216, 0.55)', // Deep ocean blue
    capColor: 'rgba(37, 99, 235, 0.85)',
    textColor: 'text-blue-100',
    labelBg: 'bg-slate-900/90',
    description: 'A powerful, magnetic fragrance combining cold pink grapefruit with warming ginger and rich cedar wood.',
    vibe: 'Confident, modern, and high-status.',
    price: 4299,
    volume: '100 ml',
    imageUrl: bleuIntenseImg
  },
  {
    id: 'peach-blossom',
    name: 'PEACH BLOSSOM',
    family: 'FRUITY FLORAL',
    notes: ['Peach', 'Freesia', 'Jasmine', 'White Musk'],
    intensity: 1,
    liquidColor: 'rgba(251, 146, 60, 0.4)', // Warm peach orange
    capColor: 'rgba(253, 186, 116, 0.8)',
    textColor: 'text-orange-950',
    labelBg: 'bg-white/90',
    description: 'Bright, cheerful, and sun-kissed orchard peaches mingled with wet dahlia and pristine white jasmine.',
    vibe: 'Joyful, sweet, and bright.',
    price: 3499,
    volume: '100 ml',
    imageUrl: peachBlossomImg
  },
  {
    id: 'noir-desire',
    name: 'NOIR DESIRE',
    family: 'SPICY ORIENTAL',
    notes: ['Black Pepper', 'Cinnamon', 'Amber', 'Patchouli', 'Musk'],
    intensity: 4,
    liquidColor: 'rgba(75, 85, 99, 0.55)', // Smokey dark grey
    capColor: 'rgba(31, 41, 55, 0.9)',
    textColor: 'text-neutral-100',
    labelBg: 'bg-neutral-900/90',
    description: 'A daringly complex evening fragrance featuring spicy black pepper, Ceylon cinnamon, and rich amber.',
    vibe: 'Seductive, spicy, and bold.',
    price: 4799,
    volume: '100 ml',
    imageUrl: noirDesireImg
  }
];

export const getFragranceById = (id: string): Fragrance | undefined => {
  return fragrances.find(f => f.id === id);
};
