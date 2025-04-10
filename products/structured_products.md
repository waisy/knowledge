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
*   **Payoff at Expiry:** Let `D` be the initial deposit amount, `Y` be the enhanced yield (as a fraction), `K` be the strike price, and `S_T` be the spot price at expiry.
    *   If `S_T < K`: Receive `D * (1 + Y)` in the *deposited* currency.
    *   If `S_T >= K`: Receive `(D * (1 + Y) * K) / K = D * (1 + Y)` worth of the *alternate* currency, converted at the strike price `K`.
        *   The *value* received is fixed in terms of the deposit currency amount `D*(1+Y)`, but the currency it's paid in depends on `S_T` vs `K`.
*   **Payoff Diagram (vs. Holding Deposited Asset):**
    ```
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
*   **Payoff at Expiry:** Let `P_0` be the initial principal, `R` be the participation rate (0 to 1), and `Perf = max(0, (S_T - S_0) / S_0)` be the asset performance (capped at 0 if negative).
    *   Value = `P_0 + P_0 * R * Perf`
    *   This can be rewritten as: Value = `P_0 * (1 + R * max(0, (S_T - S_0) / S_0))`
*   **Payoff Diagram (vs. Direct Holding):**
    ```
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
    *   **Covered Call Selling (Deposit BTC, Sell Call K):**
        *   If `S_T <= K`: Receive `BTC_{initial} + Premium` (in BTC terms, premium usually paid in kind or converted).
        *   If `S_T > K`: Receive `K + Premium` (Value in Quote Currency, BTC is sold at `K`).
        *   Payoff resembles a short call payoff added to the underlying BTC holding.
        ```
        Value at Expiry (Quote Currency Terms)
        ^
        |        /---------------- * (Capped upside at K + Premium)
        |       /
        |      / (Value follows Spot + Premium)
        |     /
        +----/---------------------> Spot Price (S_T)
             K
        ```
    *   **Put Selling (Deposit Stablecoin, Sell Put K):**
        *   If `S_T >= K`: Receive `Stablecoin_{initial} + Premium`.
        *   If `S_T < K`: Receive `BTC` bought at price `K` (using initial stablecoins), plus `Premium`. Value is `S_T + Premium` in quote terms (assuming 1 unit bought).
        *   Payoff resembles a short put payoff.
        ```
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
    *   Sell Put `K2`, Buy Put `K1` (`K1 < K2 < S_0`)
    *   Sell Call `K3`, Buy Call `K4` (`S_0 < K3 < K4`)
*   **Payoff:** Max profit (net premium received) if `K2 <= S_T <= K3`. Max loss (capped by spread width minus premium) if `S_T < K1` or `S_T > K4`.
*   **Payoff Diagram:**
    ```
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

*(End of Structured Products Section)* 