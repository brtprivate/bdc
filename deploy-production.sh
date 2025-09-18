#!/bin/bash

# BDC MLM Production Deployment Script

echo "🚀 Starting BDC MLM Production Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the bdc directory."
    exit 1
fi

# Set production environment
export NODE_ENV=production

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building for production..."
npm run build

echo "🧪 Running production preview..."
echo "Preview will be available at: http://localhost:4173"
echo "Production API URL: https://app.bdcstack.com/api"
echo "Production Frontend URL: https://bdcstack.com"

npm run preview

echo "✅ Production build completed!"
echo ""
echo "📋 Next steps:"
echo "1. Upload the 'dist' folder to your web server"
echo "2. Configure your web server to serve the files"
echo "3. Ensure your backend is running at https://app.bdcstack.com/"
echo "4. Test all functionality with production URLs"
