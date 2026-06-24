// WHY THIS FILE EXISTS:
// Handles AI-powered tab classification using Google Gemini.
// Called when detectContext returns 'unknown' for a tab.
// The extension sends the tab URL and title — Gemini reads them
// and returns the most likely context group.
// This reduces the Unknown group without changing the keyword rules.

import { Hono } from "hono";
import { GoogleGenerativeAI } from "@google/generative-ai";
console.log("[Tabby] Gemini key loaded:", !!process.env.GEMINI_API_KEY);

const classify = new Hono();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// WHY: We define the valid contexts so Gemini cannot return
// something outside our system. Constrained output is more
// reliable than open ended generation.
const VALID_CONTEXTS = [
  "work",
  "research",
  "social",
  "entertainment",
  "shopping",
  "unknown",
];

const PROMPT_TEMPLATE = (url: string, title: string) => `
You are a tab classifier for a browser extension.
Classify this browser tab into exactly one category.

Categories:
- work: emails, project tools, coding, GitHub, Notion, Figma, Slack, meetings, developer tools, productivity apps
- research: articles, Wikipedia, documentation, blogs, tutorials, learning sites, news
- social: Twitter, Facebook, Instagram, LinkedIn, Discord, WhatsApp, Reddit, forums, community sites
- entertainment: YouTube, Netflix, music, games, movies, streaming, funny content, Nollywood
- shopping: any online store, product listings, buying pages, marketplaces like Jumia, Konga, Amazon, price comparison
- unknown: government sites, utility bills, telecom providers, banking, local services that do not fit above

Examples:
- "jumia.com.ng - Buy Phones" → shopping
- "github.com - Pull Request" → work
- "youtube.com - Music Video" → entertainment
- "mtn.com.ng - Broadband Plans" → unknown
- "medium.com - React Tutorial" → research

Tab URL: ${url}
Tab Title: ${title}

Reply with ONLY one word: work, research, social, entertainment, shopping, or unknown
`;

classify.post("/classify", async (c) => {
  try {
    const { url, title } = await c.req.json<{ url: string; title: string }>();

    if (!url || !title) {
      return c.json({ error: "URL and title are required" }, 400);
    }

    const result = await model.generateContent(PROMPT_TEMPLATE(url, title));
    const rawResponse = result.response.text();
    console.log("[Tabby] Gemini raw response:", rawResponse);
    const response = rawResponse.trim().toLowerCase();

    // WHY: Validate the response is one of our valid contexts.
    // If Gemini returns something unexpected we fall back to unknown.
    const context = VALID_CONTEXTS.includes(response) ? response : "unknown";

    return c.json({ context });
  } catch (error) {
    console.error("[Tabby] Classification error:", error);
    return c.json({ context: "unknown" });
  }
});

export default classify;
