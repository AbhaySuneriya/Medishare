
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.20.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    // Create a Supabase client with the Auth context
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // First, clear user data with the database function
    console.log('Calling delete_user_account RPC for user:', userId);
    const { error: rpcError } = await supabase.rpc('delete_user_account', { user_id: userId });
    
    if (rpcError) {
      console.error('Error deleting user data:', rpcError);
      return new Response(JSON.stringify({ error: rpcError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    // Then, delete the actual user with admin privileges
    console.log('Deleting auth user with ID:', userId);
    const { error: adminError } = await supabase.auth.admin.deleteUser(userId);
    
    if (adminError) {
      console.error('Error deleting user account:', adminError);
      return new Response(JSON.stringify({ error: adminError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in deleteUser function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
