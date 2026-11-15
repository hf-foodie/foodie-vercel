const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const serverJsPath = path.resolve(__dirname, '..', 'server.js');
const standaloneServerJsPath = path.resolve(__dirname, '..', '.next', 'standalone', 'server.js');
const targetServerJsPath = path.resolve(distDir, 'server.js');

// Apply to every recursive copy, including Next.js traced standalone files.
const copyOptions = {
  recursive: true,
  filter: (source) => {
    const name = path.basename(source).toLowerCase();
    return name !== 'certs' && name !== 'h2' && name !== 'certs.zip'
      && !/\.(key|pem|pfx|jks|mv\.db|trace\.db)$/.test(name);
  },
};

try {
  console.log('Starting post-build processing...');

  // 1. dist 디렉토리 생성 및 파일 복사
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  const standaloneDir = path.resolve(__dirname, '..', '.next', 'standalone');
  if (fs.existsSync(standaloneDir)) {
    fs.cpSync(standaloneDir, distDir, copyOptions);
    console.log('Copied standalone files to dist/');
  }

  const staticSource = path.resolve(__dirname, '..', '.next', 'static');
  const staticDest = path.resolve(distDir, '.next', 'static');
  if (fs.existsSync(staticSource)) {
    if (!fs.existsSync(staticDest)) fs.mkdirSync(staticDest, { recursive: true });
    fs.cpSync(staticSource, staticDest, copyOptions);
    console.log('Copied static files to dist/.next/static/');
  }

  const publicSource = path.resolve(__dirname, '..', 'public');
  const publicDest = path.resolve(distDir, 'public');
  if (fs.existsSync(publicSource)) {
    if (!fs.existsSync(publicDest)) fs.mkdirSync(publicDest, { recursive: true });
    fs.cpSync(publicSource, publicDest, copyOptions);
    console.log('Copied public files to dist/public/');
  }

  // TLS material is supplied at runtime through TLS_KEY_PATH / TLS_CERT_PATH.
  // Never bundle production certificates or private keys with the application.

  const runBatSource = path.resolve(__dirname, '..', 'run.bat');
  const runBatDest = path.resolve(distDir, 'run.bat');
  if (fs.existsSync(runBatSource)) {
    fs.copyFileSync(runBatSource, runBatDest);
    console.log('Copied run.bat to dist/run.bat');
  }

  // 2. server.js 설정 주입
  let serverJsContent = fs.readFileSync(serverJsPath, 'utf8');
  let standaloneServerJsContent = '';
  if (fs.existsSync(standaloneServerJsPath)) {
    standaloneServerJsContent = fs.readFileSync(standaloneServerJsPath, 'utf8');
  }

  // Find nextConfig in standalone server.js
  const nextConfigMatch = standaloneServerJsContent.match(/const nextConfig = (\{[\s\S]*?\})(?=\r?\n|$)/);
  if (nextConfigMatch) {
    const nextConfigStr = nextConfigMatch[1];
    serverJsContent = serverJsContent.replace(
      /const nextConfig = JSON\.parse\(process\.env\.__NEXT_PRIVATE_STANDALONE_CONFIG \|\| '{}'\);/,
      `const nextConfig = ${nextConfigStr};`
    );
    console.log('Successfully injected nextConfig into server.js');
  } else {
    console.warn('Could not find nextConfig in .next/standalone/server.js');
  }

  fs.writeFileSync(targetServerJsPath, serverJsContent);
  console.log('Post-build process completed successfully.');

} catch (error) {
  console.error('Error during post-build process:', error);
  process.exit(1);
}
