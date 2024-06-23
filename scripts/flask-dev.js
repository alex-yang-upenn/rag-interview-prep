const { execSync } = require('child_process');
const path = require('path');
const isWindows = process.platform === 'win32';

// Determine the correct path to the virtual environment's Python executable
const venvPath = isWindows ? path.join('.venv', 'Scripts', 'python') : path.join('.venv', 'bin', 'python');
const flaskAppPath = path.join('api', 'index.py');

try {
  // Use cross-env to set the FLASK_APP environment variable and run the Flask server
  execSync(`cross-env FLASK_APP=${flaskAppPath} ${venvPath} -m flask run`, { stdio: 'inherit' });
} catch (error) {
  console.error('Error running the Flask development server:', error);
  process.exit(1);
}