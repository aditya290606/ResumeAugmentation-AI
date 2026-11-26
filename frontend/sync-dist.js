import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, 'dist');
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

const targets = [
  path.join(__dirname, 'Resume Augmentation'),
  path.join(__dirname, 'build'),
  path.join(__dirname, '..', 'Resume Augmentation'),
  path.join(__dirname, '..', 'dist'),
];

for (const t of targets) {
  try {
    copyDir(source, t);
  } catch (e) {
    // ignore
  }
}
