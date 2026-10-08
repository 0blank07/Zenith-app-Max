import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
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

function tunnelDatabaseUrl(value, port) {
  if (!value) return value;
  const url = new URL(value);
  url.hostname = tunnelHost;
  url.port = String(port);
  return url.toString();
}

async function main() {
  const tunnel = spawn('ssh', [
    '-N',
    '-L', `${tunnelPort}:${tunnelTarget}`,
    '-o', 'ExitOnForwardFailure=yes',
    'zenith'
  ], { cwd: projectRoot, stdio: 'ignore', windowsHide: true });

  try {
    console.log(`[blog-migrations] Establishing SSH tunnel to 'zenith' on port ${tunnelPort}...`);
    await waitForTunnel(tunnel);
    console.log(`[blog-migrations] SSH tunnel established.`);

    const env = { ...process.env, ZENITH_DB_TUNNELED: 'true' };
    const localEnv = dotenv.config({ path: path.join(projectRoot, '.env.local'), processEnv: {} }).parsed || {};
    
    // Override the DB URLs to point to the local tunnel port
    for (const key of ['DATABASE_URL', 'BLOG_DATABASE_URL', 'MARKET_DATABASE_URL']) {
      const value = process.env[key] || localEnv[key];
      if (value) env[key] = tunnelDatabaseUrl(value, tunnelPort);
    }

    console.log(`[blog-migrations] Running migrations through tunnel...`);
    await run(process.execPath, ['scripts/db/run-blog-migrations.mjs'], { cwd: projectRoot, env });
  } finally {
    if (tunnel.exitCode === null) {
      console.log(`[blog-migrations] Closing SSH tunnel...`);
      tunnel.kill();
    }
  }
}

main().catch((error) => {
  console.error(`[blog-migrations] ${error.message}`);
  process.exitCode = 1;
});
