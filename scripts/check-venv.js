const fs = require('fs');
const { execSync } = require('child_process');

if (!fs.existsSync('.venv')) {
  console.log('Virtual environment not found. Setting up...');
  execSync('npm run setup-python', { stdio: 'inherit' });
} else {
  console.log('Virtual environment found.');
}