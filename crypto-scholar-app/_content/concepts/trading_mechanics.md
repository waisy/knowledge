# Core Trading Mechanics for Crypto Derivatives

This document outlines foundational concepts common to many leveraged crypto derivative products like Perpetual Swaps and Futures contracts. Understanding these mechanics is crucial for risk management.

## Index Price Construction

The Index Price is designed to represent the fair market value of the underlying asset in the spot market. It serves as the anchor for calculating the Mark Price and, in the case of perpetuals, the Funding Rate mechanism. Accuracy and resistance to manipulation are paramount.

**Key Principles:**
*   **Aggregation:** Uses price data from multiple (usually 3+) major, liquid spot exchanges.
*   **Weighting:** Often uses volume weighting or equal weighting to combine prices from constituent exchanges. Volume weighting gives more influence to exchanges with higher trading activity, potentially reflecting price discovery better.
*   **Outlier Protection:** Employs mechanisms to prevent manipulation or errors from a single exchange unduly influencing the index. Common methods include:
    *   **Medianization:** Taking the median price from the constituent exchanges after potentially discarding the highest and lowest.
    *   **Deviation Checks:** Temporarily removing an exchange's price feed if it deviates beyond a certain percentage threshold (e.g., +/- 3%) from the median of the others.
    *   **Staleness Checks:** Ignoring an exchange's feed if its data hasn't updated recently or if the exchange is in maintenance.

**Mathematical Deep Dive (Example: Median with Deviation Check):**

1.  **Collect Prices:** Get $(Price_i, Volume_i)$ from N constituent exchanges (e.g., N=5).
2.  **Calculate Median Price:** $Median\\_Price = \\mathrm{Median}(Price_1, Price_2, ..., Price_N)$.
3.  **Deviation Check:** For each exchange $i$:
    *   $Deviation_i = |Price_i - Median\\_Price| / Median\\_Price$
    *   If $Deviation_i > Threshold$ (e.g., 3%), *temporarily* discard $Price_i$ from the set. Let the remaining number of valid exchanges be $N_{valid}$.
4.  **Final Index Calculation (if using remaining prices for VWAP):**
    *   If $N_{valid} >= Minimum Sources$ (e.g., 3):
        *   $Valid Prices = \\{Price_j | Deviation_j \\leq Threshold\\}$
        *   $Valid Volumes = \\{Volume_j | Price_j \\text{ is in } Valid Prices\\}$
        *   $Index Price = \\frac{\\mathrm{Sum}(Price_j \\cdot Volume_j)}{\\mathrm{Sum}(Volume_j)}$ for all $j$ where $Price_j$ is valid.
    *   Else (too few valid sources): Trigger error handling (e.g., use last valid Index Price, pause market, use median of remaining sources).
5.  **Alternative Final Step (Median of Valid Prices):** Some indices might simply take the median of the valid prices after the deviation check, ignoring volume weighting at this final stage.

**Example (Simplified BTC/USD Index):**
Assume the Index uses data from Coinbase, Binance, and Kraken.
1.  **Get Last Traded Price (LTP) and Volume (24h) from each:**
    *   Coinbase: LTP = \\$60,100, Volume = 20,000 BTC
    *   Binance: LTP = \\$60,150, Volume = 30,000 BTC
    *   Kraken: LTP = \\$60,050, Volume = 15,000 BTC
2.  **Apply Checks:** (Assume all pass deviation/staleness checks for this example).
3.  **Calculate Volume-Weighted Average Price (VWAP):**
    $$
    Total Volume = 20000 + 30000 + 15000 = 65000 \\text{ BTC}
    $$
    $$
    Weighted Sum = (60100 \\cdot 20000) + (60150 \\cdot 30000) + (60050 \\cdot 15000)
    $$
    $$
    Weighted Sum = 1,202,000,000,000 + 1,804,500,000,000 + 900,750,000,000 = 3,907,250,000,000
    $$
    $$
    Index Price = \\frac{Weighted Sum}{Total Volume} = \\frac{3,907,250,000,000}{65000} \\approx \\$60,111.54
    $$

