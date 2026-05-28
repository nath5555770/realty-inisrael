// ==========================================================================
//  Edge Function : translate-listing
//  Translates a French real estate listing into EN / HE / RU via OpenAI.
//  Stores the result in listings.translations and updates translated_at.
//
//  SECURITY:
//   - Requires an authenticated Supabase user (admin or agent)
//   - The OpenAI API key NEVER reaches the browser. It's read from
//     Supabase Function Secrets at runtime.
//
//  DEPLOY:
//   supabase functions deploy translate-listing
//   supabase secrets set OPENAI_API_KEY=sk-... OPENAI_MODEL=gpt-4o-mini
//
//  CALL FROM ADMIN:
//   const { data, error } = await sb.functions.invoke('translate-listing', {
//     body: { listing_id: '...', target_langs: ['en','he','ru'] }
//   });
// ==========================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const LANG_LABEL: Record<string, string> = {
  en: 'professional English (UK)',
  he: 'fluent Hebrew (עברית) — use natural real estate vocabulary',
  ru: 'professional Russian (Русский)',
};

const SYSTEM_PROMPT = `You are a professional translator specialized in luxury real estate.
Translate French real estate listings into the target language with these rules:
1. Tone: refined, professional, evocative — match high-end real estate copy
2. Preserve all proper nouns (city names, neighborhoods, building names like "Akirov", "YOO Tower")
3. Preserve all numbers, surfaces (m²), prices (₪), unit counts
4. Preserve Hebrew technical terms when relevant (heskem mekher, Mas Rechisha, Tabu, etc.) — transliterate or translate naturally
5. Do NOT add information that's not in the source
6. Do NOT translate the brand name "SHAHAR LEVI & NATHALIE HAIK Real Estate"
7. Return ONLY a JSON object — no markdown, no commentary
8. Keep the same JSON keys as the input — only translate the VALUES
9. If a field is empty or null in the input, return empty string ""`;

interface TranslatablePayload {
  title_main: string;
  title_accent: string;
  description: string;
  neighborhood: string;
  extra_label: string;
}

async function translateToLang(
  apiKey: string,
  payload: TranslatablePayload,
  targetLang: string,
): Promise<TranslatablePayload> {
  const userMessage = `Translate this French luxury real estate listing into ${LANG_LABEL[targetLang]}.

Input (FR):
${JSON.stringify(payload, null, 2)}

Output: same JSON shape, values translated.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI ${targetLang} failed (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`OpenAI ${targetLang}: empty response`);

  let parsed: TranslatablePayload;
  try {
    parsed = JSON.parse(content);
  } catch (_e) {
    throw new Error(`OpenAI ${targetLang}: invalid JSON: ${content.slice(0, 200)}`);
  }

  // Normalize keys — ensure all required keys exist, even if empty
  return {
    title_main: String(parsed.title_main ?? ''),
    title_accent: String(parsed.title_accent ?? ''),
    description: String(parsed.description ?? ''),
    neighborhood: String(parsed.neighborhood ?? ''),
    extra_label: String(parsed.extra_label ?? ''),
  };
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'OPENAI_API_KEY not configured on the Edge Function. Add it via: supabase secrets set OPENAI_API_KEY=sk-...',
      }), { status: 503, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    // 1. Authenticate the caller (must be a logged-in admin/agent)
    const authHeader = req.headers.get('Authorization') || '';
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // 2. Parse body
    const body = await req.json().catch(() => ({}));
    const listingId = body.listing_id as string | undefined;
    const targetLangs: string[] = Array.isArray(body.target_langs) && body.target_langs.length
      ? body.target_langs.filter((l: string) => ['en', 'he', 'ru'].includes(l))
      : ['en', 'he', 'ru'];
    if (!listingId) {
      return new Response(JSON.stringify({ error: 'listing_id is required' }), {
        status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // 3. Load the listing using SERVICE role to bypass RLS for the read
    //    (we already auth'ed the user; the listing UPDATE will still respect RLS)
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: listing, error: loadError } = await adminClient
      .from('listings')
      .select('id, title_main, title_accent, description, neighborhood, extra_label, translations')
      .eq('id', listingId)
      .single();

    if (loadError || !listing) {
      return new Response(JSON.stringify({ error: 'Listing not found' }), {
        status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const sourcePayload: TranslatablePayload = {
      title_main: listing.title_main || '',
      title_accent: listing.title_accent || '',
      description: listing.description || '',
      neighborhood: listing.neighborhood || '',
      extra_label: listing.extra_label || '',
    };

    // 4. Translate in parallel for the 3 languages
    const results: Record<string, TranslatablePayload> = {};
    const errors: Record<string, string> = {};
    await Promise.all(targetLangs.map(async (lang) => {
      try {
        results[lang] = await translateToLang(apiKey, sourcePayload, lang);
      } catch (e) {
        errors[lang] = (e as Error).message;
      }
    }));

    if (!Object.keys(results).length) {
      return new Response(JSON.stringify({ error: 'All translations failed', details: errors }), {
        status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // 5. Merge with existing translations and save
    const newTranslations = { ...(listing.translations || {}), ...results };
    const { error: saveError } = await adminClient
      .from('listings')
      .update({ translations: newTranslations, translated_at: new Date().toISOString() })
      .eq('id', listingId);

    if (saveError) {
      return new Response(JSON.stringify({ error: 'Save failed', details: saveError.message }), {
        status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      languages_translated: Object.keys(results),
      languages_failed: Object.keys(errors),
      errors,
      translations: results,
    }), { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });

  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
