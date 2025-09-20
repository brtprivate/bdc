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
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;

      // Only log in development
      if (IS_DEVELOPMENT) {
        console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`❌ API Error: ${response.status}`, data);
        return {
          success: false,
          error: data.error || data.message || 'API request failed',
        };
      }

      console.log(`✅ API Success: ${endpoint}`, data);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`❌ API Network Error: ${endpoint}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
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

  // Get user referral tree (all 21 levels) - Using optimized ultra-fast endpoint
  async getUserReferralTree(userAddress: string, levels: number = 21): Promise<ApiResponse<any>> {
    try {
      console.log(`🌳 Fetching referral tree for user: ${userAddress} (${levels} levels)`);

      // Try ultra-optimized endpoint first for better performance
      const response = await this.makeRequest(`/referrals/tree-ultra-optimized/${userAddress}?levels=${levels}&limit=500`);

      if (response.success) {
        console.log(`✅ Referral tree fetched successfully via ultra-optimized endpoint`);
        return response;
      }

      // Fallback to direct endpoint if ultra-optimized fails
      console.log(`⚠️ Ultra-optimized endpoint failed, falling back to direct endpoint`);
      const fallbackResponse = await this.makeRequest(`/referrals/tree-direct/${userAddress}?levels=${levels}`);
      console.log(`✅ Referral tree fetched successfully via fallback endpoint`);
      return fallbackResponse;

    } catch (error) {
      console.error(`❌ Failed to fetch referral tree:`, error);
      throw error;
    }
  }

  // Get user referral statistics - Using optimized direct User model with caching
  async getUserReferralStats(userAddress: string): Promise<ApiResponse<any>> {
    try {
      console.log(`📈 Fetching referral stats for user: ${userAddress}`);
      const response = await this.makeRequest(`/referrals/stats-direct/${userAddress}`);
      console.log(`✅ Referral stats fetched successfully`);
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch referral stats:`, error);
      throw error;
    }
  }

  // Get users in a specific level with optimized performance (kept for future use)
  async getLevelUsers(level: number, referrerAddress: string): Promise<ApiResponse<any>> {
    try {
      console.log(`👥 Fetching level ${level} users for referrer: ${referrerAddress}`);
      const response = await this.makeRequest(`/levels/${level}/users/${referrerAddress}`);
      console.log(`✅ Level users fetched successfully`);
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch level users:`, error);
      throw error;
    }
  }

  // Get comprehensive user analytics with caching (optimized for MyTeam page)
  async getUserTeamAnalytics(userAddress: string): Promise<ApiResponse<any>> {
    try {
      console.log(`📊 Fetching comprehensive team analytics for user: ${userAddress}`);
      const response = await this.makeRequest(`/levels/user/${userAddress}?details=true&limit=100`);
      console.log(`✅ Team analytics fetched successfully`);
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch team analytics:`, error);
      throw error;
    }
  }

  // Get quick team summary for faster initial load
  async getQuickTeamSummary(userAddress: string): Promise<ApiResponse<any>> {
    try {
      console.log(`⚡ Fetching quick team summary for user: ${userAddress}`);
      const response = await this.makeRequest(`/levels/user/${userAddress}/summary`);
      console.log(`✅ Quick team summary fetched successfully`);
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch quick team summary:`, error);
      throw error;
    }
  }

  // Batch fetch multiple API calls for better performance
  async batchFetchTeamData(userAddress: string): Promise<{
    tree: ApiResponse<any>;
    stats: ApiResponse<any>;
    summary: ApiResponse<any>;
  }> {
    try {
      console.log(`🚀 Batch fetching team data for user: ${userAddress}`);

      const [treeResponse, statsResponse, summaryResponse] = await Promise.allSettled([
        this.getUserReferralTree(userAddress, 21),
        this.getUserReferralStats(userAddress),
        this.getQuickTeamSummary(userAddress)
      ]);

      return {
        tree: treeResponse.status === 'fulfilled' ? treeResponse.value : { success: false, error: 'Tree fetch failed' },
        stats: statsResponse.status === 'fulfilled' ? statsResponse.value : { success: false, error: 'Stats fetch failed' },
        summary: summaryResponse.status === 'fulfilled' ? summaryResponse.value : { success: false, error: 'Summary fetch failed' }
      };
    } catch (error) {
      console.error(`❌ Failed to batch fetch team data:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

// Export types for use in components
export type { UserRegistrationData, InvestmentData, ApiResponse };
