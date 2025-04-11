# Options Contracts (Crypto)

## Overview & Basics

Options are contracts that give the buyer the **right**, but not the obligation, to either buy (call option) or sell (put option) an underlying asset at a specified price (strike price) on or before a certain date (expiration date). The seller (or writer) of the option is obligated to fulfill the contract if the buyer decides to exercise their right.

In the crypto market, options (primarily on $BTC$ and $ETH$) allow for sophisticated strategies beyond simple directional bets.

**Key Terminology:**
*   **Underlying Asset:** The cryptocurrency the option contract is based on (e.g., $BTC$, $ETH$).
*   **Call Option:** Gives the buyer the right to *buy* the underlying asset at the strike price.
*   **Put Option:** Gives the buyer the right to *sell* the underlying asset at the strike price.
*   **Strike Price ($K$):** The predetermined price at which the option buyer can buy or sell the underlying asset.
*   **Expiration Date (Expiry, $T$):** The date on which the option contract becomes void. Crypto options are often European style.
*   **Premium:** The price paid by the option buyer to the option seller for the rights granted by the contract.
*   **Option Buyer (Holder):** Pays the premium, gains the right (long call/long put). Limited risk (premium paid), potentially unlimited profit (call) or substantial profit (put).
*   **Option Seller (Writer):** Receives the premium, assumes the obligation (short call/short put). Limited profit (premium received), potentially unlimited loss (short call) or substantial loss (short put).
*   **In the Money (ITM):**
    *   Call: $Spot Price > Strike Price$
    *   Put: $Spot Price < Strike Price$
*   **At the Money (ATM):** $Spot Price \approx Strike Price$
*   **Out of the Money (OTM):**
    *   Call: $Spot Price < Strike Price$
    *   Put: $Spot Price > Strike Price$

## Option Styles

*   **European Style:** The option can only be exercised on the expiration date itself. This is the most common style for crypto options traded on major exchanges (e.g., Deribit).
*   **American Style:** The option can be exercised at any time up to and including the expiration date. Less common in listed crypto derivatives, potentially found in OTC markets or some DeFi protocols.
*   **Bermudan Style:** Can be exercised on specific predetermined dates before expiration. Very rare in crypto.

## Option Premium Components

The premium of an option is composed of two main parts:

$$
Option Premium = Intrinsic Value + Extrinsic Value (Time Value)
$$

*   **Intrinsic Value:** The immediate value an option would have if exercised *now*. It's the difference between the spot price ($S$) and the strike price ($K$), but cannot be negative.
    *   Call Intrinsic Value = $\max(0, S - K)$
    *   Put Intrinsic Value = $\max(0, K - S)$
    *   Only ITM options have intrinsic value. ATM and OTM options have zero intrinsic value.
*   **Extrinsic Value (Time Value):** The portion of the premium above the intrinsic value. It represents the market's expectation of future volatility, the time remaining until expiration, and interest rates. OTM options consist *only* of extrinsic value. Extrinsic value decays as the option approaches expiration (Theta decay).

## Pricing Models & The Greeks

Options are priced using mathematical models, with the **Black-Scholes-Merton (BSM)** model being the foundation, although often adapted for crypto markets (e.g., considering volatility smiles/skews).

<details class="my-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
<summary class="list-item px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer font-semibold text-gray-800 dark:text-gray-200">
Mathematical Details: Black-Scholes-Merton & The Greeks
</summary>
<div class="p-4 border-t border-gray-200 dark:border-gray-700">

**Black-Scholes-Merton (BSM) Formulas:**

The BSM model provides a theoretical estimate for the price of European-style options.

*   **Call Option Price ($C$):**
    $$
    C = S_0 \mathcal{N}(d_1) - K e^{-rT} \mathcal{N}(d_2)
    $$
*   **Put Option Price ($P$):**
    $$
    P = K e^{-rT} \mathcal{N}(-d_2) - S_0 \mathcal{N}(-d_1)
    $$

