const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[Render Build] Starting build process...');

const frontendDir = path.join(__dirname, 'frontend');
const hasNodeModules = fs.existsSync(path.join(frontendDir, 'node_modules'));

// 1. Install frontend dependencies if not already present
if (!hasNodeModules) {
  console.log('[Render Build] Installing frontend dependencies in ./frontend...');
  execSync('npm --prefix frontend install', { stdio: 'inherit' });
}

// 2. Build frontend with Vite
console.log('[Render Build] Compiling Vite application in ./frontend...');
execSync('npm --prefix frontend run build', { stdio: 'inherit' });

// 3. Helper to recursively copy directory contents
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const source = path.join(frontendDir, 'dist');

// 4. Mirror into every possible directory Render might look for
const targets = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'Resume Augmentation'),
  path.join(__dirname, 'build'),
  path.join(frontendDir, 'Resume Augmentation'),
  path.join(frontendDir, 'build'),
];

for (const target of targets) {
  console.log(`[Render Build] Mirroring output to: ${target}`);
  copyDir(source, target);
}

console.log('[Render Build] All output directories generated successfully!');
