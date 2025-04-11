import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Define the chart types we'll support
export type OptionStrategyType = 
  | 'long-call' 
  | 'long-put' 
  | 'long-straddle' 
  | 'bull-call-spread'
  | 'bear-put-spread'
  | 'short-call'
  | 'short-put'
  | 'short-straddle'
  | 'long-strangle'
  // Add structured product strategies
  | 'dual_currency'
  | 'principal_protected'
  | 'covered_call'
  | 'cash_secured_put'
  | 'iron_condor';

interface OptionPayoffChartProps {
  strategyType: OptionStrategyType;
  strikePrice?: number; // For single strike (K), or K1/Lower short strike for spreads
  strikePrice2?: number; // K2 for Iron Condor / Upper short strike for Bull Call
  strikePrice3?: number; // K3 for Iron Condor
  strikePrice4?: number; // K4 for Iron Condor
  premium?: number;
  width?: number | string;
  height?: number | string;
  className?: string;
}

const OptionPayoffChart: React.FC<OptionPayoffChartProps> = ({
  strategyType,
  strikePrice = 100,
  strikePrice2,
  strikePrice3,
  strikePrice4,
  premium = 10,
  width = '100%',
  height = 300,
  className = '',
}) => {
  // Use primary strike or default
  const K1 = strikePrice || 100; // Treat main strike as K1 or the lower strike
  const premiumVal = premium || 10;

  // Generate price points relative to the primary strike price
  const generatePricePoints = () => {
    const minPrice = K1 * 0.5;
    const maxPrice = K1 * 1.5;
    const step = (maxPrice - minPrice) / 20;
    
    return Array.from({ length: 21 }, (_, i) => minPrice + i * step);
  };

  const prices = generatePricePoints();

  // Calculate payoff values based on strategy type
  const calculatePayoff = (prices: number[]) => {
    switch (strategyType) {
      case 'long-call':
        return prices.map(price => Math.max(-premiumVal, price - K1 - premiumVal));
        
      case 'long-put':
        return prices.map(price => Math.max(-premiumVal, K1 - price - premiumVal));
        
      case 'long-straddle':
        return prices.map(price => 
          Math.max(-2 * premiumVal, Math.abs(price - K1) - 2 * premiumVal)
        );
        
      case 'bull-call-spread': {
        // Use K1 as lower strike, K2 (strikePrice2) as upper strike or derive if not provided
        const K2 = strikePrice2 || K1 * 1.2; 
        return prices.map(price => {
          if (price <= K1) return -premiumVal;
          if (price >= K2) return K2 - K1 - premiumVal;
          return price - K1 - premiumVal;
        });
      }
        
      case 'bear-put-spread': {
        // Use K1 as upper strike, K2 (strikePrice2) as lower strike or derive if not provided
        const K2 = strikePrice2 || K1 * 0.8; // Note: K2 is lower strike here
        return prices.map(price => {
          if (price >= K1) return -premiumVal;
          if (price <= K2) return K1 - K2 - premiumVal; 
          return K1 - price - premiumVal;
        });
      }
      
      case 'short-call':
        return prices.map(price => Math.min(premiumVal, premiumVal - (price - K1)));
        
      case 'short-put':
        return prices.map(price => Math.min(premiumVal, premiumVal - (K1 - price)));
        
      case 'short-straddle':
        return prices.map(price => 
          Math.min(2 * premiumVal, 2 * premiumVal - Math.abs(price - K1))
        );
        
      case 'long-strangle': {
        // Assumes K1 is center, derives put/call strikes. Could use K2/K3 if provided.
        const putStrike = strikePrice2 || K1 * 0.9; // Use K2 if provided
        const callStrike = strikePrice3 || K1 * 1.1; // Use K3 if provided
        return prices.map(price => {
          if (price <= putStrike) {
            return putStrike - price - premiumVal;
          } else if (price >= callStrike) {
            return price - callStrike - premiumVal;
          } else {
            return -premiumVal;
          }
        });
      }
      
      // Structured product payoffs
      case 'dual_currency': {
        // Deposit amount D = strikePrice, Yield Y = premium/strikePrice
        const depositAmount = K1;
        const yield_ = premiumVal / K1; // as a fraction
        const valueWithYield = depositAmount * (1 + yield_);
        
        return prices.map(price => {
          if (price < K1) {
            // Return in deposit currency (fixed value)
            return valueWithYield - depositAmount;  // Show profit over initial deposit
          } else {
            // Convert to alternate at strike price
            return valueWithYield - depositAmount;  // Same value but different currency
          }
        });
      }
      
      case 'principal_protected': {
        // Principal P0 = strikePrice, participation rate R = 0.5
        const principal = K1;
        const participationRate = 0.5;
        const initialPrice = K1 * 0.8; // S0 is below strike for visualization
        
        return prices.map(price => {
          // Guaranteed principal plus participation in upside
          const performance = Math.max(0, (price - initialPrice) / initialPrice);
          return principal * participationRate * performance; // Show only profit part
        });
      }
      
      case 'covered_call': {
        // Holding underlying plus selling a call
        return prices.map(price => {
          if (price <= K1) {
            // Keep underlying + premium
            return premiumVal + (price - K1); // Price change from strike + premium
          } else {
            // Underlying called away at strike + premium
            return premiumVal; // Fixed profit
          }
        });
      }
      
      case 'cash_secured_put': {
        // Cash deposit (stablecoin) plus selling a put
        return prices.map(price => {
          if (price >= K1) {
            // Keep cash + premium
            return premiumVal;
          } else {
            // Buy underlying at strike + keep premium
            return premiumVal + (price - K1); // Premium + any loss from buying above market
          }
        });
      }
      
      case 'iron_condor': {
        // Use provided strikes K1(strikePrice), K2, K3, K4 or defaults
        const k1_ = K1; // Already defined as strikePrice or default 100
        const k2_ = strikePrice2 || k1_ * 1.1; // Default K2 if not passed
        const k3_ = strikePrice3 || k1_ * 1.2; // Default K3 if not passed
        const k4_ = strikePrice4 || k1_ * 1.3; // Default K4 if not passed
        const maxProfit = premiumVal;
        
        return prices.map(price => {
          if (price >= k2_ && price <= k3_) {
            // Price within short strikes range - max profit
            return maxProfit;
          } else if (price < k2_ && price >= k1_) {
            // Lower spread partial profit/loss zone
            // Profit increases linearly from K1 to K2
            const profit = (price - k1_) / (k2_ - k1_) * maxProfit;
            return profit;
          } else if (price > k3_ && price <= k4_) {
            // Upper spread partial profit/loss zone
            // Profit decreases linearly from K3 to K4
            const profit = (k4_ - price) / (k4_ - k3_) * maxProfit;
            return profit;
          } else {
            // Max loss (outside K1 and K4)
            return 0; // Simplified max loss = 0, assumes premium covers spread width
          }
        });
      }
      
      default:
        return prices.map(() => 0);
    }
  };

  // Get chart title based on strategy
  const getChartTitle = () => {
    const titles: Record<OptionStrategyType, string> = {
      'long-call': 'Long Call Payoff',
      'long-put': 'Long Put Payoff',
      'long-straddle': 'Long Straddle Payoff',
      'bull-call-spread': 'Bull Call Spread Payoff',
      'bear-put-spread': 'Bear Put Spread Payoff',
      'short-call': 'Short Call Payoff',
      'short-put': 'Short Put Payoff',
      'short-straddle': 'Short Straddle Payoff',
      'long-strangle': 'Long Strangle Payoff',
      // Add titles for structured products
      'dual_currency': 'Dual Currency Deposit Payoff',
      'principal_protected': 'Principal Protected Note Payoff',
      'covered_call': 'Covered Call Payoff',
      'cash_secured_put': 'Cash-Secured Put Payoff',
      'iron_condor': 'Iron Condor Payoff',
    };
    
    return titles[strategyType] || 'Option Payoff';
  };

  const payoffs = calculatePayoff(prices);
  const titleText = getChartTitle();

  const chartData = {
    labels: prices.map(p => p.toFixed(0)),
    datasets: [
      {
        label: 'Profit/Loss',
        data: payoffs,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 5,
        fill: true,
        segment: {
          borderColor: (ctx: any) => {
            const y0 = ctx.p0.parsed.y;
            const y1 = ctx.p1.parsed.y;
            return (y0 < 0 || y1 < 0) ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)';
          },
          backgroundColor: (ctx: any) => {
            const y0 = ctx.p0.parsed.y;
            const y1 = ctx.p1.parsed.y;
            return (y0 < 0 || y1 < 0) ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)';
          },
        }
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: titleText,
        color: '#9ca3af',
        font: {
          size: 16,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          },
          title: function(context: any) {
            return `Asset Price: ${context[0].label}`;
          }
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Asset Price at Expiry',
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(209, 213, 219, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Profit / Loss',
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(209, 213, 219, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          callback: function(value: any) {
            return '$' + value;
          }
        },
        afterBuildTicks: (axis: any) => {
          if (!axis.ticks.some((tick: any) => tick.value === 0)) {
            axis.ticks.push({ value: 0 });
          }
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      }
    }
  };

  return (
    <div style={{ width: width, height: height }} className={className}>
      <Line options={chartOptions} data={chartData} />
    </div>
  );
};

export default OptionPayoffChart; 