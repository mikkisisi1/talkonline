import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Valid OpenAI TTS voices
const VALID_VOICES = ['onyx', 'echo', 'fable', 'alloy', 'nova', 'shimmer', 'coral', 'sage'];

// Input validation limits
const MAX_TEXT_LENGTH = 4000; // OpenAI TTS limit is ~4096 characters
const MIN_SPEED = 0.25;
const MAX_SPEED = 4.0;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language, voice: requestedVoice, speed: requestedSpeed } = await req.json();

    // === INPUT VALIDATION ===
    
    // Validate text is present and is a string
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Strip URLs so TTS doesn't read them aloud
    const trimmedText = text.replace(/https?:\/\/[^\s]+/g, '').replace(/\s{2,}/g, ' ').trim();
    
    // Validate text is not empty
    if (trimmedText.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate text length to prevent abuse
    if (trimmedText.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Text too long. Maximum ${MAX_TEXT_LENGTH} characters allowed` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate voice parameter
    const voice = requestedVoice && typeof requestedVoice === 'string' 
      ? (VALID_VOICES.includes(requestedVoice) ? requestedVoice : 'onyx')
      : 'onyx';

    // Validate speed parameter
    let speed = 1.0;
    if (requestedSpeed !== undefined && requestedSpeed !== null) {
      const parsedSpeed = typeof requestedSpeed === 'number' ? requestedSpeed : parseFloat(requestedSpeed);
      if (!isNaN(parsedSpeed)) {
        speed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, parsedSpeed));
      }
    }

    // === END INPUT VALIDATION ===

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'TTS service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: trimmedText,
        voice: voice,
        response_format: 'mp3',
        speed: speed,
      }),
    });

    if (!response.ok) {
      // Log detailed error server-side only
      const errorText = await response.text();
      console.error('OpenAI TTS error:', response.status, errorText);
      // Return generic error to client - never expose internal details
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return audio as base64 using proper encoding for large buffers
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(new Uint8Array(audioBuffer));

    return new Response(
      JSON.stringify({ audio: base64Audio, format: 'mp3' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Log detailed error server-side only
    console.error('TTS error:', error);
    // Return generic error to client - never expose internal details
    return new Response(
      JSON.stringify({ error: 'Service temporarily unavailable' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
