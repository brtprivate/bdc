/**
 * Utility functions for calculating staking rewards
 * 
 * Reward Logic:
 * - Users earn 0.5% daily rewards on their staked amount
 * - Rewards accumulate continuously (per second) to reach the full 0.5% by midnight each day
 * - Past complete days earn full 0.5% each
 * - Current day earns proportional rewards based on time elapsed
 */

/**
 * Calculate real-time rewards for a staking order
 * @param {number} stakedAmount - The original staked amount in tokens
 * @param {number} depositTimestamp - Unix timestamp when the stake was made
 * @param {number} currentTimestamp - Current Unix timestamp (optional, defaults to now)
 * @returns {Object} Reward calculation details
 */
export const calculateRewards = (stakedAmount, depositTimestamp, currentTimestamp = null) => {
  if (!stakedAmount || !depositTimestamp || stakedAmount <= 0 || depositTimestamp <= 0) {
    return {
      pastRewards: 0,
      todayRewards: 0,
      totalRewards: 0,
      dayProgress: 0,
      daysStaked: 0,
      dailyRewardRate: 0.005, // 0.5%
      expectedDailyReward: 0
    };
  }

  const now = currentTimestamp || Math.floor(Date.now() / 1000);
  const SECONDS_PER_DAY = 86400;
  const DAILY_REWARD_RATE = 0.005; // 0.5%

  // Calculate total seconds staked
  const totalSecondsStaked = now - depositTimestamp;
  
  // Handle edge case where current time is before deposit time
  if (totalSecondsStaked < 0) {
    return {
      pastRewards: 0,
      todayRewards: 0,
      totalRewards: 0,
      dayProgress: 0,
      daysStaked: 0,
      dailyRewardRate: DAILY_REWARD_RATE,
      expectedDailyReward: stakedAmount * DAILY_REWARD_RATE
    };
  }

  // Calculate complete days (86400 seconds = 1 day)
  const completeDays = Math.floor(totalSecondsStaked / SECONDS_PER_DAY);
  
  // Calculate rewards for complete days (0.5% per day)
  const pastRewards = completeDays * (stakedAmount * DAILY_REWARD_RATE);
  
  // Calculate today's progress
  const secondsToday = totalSecondsStaked % SECONDS_PER_DAY;
  const dayProgress = (secondsToday / SECONDS_PER_DAY) * 100;
  
  // Calculate today's accrued rewards (0.5% distributed over 86400 seconds)
  const todayRewards = (secondsToday / SECONDS_PER_DAY) * (stakedAmount * DAILY_REWARD_RATE);
  
  // Total rewards
  const totalRewards = pastRewards + todayRewards;

  return {
    pastRewards,
    todayRewards,
    totalRewards,
    dayProgress,
    daysStaked: completeDays,
    dailyRewardRate: DAILY_REWARD_RATE,
    expectedDailyReward: stakedAmount * DAILY_REWARD_RATE
  };
};

/**
 * Calculate summary data for multiple staking orders
 * @param {Array} orders - Array of staking orders
 * @param {number} currentTimestamp - Current Unix timestamp (optional)
 * @returns {Object} Summary calculation details
 */
export const calculateSummaryRewards = (orders, currentTimestamp = null) => {
  if (!orders || orders.length === 0) {
    return {
      totalStaked: 0,
      totalRewards: 0,
      totalValue: 0,
      activeOrders: 0,
      averageDailyReturn: 0,
      expectedDailyReward: 0
    };
  }

  const now = currentTimestamp || Math.floor(Date.now() / 1000);
  let totalStaked = 0;
  let totalRewards = 0;
  let activeCount = 0;

  orders.forEach(order => {
    if (!order.isactive) return;

    const stakedAmount = parseFloat(order.amount);
    const depositTime = Number(order.deposit_time);
    
    if (depositTime === 0 || stakedAmount === 0) return;

    totalStaked += stakedAmount;
    activeCount++;

    const rewardData = calculateRewards(stakedAmount, depositTime, now);
    totalRewards += rewardData.totalRewards;
  });

  const totalValue = totalStaked + totalRewards;
  const expectedDailyReward = totalStaked * 0.005; // 0.5% of total staked

  return {
    totalStaked,
    totalRewards,
    totalValue,
    activeOrders: activeCount,
    averageDailyReturn: expectedDailyReward,
    expectedDailyReward
  };
};

/**
 * Format currency amount for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @param {number} maxDecimals - Maximum decimal places (default: 6)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount = 0, currency = 'USD', maxDecimals = 6) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDecimals,
  }).format(amount);
};

/**
 * Format date for display
 * @param {number|Date} date - Date to format (Unix timestamp or Date object)
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const dateObj = typeof date === 'number' ? new Date(date * 1000) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Test function to verify reward calculations
 * @returns {Object} Test results
 */
export const testRewardCalculations = () => {
  const now = Math.floor(Date.now() / 1000);
  const oneDayAgo = now - 86400; // 1 day ago
  const tenDaysAgo = now - (86400 * 10); // 10 days ago
  const halfDayAgo = now - (86400 * 0.5); // 12 hours ago

  const tests = [
    {
      name: "100 tokens staked 1 day ago",
      stakedAmount: 100,
      depositTime: oneDayAgo,
      expected: {
        daysStaked: 1,
        pastRewards: 0.5, // 1 day * 0.5%
        totalRewards: 0.5
      }
    },
    {
      name: "100 tokens staked 10 days ago",
      stakedAmount: 100,
      depositTime: tenDaysAgo,
      expected: {
        daysStaked: 10,
        pastRewards: 5.0, // 10 days * 0.5%
        totalRewards: 5.0
      }
    },
    {
      name: "100 tokens staked 12 hours ago",
      stakedAmount: 100,
      depositTime: halfDayAgo,
      expected: {
        daysStaked: 0,
        pastRewards: 0,
        dayProgress: 50 // 50% of the day
      }
    }
  ];

  const results = tests.map(test => {
    const result = calculateRewards(test.stakedAmount, test.depositTime, now);
    return {
      ...test,
      result,
      passed: result.daysStaked === test.expected.daysStaked
    };
  });

  return results;
};

export default {
  calculateRewards,
  calculateSummaryRewards,
  formatCurrency,
  formatDate,
  testRewardCalculations
};
