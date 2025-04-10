# Perpetual Swaps (Perps)

## Overview

Perpetual Swaps, often called "perps," are a type of derivative contract unique to the cryptocurrency markets. Unlike traditional futures contracts, they do not have an expiry date. This allows traders to hold positions indefinitely, similar to holding the underlying asset in the spot market, but often with leverage.

The key challenge with perpetual contracts is ensuring their price closely tracks the underlying asset's spot price without a settlement date to enforce convergence. This is primarily achieved through the **Funding Rate mechanism**.

**Key Characteristics:**
*   **No Expiry Date:** Positions can be held indefinitely.
*   **Price Tracking:** Uses a Funding Rate mechanism to anchor the perp price to the underlying index price.
*   **Leverage:** Typically allows for significant leverage, amplifying potential profits and losses.
*   **Mark Price:** Used for calculating Unrealized PnL and triggering liquidations, based on the underlying index price plus a decaying funding basis.
*   **Index Price:** Represents the 'true' market price of the underlying asset, usually calculated as a volume-weighted average price (VWAP) from multiple major spot exchanges.

## Mark Price Calculation

The Mark Price is crucial for perpetual swaps as it determines when liquidations occur and calculates unrealized Profit and Loss (PnL). Using the last traded price for these calculations could make positions vulnerable to manipulation or unnecessary liquidations during brief, volatile price wicks. Therefore, the Mark Price is designed to be a more stable and representative price.

The most common formula for the Mark Price is:

\[ \text{Mark Price} = \text{Index Price} \times (1 + \text{Funding Basis}) \]

Where:
*   **Index Price:** As defined above, the aggregate spot price of the underlying asset. (See Index Price Construction section for details).
*   **Funding Basis:** Represents the premium (or discount) of the perpetual contract relative to the index price, adjusted by the time until the next funding payment. It is calculated based on the current funding rate and the time remaining.

\[ \text{Funding Basis} = \text{Funding Rate}_{current} \times \left( \frac{\text{Time Until Next Funding}}{\text{Funding Interval}} \right) \]

**Important Variations & Considerations:**

*   **Impact Price Inclusion:** Some exchanges incorporate "Impact Prices" directly into the Mark Price calculation to further mitigate manipulation. This involves calculating the average execution price for a hypothetical trade of a certain size (Impact Margin Notional) on the order book.
    *   `Impact Bid Price`: Average price to fill a market buy of size X.
    *   `Impact Ask Price`: Average price to fill a market sell of size X.
    *   `Impact Mid Price = (Impact Bid + Impact Ask) / 2`
    *   The Mark Price might then use a blend of the Index Price and the Impact Mid Price, or use the Impact Mid Price within the funding rate calculation itself (see next section). A potential formula could look like:
        \[ \text{Mark Price} = \text{Median}(\text{Index Price}, \text{Impact Bid Price}, \text{Impact Ask Price}) \]
        *(This median approach adds robustness against one source deviating significantly).*
*   **Time Decay Function:** The linear decay `(Time Until Funding / Funding Interval)` is common, but non-linear decay functions could theoretically be used.
*   **Frequency:** Mark Price is typically updated very frequently (e.g., every second or even more often).

**Example Calculation:**
*   Assume BTC Index Price = $60,000
*   Current Funding Rate = +0.01% (paid every 8 hours)
*   Time Until Next Funding = 2 hours
*   Funding Interval = 8 hours

\[ \text{Funding Basis} = 0.0001 \times \left( \frac{2}{8} \right) = 0.000025 \]
\[ \text{Mark Price} = \$60,000 \times (1 + 0.000025) = \$60,001.50 \]

This calculation ensures the Mark Price smoothly converges towards the Index Price as the funding time approaches, reducing the incentive for manipulation near the funding timestamp.

## Funding Rate Mechanism

The Funding Rate is the core mechanism that keeps the price of a perpetual swap tethered to the price of the underlying asset (Index Price). Since there's no expiry date forcing convergence, the funding rate incentivizes the contract price to stay close to the index.

