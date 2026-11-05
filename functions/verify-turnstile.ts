export async function onRequestPost(context: any) {
  const baseHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
  };

  try {
    const { request, env } = context;

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'method_not_allowed' }), {
        status: 405,
        headers: baseHeaders,
      });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return new Response(JSON.stringify({ success: false, error: 'bad_content_type' }), {
        status: 415,
        headers: baseHeaders,
      });
    }

    let text: string;
    try {
      text = await request.text();
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'bad_body' }), {
        status: 400,
        headers: baseHeaders,
      });
    }

    if (text.length === 0 || text.length > 1024) {
      return new Response(JSON.stringify({ success: false, error: 'body_too_large' }), {
        status: 413,
        headers: baseHeaders,
      });
    }

    let body: any;
    try {
      body = JSON.parse(text);
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'bad_json' }), {
        status: 400,
        headers: baseHeaders,
      });
    }

    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const secret = env?.TURNSTILE_SECRET_KEY;

    if (!secret) {
      return new Response(JSON.stringify({ success: false, error: 'missing_secret' }), {
        status: 500,
        headers: baseHeaders,
      });
    }
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'missing_token' }), {
        status: 400,
        headers: baseHeaders,
      });
    }

    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);

    const ip =
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('True-Client-IP') ||
      (request.headers.get('X-Forwarded-For') || '').split(',')[0]?.trim() ||
      undefined;
    if (ip) {
      formData.append('remoteip', ip);
    }

    const expectedHostname = env?.TURNSTILE_EXPECTED_HOSTNAME || (() => {
      try {
        return new URL(request.url).hostname;
      } catch {
        return '';
      }
    })();
    const isTestSecret = /^[123]x0{20,}[A-Za-z0-9]*$/.test(String(secret));
    const EXPECTED_ACTION = 'resume-gate';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    let result: Response;
    try {
      result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
    } catch (e: any) {
      clearTimeout(timeout);
      if (e?.name === 'AbortError') {
        return new Response(JSON.stringify({ success: false, error: 'verify_timeout' }), {
          status: 504,
          headers: baseHeaders,
        });
      }
      return new Response(JSON.stringify({ success: false, error: 'verify_failed' }), {
        status: 502,
        headers: baseHeaders,
      });
    } finally {
      clearTimeout(timeout);
    }

    const outcome: any = await result.json().catch(() => null);
    if (!outcome || typeof outcome.success !== 'boolean') {
      return new Response(JSON.stringify({ success: false, error: 'verify_failed' }), {
        status: 502,
        headers: baseHeaders,
      });
    }

    if (outcome.success && !isTestSecret) {
      if (expectedHostname && outcome.hostname && outcome.hostname !== expectedHostname) {
        return new Response(JSON.stringify({ success: false, error: 'hostname_mismatch' }), {
          status: 403,
          headers: baseHeaders,
        });
      }
      if (typeof outcome.action === 'string' && outcome.action !== EXPECTED_ACTION) {
        return new Response(JSON.stringify({ success: false, error: 'action_mismatch' }), {
          status: 403,
          headers: baseHeaders,
        });
      }
    }

    return new Response(JSON.stringify(outcome), {
      status: 200,
      headers: baseHeaders,
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: 'server_error' }), {
      status: 500,
      headers: baseHeaders,
    });
  }
}
