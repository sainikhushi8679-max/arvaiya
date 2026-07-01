import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// List of available fragrance IDs to validate model output
const VALID_FRAGRANCES = [
  "coastal-breeze",
  "fresh-verde",
  "journey-lavender",
  "lumiere-blush",
  "journey-rose",
  "peach-blossom",
  "vanilla-kiss",
  "midnight-orchid",
  "bleu-intense",
  "sunlit-amber",
  "noir-desire",
  "oud-majesty"
];

// Lazy initialization helper for Gemini AI client
let aiClient: GoogleGenAI | null = null;
let geminiQuotaExceededUntil = 0; // Timestamp when we can try Gemini API again

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured. Please configure it in Settings > Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// Endpoint 1: Get Personalized Fragrance Recommendations (JSON Schema)
app.post("/api/recommend", async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: "Profile is required" });
    }

    const { fragranceType, occasion, intensity, gender } = profile;

    // We check if API key is present. If not, use local algorithmic fallback
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not configured. Using high-fidelity local recommendation engine.");
      const fallbackData = getFallbackRecommendations(profile);
      return res.json({ recommendations: fallbackData, isFallback: true });
    }

    // Check if we are currently paused due to rate limiting/quota exhaustion
    const now = Date.now();
    if (geminiQuotaExceededUntil > now) {
      console.warn("Gemini API is currently paused due to rate limits. Returning fallback recommendations directly.");
      const fallbackData = getFallbackRecommendations(profile);
      return res.json({
        recommendations: fallbackData,
        isFallback: true,
        warning: "We are fine-tuning our AI systems. Connected to Arvaiya's local scent memory engine."
      });
    }

    const ai = getAiClient();


    const prompt = `
      You are Arvaiya's Official Fragrance Expert AI. Provide a highly personalized 3-part perfume recommendation for the following user profile:
      - Preferred Fragrance Family: ${fragranceType}
      - Main Usage Occasion: ${occasion}
      - Intensity Preference: ${intensity}
      - Gender Association Preference: ${gender || "Unisex / Any"}

      Your task is to select exactly 3 fragrances from the Arvaiya catalog (using their exact IDs below) and label them:
      1. Best Match (The single most perfect match for their core taste, occasion, and intensity)
      2. Alternative Pick (A strong second choice that matches their occasion but offers a slightly different family nuance)
      3. Try Something New (A delightful recommendation slightly outside their primary scent taste, matching their occasion/intensity, that will pleasantly surprise them)

      The available Arvaiya perfume IDs are:
      - "coastal-breeze" (Fresh / Citrus / Aquatic, daily/office, college)
      - "fresh-verde" (Fresh / Citrus / Aquatic, daily/office, college)
      - "journey-lavender" (Powdery, daily/office, college, evening/night)
      - "lumiere-blush" (Floral, daily/office, dates)
      - "journey-rose" (Floral, dates)
      - "peach-blossom" (Fruity, dates, college)
      - "vanilla-kiss" (Sweet / Gourmand, dates, evening/night)
      - "midnight-orchid" (Oriental / Spicy, dates, festivals/weddings, evening/night)
      - "bleu-intense" (Fresh / Citrus / Aquatic, parties, evening/night)
      - "sunlit-amber" (Oriental / Spicy, parties, festivals/weddings, evening/night)
      - "noir-desire" (Woody, parties, evening/night)
      - "oud-majesty" (Woody, festivals/weddings, evening/night)

      Ensure your output matches the JSON schema requested. Give elegant, sensory, and luxury-appropriate explanations. Avoid dry or aggressive sales pitches; talk about emotional experiences, notes, and sillage.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite, warm, and highly skilled organic perfume consultant for Arvaiya, a brand that embodies luxury, consistency, and emotional memory through scent.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bestMatch: {
              type: Type.STRING,
              description: "The ID of the best matching perfume from the allowed IDs."
            },
            bestMatchReason: {
              type: Type.STRING,
              description: "Elegant explanation of why this perfume is the absolute perfect match."
            },
            alternativePick: {
              type: Type.STRING,
              description: "The ID of the alternative pick from the allowed IDs."
            },
            alternativePickReason: {
              type: Type.STRING,
              description: "Explanation of why this makes a brilliant alternative."
            },
            trySomethingNew: {
              type: Type.STRING,
              description: "The ID of the try-something-new perfume from the allowed IDs."
            },
            trySomethingNewReason: {
              type: Type.STRING,
              description: "Intriguing explanation encouraging them to explore this scent."
            },
            personalityDescription: {
              type: Type.STRING,
              description: "An evocative, poetic, and emotional paragraph describing the user's scent personality based on their choices."
            }
          },
          required: [
            "bestMatch",
            "bestMatchReason",
            "alternativePick",
            "alternativePickReason",
            "trySomethingNew",
            "trySomethingNewReason",
            "personalityDescription"
          ]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response text received from Gemini.");
    }

    const data = JSON.parse(responseText);

    // Validate that the returned IDs are correct, otherwise fix them with safe fallbacks
    if (!VALID_FRAGRANCES.includes(data.bestMatch)) data.bestMatch = "coastal-breeze";
    if (!VALID_FRAGRANCES.includes(data.alternativePick)) data.alternativePick = "journey-lavender";
    if (!VALID_FRAGRANCES.includes(data.trySomethingNew)) data.trySomethingNew = "noir-desire";

    return res.json({ recommendations: data, isFallback: false });

  } catch (error: any) {
    const errorStr = String(error?.message || error || "");
    const isQuotaExceeded = errorStr.includes("429") || errorStr.includes("quota") || errorStr.includes("RESOURCE_EXHAUSTED");
    
    if (isQuotaExceeded) {
      console.warn("Gemini Quota Exceeded in Recommend. Activating beautiful local recommendation engine for 5 minutes.");
      geminiQuotaExceededUntil = Date.now() + 5 * 60 * 1000; // 5 minutes pause
    } else {
      console.warn("Error calling Gemini API in Recommend:", errorStr);
    }

    // Return graceful fallback data so the app doesn't break
    const fallbackData = getFallbackRecommendations(req.body.profile || {});
    return res.json({
      recommendations: fallbackData,
      isFallback: true,
      warning: "We are fine-tuning our AI systems. Connected to Arvaiya's local scent memory engine."
    });
  }
});

// Endpoint 2: Premium AI Consultant Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, profile } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // High-quality local responsive consultant replies
      const lastMessage = messages[messages.length - 1]?.text || "";
      const reply = getFallbackChatReply(lastMessage, profile);
      return res.json({ reply, isFallback: true });
    }

    // Check if we are currently paused due to rate limiting/quota exhaustion
    const now = Date.now();
    if (geminiQuotaExceededUntil > now) {
      console.warn("Gemini API is currently paused due to rate limits. Returning fallback chat reply directly.");
      const lastMessage = messages[messages.length - 1]?.text || "";
      const reply = getFallbackChatReply(lastMessage, profile);
      return res.json({
        reply,
        isFallback: true,
        warning: "Connected to Arvaiya's local scent memory consultant."
      });
    }

    const ai = getAiClient();

    // Map chat history to standard Gemini parts format
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const systemInstruction = `
      You are Arvaiya’s Official Fragrance Expert AI, an elite organic perfume consultant.
      Arvaiya is a premium organic perfume brand that focuses on elegance, consistency, and emotional connection through fragrance.

      CRITICAL RULE:
      - All Arvaiya perfumes must follow the exact same logo and bottle design.
      - The Arvaiya logo remains identical on every perfume.
      - Bottle shape, size, cap style, and label layout must never change. No alternate bottle designs are allowed.
      - Only the bottle color/liquid color, background theme, fragrance name, and fragrance family color accents may vary.
      - Always respect this luxury consistency. Say things like: “All Arvaiya fragrances share a signature bottle and logo design, expressing individuality only through color and scent.”

      User Profile Context (If available):
      ${profile ? JSON.stringify(profile, null, 2) : "No profile collected yet. Help them discover their profile if they ask."}

      Our exquisite catalog of Arvaiya fragrances:
      1. Coastal Breeze (Fresh / Citrus / Aquatic) - Top: Sea Salt, Bergamot; Heart: Neroli, Sage; Base: Driftwood. Clean, professional, calming.
      2. Fresh Verde (Fresh / Citrus / Aquatic) - Top: Mint leaves, Green Apple; Heart: Basil, Jasmine; Base: Cedarwood. Botanical, crisp.
      3. Journey Lavender (Powdery) - Top: Lavender, Eucalyptus; Heart: Chamomile, Iris; Base: Sandalwood. Peaceful, clean.
      4. Lumière Blush (Floral) - Top: Peony, Freesia; Heart: Lily of the Valley; Base: Cedarwood, Amber. Soft, clean, graceful.
      5. Journey Rose (Floral) - Top: Turkish Rose, Lychee; Heart: Damask Rose, Honey; Base: Patchouli. Deep, romantic, elegant.
      6. Peach Blossom (Fruity) - Top: White Peach, Apricot; Heart: Nectarine; Base: Vanilla bean. Sweet, charming, joyful.
      7. Vanilla Kiss (Sweet / Gourmand) - Top: Caramel, Toasted Sugar; Heart: Bourbon Vanilla; Base: Tonka Bean. Warm, sweet, cozy.
      8. Midnight Orchid (Oriental / Spicy) - Top: Black Truffle, Ylang-Ylang; Heart: Orchid, Plum; Base: Patchouli, Incense. Bold, mystical, exotic.
      9. Bleu Intense (Fresh / Citrus / Aquatic) - Top: Grapefruit, Mint; Heart: Ginger, Jasmine; Base: Cedarwood. Confident, magnetic.
      10. Sunlit Amber (Oriental / Spicy) - Top: Bergamot, Pink Pepper; Heart: Amber, Labdanum; Base: Vanilla, Patchouli. Rich, golden, luxurious.
      11. Noir Desire (Woody) - Top: Cardamom, Cypress; Heart: Leather, Cedarwood; Base: Vetiver, Oud. Bold, smoky, dark.
      12. Oud Majesty (Woody) - Top: Rosewood, Cardamom; Heart: Sichuan Pepper, Oud; Base: Vetiver, Amber. Opulent, regal, pure luxury.

      Tone and Language Rules:
      - Keep language simple, elegant, warm, and professional.
      - Avoid aggressive sales pitches. Speak of experiences, moods, and lifestyle.
      - Respond with formatting (bullet points, italic accents) to feel premium and highly readable.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "I apologize, I am contemplating the perfect notes for your answer. How can I help you find your signature Arvaiya scent today?";
    return res.json({ reply: replyText, isFallback: false });

  } catch (error: any) {
    const errorStr = String(error?.message || error || "");
    const isQuotaExceeded = errorStr.includes("429") || errorStr.includes("quota") || errorStr.includes("RESOURCE_EXHAUSTED");
    
    if (isQuotaExceeded) {
      console.warn("Gemini Quota Exceeded in Chat. Activating local consultant fallback.");
      geminiQuotaExceededUntil = Date.now() + 5 * 60 * 1000; // 5 minutes pause
    } else {
      console.warn("Error calling Gemini API in Chat:", errorStr);
    }

    const lastMsg = req.body.messages?.[req.body.messages.length - 1]?.text || "";
    const reply = getFallbackChatReply(lastMsg, req.body.profile);
    return res.json({
      reply,
      isFallback: true,
      warning: "Connected to Arvaiya's local scent memory consultant."
    });
  }
});

