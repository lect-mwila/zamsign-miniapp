import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import * as crypto from "node:crypto"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { initDataRaw } = await req.json()
    
    if (!initDataRaw) {
      throw new Error('Missing initDataRaw')
    }

    const urlParams = new URLSearchParams(initDataRaw);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    // Sort parameters
    const params = Array.from(urlParams.entries());
    params.sort((a, b) => a[0].localeCompare(b[0]));
    
    const dataCheckString = params.map(([key, value]) => `${key}=${value}`).join('\n');
    
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set');
    }

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash !== hash) {
      // In development/mock environments we might skip hash validation if desired, 
      // but for security it's required. You could add an override here for local dev if needed.
      if (Deno.env.get('NODE_ENV') !== 'development') {
        throw new Error('Invalid initData hash');
      }
    }

    const userStr = urlParams.get('user');
    if (!userStr) throw new Error('No user data');
    const tgUser = JSON.parse(userStr);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const email = `${tgUser.id}@telegram.local`;
    const generatedPassword = crypto.randomBytes(16).toString('hex');

    // Check if user exists in public.users to get their auth.users ID
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', tgUser.id)
      .maybeSingle();

    if (!existingUser) {
      // Create user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: {
          telegram_id: tgUser.id,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          telegram_username: tgUser.username,
        }
      });
      if (createError) throw createError;
    } else {
      // Update password so we can sign in
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password: generatedPassword,
        user_metadata: {
          telegram_id: tgUser.id,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          telegram_username: tgUser.username,
        }
      });
      if (updateError) throw updateError;
    }

    // Sign in to get a session
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: generatedPassword
    });

    if (authError) throw authError;

    return new Response(
      JSON.stringify({ session: authData.session }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
