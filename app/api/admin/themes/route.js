import { NextResponse } from 'next/server';
import { requireBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';
import { createSquadTheme, deleteSquadTheme, listSquadThemes } from '../../../../src/lib/server/squad-themes.mjs';

export async function GET(request) {
  try {
    await requireBlogSessionUser({ nextPath: null });
    const themes = await listSquadThemes();
    return NextResponse.json({ success: true, themes });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await requireBlogSessionUser({ nextPath: null });
    const body = await request.json();
    
    if (!body.name || !body.backgroundUrl) {
      return NextResponse.json({ error: 'Name and backgroundUrl are required' }, { status: 400 });
    }
    
    const theme = await createSquadTheme({
      name: body.name,
      backgroundUrl: body.backgroundUrl,
      className: body.className || ''
    });
    
    return NextResponse.json({ success: true, theme });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