// Helper function: Local high-fidelity algorithmic recommendations
function getFallbackRecommendations(profile: any) {
  const type = profile.fragranceType || "Floral";
  const occasion = profile.occasion || "Daily / Office";

  let bestMatch = "lumiere-blush";
  let alternativePick = "journey-lavender";
  let trySomethingNew = "sunlit-amber";

  // Map preferences to correct IDs
  if (type === "Fresh / Citrus / Aquatic") {
    bestMatch = occasion === "Parties" || occasion === "Evening / Night" ? "bleu-intense" : "coastal-breeze";
    alternativePick = "fresh-verde";
    trySomethingNew = "journey-lavender";
  } else if (type === "Woody") {
    bestMatch = occasion === "Festivals / Weddings" ? "oud-majesty" : "noir-desire";
    alternativePick = "sunlit-amber";
    trySomethingNew = "coastal-breeze";
  } else if (type === "Floral") {
    bestMatch = occasion === "Dates" ? "journey-rose" : "lumiere-blush";
    alternativePick = "peach-blossom";
    trySomethingNew = "vanilla-kiss";
  } else if (type === "Sweet / Gourmand") {
    bestMatch = "vanilla-kiss";
    alternativePick = "peach-blossom";
    trySomethingNew = "midnight-orchid";
  } else if (type === "Oriental / Spicy") {
    bestMatch = "midnight-orchid";
    alternativePick = "sunlit-amber";
    trySomethingNew = "noir-desire";
  } else if (type === "Fruity") {
    bestMatch = "peach-blossom";
    alternativePick = "lumiere-blush";
    trySomethingNew = "vanilla-kiss";
  } else if (type === "Powdery") {
    bestMatch = "journey-lavender";
    alternativePick = "lumiere-blush";
    trySomethingNew = "fresh-verde";
  } else {
    // Not sure
    bestMatch = "coastal-breeze";
    alternativePick = "lumiere-blush";
    trySomethingNew = "midnight-orchid";
  }

  // Double-check duplicates
  if (bestMatch === alternativePick) {
    alternativePick = "journey-lavender";
  }
  if (bestMatch === trySomethingNew || alternativePick === trySomethingNew) {
    trySomethingNew = "sunlit-amber";
  }

  // Descriptions based on choices
  const personalityMap: Record<string, string> = {
    "Floral": "A poetic soul with a deep appreciation for classical romance and timeless elegance. Your scent choices reflect softness, grace, and an innate connection to the delicate beauty of blooming petals.",
    "Fresh / Citrus / Aquatic": "An active, vibrant, and clarity-seeking individual. You find comfort in sea breezes, clean mountain air, and dew-covered green leaves. Your presence is clarifying and effortlessly dynamic.",
    "Woody": "Grounded, sophisticated, and deeply confident. You appreciate the quiet luxury of cedar forests, rugged leather, and rich resins. You possess an intellectual depth that leaves a lasting impression.",
    "Oriental / Spicy": "Mysterious, bold, and magnetic. You are drawn to complex, warm layers of spices, orchids, and incense. You don't just enter a room; you leave a captivating story in your wake.",
    "Sweet / Gourmand": "Warm, cozy, and highly inviting. You appreciate the rich decadence of vanilla, warm caramel, and roasted almond. You bring a sweet, addictive comfort and joy to everyone around you.",
    "Fruity": "Bright, playful, and radiating pure optimism. You love the sunny sweetness of orchard peaches, apricots, and citrus. Your energy is vibrant, cheerful, and delightful.",
    "Powdery": "Immaculate, peaceful, and beautifully poised. You appreciate pristine linens, clean cotton blossoms, and fine French lavender. You exude a gentle, refined confidence."
  };

  const personalityDescription = personalityMap[type] || "An elegant seeker of premium organic harmony, balancing modern luxury with emotional memories and pure natural ingredients.";

  return {
    bestMatch,
    bestMatchReason: `Given your taste for ${type} notes and your focus on ${occasion}, this fragrance offers the perfect emotional and sensory projection. Its notes harmonize beautifully to wrap you in a tailored signature sillage.`,
    alternativePick,
    alternativePickReason: "A beautiful second option that respects your usage preferences while adding a subtle shift in the fragrance notes, giving you elegant versatility.",
    trySomethingNew,
    trySomethingNewReason: "A delightful departure from your usual scent bubble that matches your intensity preferences but introduces you to new premium aromatic horizons.",
    personalityDescription
  };
}

