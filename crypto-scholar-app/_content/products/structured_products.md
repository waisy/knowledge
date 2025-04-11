# Structured Products (Crypto)

## Overview

Structured Products in finance combine traditional assets (like bonds or deposits) or derivatives (like options or futures) to create investments with non-linear risk/return profiles tailored to specific market views or risk appetites. In crypto, this concept is applied using digital assets and crypto derivatives.

**Goal:** To offer predefined payoff structures that differ from simply holding spot assets or trading standard derivatives. They often provide yield enhancement, principal protection, or leveraged exposure with defined risk.

**Key Characteristics:**
*   **Packaged Strategy:** Bundles multiple underlying components (spot, futures, options) into a single product.
*   **Defined Payoff:** The return profile is clearly defined based on the performance of the underlying crypto asset(s) over the product's term.
*   **Fixed Term:** Usually have a predetermined maturity or settlement date.
*   **Accessibility:** Often provide access to complex strategies (like options selling) in a simplified format.

## Common Types in Crypto

Here are some examples of structured products prevalent in the crypto space, often offered by CeFi platforms or DeFi protocols:

**1. Dual Currency Investment / Deposit:**
*   **Concept:** A short-term yield generation product linked to two currencies (typically a crypto asset like BTC or ETH, and a stablecoin like USDT/USDC).
*   **Mechanism:** Essentially involves the user depositing one asset (e.g., BTC) and implicitly selling a short-dated option (e.g., a BTC call option) against it. The premium received from selling the option enhances the yield.
*   **Payoff at Expiry:** Let $D$ be the initial deposit amount, $Y$ be the enhanced yield (as a fraction), $K$ be the strike price, and $S_T$ be the spot price at expiry.
    *   If $S_T < K$: Receive $D \cdot (1 + Y)$ in the *deposited* currency.
    *   If $S_T \ge K$: Receive $(D \cdot (1 + Y) \cdot K) / K = D \cdot (1 + Y)$ worth of the *alternate* currency, converted at the strike price $K$.
        *   The *value* received is fixed in terms of the deposit currency amount $D \cdot (1+Y)$, but the currency it's paid in depends on $S_T$ vs $K$.
*   **Payoff Diagram (vs. Holding Deposited Asset):**
    ```
    STRATEGY: DUAL_CURRENCY :: K=100 YIELD=0.05
    Value at Expiry (in Dep. Asset terms)
    ^
    |         /------------------  (Value if converted to Alt Currency at K)
    |        /
    |-------*-------------------  (Value if returned in Dep. Currency)
    |      / D*(1+Y)
    |     /
    |    / D
    |   /
    +--/-----------------------> Spot Price (S_T)
       K

    (Compared to just holding D, which would be a straight line up from D)
    ```
*   **Risk:** The user might end up holding the less desirable asset at expiry if the market moves significantly against their initial deposit choice (e.g., holding stablecoins after BTC has rallied significantly above the strike, missing out on further upside).
*   **Use Case:** Earning enhanced yield on crypto or stablecoins, suitable for users who are comfortable holding either asset at the strike price and have a neutral or range-bound view.

**2. Principal Protected Notes (PPNs) / Products:**
*   **Concept:** Aim to return the user's initial investment (principal) at maturity, regardless of the underlying asset's performance, while offering potential upside participation.
*   **Mechanism:** Typically combines a zero-coupon bond (or equivalent deposit guaranteeing principal return) with purchasing a call option on the underlying crypto asset. The cost of the option reduces the overall potential return compared to direct investment, but provides downside protection.
*   **Payoff at Expiry:** Let $P_0$ be the initial principal, $R$ be the participation rate (0 to 1), and $Perf = \max(0, (S_T - S_0) / S_0)$ be the asset performance (capped at $0$ if negative).
    $$ \text{Value} = P_0 + P_0 \cdot R \cdot Perf $$
    *   This can be rewritten as: 
    $$ \text{Value} = P_0 \cdot (1 + R \cdot \max(0, (S_T - S_0) / S_0)) $$
