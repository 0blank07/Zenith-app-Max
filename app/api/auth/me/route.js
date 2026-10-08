import { NextResponse } from 'next/server';
import {
  getSessionFromRequest
} from '../../../../src/lib/server/auth/session.mjs';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const sessionData = await getSessionFromRequest(request);

    if (!sessionData || !sessionData.user || sessionData.user.isActive === false) {
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }

    const { user } = sessionData;
    const providers = Array.isArray(user.providers) ? user.providers : [];
    const linkedAccounts = Array.isArray(user.linkedAccounts)
      ? user.linkedAccounts.map((acc) => ({
          provider: acc.provider,
          displayName: acc.displayName || acc.display_name || null,
          avatarUrl: acc.avatarUrl || acc.avatar_url || null,
          createdAt: acc.createdAt || acc.created_at || null
        }))
      : [];

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name || user.displayName || '',
        displayName: user.displayName || user.name || '',
        email: user.email || null,
        avatarUrl: user.avatarUrl || null,
        role: user.role || 'user',
        providers,
        linkedAccounts
      }
    });
  } catch (error) {
    console.error('Error retrieving session in /api/auth/me:', error);
    return NextResponse.json({
      authenticated: false,
      user: null
    });
  }
}
