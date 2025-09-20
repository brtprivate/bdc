# Staking Orders Section - Real-time Reward Calculations

## Overview

The Staking Orders section displays user staking orders with real-time reward calculations. Each staking order shows live reward accrual based on a 0.5% daily return rate, updating every second to provide users with accurate, up-to-the-moment reward information.

## Features

### 🔄 Real-time Reward Calculations
- **0.5% Daily Rewards**: Users earn 0.5% daily rewards on their staked amount
- **Continuous Accrual**: Rewards accumulate per second to reach full 0.5% by midnight
- **Live Updates**: Display updates every second to show growing rewards
- **Past vs Current**: Separate display for completed days vs current day progress

### 📊 Data Structure

Each staking order contains the following fields:

```javascript
{
  amount: uint256,              // e.g., 50000000000000000000 = 50 tokens
  releaseStackBonus: uint256,   // e.g., 0
  deposit_time: uint256,        // e.g., 1758007078 - Unix timestamp
  reward_time: uint256,         // e.g., 1758007078 - Unix timestamp
  isactive: bool,               // e.g., true
  isUsdt: bool                  // e.g., true
}
```

### 🎯 Calculation Logic

#### Example: 100 tokens staked 10 days ago
1. **Past 9 complete days**: 9 × 0.5% = 4.5 tokens
2. **Current day progress**: Calculate seconds elapsed today × (0.5% ÷ 86400 seconds)
3. **Total display**: Original amount (100) + Past rewards (4.5) + Today's accrued rewards

#### Formula
```javascript
// Complete days reward
pastRewards = completeDays × (stakedAmount × 0.005)

// Current day reward
todayRewards = (secondsToday / 86400) × (stakedAmount × 0.005)

// Total rewards
totalRewards = pastRewards + todayRewards
```

## Components

### 1. StakingOrdersSection
Main container component that displays all staking orders with summary statistics.

**Props:**
- `orders`: Array of staking order objects
- `isLoading`: Boolean indicating loading state
- `onRefresh`: Function to refresh data
- `notRegistered`: Boolean indicating if user is registered

**Features:**
- Summary cards showing total staked, total rewards, total value, and active orders
- Grid layout of individual staking order cards
- Real-time updates every 10 seconds for summary data
- Responsive design for mobile and desktop

### 2. StakingOrderCard
Individual card component for each staking order.

**Props:**
- `order`: Single staking order object
- `index`: Order index for display

**Features:**
- Real-time reward calculation updating every second
- Visual progress bar for current day's reward progress
- Status indicators (Active/Inactive, USDT/BDC)
- Detailed breakdown of past rewards vs current day rewards
- Hover effects and smooth animations

### 3. Utility Functions (rewardCalculations.js)

#### `calculateRewards(stakedAmount, depositTimestamp, currentTimestamp)`
Calculates real-time rewards for a single staking order.

**Returns:**
```javascript
{
  pastRewards: number,        // Rewards from complete days
  todayRewards: number,       // Rewards accrued today
  totalRewards: number,       // Total accumulated rewards
  dayProgress: number,        // Percentage of current day completed
  daysStaked: number,         // Number of complete days staked
  dailyRewardRate: number,    // 0.005 (0.5%)
  expectedDailyReward: number // Expected reward per day
}
```

#### `calculateSummaryRewards(orders, currentTimestamp)`
Calculates summary statistics for multiple orders.

#### `formatCurrency(amount, currency, maxDecimals)`
Formats currency amounts for display.

#### `formatDate(date)`
Formats dates for display.

## Integration

### Adding to MLM Dashboard

The staking orders section is integrated into the MLM Dashboard:

```jsx
import StakingOrdersSection from '../components/StakingOrdersSection';

// In your component
<StakingOrdersSection 
  orders={orders}
  isLoading={isLoading}
  onRefresh={fetchMlmData}
  notRegistered={notRegistered}
/>
```

### Contract Service Updates

Updated the contract service to match the correct field names:

```typescript
interface OrderInfo {
  amount: bigint;
  releaseStackBonus: bigint;  // Updated from holdingbonus
  deposit_time: bigint;
  reward_time: bigint;
  isactive: boolean;
  isUsdt: boolean;           // Updated from isdai
}
```

## Visual Design

### Color Scheme
- **Primary Blue**: #1976d2 (headers, main elements)
- **Success Green**: #4caf50 (rewards, positive values)
- **Warning Orange**: #ed6c02 (progress, current day)
- **Background Gradients**: Subtle blue-to-white gradients

### Animations
- **Hover Effects**: Cards lift slightly on hover
- **Progress Bars**: Smooth animated progress indicators
- **Real-time Updates**: Smooth value transitions

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Grid Layout**: Responsive grid that adapts to screen size
- **Touch Friendly**: Large touch targets and spacing

## Performance Considerations

### Update Intervals
- **Individual Cards**: Update every 1 second for real-time feel
- **Summary Data**: Update every 10 seconds to reduce computation
- **Cleanup**: Proper interval cleanup on component unmount

### Optimization
- **Memoization**: Consider using React.memo for card components
- **Batch Updates**: Summary calculations batch multiple orders
- **Error Handling**: Graceful handling of invalid data

## Testing

### Test Functions
The utility includes test functions to verify calculations:

```javascript
import { testRewardCalculations } from '../utils/rewardCalculations';

// Run tests
const testResults = testRewardCalculations();
console.log(testResults);
```

### Demo Component
Use `StakingOrdersDemo.jsx` to test the component with sample data:

```jsx
import StakingOrdersDemo from '../components/StakingOrdersDemo';

// Renders demo with sample orders
<StakingOrdersDemo />
```

## Future Enhancements

### Potential Features
1. **Compound Interest**: Option for compound reward calculations
2. **Historical Charts**: Graphs showing reward accumulation over time
3. **Notifications**: Alerts for milestone rewards
4. **Export Data**: CSV/PDF export of staking history
5. **Reward Predictions**: Projections of future rewards

### Performance Improvements
1. **Virtual Scrolling**: For users with many orders
2. **Web Workers**: Move calculations to background threads
3. **Caching**: Cache calculation results for better performance

## Troubleshooting

### Common Issues

1. **Rewards not updating**: Check if `isactive` is true and timestamps are valid
2. **Incorrect calculations**: Verify deposit_time is in Unix seconds, not milliseconds
3. **Performance issues**: Reduce update frequency or implement virtualization

### Debug Tools

```javascript
// Enable debug logging
localStorage.setItem('debug-staking', 'true');

// Test specific calculation
import { calculateRewards } from '../utils/rewardCalculations';
const result = calculateRewards(100, Date.now()/1000 - 86400);
console.log(result);
```

## Dependencies

- **React**: ^18.0.0
- **Material-UI**: ^5.0.0
- **Viem**: For blockchain data formatting
- **Lucide React**: For icons

## License

This component is part of the BDC MLM application and follows the same licensing terms.
