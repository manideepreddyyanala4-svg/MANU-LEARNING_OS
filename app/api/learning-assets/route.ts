import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  if (!path || path.includes('..')) return NextResponse.json({ error: 'Invalid path' }, { status: 400 });

  const client = await createServerSupabase();
  if (!client) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  // Require an authenticated owner. Storage RLS already scopes `learning-assets`
  // to `<user-id>/…`, but we assert ownership explicitly here as defense in depth
  // so an authenticated user can never mint a signed URL for someone else's path.
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  if (!path.startsWith(`${user.id}/`)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data, error } = await client.storage.from('learning-assets').createSignedUrl(path, 300);
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  // Short-lived signed URLs are never persisted as document data — they are
  // minted on demand and redirected to, so private storage stays private.
  return NextResponse.redirect(data.signedUrl);
}
