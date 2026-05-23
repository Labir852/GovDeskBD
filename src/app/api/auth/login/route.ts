import { credentialSchema, createAuthToken, getAuthCookieHeader, validateUserCredentials } from '@/auth';

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') ?? '';
  console.log('📨 Login request received. Content-Type:', contentType);
  
  const payload = contentType.includes('application/json') ? await req.json() : await req.formData();
  console.log('📦 Payload type:', payload instanceof FormData ? 'FormData' : 'JSON');
    
  const email = contentType.includes('application/json') ? payload.email?.toString() : payload.get('email')?.toString();
  const password = contentType.includes('application/json') ? payload.password?.toString() : payload.get('password')?.toString();
  const callbackUrl = contentType.includes('application/json') ? payload.callbackUrl?.toString() : payload.get('callbackUrl')?.toString();
  
  console.log('🔑 Credentials extracted:');
  console.log('   Email:', email, `(${email?.length || 0} chars)`);
  console.log('   Password:', password ? `***${password.slice(-3)}` : 'undefined', `(${password?.length || 0} chars)`);
  console.log('   Callback URL:', callbackUrl);
  
  const parsed = credentialSchema.safeParse({
    email,
    password,
    callbackUrl: callbackUrl ?? undefined,
  });
  
  console.log('✔️ Schema validation:', parsed.success ? 'PASSED' : 'FAILED');
  if (!parsed.success) {
    console.log('❌ Validation errors:', parsed.error.errors);
  }
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid email or password.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = await validateUserCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid email or password.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = createAuthToken(user);
  const location = parsed.data.callbackUrl ?? '/dashboard';

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
