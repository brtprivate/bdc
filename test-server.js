import http from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVER_URL = 'http://localhost:1737';

async function testEndpoint(path, expectedContentType) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${SERVER_URL}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'],
          data: data.substring(0, 200) + (data.length > 200 ? '...' : ''),
          headers: res.headers
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Timeout')));
  });
}

async function runTests() {
  console.log('🧪 Testing BDC Stack Server...\n');

  const tests = [
    { path: '/health', expectedType: 'application/json', name: 'Health Check' },
    { path: '/app', expectedType: 'text/html', name: 'React App Root' },
    { path: '/app/', expectedType: 'text/html', name: 'React App Root (trailing slash)' },
    { path: '/', expectedType: 'text/html', name: 'BDC Stack Root' }
  ];

  // Test if server is running
  try {
    await testEndpoint('/health', 'application/json');
    console.log('✅ Server is running');
  } catch (error) {
    console.error('❌ Server is not running or not accessible');
    console.error('   Make sure to start the server first: cd server && node index.js');
    return;
  }

  // Run tests
  for (const test of tests) {
    try {
      const result = await testEndpoint(test.path, test.expectedType);
      
      if (result.status === 200) {
        console.log(`✅ ${test.name}: ${result.status} - ${result.contentType}`);
      } else {
        console.log(`⚠️ ${test.name}: ${result.status} - ${result.contentType}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }

  // Test asset loading
  console.log('\n📦 Testing Asset Loading...');
  
  try {
    const indexPath = join(__dirname, 'server', 'dist', 'index.html');
    const indexContent = readFileSync(indexPath, 'utf8');
    
    const jsMatch = indexContent.match(/src="\/app\/assets\/(index-[^"]+\.js)"/);
    const cssMatch = indexContent.match(/href="\/app\/assets\/(index-[^"]+\.css)"/);
    
    if (jsMatch) {
      try {
        const jsResult = await testEndpoint(`/app/assets/${jsMatch[1]}`, 'application/javascript');
        console.log(`✅ JavaScript Asset: ${jsResult.status} - ${jsResult.contentType}`);
      } catch (error) {
        console.log(`❌ JavaScript Asset: ${error.message}`);
      }
    }
    
    if (cssMatch) {
      try {
        const cssResult = await testEndpoint(`/app/assets/${cssMatch[1]}`, 'text/css');
        console.log(`✅ CSS Asset: ${cssResult.status} - ${cssResult.contentType}`);
      } catch (error) {
        console.log(`❌ CSS Asset: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Asset test failed: ${error.message}`);
  }

  console.log('\n🎯 Test Summary:');
  console.log('   If all tests pass, the server should work correctly in production');
  console.log('   If assets fail, check MIME types and file paths');
}