**How it works:**
Periodically (e.g., every 8 hours, 4 hours, or even 1 hour depending on the exchange), a payment is exchanged directly between traders holding long positions and traders holding short positions. 
*   **If the Funding Rate is positive:** The perpetual contract is trading at a premium to the Index Price. Longs pay shorts.
*   **If the Funding Rate is negative:** The perpetual contract is trading at a discount to the Index Price. Shorts pay longs.

The payment amount for a position is:
\[ \text{Funding Payment} = \text{Position Value} \times \text{Funding Rate} \]
Where Position Value is typically calculated using the Mark Price at the time of the funding timestamp.

**Calculation of the Funding Rate:**
The funding rate generally consists of two components:
1.  **Interest Rate Component (I):** Accounts for the difference in borrowing costs between the base and quote currencies.
2.  **Premium/Discount Component (P):** Measures the spread between the perpetual contract's price and the underlying Index Price.

A widely used formula structure is:

\[ \text{Funding Rate} (F) = \text{Premium Index} (P) + \text{clamp}(\text{Interest Rate Component} (I) - \text{Premium Index} (P), \text{Clamp Floor}, \text{Clamp Ceiling}) \]

Let's break down the components in more detail:

*   **Interest Rate Component (I):**
    *   This aims to reflect the difference in nominal interest rates for holding the base currency vs. the quote currency.
    *   Often fixed by the exchange per market (e.g., 0.01% per interval for BTC/USD pairs, assuming USD interest slightly higher than BTC interest/lending rates).
    *   Formulaically: `I = (Quote Index Rate - Base Index Rate) / Number of Funding Intervals per Day`
    *   Example: If USD rate is 5% annually, BTC rate is 1% annually, and funding is every 8 hours (3 intervals/day):
        `I = (0.05 - 0.01) / 3 = 0.04 / 3 ≈ 0.0133%` per 8-hour interval. *Note: Exchanges often simplify this to fixed values like 0.01%*.

*   **Premium Index (P):**
    *   This measures how far the perpetual's price is trading from the Index Price. To resist manipulation, it often uses the *Impact Mid Price* rather than the last traded price.
    *   `Premium = Impact Mid Price - Index Price`
    *   The Premium Index is frequently calculated as a time-weighted average of the premium over the current funding interval.
        \[ P = \text{TWAP} \left( \frac{\text{Impact Mid Price} - \text{Index Price}}{\text{Index Price}} \right) + \text{Current Funding Basis} \]
        *(Some exchanges add the current funding basis back here to measure the premium relative to the *current* mark price trajectory).*
    *   Alternatively, a simpler average premium calculation might be used:
        \[ P = \text{Average} \left( \frac{\text{Max(0, Impact Bid Price - Index Price)} - \text{Max(0, Index Price - Impact Ask Price)}}{\text{Index Price}} \right) \]
        *(This averages the depth-weighted premium/discount over measurement periods within the funding interval).*

*   **Clamp Function:**
    *   The `clamp(value, floor, ceiling)` function restricts the `Interest Rate - Premium Index` difference within defined bounds.
    *   These bounds (`Clamp Floor`, `Clamp Ceiling`) are often defined relative to the Maintenance Margin or a fixed percentage (e.g., +/- 0.05%).
    *   Example: `Clamp Ceiling = +0.05%`, `Clamp Floor = -0.05%`.
    *   Purpose: Prevents extreme funding rates during periods of high volatility or temporary price dislocations. Ensures the funding rate doesn't deviate *too* drastically from the interest rate component purely due to short-term premium fluctuations.

**Funding Payment Calculation:**

\[ \text{Funding Payment} = \text{Position Notional Value} \times \text{Funding Rate} \]

*   **Position Notional Value:** Typically `Position Size × Mark Price` at the funding timestamp.
*   **Timing:** Payments are exchanged *at* the funding timestamp (e.g., 00:00, 08:00, 16:00 UTC). If you close your position even one second before, you don't pay/receive funding for that interval.

**Impact:**
The funding rate mechanism creates arbitrage opportunities that pull the perpetual price back towards the index. If the perp trades too high (positive funding), traders are incentivized to short the perp and buy spot (collecting funding), pushing the perp price down. If it trades too low (negative funding), traders are incentivized to long the perp and short spot (collecting funding), pushing the perp price up.

## Index Price Construction

