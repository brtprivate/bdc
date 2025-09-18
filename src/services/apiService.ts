// API Service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://app.bdcstack.com/api';
const IS_DEVELOPMENT = import.meta.env.VITE_APP_ENV === 'development' || import.meta.env.DEV;

// Log the API URL being used (only in development)
if (IS_DEVELOPMENT) {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🌍 Environment:', import.meta.env.VITE_APP_ENV || 'production');
}

interface UserRegistrationData {
  walletAddress: string;
  referrerAddress?: string;
}

interface InvestmentData {
  userAddress: string;
  amount: number;
  txHash: string;
  blockNumber: number;
  type: 'USDT' | 'BDC';
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly CACHE_TTL = 60000; // 1 minute cache

  private getCacheKey(endpoint: string, options: RequestInit = {}): string {
    return `${endpoint}_${JSON.stringify(options)}`;
  }

  private isValidCache(cacheEntry: { timestamp: number; ttl: number }): boolean {
    return Date.now() - cacheEntry.timestamp < cacheEntry.ttl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheTTL: number = this.CACHE_TTL
  ): Promise<ApiResponse<T>> {
    try {
      // Check cache for GET requests
      if (!options.method || options.method === 'GET') {
        const cacheKey = this.getCacheKey(endpoint, options);
        const cached = this.cache.get(cacheKey);

        if (cached && this.isValidCache(cached)) {
          if (IS_DEVELOPMENT) {
            console.log(`🎯 Cache Hit: ${endpoint}`);
          }
          return {
            success: true,
            data: cached.data,
          };
        }
      }

      const url = `${API_BASE_URL}${endpoint}`;

      // Only log in development
      if (IS_DEVELOPMENT) {
        console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      }

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.DEFAULT_TIMEOUT);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        console.error(`❌ API Error: ${response.status}`, data);
        return {
          success: false,
          error: data.error || data.message || 'API request failed',
        };
      }

