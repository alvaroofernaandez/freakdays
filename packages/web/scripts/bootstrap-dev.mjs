import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';

const backendDir = path.resolve(process.cwd(), '../api');
const noStart = process.argv.includes('--no-start');
const backendPort = process.env.FREAK_DAYS_API_PORT ?? '3001';
const frontendApiBaseUrl =
  process.env.NUXT_PUBLIC_API_BASE_URL ?? `http://localhost:${backendPort}/api`;

function runSync(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function spawnInherit(command, args, options = {}) {
  return spawn(command, args, {
    stdio: 'inherit',
    ...options,
  });
}

function killProcess(child) {
  if (!child || child.killed) {
    return;
  }

  child.kill('SIGTERM');
}

console.log('▶ Preparando backend (DB + Prisma + checks) ...');
runSync('pnpm', ['--dir', backendDir, 'dev:bootstrap:setup']);

if (noStart) {
  console.log('✅ Setup completo. No se iniciaron servidores (--no-start).');
  process.exit(0);
}

console.log(`▶ Iniciando backend en puerto ${backendPort} ...`);
const backend = spawnInherit(
  'pnpm',
  ['--dir', backendDir, 'start:dev'],
  {
    env: {
      ...process.env,
      PORT: backendPort,
    },
  },
);

console.log('▶ Iniciando frontend Nuxt ...');
const frontend = spawnInherit('pnpm', ['dev'], {
  env: {
    ...process.env,
    NUXT_PUBLIC_API_BASE_URL: frontendApiBaseUrl,
  },
});

let exiting = false;

function shutdown(code = 0) {
  if (exiting) return;
  exiting = true;

  killProcess(frontend);
  killProcess(backend);

  setTimeout(() => process.exit(code), 100);
}

backend.on('exit', (code) => {
  if (!exiting) {
    console.error(`❌ Backend terminó (code ${code ?? 1}). Cerrando frontend...`);
    shutdown(code ?? 1);
  }
});

frontend.on('exit', (code) => {
  if (!exiting) {
    console.error(`❌ Frontend terminó (code ${code ?? 1}). Cerrando backend...`);
    shutdown(code ?? 1);
  }
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