The Index Price is designed to represent the fair market value of the underlying asset in the spot market. It serves as the anchor for both the Mark Price calculation and the Funding Rate mechanism. Accuracy and resistance to manipulation are paramount.

**Key Principles:**
*   **Aggregation:** Uses price data from multiple (usually 3+) major, liquid spot exchanges.
*   **Weighting:** Often uses volume weighting or equal weighting to combine prices from constituent exchanges. Volume weighting gives more influence to exchanges with higher trading activity, potentially reflecting price discovery better.
*   **Outlier Protection:** Employs mechanisms to prevent manipulation or errors from a single exchange unduly influencing the index. Common methods include:
    *   **Medianization:** Taking the median price from the constituent exchanges after potentially discarding the highest and lowest.
    *   **Deviation Checks:** Temporarily removing an exchange's price feed if it deviates beyond a certain percentage threshold (e.g., +/- 3%) from the median of the others.
    *   **Staleness Checks:** Ignoring an exchange's feed if its data hasn't updated recently or if the exchange is in maintenance.

**Mathematical Deep Dive (Example: Median with Deviation Check):**

1.  **Collect Prices:** Get `(Price_i, Volume_i)` from N constituent exchanges (e.g., N=5).
2.  **Calculate Median Price:** `Median_Price = Median(Price_1, Price_2, ..., Price_N)`.
3.  **Deviation Check:** For each exchange `i`:
    *   `Deviation_i = |Price_i - Median_Price| / Median_Price`
    *   If `Deviation_i > Threshold` (e.g., 3%), *temporarily* discard `Price_i` from the set. Let the remaining number of valid exchanges be `N_valid`.
4.  **Final Index Calculation (if using remaining prices for VWAP):**
    *   If `N_valid >= Minimum Sources` (e.g., 3):
        *   `Valid Prices = {Price_j | Deviation_j <= Threshold}`
        *   `Valid Volumes = {Volume_j | Price_j is in Valid Prices}`
        *   `Index Price = Sum(Price_j * Volume_j) / Sum(Volume_j)` for all `j` where `Price_j` is valid.
    *   Else (too few valid sources): Trigger error handling (e.g., use last valid Index Price, pause market, use median of remaining sources).
5.  **Alternative Final Step (Median of Valid Prices):** Some indices might simply take the median of the valid prices after the deviation check, ignoring volume weighting at this final stage.

**Example (Simplified BTC/USD Index):**
Assume the Index uses data from Coinbase, Binance, and Kraken.
1.  **Get Last Traded Price (LTP) and Volume (24h) from each:**
    *   Coinbase: LTP = $60,100, Volume = 20,000 BTC
    *   Binance: LTP = $60,150, Volume = 30,000 BTC
    *   Kraken: LTP = $60,050, Volume = 15,000 BTC
2.  **Apply Checks:** (Assume all pass deviation/staleness checks for this example).
3.  **Calculate Volume-Weighted Average Price (VWAP):**
    \[ \text{Total Volume} = 20000 + 30000 + 15000 = 65000 \text{ BTC} \]
    \[ \text{Weighted Sum} = (60100 \times 20000) + (60150 \times 30000) + (60050 \times 15000) \]
    \[ \text{Weighted Sum} = 1,202,000,000,000 + 1,804,500,000,000 + 900,750,000,000 = 3,907,250,000,000 \]
    \[ \text{Index Price} = \frac{\text{Weighted Sum}}{\text{Total Volume}} = \frac{3,907,250,000,000}{65000} \approx \$60,111.54 \]

**Considerations:**
*   The exact list of constituent exchanges and weighting methodology is specific to each derivatives exchange providing the perpetual contract.
*   Transparency regarding index constituents and calculation methodology is crucial for traders.
*   Robustness against API failures or anomalous data from a single source is a key design goal.

## Liquidation Mechanism

Liquidation is the process of automatically closing a trader's leveraged position to prevent their losses from exceeding their deposited collateral (Margin). This is necessary because perpetual swaps are traded on margin, allowing traders to control large positions with relatively small capital.