**Considerations:**
*   The exact list of constituent exchanges and weighting methodology is specific to each derivatives exchange.
*   Transparency regarding index constituents and calculation methodology is crucial for traders.
*   Robustness against API failures or anomalous data from a single source is a key design goal.

## Margin & Leverage

Leveraged derivatives trading allows controlling large positions with smaller amounts of capital, known as margin.

**Key Concepts:**
*   **Margin:** The collateral deposited by a trader to open and maintain a leveraged position. There are two main types:
    *   **Initial Margin (IM):** The minimum amount of collateral required to *open* a position. Usually a percentage of the position's notional value, determined by the maximum allowed leverage (e.g., 1% IM for 100x leverage).
    *   **Maintenance Margin (MM):** The minimum amount of collateral required to *keep* a position open. If the position's equity falls below the Maintenance Margin level, the liquidation process begins. MM is always lower than IM (e.g., 0.5% for 100x leverage).
*   **Leverage:** The ratio of the position's notional value to the required Initial Margin. Higher leverage amplifies both potential profits and losses.
*   **Position Equity / Margin Balance:** The value of the collateral supporting a position, including the initial margin plus any unrealized profits or minus any unrealized losses and funding fees.
*   **Margin Ratio:** Often expressed as $Maintenance Margin Required / Position Value$ or calculated based on assets and liabilities in the margin account. This is compared against the Maintenance Margin Rate (MMR) to determine liquidation risk.

**Tiered Margin:**

Exchanges often use a **tiered margin system**. This means larger position sizes require proportionally higher Maintenance Margin percentages (i.e., lower maximum allowed leverage).

*   **Rationale:** Larger positions have a greater market impact when liquidated, potentially causing more slippage. Higher MM for large positions provides a larger buffer for the liquidation engine and reduces the risk to the Insurance Fund/ADL system.
*   **Example Tiers (Illustrative):**
    | Position Notional (BTC) | Max Leverage | Initial Margin % | Maintenance Margin % |
    | :---------------------- | :----------- | :--------------- | :------------------- |
    | 0 - 50                  | 100x         | 1.0%             | 0.5%                 |
    | 50 - 250                | 50x          | 2.0%             | 1.0%                 |
    | 250 - 1000              | 20x          | 5.0%             | 2.5%                 |
    | > 1000                  | 10x          | 10.0%            | 5.0%                 |

*   **Calculating MM for a Large Position:** If a position spans multiple tiers, the MM requirement is often calculated incrementally based on the portion of the position in each tier.

## Liquidation Mechanism

Liquidation is the process of automatically closing a trader's leveraged position to prevent their losses from exceeding their deposited collateral (Margin).

**Trigger:** Liquidation occurs when a position's Margin Balance falls below the required Maintenance Margin level.
$$
Position Equity \le \text{Maintenance Margin Required}
$$
*(Note: Maintenance Margin Required = Position Value * Maintenance Margin Rate (MMR) for that tier)*

**The Process:**
1.  **Monitoring:** The exchange continuously monitors the **Mark Price** (a price designed to be manipulation-resistant, often based on the Index Price) and compares each position's Equity against its Maintenance Margin requirement.
2.  **Trigger:** If $Position Equity < Maintenance Margin Required$, the position is flagged for liquidation.
3.  **Execution (by Liquidation Engine):** The exchange's automated system takes over the position.
    *   It attempts to close the position in the market at the best possible price.
    *   Exchanges typically use a tiered liquidation process. They first try to close the position via limit orders slightly better than the bankruptcy price (the price at which margin = 0) to minimize market impact.
    *   If the position cannot be closed quickly or if the market moves rapidly against it, the engine may need to market sell/buy the position more aggressively.
4.  **Waterfall:** The losses are covered first by the trader's remaining margin. If the losses exceed the margin (i.e., the position is closed at a price worse than the bankruptcy price), the exchange proceeds to the next step:
    *   **Insurance Fund:** Used to cover the deficit.
    *   **Auto-Deleveraging (ADL):** Used if the Insurance Fund is depleted.

