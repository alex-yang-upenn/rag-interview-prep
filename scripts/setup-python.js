const { execSync } = require('child_process');
const isWindows = process.platform === 'win32';

if (isWindows) {
  execSync('.venv\\Scripts\\activate && pip install -r requirements.txt', { stdio: 'inherit' });
} else {
  execSync('python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt', { stdio: 'inherit' });
}