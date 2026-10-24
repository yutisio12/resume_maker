export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const token = body.token;
    const secret = env.TURNSTILE_SECRET_KEY;
    
    if (!secret) {
      return new Response(JSON.stringify({ success: false, error: 'missing_secret' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'missing_token' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);
    
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    
    const outcome = await result.json();
    return new Response(JSON.stringify(outcome), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: 'server_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