**Key Concepts:**
*   **Margin:** The collateral deposited by a trader to open and maintain a leveraged position. There are two main types:
    *   **Initial Margin (IM):** The minimum amount of collateral required to open a position. Usually a percentage of the position's notional value (e.g., 1% for 100x leverage).
    *   **Maintenance Margin (MM):** The minimum amount of collateral required to keep a position open. If the position's equity falls below the Maintenance Margin level, the liquidation process begins. MM is always lower than IM (e.g., 0.5% for 100x leverage).
*   **Margin Ratio:** Often expressed as `Maintenance Margin / Position Value` or calculated based on assets and liabilities in the margin account.
*   **Liquidation Price:** The price (calculated using the Mark Price) at which a position's margin level drops below the Maintenance Margin requirement, triggering liquidation.
*   **Liquidation Engine:** The automated system run by the exchange that monitors positions and executes liquidations when necessary.

**Tiered Margin & Liquidation:**

Exchanges often use a **tiered margin system**. This means larger position sizes require proportionally higher Maintenance Margin percentages.

*   **Rationale:** Larger positions have a greater market impact when liquidated, potentially causing more slippage. Higher MM for large positions provides a larger buffer for the liquidation engine and reduces the risk to the Insurance Fund/ADL system.
*   **Example Tiers (Illustrative):**
    | Position Notional (BTC) | Max Leverage | Initial Margin % | Maintenance Margin % |
    | :---------------------- | :----------- | :--------------- | :------------------- |
    | 0 - 50                  | 100x         | 1.0%             | 0.5%                 |
    | 50 - 250                | 50x          | 2.0%             | 1.0%                 |
    | 250 - 1000              | 20x          | 5.0%             | 2.5%                 |
    | > 1000                  | 10x          | 10.0%            | 5.0%                 |

*   **Calculating MM for a Large Position:** If a position spans multiple tiers, the MM requirement is often calculated incrementally based on the portion of the position in each tier.

**Liquidation Price Calculation (More Precise - Isolated Margin):**

The liquidation process starts when `Account Equity <= Maintenance Margin`. For isolated margin, `Account Equity = Initial Margin + Unrealized PnL`.

Let:
*   `E` = Entry Price
*   `S` = Position Size (Positive for Long, Negative for Short)
*   `IM` = Initial Margin Amount (Collateral)
*   `MMR` = Maintenance Margin Rate (as a decimal, e.g., 0.005 for 0.5%)
*   `LP` = Liquidation Price
*   `Fees` = Estimated Liquidation Fees (can be complex, sometimes ignored in basic calcs)

The Mark Price at which liquidation occurs (`LP`) is when:
`IM + Unrealized PnL = Maintenance Margin Required`
`IM + S * (LP - E)`  *(for Longs)*  `= |S| * LP * MMR + Fees`
`IM + S * (E - LP)`  *(for Shorts)* `= |S| * LP * MMR + Fees`

Solving for `LP` (ignoring fees for simplicity):

*   **For Longs (S > 0):**
    `IM + S*LP - S*E = S*LP*MMR`
    `IM - S*E = S*LP*MMR - S*LP`
    `IM - S*E = S*LP*(MMR - 1)`
    \[ LP_{Long} = \frac{IM - S \times E}{S \times (MMR - 1)} = \frac{S \times E - IM}{S \times (1 - MMR)} \] *(Note: Ensure S is positive here)*

*   **For Shorts (S < 0, let S = -|S|):**
    `IM - |S|*E + |S|*LP = |S|*LP*MMR`
    `IM - |S|*E = |S|*LP*MMR - |S|*LP`
    `IM - |S|*E = |S|*LP*(MMR - 1)`
    \[ LP_{Short} = \frac{IM - |S| \times E}{|S| \times (MMR - 1)} = \frac{|S| \times E - IM}{|S| \times (1 - MMR)} \] *(Note: Ensure S = |S| > 0 here)*

*   **Alternative Cross Margin Calculation:** In cross-margin, `IM` becomes the total account balance available as margin, and PnL from other positions also contributes. The calculation involves the total account maintenance requirement.

