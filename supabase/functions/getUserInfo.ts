
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user data from the auth_users_info view (which is safer than direct access to auth.users)
    const { data: userData, error: userError } = await supabase.rpc('get_user_info', { user_id: userId });
    
    if (userError) {
      console.error('Error getting user info:', userError);
      
      // Fallback to admin API if RPC fails
      const { data: adminData, error: adminError } = await supabase.auth.admin.getUserById(userId);
      
      if (adminError) {
        return new Response(JSON.stringify({ error: adminError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      
      // Format the response from admin API
      const userInfo = {
        id: adminData.user.id,
        email: adminData.user.email,
        display_name: adminData.user.user_metadata?.full_name || adminData.user.email,
        created_at: adminData.user.created_at,
      };
      
      return new Response(JSON.stringify({ data: userInfo }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    return new Response(JSON.stringify({ data: userData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in getUserInfo function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