Where:
*   $S_0$: Current spot price of the underlying asset
*   $K$: Strike price of the option
*   $T$: Time to expiration (in years)
*   $r$: Risk-free interest rate (annualized, continuous compounding)
*   $\sigma$ (Sigma): Implied Volatility of the underlying asset's returns (annualized)
*   $\mathcal{N}(x)$: The cumulative distribution function (CDF) of the standard normal distribution. It gives the probability that a standard normal random variable is less than $x$.
*   $d_1$ and $d_2$ are calculated as:
    $$
    d_1 = \frac{\ln(S_0/K) + (r + \sigma^2/2)T}{\sigma \sqrt{T}}
    $$
    $$
    d_2 = d_1 - \sigma \sqrt{T} = \frac{\ln(S_0/K) + (r - \sigma^2/2)T}{\sigma \sqrt{T}}
    $$

*(Note: For assets with continuous dividend yield $q$, $S_0$ is replaced by $S_0 e^{-qT}$ in the formulas, and $r$ is replaced by $r-q$ in $d_1$ and $d_2$. For most cryptos, $q$ is assumed to be 0 unless dealing with staked derivatives).* 

**The Greeks (Formulas & Interpretation):**

The Greeks are the partial derivatives of the option pricing formula with respect to its parameters.

*   **Delta ($\Delta$):** Sensitivity to underlying price $S$.
    *   $\Delta_{Call} = \mathcal{N}(d_1)$
    *   $\Delta_{Put} = \mathcal{N}(d_1) - 1 = -\mathcal{N}(-d_1)$
    *   Interpretation: For a \$1 increase in $S$, the call price increases by approx. $\Delta_{Call}$, and the put price decreases by approx. $|\Delta_{Put}|$.