      // Cache successful GET requests
      if (!options.method || options.method === 'GET') {
        const cacheKey = this.getCacheKey(endpoint, options);
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: cacheTTL
        });
      }

      if (IS_DEVELOPMENT) {
        console.log(`✅ API Success: ${endpoint}`);
      }
      return {
        success: true,
        data,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`⏰ API Timeout: ${endpoint}`);
        return {
          success: false,
          error: 'Request timeout - please try again',
        };
      }
      console.error(`❌ API Network Error: ${endpoint}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Clear cache method
  clearCache(): void {
    this.cache.clear();
  }

  // Clear specific cache entry
  clearCacheEntry(endpoint: string, options: RequestInit = {}): void {
    const cacheKey = this.getCacheKey(endpoint, options);
    this.cache.delete(cacheKey);
  }

  // User Registration
  async registerUser(userData: UserRegistrationData): Promise<ApiResponse<any>> {
    console.log('📝 Registering user in database:', userData);
    
    return this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Get User Data
  async getUser(walletAddress: string): Promise<ApiResponse<any>> {
    console.log('👤 Fetching user data:', walletAddress);
    
    return this.makeRequest(`/users/${walletAddress}`);
  }

  // Record Investment
  async recordInvestment(investmentData: InvestmentData): Promise<ApiResponse<any>> {
    console.log('💰 Recording investment in database:', investmentData);
    
    // Note: Investment recording is typically handled by the event listener
    // But we can also provide a manual endpoint if needed
    return this.makeRequest('/investments', {
      method: 'POST',
      body: JSON.stringify(investmentData),
    });
  }

  // Get User Investments
  async getUserInvestments(walletAddress: string): Promise<ApiResponse<any>> {
    console.log('📊 Fetching user investments:', walletAddress);

    return this.makeRequest(`/investments?userAddress=${walletAddress}`);
  }

  // Get User Summary
  async getUserSummary(walletAddress: string): Promise<ApiResponse<any>> {
    console.log('📈 Fetching user summary:', walletAddress);
    
    return this.makeRequest(`/users/${walletAddress}/summary`);
  }

  // Get User Referrals
  async getUserReferrals(walletAddress: string): Promise<ApiResponse<any>> {
    console.log('👥 Fetching user referrals:', walletAddress);
    
    return this.makeRequest(`/users/${walletAddress}/referrals`);
  }

  // Get Level Analytics
  async getUserLevelAnalytics(walletAddress: string): Promise<ApiResponse<any>> {
    console.log('🏆 Fetching user level analytics:', walletAddress);
    
    return this.makeRequest(`/levels/user/${walletAddress}?details=true&limit=10`);
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.makeRequest('/health');
  }

  // Test API Connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.healthCheck();
      return response.success;
    } catch (error) {
      console.error('❌ API Connection Test Failed:', error);
      return false;
    }
  }

  // Get user referral tree (all 21 levels) - Using direct User model with caching
  async getUserReferralTree(userAddress: string, levels: number = 21): Promise<ApiResponse<any>> {
    try {
      console.log(`🌳 Fetching referral tree for user: ${userAddress} (${levels} levels)`);
      // Use longer cache for tree data (5 minutes) since it doesn't change frequently
      const response = await this.makeRequest(`/referrals/tree-direct/${userAddress}?levels=${levels}`, {}, 300000);
      console.log(`✅ Referral tree fetched successfully`);
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch referral tree:`, error);
      throw error;
    }
  }

  // Get user referral statistics - Using direct User model with caching
  async getUserReferralStats(userAddress: string): Promise<ApiResponse<any>> {
    try {
      console.log(`📈 Fetching referral stats for user: ${userAddress}`);
      // Use longer cache for stats (5 minutes)
      const response = await this.makeRequest(`/referrals/stats-direct/${userAddress}`, {}, 300000);
      console.log(`✅ Referral stats fetched successfully`);
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch referral stats:`, error);
      throw error;
    }
  }

  // Get optimized referral tree with pagination
  async getUserReferralTreeOptimized(userAddress: string, levels: number = 21, limit: number = 50): Promise<ApiResponse<any>> {
    try {
      console.log(`🚀 Fetching optimized referral tree for user: ${userAddress} (${levels} levels, limit: ${limit})`);
      // Try ultra-optimized endpoint first, fallback to regular optimized
      try {
        const response = await this.makeRequest(`/referrals/tree-ultra-optimized/${userAddress}?levels=${levels}&limit=${limit}`, {}, 300000);
        console.log(`✅ Ultra-optimized referral tree fetched successfully`);
        return response;
      } catch (ultraError) {
        console.warn(`⚠️ Ultra-optimized endpoint failed, falling back to regular optimized:`, ultraError);
        const response = await this.makeRequest(`/referrals/tree-optimized/${userAddress}?levels=${levels}&limit=${limit}`, {}, 300000);
        console.log(`✅ Optimized referral tree fetched successfully`);
        return response;
      }
    } catch (error) {
      console.error(`❌ Failed to fetch optimized referral tree:`, error);
      throw error;
    }
  }

  // Get users in a specific level
  async getLevelUsers(level: number, referrerAddress: string): Promise<ApiResponse<any>> {
    try {
      console.log(`👥 Fetching level ${level} users for referrer: ${referrerAddress}`);
      // Try new optimized endpoint first
      try {
        const response = await this.makeRequest(`/referrals/level/${referrerAddress}/${level}`);
        console.log(`✅ Level users fetched successfully (optimized)`);
        return response;
      } catch (optimizedError) {
        // Fallback to old endpoint
        console.warn('Optimized endpoint failed, using fallback:', optimizedError);
        const response = await this.makeRequest(`/levels/${level}/users/${referrerAddress}`);
        console.log(`✅ Level users fetched successfully (fallback)`);
        return response;
      }
    } catch (error) {
      console.error(`❌ Failed to fetch level users:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

// Export types for use in components
export type { UserRegistrationData, InvestmentData, ApiResponse };
