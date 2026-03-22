import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const helpWatcherScript = fileURLToPath(new URL('./check-help-content.mjs', import.meta.url));
const ngCliEntrypoint = require.resolve('@angular/cli/bin/ng.js');

const helpWatcher = spawn(process.execPath, [helpWatcherScript, '--watch'], {
  stdio: 'inherit'
});
const ngProcess = spawn(process.execPath, [ngCliEntrypoint, ...process.argv.slice(2)], {
  stdio: 'inherit'
});

let shuttingDown = false;

function terminateChild(child) {
  if (!child.killed) {
    child.kill('SIGTERM');
  }
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  terminateChild(helpWatcher);
  terminateChild(ngProcess);
  process.exit(exitCode);
}

helpWatcher.on('exit', (code) => {
  if (shuttingDown) {
    return;
  }

  shutdown(code ?? 1);
});

ngProcess.on('exit', (code) => {
  shutdown(code ?? 0);
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));