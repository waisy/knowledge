# Perpetual Swaps (Perps)

## Overview

Perpetual Swaps, often called "perps," are a type of derivative contract unique to the cryptocurrency markets. Unlike traditional futures contracts, they do not have an expiry date. This allows traders to hold positions indefinitely, similar to holding the underlying asset in the spot market, but often with leverage.

The key challenge with perpetual contracts is ensuring their price closely tracks the underlying asset's spot price without a settlement date to enforce convergence. This is primarily achieved through the **Funding Rate mechanism**.

**Key Characteristics:**
*   **No Expiry Date:** Positions can be held indefinitely.
*   **Price Tracking:** Uses a Funding Rate mechanism to anchor the perp price to the underlying index price.
*   **Leverage:** Typically allows for significant leverage, amplifying potential profits and losses.
*   **Mark Price:** Used for calculating Unrealized PnL and triggering liquidations, based on the underlying index price plus a decaying funding basis.
*   **Index Price:** Represents the 'true' market price of the underlying asset, usually calculated as a volume-weighted average price (VWAP) from multiple major spot exchanges. See [Core Trading Mechanics > Index Price](../concepts/trading_mechanics.md#index-price-construction) for details on construction.

## Mark Price Calculation

The Mark Price is crucial for perpetual swaps as it determines when liquidations occur and calculates unrealized Profit and Loss (PnL). Using the last traded price for these calculations could make positions vulnerable to manipulation or unnecessary liquidations during brief, volatile price wicks. Therefore, the Mark Price is designed to be a more stable and representative price, based on the Index Price.

The most common formula for the Mark Price in perpetuals is:

$$
Mark Price = Index Price \cdot (1 + Funding Basis)
$$

Where:
*   **Index Price:** The aggregate spot price of the underlying asset. (See [Core Trading Mechanics > Index Price](../concepts/trading_mechanics.md#index-price-construction)).
*   **Funding Basis:** Represents the premium (or discount) of the perpetual contract relative to the index price, adjusted by the time until the next funding payment. It is calculated based on the current funding rate and the time remaining.

$$
Funding Basis = Funding Rate_{current} \cdot \left( \frac{Time Until Next Funding}{Funding Interval} \right)
$$

**Important Variations & Considerations:**

*   **Impact Price Inclusion:** Some exchanges incorporate "Impact Prices" (average execution price for a notional trade size) into the Mark Price calculation or Funding Rate calculation to further mitigate manipulation.
*   **Frequency:** Mark Price is typically updated very frequently (e.g., every second or even more often).

**Example Calculation:**
*   Assume BTC Index Price = \$60,000
*   Current Funding Rate = +0.01% (paid every 8 hours)
*   Time Until Next Funding = 2 hours
*   Funding Interval = 8 hours

$$
Funding Basis = 0.0001 \cdot \left( \frac{2}{8} \right) = 0.000025
$$
$$
Mark Price = \$60,000 \cdot (1 + 0.000025) = \$60,001.50
$$

This calculation ensures the Mark Price smoothly converges towards the Index Price as the funding time approaches, reducing the incentive for manipulation near the funding timestamp.

## Funding Rate Mechanism

The Funding Rate is the core mechanism specific to Perpetual Swaps that keeps the contract price tethered to the underlying Index Price. Since there's no expiry date forcing convergence, the funding rate incentivizes the contract price to stay close to the index through payments between long and short traders.

**How it works:**
Periodically (e.g., every 8 hours, 4 hours, or even 1 hour depending on the exchange), a payment is exchanged directly between traders holding long positions and traders holding short positions. 
*   **If the Funding Rate is positive:** The perpetual contract is trading at a premium to the Index Price. Longs pay shorts.
*   **If the Funding Rate is negative:** The perpetual contract is trading at a discount to the Index Price. Shorts pay longs.

The payment amount for a position is:
$$
Funding Payment = Position Value \cdot Funding Rate
$$
Where Position Value is typically calculated using the Mark Price at the time of the funding timestamp.

**Calculation of the Funding Rate:**
The funding rate generally consists of two components:
1.  **Interest Rate Component (I):** Accounts for the difference in borrowing costs between the base and quote currencies.
2.  **Premium/Discount Component (P):** Measures the spread between the perpetual contract's price and the underlying Index Price.

A widely used formula structure is:

$$
Funding Rate (F) = Premium Index (P) + \mathrm{clamp}(Interest Rate Component (I) - Premium Index (P), Clamp Floor, Clamp Ceiling)
$$

Let's break down the components in more detail:

<details class="my-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
<summary class="list-item px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer font-semibold text-gray-800 dark:text-gray-200">
Mathematical Details: Funding Rate Calculation
</summary>
<div class="p-4 border-t border-gray-200 dark:border-gray-700">

*   **Interest Rate Component (I):**
    *   This aims to reflect the difference in nominal interest rates for holding the base currency vs. the quote currency.
    *   Often fixed by the exchange per market (e.g., 0.01% per interval for BTC/USD pairs, assuming USD interest slightly higher than BTC interest/lending rates).
    *   Formulaically: $I = (Quote Index Rate - Base Index Rate) / \text{Number of Funding Intervals per Day}$
    *   Example: If USD rate is 5% annually, BTC rate is 1% annually, and funding is every 8 hours (3 intervals/day):
        $I = (0.05 - 0.01) / 3 = 0.04 / 3 \approx 0.0133\%$ per 8-hour interval. *Note: Exchanges often simplify this to fixed values like 0.01%*.

*   **Premium Index (P):**
    *   This measures how far the perpetual's price is trading from the Index Price. To resist manipulation, it often uses the *Impact Mid Price* rather than the last traded price.
    *   `Premium = Impact Mid Price - Index Price`
    *   The Premium Index is frequently calculated as a time-weighted average of the premium over the current funding interval.
        $$
        P = \mathrm{TWAP} \left( \frac{\text{Impact Mid Price} - \text{Index Price}}{\text{Index Price}} \right) + \text{Current Funding Basis}
        $$
        *(Some exchanges add the current funding basis back here to measure the premium relative to the *current* mark price trajectory).*
    *   Alternatively, a simpler average premium calculation might be used:
        $$
        P = \mathrm{Average} \left( \frac{\mathrm{Max}(0, \text{Impact Bid Price} - \text{Index Price}) - \mathrm{Max}(0, \text{Index Price} - \text{Impact Ask Price})}{\text{Index Price}} \right)
        $$
        *(This averages the depth-weighted premium/discount over measurement periods within the funding interval).*

*   **Clamp Function:**
    *   The `clamp(value, floor, ceiling)` function restricts the Interest Rate - Premium Index difference within defined bounds.
    *   These bounds (Clamp Floor, Clamp Ceiling) are often defined relative to the Maintenance Margin or a fixed percentage (e.g., +/- 0.05%).
    *   Example: `Clamp Ceiling = +0.05%`, `Clamp Floor = -0.05%`.
    *   Purpose: Prevents extreme funding rates during periods of high volatility or temporary price dislocations.

</div>
</details>

**Funding Payment Calculation:**

$$
Funding Payment = Position Notional Value \cdot Funding Rate
$$

*   **Position Notional Value:** Typically $ Position Size \cdot Mark Price $ at the funding timestamp.
*   **Timing:** Payments are exchanged *at* the funding timestamp (e.g., 00:00, 08:00, 16:00 UTC). If you close your position even one second before, you don't pay/receive funding for that interval.

**Impact:**
The funding rate mechanism creates arbitrage opportunities that pull the perpetual price back towards the index. If the perp trades too high (positive funding), traders are incentivized to short the perp and buy spot (collecting funding), pushing the perp price down. If it trades too low (negative funding), traders are incentivized to long the perp and short spot (collecting funding), pushing the perp price up.

## Margin & Liquidation

Trading perpetual swaps involves leverage and therefore requires margin (collateral) management and understanding the liquidation process.

*   **Margin Requirements:** Positions need Initial Margin (IM) to open and Maintenance Margin (MM) to stay open. Exchanges often use tiered margin systems where larger positions require higher MM rates.
*   **Liquidation Trigger:** Liquidation occurs if a position's equity falls below the Maintenance Margin level, based on the Mark Price.
*   **Process:** The exchange's liquidation engine takes over the position, attempts to close it, and uses the Insurance Fund or ADL if the trader's margin is insufficient.

For a detailed explanation of margin concepts, tiered margin, the liquidation process, the Insurance Fund, and Auto-Deleveraging (ADL), please refer to the [Core Trading Mechanics](../concepts/trading_mechanics.md) document:
*   [Margin & Leverage](../concepts/trading_mechanics.md#margin-leverage)
*   [Liquidation Mechanism](../concepts/trading_mechanics.md#liquidation-mechanism)
*   [Insurance Fund](../concepts/trading_mechanics.md#insurance-fund)
*   [Auto-Deleveraging (ADL)](../concepts/trading_mechanics.md#auto-deleveraging-adl)

**Liquidation Price Calculation (Perpetuals - Isolated Margin):**

While the general mechanism is shared, the specific calculation for the Mark Price at which liquidation occurs ($LP$) depends on the product. For perpetual swaps using isolated margin (ignoring fees for simplicity): 

<details class="my-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
<summary class="list-item px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer font-semibold text-gray-800 dark:text-gray-200">
Mathematical Details: Liquidation Price Formulas (Isolated Margin)
</summary>
<div class="p-4 border-t border-gray-200 dark:border-gray-700">

Let:
*   $E$ = Entry Price
*   $S$ = Position Size (Positive for Long, Negative for Short)
*   $IM$ = Initial Margin Amount (Collateral deposited for this position)
*   $MMR$ = Maintenance Margin Rate for the position's tier (as a decimal, e.g., 0.005 for 0.5%)
*   $LP$ = Liquidation Price (Mark Price at trigger)

Liquidation occurs when $IM + \text{Unrealized PnL} = \text{Maintenance Margin Required}$.
$IM + S \cdot (LP - E)$  *(for Longs)*  $= |S| \cdot LP \cdot MMR$
$IM + S \cdot (E - LP)$  *(for Shorts)* $= |S| \cdot LP \cdot MMR$

Solving for $LP$:

*   **For Longs ($S > 0$):**
    $$
    LP_{Long} = \frac{S \cdot E - IM}{S \cdot (1 - MMR)}
    $$
    *(Note: Ensure $S$ is positive here)*

*   **For Shorts ($S < 0$, let $S = -|S|$):**
    $$
    LP_{Short} = \frac{|S| \cdot E + IM}{|S| \cdot (1 + MMR)}
    $$
    *(Correction: The formula for shorts is slightly different when derived carefully. Use the version provided by the specific exchange, as variations exist.)* 
    *An alternative and often more reliable way to think about it for shorts is:* 
    $IM - |S| \cdot (LP - E) = |S| \cdot LP \cdot MMR$
    $IM + |S| \cdot E = |S| \cdot LP \cdot MMR + |S| \cdot LP$
    $IM + |S| \cdot E = |S| \cdot LP \cdot (MMR + 1)$
    $$ LP_{Short} = \frac{IM + |S| \cdot E}{|S| \cdot (1 + MMR)} $$
    *(Note: Ensure $S = |S| > 0$ here)*

*   **Cross Margin:** Calculations are more complex as they involve the total account balance and margin requirements across all positions.
*   **Fees & Funding:** Real-world liquidation prices are also affected by accrued funding payments/receipts and potential liquidation fees, which slightly adjust the equity available.

</div>
</details>

**Calculating Liquidation Price (Simplified Example - Isolated Margin Long):**
Let's assume:
*   Entry Price = \$60,000
*   Position Size = 1 BTC
*   Leverage = 10x
*   Initial Margin = Position Value / Leverage = (\$60,000 \cdot 1) / 10 = \$6,000
*   Maintenance Margin Rate = 0.5%
*   Maintenance Margin Required (at Entry) = Position Value \cdot MM Rate = (\$60,000 \cdot 1) \cdot 0.005 = \$300

The position can sustain a loss equal to the Initial Margin minus the Maintenance Margin Required *at the Liquidation Price*. Using the formula:
$$LP_{Long} = \frac{(1 \cdot 60000) - 6000}{1 \cdot (1 - 0.005)} = \frac{54000}{0.995} \approx \$54,271.36$$

*(This precise calculation using the formula is more accurate than the simple loss tolerance subtraction used previously, as MM Required changes with price.)*

## Compared to Traditional Futures

Perpetual swaps are similar to traditional futures in that they both involve trading a derivative contract on an underlying asset. However, there are key differences unique to Perps:

1. **No Expiry Date:** Positions can be held indefinitely.
2. **Funding Rate Mechanism:** Uses the periodic funding rate to keep the price close to the index, unlike fixed-term futures which converge naturally at expiry.

(Differences related to liquidation mechanisms and leverage are less about the product type and more about the exchange implementation, which are covered in Core Trading Mechanics).

*(End of Perpetual Swaps Section)* 