// Helper function: Local high-fidelity chat expert
function getFallbackChatReply(msg: string, profile: any): string {
  const query = msg.toLowerCase();
  let response = "";

  if (query.includes("bottle") || query.includes("design") || query.includes("logo")) {
    response = "At **Arvaiya**, luxury is expressed through flawless consistency. All of our exquisite fragrances share the **exact same signature glass bottle, gold cap, and elegant label layout**, keeping our brand identity pristine and recognizable. We express individual characters solely through the **distinctive natural color of the perfume oil and custom background visual themes**! This ensures a truly premium aesthetic for your vanity.";
  } else if (query.includes("hello") || query.includes("hi") || query.includes("hey") || query.includes("greet")) {
    response = "Greetings! I am **Arvaiya’s Official Fragrance Expert AI**. It is my absolute honor to guide you through our organic perfume universe. " + 
               (profile ? `I see you appreciate **${profile.fragranceType}** notes for **${profile.occasion}** occasions! ` : "") +
               "How may I assist you in finding or refining your perfect signature scent today?";
  } else if (query.includes("recommend") || query.includes("choose") || query.includes("suggest")) {
    response = "I would be delighted! Based on your preference profile, I highly recommend our signature **Lumière Blush** for a soft, pristine floral experience, or **Coastal Breeze** if you prefer something vibrant, clean, and coastal. If you are seeking pure luxury for evenings, **Oud Majesty** is a regal wood and saffron masterpiece. Would you like me to elaborate on the top, heart, or base notes of any of these?";
  } else if (query.includes("organic") || query.includes("natural") || query.includes("ingredients")) {
    response = "Every single drop of an **Arvaiya** perfume is crafted from certified organic essential oils, precious resins, and natural floral absolutes. We harvest our French Lavender, Turkish Rose, and Cambodian Oud sustainably, preserving the raw emotional connection and clean, skin-friendly experience of pure luxury.";
  } else {
    response = "That is a fascinating inquiry. In the world of premium perfumery, notes transition over hours: from the immediate sparkle of **Top Notes** (like bergamot or pink pepper), to the heart and soul of the **Heart Notes** (like rose absolute or orchid), and finally to the long-lasting **Base Notes** (like sandalwood, rich amber, or organic oud) which stay with you throughout the day. \n\nWhich of these olfactory families speaks to your heart the most?";
  }

  return response;
}

// Integrate Vite middleware or serve static files
async function init() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Arvaiya backend running on http://localhost:${PORT}`);
  });
}

init();
