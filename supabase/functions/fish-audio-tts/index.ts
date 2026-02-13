import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Fish Audio voice model IDs - popular public voices
const FISH_VOICES: Record<string, string> = {
  // Premium voices
  'fish_aria': 'c5d218ca-30df-4e21-bcd6-8db46a4c0de6',
  'fish_roger': '2251f7d1-13f5-4b50-8b76-01be2b43e7ab',
  'fish_sarah': '6e1565d6-a030-4d41-a8ae-8d9e0d849f8b',
  'fish_charlie': 'e23e40f7-51d6-4f8b-bb60-5ecef1e77098',
  // Community voices
  'fish_egirl': 'bc8eb8dcdc184763b0a769ee03275724',
  'fish_alina': 'd61694f4ee5042aba2ffe11a9635d97e',
  'fish_brad_pitt': 'd9247a00779649adbe7f4fdde2ac11c8',
  'fish_nasal_90s': '01824726cd8e41e08df130787028e55e',
  'fish_child': 'af10c39629a0490087eda7b87302d2ba',
  'fish_flora': 'f40f7f02424a4bfb824b44c47e097737',
  'fish_sobchak': '7815c3f528c6454ebee675a870796cfc',
  'fish_tinkov': 'e02455f835054ae79a65db4d6116f1dd',
  'fish_egirl_real': '8ef4a238714b45718ce04243307c57a7',
  'fish_drug': '82faa0a57e3d4ca5b69a2b8d49a78d4c',
  'fish_mironov': 'a384391e04604c37ae797399f9d58c58',
  'fish_bodrov': '5ab9c3a566ce4d70a15bca64d1ef04a9',
  'fish_shirvindt': 'e4e97d819f704dfc9d8fbf06c1857f43',
  'fish_sherlock': 'f54364f43cab4f748b4662ea1fe5a572',
  'fish_mikhalkov': '43b70a02809f43d4a54c42f507091916',
  'fish_mordyukova': '48cecb704f6742ffa7da818fb5b6c805',
  'fish_papanov': 'e627e8766d7644dc81f37f860dc34122',
  'fish_litvinova': '8b10f726954b41fd9ede63ad5ddc0dce',
  'fish_vysotsky': 'a844b1361565441491807eb2c3c0b20a',
  'fish_mironov2': '6d07c38fcb7f40b68764821994bca624',
  'fish_evstigneev': 'e8ba9120a0654ea2bee93cea70e69981',
  'fish_pugacheva': '9645912faa7947b493ac4d2796ff6dfe',
  'fish_urgant': '7b662f13049b49888e8a68d563ec982e',
  'fish_lagutenko': '4ef547e565e24a7eb4303e2f6e536aff',
  'fish_kartunkova': '6745990b975d4041a23ad713bcee69f5',
};

// Input validation limits
const MAX_TEXT_LENGTH = 4000;

/**
 * Preprocess text for natural TTS pronunciation
 */
function preprocessTextForTTS(text: string): string {
  let result = text;

  // Strip Fish Audio emotion tags — cloned voices may read them aloud
  result = result.replace(/\([a-zA-Z][a-zA-Z\s-]*\)\s*/g, '');

  // Strip URLs
  result = result.replace(/https?:\/\/[^\s]+/g, '');

  // Strip markdown formatting (* ~ ` _)
  result = result.replace(/[*~`_]/g, '');

  // Strip bracket tags like [video:...] [photo:...]
  result = result.replace(/\[[^\]]*\]/g, '');

  // Convert symbols to spoken words (Russian)
  result = result.replace(/\+/g, ' плюс ');
  result = result.replace(/&/g, ' и ');
  result = result.replace(/@/g, ' собачка ');
  result = result.replace(/#/g, ' хештег ');
  result = result.replace(/%/g, ' процентов ');
  result = result.replace(/\$/g, ' долларов ');
  result = result.replace(/€/g, ' евро ');
  result = result.replace(/₽/g, ' рублей ');

  // Remove emojis
  result = result.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');

  // Clean up multiple spaces/newlines
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice: requestedVoice, speed } = await req.json();

    // === INPUT VALIDATION ===
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmedText = text.trim();
    
    if (trimmedText.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (trimmedText.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Text too long. Maximum ${MAX_TEXT_LENGTH} characters allowed` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const FISH_AUDIO_API_KEY = Deno.env.get('FISH_AUDIO_API_KEY');
    if (!FISH_AUDIO_API_KEY) {
      console.error('FISH_AUDIO_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Fish Audio not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get reference_id for the voice (if it's a Fish voice)
    const referenceId = requestedVoice && FISH_VOICES[requestedVoice] 
      ? FISH_VOICES[requestedVoice] 
      : undefined;

    // Preprocess text: convert symbols to words and add natural pauses
    const processedText = preprocessTextForTTS(trimmedText);

    // Build request body
    const requestBody: Record<string, unknown> = {
      text: processedText,
      format: 'mp3',
      mp3_bitrate: 64,
      model: 's1',
    };

    // Add reference_id if we have a specific voice
    if (referenceId) {
      requestBody.reference_id = referenceId;
    }

    // Add speed/prosody if specified
    if (speed && typeof speed === 'number' && speed !== 1.0) {
      requestBody.prosody = {
        speed: Math.max(0.5, Math.min(2.0, speed)),
      };
    }

    // Try with requested voice first, fallback to default if it fails
    // Use fishaudio.net endpoint (Chinese mirror) as user's account is on fishaudio.net
    const TTS_URL = 'https://api.fish.audio/v1/tts';
    let response = await fetch(TTS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // If voice reference failed (400/404/500), retry without reference_id
    if (!response.ok && referenceId) {
      console.error('Fish Audio TTS error with voice:', response.status, await response.text());
      
      const fallbackBody = { ...requestBody };
      delete fallbackBody.reference_id;
      response = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fallbackBody),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fish Audio TTS error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Fish Audio service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Read audio into buffer
    const audioBuffer = await response.arrayBuffer();
    

    if (audioBuffer.byteLength === 0) {
      console.error('[Fish TTS] Empty audio buffer received from Fish Audio API');
      return new Response(
        JSON.stringify({ error: 'Empty audio response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if client wants raw binary (faster) or base64 JSON (legacy)
    const wantsBinary = req.headers.get('accept') === 'audio/mpeg';

    if (wantsBinary) {
      return new Response(new Uint8Array(audioBuffer), {
        headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
      });
    }

    // Legacy: return as base64 JSON
    const base64Audio = base64Encode(new Uint8Array(audioBuffer));

    return new Response(
      JSON.stringify({ audio: base64Audio, format: 'mp3' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fish Audio TTS error:', error);
    return new Response(
      JSON.stringify({ error: 'Service temporarily unavailable' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