*   **Gamma ($\Gamma$):** Sensitivity of Delta to underlying price $S$. (Second derivative w.r.t $S$).
    $$
    \Gamma = \frac{\mathcal{N}'(d_1)}{S_0 \sigma \sqrt{T}}
    $$
    *   Where $\mathcal{N}'(x)$ is the probability density function (PDF) of the standard normal distribution: $\mathcal{N}'(x) = \frac{1}{\sqrt{2\pi}} e^{-x^2/2}$.
    *   Interpretation: For a \$1 increase in $S$, Delta changes by approx. $\Gamma$.
*   **Vega ($\nu$):** Sensitivity to Implied Volatility $\sigma$. (Note: Often quoted per 1% change in IV, so formula result is divided by 100).
    $$
    \nu = S_0 \mathcal{N}'(d_1) \sqrt{T}
    $$
    *   Interpretation: For a 1% increase in $\sigma$, the option price increases by approx. $\nu/100$.
*   **Theta ($\Theta$):** Sensitivity to Time $T$. (Note: Often quoted per day, so formula result is divided by 365 or 252 trading days).
    $$
    \Theta_{Call} = -\frac{S_0 \mathcal{N}'(d_1) \sigma}{2 \sqrt{T}} - r K e^{-rT} \mathcal{N}(d_2)
    $$
    $$
    \Theta_{Put} = -\frac{S_0 \mathcal{N}'(d_1) \sigma}{2 \sqrt{T}} + r K e^{-rT} \mathcal{N}(-d_2)
    $$
    *   Interpretation: Per day passing, the option price changes by approx. $\Theta/365$. Usually negative for long options.
*   **Rho ($\rho$):** Sensitivity to Risk-Free Rate $r$. (Note: Often quoted per 1% change in $r$, so formula result is divided by 100).
    $$
    \rho_{Call} = K T e^{-rT} \mathcal{N}(d_2)
    $$
    $$
    \rho_{Put} = -K T e^{-rT} \mathcal{N}(-d_2)
    $$
    *   Interpretation: For a 1% increase in $r$, the option price changes by approx. $\rho/100$.

</div>
</details>

**Second-Order Greeks:**
These measure how the primary Greeks change. More relevant for advanced hedging and risk management.
*   **Vanna:** Sensitivity of Delta to IV ($\partial\Delta/\partial\sigma$) or Vega to $S$ ($\partial\nu/\partial S$). Measures how option delta changes as volatility changes.
*   **Volga (Vomma):** Sensitivity of Vega to IV ($\partial\nu/\partial\sigma$). Measures the convexity of Vega.
*   **Charm (Delta Decay):** Sensitivity of Delta to Time ($\partial\Delta/\partial T$).
*   **Speed:** Sensitivity of Gamma to $S$ ($\partial\Gamma/\partial S$).
*   **Color:** Sensitivity of Gamma to Time ($\partial\Gamma/\partial T$).

## Implied Volatility (IV) & Volatility Surfaces

*   **Implied Volatility (IV):** This is arguably the most important input for option pricing after the underlying price. It represents the market's *expectation* of future price volatility of the underlying asset until the option's expiration. It's the volatility percentage ($\sigma$) that, when plugged into a pricing model (like BSM) along with other known inputs ($S, K, T, r$), yields the current market price (premium) of the option.
    *   IV is forward-looking.
    *   It differs from **Historical Volatility (HV)**, which measures actual past price movements.
    *   Traders trade IV: buying options when they think IV will rise (and vice-versa).
*   **Volatility Smile/Skew:** In theory (basic BSM), IV should be constant across all strikes and expiries for a given underlying. In reality, it's not. When plotting IV against strike price for a single expiration, the shape often resembles a "smile" or "skew".
    *   **Skew:** Typically, OTM puts (downside protection) have higher IV than OTM calls for the same distance from ATM. This reflects higher demand for downside protection (crash risk perception).
    *   **Smile:** Sometimes both OTM puts and OTM calls have higher IV than ATM options, indicating expected volatility for large price moves in either direction.
*   **Volatility Surface:** A 3D plot showing Implied Volatility across different strike prices and different expiration dates. It provides a complete picture of the market's volatility expectations.

## Mark Price Calculation (Options)

Exchanges need a reliable Mark Price for options to calculate margin requirements and potential liquidations for *option sellers* (buyers have limited risk).

*   The Mark Price for an option is typically derived from a theoretical pricing model (like BSM) using reliable inputs:
    *   **Underlying Mark Price:** Usually the Index Price of the underlying asset (e.g., $BTC$ Index Price).
    *   **Mark Volatility:** A smoothed Implied Volatility derived from the exchange's volatility surface, designed to be less susceptible to momentary spikes or manipulation in individual option bids/asks.
    *   Strike Price, Time to Expiration, and Interest Rate.
$$
\text{Option Mark Price} = \mathrm{BSM}(\text{Underlying Index Price}, K, T, \text{Mark IV}, r)
$$
*   This ensures margin calculations reflect a fair theoretical value rather than potentially illiquid or manipulated last traded prices or bid/ask spreads.

## Common Strategies (with Payoff Diagrams Concept)

Options allow for numerous strategies:
*   **Directional:**
    *   *Long Call:* Profit if $S > K + Premium$. Max Loss = Premium.
    *   **Payoff at Expiry:** $\max(0, S_T - K) - Premium$
    *   **Max Profit:** Unlimited
    *   **Max Loss:** Premium paid
    *   **Diagram:**
        ```
        STRATEGY: LONG CALL :: K=100 PREMIUM=5
        Profit/Loss
        ^
        |      / 
        |     /  
        |    /   
        +---/-----> Spot Price (S)
        |  /| K
        | / |
        |/  |
        *---+
       -P |   (Max Loss)
        ```
    *   *Long Put:* Profit if $S < K - Premium$. Max Loss = Premium.
    *   **Payoff at Expiry:** $\max(0, K - S_T) - Premium$
    *   **Max Profit:** $K - Premium$ (if $S_T$ goes to 0)
    *   **Max Loss:** Premium paid
    *   **Diagram:**
        ```
        STRATEGY: LONG PUT :: K=100 PREMIUM=5
        Profit/Loss
        ^
        |\ 
        | \    
        |  \   
        +---\-----> Spot Price (S)
       K|\  |
        | \ |
        |  \|
        +---*
            | -P (Max Loss)
        ```
*   **Income Generation:**
    *   *Short Covered Call:* Sell Call with $K > S$, while holding $S$. Profit capped at $Premium + (K - S)$. Loss if $S$ falls significantly.
    *   *Short Cash-Secured Put:* Sell Put with $K < S$, holding cash $K$. Max Profit = Premium. Takes loss if $S$ falls below $K - Premium$.
*   **Volatility Plays:**
    *   *Long Straddle:* Buy Call and Put with same $K$ and $T$. Profit if $S$ moves significantly away from $K$ in either direction (by more than total premium). Max Loss = Total Premium.
    *   **Payoff at Expiry:** $|S_T - K| - Premium_{Call} - Premium_{Put}$
    *   **Max Profit:** Unlimited (in either direction)
    *   **Max Loss:** Net premium paid
    *   **Diagram:**
        ```
        STRATEGY: LONG STRADDLE :: K=100 PREMIUM=10
        Profit/Loss
        ^
        |\     / 
        | \   /  
        |  \ /   
        +---*-----> Spot Price (S)
        |  / \ K
        | /   \
       -P    (Max Loss)
        ```
    *   *Long Strangle:* Buy OTM Call and OTM Put with same $T$. Cheaper than straddle, needs larger move to profit.
    *   *Short Straddle/Strangle:* Opposite profile, profit if low volatility.
*   **Spreads (Risk Defined):**
    *   *Bull Call Spread:* Buy Call $K_1$, Sell Call $K_2$ ($K_2 > K_1$). Max Profit = $K_2 - K_1 - Net Premium$. Max Loss = Net Premium.
    *   **Payoff at Expiry:** Capped between 0 and $(K_2 - K_1)$, minus net premium.
    *   **Max Profit:** $K_2 - K_1 - Net Premium$
    *   **Max Loss:** Net Premium paid
    *   **Diagram:**
        ```
        STRATEGY: BULL CALL SPREAD :: K1=90 K2=110 PREMIUM=4
        Profit/Loss
        ^    +-------* Max Profit
        |   /       
        |  /        
        +-*---------> Spot Price (S)
        | K1      K2
        *-----------+ Max Loss (- Premium)
        ```
    *   *Bear Put Spread:* Buy Put $K_2$, Sell Put $K_1$ ($K_2 > K_1$). Max Profit = $K_2 - K_1 - Net Premium$. Max Loss = Net Premium.
    *   **Payoff at Expiry:** Capped between 0 and $(K_1 - K_2)$, minus net premium.
    *   **Max Profit:** $K_1 - K_2 - Net Premium$
    *   **Max Loss:** Net Premium paid
    *   **Diagram:**
        ```
        STRATEGY: BEAR PUT SPREAD :: K1=110 K2=90 PREMIUM=4
        Profit/Loss
        ^    *-------+ Max Profit
        |   /|       
        |  / |        
        +-*----------> Spot Price (S)
        |      K2   K1
        *-----------+ Max Loss (- Premium)
        ```

*(Payoff diagrams are illustrative)*

## Settlement (Options)

Crypto options on major exchanges are typically European style and **cash-settled**.
*   At expiration, ITM options are automatically exercised.
*   The settlement value is based on the difference between the **Settlement Price** (usually a time-weighted average price - TWAP - of the Index Price over a period like the last 30-60 minutes before expiry) and the Strike Price.
*   The cash difference is credited/debited to the buyer/seller.
    *   Call settlement = $\max(0, Settlement Price - Strike Price)$
    *   Put settlement = $\max(0, Strike Price - Settlement Price)$

*(End of Options Contracts Section)* 