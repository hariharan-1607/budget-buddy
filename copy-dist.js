const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const frontendDist = path.join(rootDir, 'frontend', 'dist');
const rootDist = path.join(rootDir, 'dist');

console.log('[copy-dist] Current working directory:', rootDir);

// 1. If frontend/dist exists and rootDist does not or needs sync, copy frontend/dist -> dist
if (fs.existsSync(frontendDist)) {
  console.log('[copy-dist] Found frontend/dist, copying to root dist...');
  if (!fs.existsSync(rootDist)) {
    fs.mkdirSync(rootDist, { recursive: true });
  }
  fs.cpSync(frontendDist, rootDist, { recursive: true });
}

// 2. If rootDist exists and frontend/dist does not, copy root dist -> frontend/dist
if (fs.existsSync(rootDist)) {
  console.log('[copy-dist] Found root dist, copying to frontend/dist...');
  if (!fs.existsSync(frontendDist)) {
    fs.mkdirSync(frontendDist, { recursive: true });
  }
  fs.cpSync(rootDist, frontendDist, { recursive: true });
}

console.log('[copy-dist] Root dist contents:', fs.existsSync(rootDist) ? fs.readdirSync(rootDist) : 'MISSING');
console.log('[copy-dist] Frontend dist contents:', fs.existsSync(frontendDist) ? fs.readdirSync(frontendDist) : 'MISSING');
