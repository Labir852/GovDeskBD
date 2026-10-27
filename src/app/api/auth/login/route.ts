import { credentialSchema, createAuthToken, getAuthCookieHeader, validateUserCredentials } from '@/auth';

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') ?? '';
  
  const payload = contentType.includes('application/json') ? await req.json() : await req.formData();
    
  const username = contentType.includes('application/json') ? payload.username?.toString() : payload.get('username')?.toString();
  const password = contentType.includes('application/json') ? payload.password?.toString() : payload.get('password')?.toString();
  const callbackUrl = contentType.includes('application/json') ? payload.callbackUrl?.toString() : payload.get('callbackUrl')?.toString();
  
  const parsed = credentialSchema.safeParse({
    username,
    password,
    callbackUrl: callbackUrl ?? undefined,
  });
  
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid username or password.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = await validateUserCredentials(parsed.data.username, parsed.data.password);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid username or password.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = createAuthToken(user);
  const location = parsed.data.callbackUrl ?? '/dashboard';

  if (contentType.includes('application/json')) {
    return new Response(JSON.stringify({ success: true, redirect: location }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': getAuthCookieHeader(token),
      },
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': getAuthCookieHeader(token),
      Location: location,
    },
  });
}

export async function GET() {
  return new Response('Not found', { status: 404 });
}
