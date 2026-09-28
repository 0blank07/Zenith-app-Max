import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2] === 'dev' ? 'dev' : 'build';
const tunnelPort = Number(process.env.ZENITH_DB_TUNNEL_PORT || 15432);
const tunnelHost = '127.0.0.1';
const tunnelTarget = '127.0.0.1:5432';

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${signal ? `signal ${signal}` : `code ${code}`}`));
    });
  });
}

function waitForTunnel(child) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 15000;
    let settled = false;

    child.once('error', (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });

    const check = () => {
      if (settled) return;
      if (child.exitCode !== null) {
        settled = true;
        reject(new Error('SSH tunnel exited before it became ready.'));
        return;
      }

      const socket = net.createConnection({ host: tunnelHost, port: tunnelPort });
      socket.once('connect', () => {
        socket.destroy();
        settled = true;
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() >= deadline) {
          settled = true;
          reject(new Error('Timed out waiting for the SSH tunnel.'));
        } else {
          setTimeout(check, 200);
        }
      });
    };

    check();
  });
}

function tunnelDatabaseUrl(value) {
  if (!value) return value;
  const url = new URL(value);
  url.hostname = tunnelHost;
  url.port = String(tunnelPort);
  return url.toString();
}

async function main() {
  if (mode === 'build') {
    await run(process.execPath, ['scripts/prepare-legacy.mjs'], { cwd: projectRoot });
  }

  const tunnel = spawn('ssh', [
    '-N',
    '-L', `${tunnelPort}:${tunnelTarget}`,
    '-o', 'ExitOnForwardFailure=yes',
    'zenith'
  ], { cwd: projectRoot, stdio: 'ignore', windowsHide: true });

  try {
    await waitForTunnel(tunnel);

    const env = { ...process.env, PG_HOST: tunnelHost, PG_PORT: String(tunnelPort) };
    const localEnv = dotenv.config({ path: path.join(projectRoot, '.env.local'), processEnv: {} }).parsed || {};
    for (const key of ['DATABASE_URL', 'BLOG_DATABASE_URL', 'MARKET_DATABASE_URL']) {
      const value = process.env[key] || localEnv[key];
      if (value) env[key] = tunnelDatabaseUrl(value);
    }

    if (mode === 'build') {
      await run(process.execPath, ['scripts/fix-database-urls.mjs'], { cwd: projectRoot, env });
    }
    await run(process.execPath, ['node_modules/next/dist/bin/next', mode], { cwd: projectRoot, env });
  } finally {
    if (tunnel.exitCode === null) tunnel.kill();
  }
}

main().catch((error) => {
  console.error(`[${mode.toUpperCase()}] ${error.message}`);
  process.exitCode = 1;
});
