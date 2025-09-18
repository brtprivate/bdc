import { execSync } from 'child_process';
import { copyFileSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Production Build...');

try {
  // 1. Clean and build
  console.log('📦 Building React app...');
  execSync('pnpm build', { stdio: 'inherit', cwd: __dirname });

  // 2. Ensure server dist directory exists
  const serverDistDir = join(__dirname, 'server', 'dist');
  if (!existsSync(serverDistDir)) {
    mkdirSync(serverDistDir, { recursive: true });
  }

  // 3. Copy dist to server
  console.log('📁 Copying build files...');
  execSync(`xcopy /E /I /Y dist server\\dist`, { stdio: 'inherit', cwd: __dirname });

  // 4. Verify critical files exist
  const indexPath = join(serverDistDir, 'index.html');
  const assetsDir = join(serverDistDir, 'assets');
  
  if (!existsSync(indexPath)) {
    throw new Error('index.html not found in server/dist');
  }
  
  if (!existsSync(assetsDir)) {
    throw new Error('assets directory not found in server/dist');
  }

  // 5. Read and validate index.html
  const indexContent = readFileSync(indexPath, 'utf8');
  console.log('📄 Validating index.html...');
  
  // Check for asset references
  const jsMatch = indexContent.match(/src="\/app\/assets\/(index-[^"]+\.js)"/);
  const cssMatch = indexContent.match(/href="\/app\/assets\/(index-[^"]+\.css)"/);
  
  if (!jsMatch || !cssMatch) {
    console.warn('⚠️ Warning: Asset references not found in expected format');
  } else {
    const jsFile = join(assetsDir, jsMatch[1]);
    const cssFile = join(assetsDir, cssMatch[1]);
    
    if (!existsSync(jsFile)) {
      throw new Error(`JavaScript file not found: ${jsMatch[1]}`);
    }
    
    if (!existsSync(cssFile)) {
      throw new Error(`CSS file not found: ${cssMatch[1]}`);
    }
    
    console.log(`✅ Verified assets: ${jsMatch[1]}, ${cssMatch[1]}`);
  }

  console.log('✅ Production build completed successfully!');
  console.log('🔗 To start server: cd server && node index.js');
  console.log('🌐 App will be available at: http://localhost:1737/app');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
