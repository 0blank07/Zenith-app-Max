import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '../../../../src/lib/server/auth/session.mjs';
import {
  unlinkOAuthAccount,
  getLinkedAccounts
} from '../../../../src/lib/server/auth/db.mjs';
import { isSupportedProvider } from '../../../../src/lib/server/auth/oauth-providers.mjs';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const sessionData = await getSessionFromRequest(request);
    if (!sessionData || !sessionData.user || sessionData.user.isActive === false) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { user } = sessionData;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const provider = body?.provider ? String(body.provider).trim().toLowerCase() : '';
    if (!provider || !isSupportedProvider(provider)) {
      return NextResponse.json(
        { success: false, error: 'A valid OAuth provider is required to unlink.' },
        { status: 400 }
      );
    }

    const linkedAccounts = await getLinkedAccounts(user.id);
    const isCurrentlyLinked = linkedAccounts.some((acc) => acc.provider === provider);
    if (!isCurrentlyLinked) {
      return NextResponse.json(
        { success: false, error: 'Provider account not found' },
        { status: 404 }
      );
    }

    const hasPassword = Boolean(user.passwordHash || user.password_hash);
    const distinctProviders = new Set(linkedAccounts.map((acc) => acc.provider));

    if (!hasPassword && distinctProviders.size <= 1) {
      return NextResponse.json(
        { success: false, error: 'Cannot unlink sole provider' },
        { status: 400 }
      );
    }

    try {
      await unlinkOAuthAccount(user.id, provider);
    } catch (dbErr) {
      if (dbErr?.code === 'CANNOT_UNLINK_SOLE_IDENTITY') {
        return NextResponse.json(
          { success: false, error: 'Cannot unlink sole provider' },
          { status: 400 }
        );
      }
      throw dbErr;
    }

    const remainingAccounts = await getLinkedAccounts(user.id);
    const remainingProviders = remainingAccounts.map((acc) => acc.provider);

    return NextResponse.json({
      success: true,
      remainingProviders
    });
  } catch (error) {
    console.error('Error during account unlinking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unlink account' },
      { status: 500 }
    );
  }
}
