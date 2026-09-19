import { NextResponse } from 'next/server';
import SftpClient from 'ssh2-sftp-client';
import { requireBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';

export const maxDuration = 60; // Max execution time

export async function POST(request) {
  try {
    // 1. Authenticate user
    await requireBlogSessionUser({ nextPath: null });

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file');
    const filename = formData.get('filename');

    if (!file || !filename) {
      return NextResponse.json({ error: 'File and filename are required' }, { status: 400 });
    }

    // 3. Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Initialize SFTP
    const sftp = new SftpClient();

    const connectConfig = {
      host: process.env.SFTP_HOST,
      port: Number(process.env.SFTP_PORT) || 22,
      username: process.env.SFTP_USER,
      // Give up faster on auth failure
      readyTimeout: 20000,
      retries: 0,
    };

    // --- Auth method resolution ---
    // Priority 1: SFTP_PRIVATE_KEY env var.
    // The value is the base64-encoded raw binary of the OpenSSH private key.
    // ssh2 requires PEM format: wrap the base64 content with the correct headers.
    // If the value already starts with "-----BEGIN", use it as-is.
    const rawKeyEnv = (process.env.SFTP_PRIVATE_KEY || '').trim().replace(/^"|"$/g, '');
    if (rawKeyEnv) {
      let resolvedKey;
      if (rawKeyEnv.startsWith('-----BEGIN')) {
        // Already full PEM text — just normalise escaped newlines
        resolvedKey = rawKeyEnv.replace(/\\n/g, '\n');
      } else {
        // Raw base64 of the binary key body — wrap with OpenSSH PEM headers.
        // Split into 70-character lines as the PEM standard requires.
        const b64Lines = rawKeyEnv.match(/.{1,70}/g).join('\n');
        resolvedKey = `-----BEGIN OPENSSH PRIVATE KEY-----\n${b64Lines}\n-----END OPENSSH PRIVATE KEY-----\n`;
      }
      connectConfig.privateKey = resolvedKey;
      // Always pass the passphrase as-is — it may literally be the word "blank"
      const passphrase = (process.env.SFTP_PASSPHRASE || '').trim().replace(/^"|"$/g, '');
      if (passphrase) connectConfig.passphrase = passphrase;
      console.log('[admin-upload-api] Using private key auth (env var)');

    // Priority 2: SFTP_PRIVATE_KEY_PATH — read raw file (strips surrounding quotes from path)
    } else if (process.env.SFTP_PRIVATE_KEY_PATH) {
      const keyPath = process.env.SFTP_PRIVATE_KEY_PATH.trim().replace(/^"|"$/g, '');
      try {
        const { readFileSync } = await import('fs');
        connectConfig.privateKey = readFileSync(keyPath);
        const passphrase = (process.env.SFTP_PASSPHRASE || '').trim().replace(/^"|"$/g, '');
        if (passphrase) connectConfig.passphrase = passphrase;
        console.log('[admin-upload-api] Using private key auth (file)');
      } catch (keyReadError) {
        console.warn('[admin-upload-api] Could not read key file, will try password auth:', keyReadError.message);
      }
    }

    // Priority 3: SFTP_PASSWORD — plain password auth
    if (!connectConfig.privateKey && process.env.SFTP_PASSWORD) {
      connectConfig.password = process.env.SFTP_PASSWORD.trim().replace(/^"|"$/g, '');
      console.log('[admin-upload-api] Using password auth');
    }

    if (!connectConfig.privateKey && !connectConfig.password) {
      throw new Error('No SFTP auth method configured. Set SFTP_PRIVATE_KEY or SFTP_PASSWORD in .env.local');
    }

    await sftp.connect(connectConfig);

    const remoteDir = '/var/www/images.zenithfcm.com';
    const remotePath = `${remoteDir}/${filename}`;

    // 5. Upload via SFTP stream/buffer
    await sftp.put(buffer, remotePath);
    await sftp.end();

    // 6. Return the public CDN url
    const publicUrl = `https://images.zenithfcm.com/${filename}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('[admin-upload-api] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
