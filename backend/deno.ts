import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    
    // Health check endpoint
    if (url.pathname === '/') {
      return new Response(
        JSON.stringify({ message: 'Backend is running!', status: 'OK' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // API health endpoint
    if (url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Users endpoint (requires Supabase configuration)
    if (url.pathname === '/api/users') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      
      if (!supabaseUrl || !supabaseKey) {
        return new Response(
          JSON.stringify({ error: 'Supabase configuration missing' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }

      const supabase = createClient(supabaseUrl, supabaseKey)
      
      try {
        const { data, error } = await supabase.from('users').select('*')
        if (error) throw error
        
        return new Response(
          JSON.stringify(data),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }
    }

    // Forex rates endpoint
    if (url.pathname === '/api/forex') {
      const apiKey = Deno.env.get('TWELVE_DATA_API_KEY')
      
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'API key not configured' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }

      // Example forex data (you can replace with actual API call)
      const forexData = {
        EUR: { USD: 1.08, GBP: 0.86 },
        USD: { EUR: 0.93, GBP: 0.79 },
        GBP: { EUR: 1.16, USD: 1.27 }
      }

      return new Response(
        JSON.stringify(forexData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: 'Not Found' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}) 