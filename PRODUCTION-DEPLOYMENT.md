# BDC MLM Production Deployment Guide

## 🚀 Production URLs

- **Frontend**: https://bdcstack.com/
- **Backend API**: https://app.bdcstack.com/

## 📋 Environment Configuration

### Production Environment Variables

The application is now configured to use production URLs by default. Environment variables are set in:

- `.env` - Default production configuration
- `.env.production` - Production-specific settings
- `.env.development` - Development-specific settings

### Key Environment Variables

```bash
# Production Configuration
VITE_API_BASE_URL=https://app.bdcstack.com/api
VITE_APP_ENV=production
VITE_APP_NAME=BDC MLM
VITE_FRONTEND_URL=https://bdcstack.com
VITE_DEBUG=false
VITE_LOG_LEVEL=error
```

## 🔧 Build Commands

### Development Build
```bash
npm run dev              # Start development server
npm run build:dev        # Build for development
```

### Production Build
```bash
npm run build            # Build for production
npm run preview          # Preview production build
npm run start:prod       # Build and preview
```

### Quick Deployment
```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

## 🌐 CORS Configuration

The backend server is configured to accept requests from:

- `https://bdcstack.com`
- `https://www.bdcstack.com`
- `https://app.bdcstack.com`
- Development localhost URLs (when in development mode)

## 📊 API Endpoints

All API endpoints are now configured to work with production URLs:

- **Health Check**: `https://app.bdcstack.com/health`
- **User Tree**: `https://app.bdcstack.com/api/referrals/tree-direct/{address}`
- **User Stats**: `https://app.bdcstack.com/api/referrals/stats-direct/{address}`
- **Investments**: `https://app.bdcstack.com/api/investments?userAddress={address}`

## 🔍 Configuration Validation

The application includes automatic configuration validation:

- Validates API URLs in production
- Checks for HTTPS usage in production
- Warns about localhost usage in production
- Logs configuration status in development mode

## 📁 Deployment Steps

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your web server

3. **Configure your web server** to serve the files from the `dist` folder

4. **Ensure your backend** is running at `https://app.bdcstack.com/`

5. **Test all functionality** with the production URLs

## 🧪 Testing Production Configuration

1. **Local Testing**:
   ```bash
   npm run build
   npm run preview
   ```

2. **Verify API Calls**: Check browser network tab to ensure all API calls go to `https://app.bdcstack.com/`

3. **Test MyTeam Modal**: Verify that the "View Details" functionality works with production APIs

## 🔒 Security Considerations

- All production URLs use HTTPS
- CORS is properly configured for production domains
- Debug logging is disabled in production
- Environment variables are validated

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**:
   - Verify backend is running at `https://app.bdcstack.com/`
   - Check CORS configuration
   - Ensure SSL certificates are valid

2. **Build Errors**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check environment variables are properly set

3. **Modal Not Loading Data**:
   - Check browser console for API errors
   - Verify wallet connection
   - Ensure user exists in the system

### Debug Mode

To enable debug logging in production, set:
```bash
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

## 📞 Support

For deployment issues, check:
1. Browser console for errors
2. Network tab for failed API calls
3. Configuration validation logs
4. Backend server logs at `https://app.bdcstack.com/`