**Liquidation Price:**
*   This is the calculated Mark Price at which a position's equity would fall below the Maintenance Margin requirement.
*   The exact formula depends on whether **Isolated Margin** (margin assigned only to one position) or **Cross Margin** (account balance shared as margin across positions) is used, the specific product (Perpetual or Futures), and the direction (Long or Short).
*   *Refer to the specific product documentation (e.g., Perpetuals, Futures) for detailed Liquidation Price formulas.*

**Importance:**
Understanding the liquidation mechanism, Maintenance Margin requirements, and how the Mark Price influences liquidation is critical for risk management when trading with leverage.

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
*   **Contribution Example:** Trader Long 1 BTC from \\$60k, MM=0.5%, Bankruptcy Price ≈ \\$59.7k. Mark Price drops, liquidation triggered. Engine closes position at \\$59.8k. The \\$100 profit per BTC (relative to bankruptcy) *after* deducting liquidation fees is contributed to the fund.
*   **Withdrawal Example:** Trader Short 1 BTC from \\$60k, MM=0.5%, Bankruptcy Price ≈ \\$60.3k. Mark Price spikes, liquidation triggered. Engine can only close position at \\$60.4k due to slippage. The \\$100 loss per BTC (relative to bankruptcy) is withdrawn from the fund.
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
*   **Guaranteed Settlement:** Ensures that all contracts are settled and losses are covered even in extreme market conditions when the Insurance Fund is depleted.
*   **Avoid Socialized Losses:** Prevents losses from being spread across all users of the platform, instead targeting specific profitable counterparties.
*   **Last Resort:** It's designed to be used rarely, only when other mechanisms fail.

**How it Works:**
1.  **Trigger:** ADL is triggered when a liquidation order cannot be filled entirely in the market, and the Insurance Fund does not have enough funds to cover the contract loss (the difference between the bankruptcy price and the eventual fill price/mark price).
2.  **Ranking:** Profitable traders holding positions on the opposite side of the triggering liquidation are ranked. The ranking often uses a formula that prioritizes both profitability and leverage:
    $$
    ADL Score = \\frac{Unrealized Profit Percentage}{Effective Margin Ratio}
    $$
    Where:
    *   $Unrealized Profit Percentage = \\frac{Unrealized PnL}{\\mathrm{max}(1, Position Value at Entry)}$
    *   $Effective Margin Ratio = \\frac{Maintenance Margin Required}{Position Value at Mark Price}$

    *   Higher Profit % -> Higher Score
    *   Lower Margin Ratio (Higher Effective Leverage) -> Higher Score
3.  **Selection & Deleveraging:** Traders are ranked from highest score to lowest. The system deleverages starting from the top rank until the deficit is covered.
    *   The selected counterparty's position is partially or fully closed at the **bankruptcy price** of the original liquidated order.
    *   The trader receives a notification that their position has been auto-deleveraged.
    *   The amount deleveraged from each counterparty is typically proportional to cover the required size.

**Example:**
1.  Trader A (Long) gets liquidated, position cannot be filled, Insurance Fund is empty. Bankruptcy Price = \\$50k. Deficit = \\$1M.
2.  Exchange ranks profitable short traders based on PnL% and Leverage.
3.  Trader B (Short) is ranked highest. Their position size is large enough to cover the \\$1M deficit when partially closed at the \\$50k bankruptcy price.
4.  A portion of Trader B's short position is automatically closed (effectively a forced buy) at \\$50k, covering Trader A's deficit. Trader B is notified.

**Downsides:**
*   **Unpredictable:** Profitable traders can have parts of their position closed involuntarily, potentially disrupting their trading strategy.
*   **Non-Market Price:** The fill occurs at the bankruptcy price, which might be significantly different from the current market price.

**Mitigation:**
*   Exchanges aim to minimize ADL events through robust liquidation engines and well-funded Insurance Funds.
*   The ADL ranking indicator (often shown in the UI as a series of lights or bars) gives traders an estimate of their position in the queue, allowing highly ranked traders to potentially reduce their risk (e.g., by lowering leverage or taking some profit) if they wish to avoid ADL.

*(End of Core Trading Mechanics Section)* 