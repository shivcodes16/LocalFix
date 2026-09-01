const isAiConfigured = Boolean(process.env.OPENAI_API_KEY);

let OpenAI;
let client;
if (isAiConfigured) {
  // Lazy require so the package is only touched when actually configured.
  OpenAI = require('openai');
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Simple keyword map used as an offline fallback classifier. Not a diagnosis
// engine — just enough to route a request to a sensible category so the
// product still feels smart with zero AI credentials configured.
const KEYWORD_MAP = [
  { keywords: ['ac ', 'air condition', 'cooling', 'compressor', 'gas refill', 'split ac', 'window ac'], category: 'AC Repair', subcategory: 'Cooling issue' },
  { keywords: ['fridge', 'refrigerator', 'freezer'], category: 'Appliance Repair', subcategory: 'Refrigerator' },
  { keywords: ['washing machine', 'washer', 'spin'], category: 'Appliance Repair', subcategory: 'Washing Machine' },
  { keywords: ['leak', 'pipe', 'tap', 'faucet', 'drain', 'toilet', 'bathroom fitting'], category: 'Plumbing', subcategory: 'Leak / Pipe issue' },
  { keywords: ['switch', 'socket', 'wiring', 'short circuit', 'mcb', 'fuse', 'electric'], category: 'Electrical', subcategory: 'Wiring / Switches' },
  { keywords: ['laptop', 'screen', 'keyboard not working', 'battery not charging', 'motherboard'], category: 'Laptop Repair', subcategory: 'Hardware issue' },
  { keywords: ['phone', 'mobile', 'cracked screen', 'charging port'], category: 'Mobile Repair', subcategory: 'Screen / Charging' },
  { keywords: ['door', 'cabinet', 'furniture', 'wood', 'hinge'], category: 'Carpentry', subcategory: 'Furniture / Fittings' },
  { keywords: ['paint', 'wall crack', 'whitewash'], category: 'Painting', subcategory: 'Wall repair' },
  { keywords: ['pest', 'cockroach', 'termite', 'rodent'], category: 'Pest Control', subcategory: 'General pest control' },
];

const classifyWithFallback = (text) => {
  const lower = text.toLowerCase();
  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return {
        suggestedCategory: entry.category,
        suggestedSubcategory: entry.subcategory,
        confidence: 0.55,
        rawModelOutput: '',
        source: 'fallback',
      };
    }
  }
  return {
    suggestedCategory: 'General Repair',
    suggestedSubcategory: '',
    confidence: 0.2,
    rawModelOutput: '',
    source: 'fallback',
  };
};

/**
 * Classifies a free-text problem description into a service category.
 * Uses the AI API when configured; falls back to keyword matching otherwise.
 * The result is always a *suggestion* meant to pre-fill a structured form,
 * never presented as a technical diagnosis.
 */
const classifyServiceRequest = async (description, categoryNames = []) => {
  if (!isAiConfigured) {
    return classifyWithFallback(description);
  }

  try {
    const categoryList = categoryNames.length
      ? categoryNames.join(', ')
      : 'AC Repair, Plumbing, Electrical, Appliance Repair, Laptop Repair, Mobile Repair, Carpentry, Painting, Pest Control, General Repair';

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You classify home/local service problem descriptions into a category and short subcategory for a repair marketplace. ' +
            `Choose the category strictly from this list when possible: ${categoryList}. ` +
            'Respond ONLY with compact JSON: {"category": string, "subcategory": string, "confidence": number between 0 and 1}. ' +
            'You are only routing the request to the right professional, never diagnosing the underlying technical fault.',
        },
        { role: 'user', content: description },
      ],
      temperature: 0.2,
      max_tokens: 150,
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      suggestedCategory: parsed.category || 'General Repair',
      suggestedSubcategory: parsed.subcategory || '',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      rawModelOutput: raw,
      source: 'ai',
    };
  } catch (error) {
    console.error('[LocalFix][ai] Classification failed, using fallback:', error.message);
    return classifyWithFallback(description);
  }
};

const summarizeWithFallback = (notesText) => {
  // Naive fallback: first ~240 characters, trimmed to the nearest sentence end.
  if (!notesText) return '';
  const trimmed = notesText.slice(0, 240);
  const lastPeriod = trimmed.lastIndexOf('.');
  return lastPeriod > 40 ? trimmed.slice(0, lastPeriod + 1) : `${trimmed.trim()}...`;
};

/**
 * Summarizes technician service notes into a short customer-friendly blurb.
 */
const summarizeServiceNotes = async (notesText) => {
  if (!isAiConfigured) {
    return summarizeWithFallback(notesText);
  }

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Summarize the following technician service note into 1-2 short, plain-language sentences ' +
            'for the customer. Do not add any diagnosis or claims not present in the note.',
        },
        { role: 'user', content: notesText },
      ],
      temperature: 0.3,
      max_tokens: 120,
    });
    return completion.choices?.[0]?.message?.content?.trim() || summarizeWithFallback(notesText);
  } catch (error) {
    console.error('[LocalFix][ai] Summarization failed, using fallback:', error.message);
    return summarizeWithFallback(notesText);
  }
};

module.exports = { classifyServiceRequest, summarizeServiceNotes, isAiConfigured };