*   **Payoff Diagram (vs. Direct Holding):**
    ```
    STRATEGY: PRINCIPAL_PROTECTED :: K=100 INIT_PRICE=80 PART_RATE=0.5
    Value at Expiry
    ^
    |          /----- (PPN Payoff, slope = P0 * R / S0)
    |         /
    |        /
    |-------*------- (Guaranteed Principal P0)
    |      /
    |     /  (Direct Holding Payoff, slope = P0 / S0)
    |    /
    +---/-------------> Spot Price (S_T)
       S0
    ```
*   **Risk:** Opportunity cost (might underperform direct holding in a strong bull market), credit risk of the issuer guaranteeing the principal, inflation risk.
*   **Use Case:** Conservative investors seeking exposure to crypto upside with capital preservation as a priority.

**3. Yield Enhancement Products (Option Selling Strategies):**
*   **Concept:** Generate yield by systematically selling options (e.g., covered calls, put selling) on behalf of the user.
*   **Mechanism & Payoffs:**
    *   **Covered Call Selling (Deposit BTC, Sell Call $K$):**
        *   If $S_T \le K$: Receive $BTC_{initial} + Premium$ (in BTC terms, premium usually paid in kind or converted).
        *   If $S_T > K$: Receive $K + Premium$ (Value in Quote Currency, BTC is sold at $K$).
        *   Payoff resembles a short call payoff added to the underlying BTC holding.
        ```
        STRATEGY: COVERED_CALL :: K=110 PREMIUM=5
        Value at Expiry (Quote Currency Terms)
        ^
        |        /---------------- * (Capped upside at K + Premium)
        |       /
        |      / (Value follows Spot + Premium)
        |     /
        +----/---------------------> Spot Price (S_T)
             K
        ```
    *   **Put Selling (Deposit Stablecoin, Sell Put $K$):**
        *   If $S_T \ge K$: Receive $Stablecoin_{initial} + Premium$.
        *   If $S_T < K$: Receive $BTC$ bought at price $K$ (using initial stablecoins), plus $Premium$. Value is $S_T + Premium$ in quote terms (assuming $1$ unit bought).
        *   Payoff resembles a short put payoff.
        ```
        STRATEGY: CASH_SECURED_PUT :: K=90 PREMIUM=3
        Value at Expiry (Quote Currency Terms)
        ^
        |        *----------------- (Profit capped at Premium)
        |       / 
        |      / (Value follows Spot + Premium below K)
        |     /
        +----/---------------------> Spot Price (S_T)
             K
        ```
*   **Risk:** Capped upside (covered calls), obligation to buy potentially depreciating asset (put selling).
*   **Use Case:** Users seeking higher yield than standard lending, with a neutral to moderately bullish (covered call) or neutral to bullish (put selling) outlook, willing to accept the associated risks.

**4. Range/Corridor Products (e.g., Iron Condor Structure):**
*   **Concept:** Pay a yield if the price of the underlying asset stays within a predefined range for the duration of the product.
*   **Mechanism:** Often involves selling an OTM put spread and an OTM call spread simultaneously.
    *   Sell Put $K_2$, Buy Put $K_1$ ($K_1 < K_2 < S_0$)
    *   Sell Call $K_3$, Buy Call $K_4$ ($S_0 < K_3 < K_4$)
*   **Payoff:** Max profit (net premium received) if $K_2 \le S_T \le K_3$. Max loss (capped by spread width minus premium) if $S_T < K_1$ or $S_T > K_4$.
*   **Payoff Diagram:**
    ```
    STRATEGY: IRON CONDOR :: K1=70 K2=80 K3=120 K4=130 PREMIUM=4
    Profit/Loss
    ^
    |       +-------+       (Max Profit = Net Premium)
    |      /         \ 
    |     /           \
    +----*-------------*-----> Spot Price (S_T)
    |   K1 K2        K3 K4  
    *-----------------------* (Max Loss)
    ```
*   **Risk:** Significant loss if the market makes a large move outside the defined range.
*   **Use Case:** Traders with a strong conviction that volatility will remain low and the price will stay within a specific range.

## Considerations for Structured Products

*   **Complexity:** Underlying mechanics can be opaque. Understand exactly what derivatives are involved and the payoff structure.
*   **Fees:** Implicit and explicit fees can eat into returns. Compare fees between providers.
*   **Counterparty/Platform Risk:** Especially in CeFi, the solvency of the issuer is critical. In DeFi, smart contract risk exists.
*   **Liquidity:** These products are often illiquid before maturity. Exiting early might be impossible or costly.
*   **Market Conditions:** Performance is highly dependent on the market conditions matching the product's design (e.g., range products suffer in trending markets).