**The Process:**
1.  **Monitoring:** The exchange continuously monitors the Mark Price and compares it against each open position's Maintenance Margin level.
2.  **Trigger:** If `Position Margin < Maintenance Margin`, the position is flagged for liquidation.
3.  **Execution:** The Liquidation Engine takes over the position.
    *   It attempts to close the position in the market at the best possible price.
    *   Exchanges typically use a tiered liquidation process. They first try to close the position via limit orders slightly better than the bankruptcy price (the price at which margin = 0) to minimize market impact.
    *   If the position cannot be closed quickly or if the market moves rapidly against it, the engine may need to market sell/buy the position more aggressively.
4.  **Insurance Fund:** If the position is closed at a price worse than the bankruptcy price (meaning the trader's margin was insufficient to cover the losses), the exchange's Insurance Fund is typically used to cover the deficit, preventing counterparty losses.
5.  **Auto-Deleveraging (ADL):** If the Insurance Fund is depleted or the liquidation causes significant market disruption, ADL may be triggered as a last resort (covered in the next section).

**Calculating Liquidation Price (Simplified Example - Isolated Margin Long):**
Let's assume:
*   Entry Price = $60,000
*   Position Size = 1 BTC
*   Leverage = 10x
*   Initial Margin = Position Value / Leverage = ($60,000 * 1) / 10 = $6,000
*   Maintenance Margin Rate = 0.5%
*   Maintenance Margin Amount = Position Value * MM Rate = ($60,000 * 1) * 0.005 = $300

The position can sustain a loss equal to the Initial Margin minus the Maintenance Margin before liquidation is triggered:
*   Loss Tolerance = $6,000 - $300 = $5,700

For a 1 BTC long position, a $5,700 loss corresponds to a price drop of $5,700.
*   Liquidation Price ≈ Entry Price - Loss Tolerance / Position Size
*   Liquidation Price ≈ $60,000 - $5,700 / 1 = $54,300

*(Note: This is simplified. Real calculations involve the Mark Price, potential fees, and slightly different formulas depending on the exchange and whether cross-margin or isolated margin is used. Funding payments also affect the margin balance over time.)*

**Importance:**
Understanding the liquidation mechanism, Maintenance Margin requirements, and how the Mark Price influences liquidation is critical for risk management when trading perpetual swaps with leverage.

## Insurance Fund

The Insurance Fund is a safety net designed to absorb losses when a liquidated position is closed at a price worse than the trader's bankruptcy price (the price at which their margin balance would reach zero).

**Purpose:**
*   **Prevent Counterparty Losses:** Its primary goal is to ensure that profitable traders receive their full profits, even if the counterparty to their trade gets liquidated and their margin is insufficient to cover the loss. Without an insurance fund, exchanges might have to socialize losses across all users or claw back profits from winning traders.
*   **Maintain Market Stability:** By covering liquidation deficits, the fund helps prevent cascading failures and maintains confidence in the exchange's solvency.

**How it's Funded:**
*   **Liquidation Proceeds:** When a position is liquidated, the liquidation engine attempts to close it in the market. If the position is closed at a price *better* than the bankruptcy price, the remaining margin (after covering the position loss and any liquidation fees) is typically contributed to the Insurance Fund.
*   **Exchange Contributions:** Some exchanges may initially seed the fund or contribute to it periodically.

**Detailed Fund Dynamics:**

*   **Waterfall:** Liquidation Engine -> Trader's Margin -> Insurance Fund -> ADL.
*   **Contribution Example:** Trader Long 1 BTC from $60k, MM=0.5%, Bankruptcy Price ≈ $59.7k. Mark Price drops, liquidation triggered. Engine closes position at $59.8k. The $100 profit per BTC (relative to bankruptcy) *after* deducting liquidation fees is contributed to the fund.
*   **Withdrawal Example:** Trader Short 1 BTC from $60k, MM=0.5%, Bankruptcy Price ≈ $60.3k. Mark Price spikes, liquidation triggered. Engine can only close position at $60.4k due to slippage. The $100 loss per BTC (relative to bankruptcy) is withdrawn from the fund.
*   **Clawbacks (Rare):** In *extreme* fund depletion scenarios prior to ADL, some exchanges historically reserved the right to "claw back" profits from winning traders during that settlement period, though this is highly unpopular and generally avoided by current ADL systems.

**Monitoring and Risk:**
*   **Fund Size:** Exchanges publicly display the size of their insurance fund. A large and growing fund generally indicates a healthy liquidation process where liquidations are typically closed profitably.
*   **Depletion Risk:** In extreme market volatility, numerous large positions might get liquidated simultaneously, potentially leading to significant deficits. If the Insurance Fund is depleted, the exchange must resort to other mechanisms, typically Auto-Deleveraging (ADL).
*   **Transparency:** The rules governing contributions to and withdrawals from the fund should be clearly documented by the exchange.

**Relationship to Fees:**
Exchanges often charge a small liquidation fee. This fee might cover the operational costs of the liquidation engine and potentially contribute to the insurance fund or the exchange's revenue.

## Auto-Deleveraging (ADL)

Auto-Deleveraging (ADL) is a mechanism of last resort used by some cryptocurrency derivatives exchanges when the Insurance Fund is insufficient to cover the losses from a liquidation.

**Purpose:**
*   To ensure that the exchange remains solvent and that market integrity is maintained even when the insurance fund is depleted during extreme market conditions.
*   It acts as the final backstop to prevent socialized losses across all users.

**When it Triggers:**
*   ADL is triggered only when a liquidated position cannot be closed in the market at a price better than the bankruptcy price, *and* the Insurance Fund does not have enough funds to cover the resulting deficit.

**How it Works:**
1.  **Identify Counterparties:** When ADL is necessary, the system identifies traders on the opposite side of the market (i.e., profitable positions) who will be deleveraged.
2.  **Prioritization:** Traders are typically ranked for ADL based on a combination of their profit and leverage. Those with the highest profit margins and highest effective leverage are prioritized first.
    *   Exchanges often display an ADL indicator or ranking (e.g., a series of lights or a percentile ranking) on the trading interface so traders can assess their risk of being auto-delevaraged.
3.  **Execution:** The positions of the selected counterparty traders are automatically closed (delevaraged) at the bankruptcy price of the liquidated order that triggered the ADL event.
    *   The size of the deleveraging corresponds to the size of the liquidated order that couldn't be filled by the market or covered by the insurance fund.
4.  **Notification:** Affected traders are notified that their position (or part of it) has been closed via ADL.

**ADL Ranking Calculation:**

The ranking often uses a formula that prioritizes both profitability and leverage:

\[ \text{ADL Score} = \frac{\text{Unrealized Profit Percentage}}{\text{Effective Margin Ratio}} \]
\[ \text{Unrealized Profit Percentage} = \frac{\text{Unrealized PnL}}{\text{max(1, Position Value at Entry)}} \]
\[ \text{Effective Margin Ratio} = \frac{\text{Maintenance Margin Required}}{\text{Position Value at Mark Price}} \]

*   Higher Profit % -> Higher Score
*   Lower Margin Ratio (Higher Effective Leverage) -> Higher Score
*   Traders are ranked from highest score to lowest. The system deleverages starting from the top rank until the deficit is covered.

**Example:**
*   Trader A (Long) gets liquidated, but due to a market crash, their position is closed with a deficit of $10,000.
*   The Insurance Fund only has $2,000 remaining.
*   The ADL system is triggered for the remaining $8,000 deficit.
*   Trader B (Short) has the highest ADL ranking (most profitable/highest leverage short).
*   A portion of Trader B's profitable short position, equivalent to the size needed to cover the $8,000 deficit when closed at Trader A's bankruptcy price, is automatically closed by the system.
*   Trader B keeps the profit accrued up to the bankruptcy price but loses the potential for further profit on that portion of the position.

**Consequences for Traders:**
*   **Unwanted Position Closure:** The main risk for profitable traders is having their positions closed prematurely, potentially missing out on further gains.
*   **Uncertainty:** ADL events introduce uncertainty, especially during high volatility.
*   **Risk Management:** Traders may try to manage their ADL risk by reducing leverage or taking partial profits on highly profitable positions during volatile periods.

**Alternatives:**
Some exchanges use alternative backstop mechanisms like socialized loss systems (where deficits are spread across all profitable traders), but ADL is more common as it targets specific high-profit/high-leverage accounts first.

*(End of Perpetual Swaps Section)* 