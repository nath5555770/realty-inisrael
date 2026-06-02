// ==========================================================================
//  Edge Function : translate-listing
//  Translates a French luxury real estate listing into EN / HE / RU using
//  OpenAI, with an expert luxury-copywriter prompt for maximum quality.
//
//  SECURITY:
//   - Requires an authenticated Supabase user (admin or agent)
//   - The OpenAI API key is read from Supabase Function Secrets (never the browser)
//
//  SECRETS (Supabase > Edge Functions > Secrets):
//   OPENAI_API_KEY = sk-...
//   OPENAI_MODEL   = gpt-4o     (best quality; gpt-4o-mini = cheaper)
// ==========================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4o';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const LANG_LABEL = {
  en: 'English (UK), polished luxury real estate register',
  he: 'Hebrew, native idiomatic luxury real estate register (right-to-left)',
  ru: 'Russian, refined luxury real estate register',
};

const SYSTEM_PROMPT = [
  'You are an elite luxury real estate copywriter, native in the target language.',
  'Translate the French real estate listing into the target language.',
  'QUALITY: translate for meaning, emotion and marketing impact, never word for word.',
  'Luxury and marketing adjectives (sublime, exceptionnel, prestigieux, raffine, cle en main, d exception) must use the most natural and evocative equivalent a native luxury copywriter would choose, never a literal, technical or transliterated translation.',
  'Example: sublime becomes stunning in English, magnifique becomes magnificent, never the chemistry meaning.',
  'The result must read as if originally written by a native real estate professional in that language.',
  'PRESERVE exactly: proper nouns (city names, neighborhoods, building names like Akirov, YOO Tower, Park Hayam), all numbers, surfaces in m2, prices in shekels, floor and room counts, every figure.',
  'HEBREW: use real idiomatic Hebrew real estate vocabulary, never transliterate French or English words, natural right to left phrasing.',
  'DO NOT add information that is not in the source.',
  'DO NOT translate the brand name SHAHAR LEVI and NATHALIE HAIK Real Estate.',
  'Return ONLY a JSON object with exactly the same keys as the input; translate only the values.',
  'If a field is empty, return an empty string.'
].join(' ');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: Object.assign({}, CORS_HEADERS, { 'Content-Type': 'application/json' }),
  });
}

async function translateToLang(apiKey, payload, targetLang) {
  const userMessage = 'Translate this French luxury real estate listing into '
    + LANG_LABEL[targetLang]
    + '. Input JSON: ' + JSON.stringify(payload)
    + '. Output: the same JSON shape, values translated, professional and flawless.';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error('OpenAI ' + targetLang + ' failed ' + res.status + ': ' + errText.slice(0, 200));
  }
  const data = await res.json();
  const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!content) throw new Error('OpenAI ' + targetLang + ': empty response');
  let parsed;
  try { parsed = JSON.parse(content); } catch (e) { throw new Error('OpenAI ' + targetLang + ': invalid JSON'); }
  return {
    title_main: String(parsed.title_main || ''),
    title_accent: String(parsed.title_accent || ''),
    description: String(parsed.description || ''),
    neighborhood: String(parsed.neighborhood || ''),
    extra_label: String(parsed.extra_label || ''),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return jsonResponse({ error: 'POST only' }, 405);
  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) return jsonResponse({ error: 'OPENAI_API_KEY not configured' }, 503);

    const authHeader = req.headers.get('Authorization') || '';
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const userRes = await userClient.auth.getUser();
    if (userRes.error || !userRes.data || !userRes.data.user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const body = await req.json().catch(() => ({}));
    const listingId = body.listing_id;
    let targetLangs = Array.isArray(body.target_langs) && body.target_langs.length
      ? body.target_langs.filter((l) => ['en', 'he', 'ru'].includes(l))
      : ['en', 'he', 'ru'];
    if (!listingId) return jsonResponse({ error: 'listing_id is required' }, 400);

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const loadRes = await adminClient.from('listings')
      .select('id, title_main, title_accent, description, neighborhood, extra_label, translations')
      .eq('id', listingId).single();
    if (loadRes.error || !loadRes.data) return jsonResponse({ error: 'Listing not found' }, 404);
    const listing = loadRes.data;

    const sourcePayload = {
      title_main: listing.title_main || '',
      title_accent: listing.title_accent || '',
      description: listing.description || '',
      neighborhood: listing.neighborhood || '',
      extra_label: listing.extra_label || '',
    };

    const results = {};
    const errors = {};
    await Promise.all(targetLangs.map(async (lang) => {
      try { results[lang] = await translateToLang(apiKey, sourcePayload, lang); }
      catch (e) { errors[lang] = e.message; }
    }));

    if (!Object.keys(results).length) return jsonResponse({ error: 'All translations failed', details: errors }, 502);

    const newTranslations = Object.assign({}, listing.translations || {}, results);
    const saveRes = await adminClient.from('listings')
      .update({ translations: newTranslations, translated_at: new Date().toISOString() })
      .eq('id', listingId);
    if (saveRes.error) return jsonResponse({ error: 'Save failed', details: saveRes.error.message }, 500);

    return jsonResponse({
      ok: true,
      languages_translated: Object.keys(results),
      languages_failed: Object.keys(errors),
      errors: errors,
      translations: results,
    }, 200);
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
});
