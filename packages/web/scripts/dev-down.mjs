import { spawnSync } from 'node:child_process';
import path from 'node:path';

const backendDir = path.resolve(process.cwd(), '../api');

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    cwd,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('▶ Bajando PostgreSQL local de freak-days-api...');
run('docker', ['compose', 'down'], backendDir);
console.log('✅ DB detenida. Si tenías dev:bootstrap corriendo, cortalo con Ctrl+C.');
