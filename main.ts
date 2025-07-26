import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req: Request) => {
  const url = new URL(req.url)
  if (url.pathname === '/') {
    return new Response(
      JSON.stringify({ 
        message: 'ForexAdvisor Backend is running!', 
        status: 'OK',
        timestamp: new Date().toISOString(),
        endpoints: ['/api/health', '/api/forex', '/api/users']
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        status: 200 
      }
    )
  }

  if (url.pathname === '/api/health') {
    return new Response(
      JSON.stringify({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: 'Deno Deploy'
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        status: 200 
      }
    )
  }

  return new Response(
    JSON.stringify({ error: 'Not Found' }),
    { 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 404 
    }
  )
}) 