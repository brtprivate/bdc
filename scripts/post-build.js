#!/usr/bin/env node

/**
 * Post-Build Script for BDC Stack
 * Automatically fixes index.html after build for mobile wallet compatibility
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '..', 'dist');
const INDEX_HTML_PATH = join(DIST_DIR, 'index.html');

// Mobile-friendly CSP for wallet connections
const MOBILE_FRIENDLY_CSP = `default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; frame-src *; connect-src *; img-src *; media-src *; object-src 'none'; base-uri 'self';`;

console.log('🔧 Running post-build script for mobile wallet compatibility...');

function updateIndexHtml() {
  if (!existsSync(INDEX_HTML_PATH)) {
    console.error('❌ index.html not found in dist folder');
    process.exit(1);
  }

  try {
    // Read the built index.html
    let htmlContent = readFileSync(INDEX_HTML_PATH, 'utf8');
    console.log('📄 Reading index.html from dist folder...');

    // Check if CSP meta tag exists
    const cspRegex = /<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*>/i;
    const cspMatch = htmlContent.match(cspRegex);

    if (cspMatch) {
      console.log('🔍 Found existing CSP meta tag, updating...');
      
      // Replace existing CSP with mobile-friendly version
      const newCSPTag = `<meta http-equiv="Content-Security-Policy" content="${MOBILE_FRIENDLY_CSP}" />`;
      htmlContent = htmlContent.replace(cspRegex, newCSPTag);
      
      console.log('✅ CSP updated to mobile-friendly version');
    } else {
      console.log('🔍 No CSP meta tag found, adding mobile-friendly CSP...');
      
      // Add mobile-friendly CSP after viewport meta tag
      const viewportRegex = /(<meta\s+name=["']viewport["'][^>]*>)/i;
      const newCSPTag = `$1\n    <!-- Mobile-friendly CSP for wallet connections -->\n    <meta http-equiv="Content-Security-Policy" content="${MOBILE_FRIENDLY_CSP}" />`;
      
      if (htmlContent.match(viewportRegex)) {
        htmlContent = htmlContent.replace(viewportRegex, newCSPTag);
        console.log('✅ Mobile-friendly CSP added after viewport meta tag');
      } else {
        // Fallback: add after <head> tag
        htmlContent = htmlContent.replace(
          /<head>/i,
          `<head>\n    <!-- Mobile-friendly CSP for wallet connections -->\n    <meta http-equiv="Content-Security-Policy" content="${MOBILE_FRIENDLY_CSP}" />`
        );
        console.log('✅ Mobile-friendly CSP added after <head> tag');
      }
    }

    // Ensure mobile meta tags are present
    if (!htmlContent.includes('mobile-web-app-capable')) {
      console.log('📱 Adding mobile-web-app-capable meta tag...');
      const mobileCapableTag = `    <meta name="mobile-web-app-capable" content="yes" />`;
      htmlContent = htmlContent.replace(
        /(<meta\s+name=["']viewport["'][^>]*>)/i,
        `$1\n${mobileCapableTag}`
      );
    }

    if (!htmlContent.includes('apple-mobile-web-app-capable')) {
      console.log('🍎 Adding apple-mobile-web-app-capable meta tag...');
      const appleCapableTag = `    <meta name="apple-mobile-web-app-capable" content="yes" />`;
      htmlContent = htmlContent.replace(
        /(<meta\s+name=["']mobile-web-app-capable["'][^>]*>)/i,
        `$1\n${appleCapableTag}`
      );
    }

    if (!htmlContent.includes('apple-mobile-web-app-status-bar-style')) {
      console.log('📱 Adding apple-mobile-web-app-status-bar-style meta tag...');
      const statusBarTag = `    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />`;
      htmlContent = htmlContent.replace(
        /(<meta\s+name=["']apple-mobile-web-app-capable["'][^>]*>)/i,
        `$1\n${statusBarTag}`
      );
    }

    // Write the updated content back
    writeFileSync(INDEX_HTML_PATH, htmlContent, 'utf8');
    console.log('💾 Updated index.html saved successfully');

    // Verify the changes
    const updatedContent = readFileSync(INDEX_HTML_PATH, 'utf8');
    if (updatedContent.includes(MOBILE_FRIENDLY_CSP)) {
      console.log('✅ Verification passed: Mobile-friendly CSP is present');
    } else {
      console.error('❌ Verification failed: CSP not found in updated file');
      process.exit(1);
    }

    console.log('🎉 Post-build script completed successfully!');
    console.log('📱 Mobile wallet connections should now work properly');

  } catch (error) {
    console.error('❌ Error updating index.html:', error.message);
    process.exit(1);
  }
}

function copyToServer() {
  const serverDistPath = join(__dirname, '..', 'server', 'dist');
  
  if (existsSync(serverDistPath)) {
    console.log('📁 Copying updated dist to server...');
    
    try {
      // Copy the updated index.html to server
      const serverIndexPath = join(serverDistPath, 'index.html');
      const distIndexContent = readFileSync(INDEX_HTML_PATH, 'utf8');
      writeFileSync(serverIndexPath, distIndexContent, 'utf8');
      
      console.log('✅ Updated index.html copied to server/dist');
    } catch (error) {
      console.warn('⚠️ Could not copy to server/dist:', error.message);
    }
  }
}

// Main execution
function main() {
  console.log('🚀 Starting BDC Stack post-build optimization...');
  
  updateIndexHtml();
  copyToServer();
  
  console.log('\n🎯 Summary:');
  console.log('   ✅ Mobile-friendly CSP applied');
  console.log('   ✅ Mobile meta tags ensured');
  console.log('   ✅ Wallet connections optimized');
  console.log('   ✅ Ready for mobile deployment');
  console.log('\n🔗 Test URLs:');
  console.log('   📱 Mobile App: http://localhost:1737/app');
  console.log('   🧪 Test Page: http://localhost:1737/app/mobile-wallet-test.html');
}

// Run the script
main();
