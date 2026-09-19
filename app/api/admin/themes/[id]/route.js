import { NextResponse } from 'next/server';
import { requireBlogSessionUser } from '../../../../../src/lib/server/blog/auth.mjs';
import { deleteSquadTheme } from '../../../../../src/lib/server/squad-themes.mjs';

export async function DELETE(request, { params }) {
  try {
    await requireBlogSessionUser({ nextPath: null });
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Theme ID is required' }, { status: 400 });
    }
    
    await deleteSquadTheme(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
