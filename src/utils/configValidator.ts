// Configuration Validator for Production Deployment

interface ConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  environment: 'development' | 'production';
  apiUrl: string;
  frontendUrl: string;
}

export function validateConfiguration(): ConfigValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Get environment variables
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
  const environment = import.meta.env.VITE_APP_ENV || 'production';
  const isDev = import.meta.env.DEV;
  
  // Validate API URL
  if (!apiUrl) {
    errors.push('VITE_API_BASE_URL is not defined');
  } else {
    if (environment === 'production' && apiUrl.includes('localhost')) {
      errors.push('Production environment should not use localhost API URL');
    }
    if (!apiUrl.startsWith('http')) {
      errors.push('API URL must start with http:// or https://');
    }
  }
  
  // Validate Frontend URL
  if (!frontendUrl) {
    warnings.push('VITE_FRONTEND_URL is not defined');
  } else {
    if (environment === 'production' && frontendUrl.includes('localhost')) {
      warnings.push('Production environment should not use localhost frontend URL');
    }
  }
  
  // Environment-specific validations
  if (environment === 'production') {
    if (apiUrl && !apiUrl.startsWith('https://')) {
      warnings.push('Production API should use HTTPS');
    }
    if (frontendUrl && !frontendUrl.startsWith('https://')) {
      warnings.push('Production frontend should use HTTPS');
    }
  }
  
  // Check for development environment consistency
  if (isDev && environment !== 'development') {
    warnings.push('Vite dev mode detected but VITE_APP_ENV is not set to development');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    environment: environment as 'development' | 'production',
    apiUrl: apiUrl || 'undefined',
    frontendUrl: frontendUrl || 'undefined'
  };
}

export function logConfigurationStatus(): void {
  const config = validateConfiguration();
  
  console.log('\n🔧 Configuration Status:');
  console.log('========================');
  console.log(`Environment: ${config.environment}`);
  console.log(`API URL: ${config.apiUrl}`);
  console.log(`Frontend URL: ${config.frontendUrl}`);
  console.log(`Valid: ${config.isValid ? '✅' : '❌'}`);
  
  if (config.errors.length > 0) {
    console.log('\n❌ Errors:');
    config.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (config.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    config.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  console.log('========================\n');
}