*(Payoff diagrams are illustrative and ignore nuances like fees/slippage)*

<details class="my-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
<summary class="list-item px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer font-semibold text-gray-800 dark:text-gray-200">
Example: Calculating Payoff for a DCI (Sell BTC Call)
</summary>
<div class="p-4 border-t border-gray-200 dark:border-gray-700">

*   Deposit: 1 $BTC$
*   Spot Price ($S_0$): \$60,000
*   Strike ($K$): \$65,000
*   Expiry ($T$): 7 days
*   Implied Volatility (Annualized): 50%
*   Risk-Free Rate ($r$): 2% (Annualized)

1.  **Calculate Option Premium:** Using BSM or similar model, price a 7-day European call option with $S_0=60k, K=65k, T=7/365, \sigma=0.5, r=0.02$. Let's assume the model gives a premium of $\approx 0.005$ $BTC$ per $BTC$ (or $\approx \$300 at $S_0$).
2.  **Calculate Annualized Percentage Yield (APY):**
    *   Yield (for 7 days) = $Premium / Principal = 0.005 BTC / 1 BTC = 0.5\%$
    *   APY $\approx Yield \times (365 / \text{Days}) = 0.005 \times (365 / 7) \approx 26.07\%$
3.  **Determine Payoff at Expiry ($T$):**
    *   **Scenario 1: $BTC$ finishes at \$63,000 (below $K$)**
        *   Option expires worthless.
        *   User receives: $Principal + Yield = 1 BTC + 0.005 BTC = 1.005 BTC$.
    *   **Scenario 2: $BTC$ finishes at \$70,000 (above $K$)**
        *   Option is exercised.
        *   User sells $BTC$ at Strike $K$, receives $USDC$, plus yield (paid in the settlement currency).
        *   User receives: $(Principal \times K) + (Yield \times K) = (1 \times 65000) + (0.005 \times 65000) = 65000 + 325 = 65,325 USDC$.

This illustrates how the product provides yield but converts the holding currency if the strike is breached.

</div>
</details>

<details class="my-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
<summary class="list-item px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer font-semibold text-gray-800 dark:text-gray-200">
Example: Calculating Payoff for a Simple PPN
</summary>
<div class="p-4 border-t border-gray-200 dark:border-gray-700">

*   Deposit: \$10,000 $USDC$
*   Term ($T$): 1 year
*   Zero-Coupon Bond Price: Assume a 1-year bond yielding 2% can be bought for \$9803.92 to guarantee \$10,000 back at expiry ($10000 / (1+0.02)$).
*   Funds for Options: \$10,000 - \$9803.92 = \$196.08
*   Underlying: $BTC$, starting at $S_0 = \$60,000
*   Participation Rate ($P$): Protocol uses the \$196.08 to buy 1-year $BTC$ call options. Let's assume this allows for a participation rate of 30% ($P=0.3$).

**Payoff at Expiry ($T$):** $Payoff = \$10,000 + \$10,000 \times P \times \max(0, \frac{S_T - S_0}{S_0})$

*   **Scenario 1: $BTC$ finishes at \$50,000 (down)**
    *   Asset Return = $(\$50k - \$60k) / \$60k = -16.67\%$
    *   $\max(0, -0.1667) = 0$
    *   Payoff = \$10,000 + \$10,000 \times 0.3 \times 0 = \$10,000$. (Principal returned)
*   **Scenario 2: $BTC$ finishes at \$80,000 (up)**
    *   Asset Return = $(\$80k - \$60k) / \$60k = 33.33\%$
    *   $\max(0, 0.3333) = 0.3333$
    *   Payoff = \$10,000 + \$10,000 \times 0.3 \times 0.3333 = \$10,000 + \$1000 = \$11,000$. (Principal + 30% of the 33.33% gain)

This shows how PPNs protect principal while offering some upside participation.

</div>
</details>

## Conclusion
Structured products in crypto offer tailored risk/reward profiles by combining basic assets (spot, futures) with derivatives (options). While they can provide enhanced yields or principal protection, users must understand the embedded complexities, risks, and fees before investing.

*(End of Structured Products Section)* 