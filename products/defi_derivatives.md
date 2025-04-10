# DeFi-Specific Derivatives

## Overview

Beyond replicating traditional financial derivatives (futures, options), the Decentralized Finance (DeFi) ecosystem has fostered the creation of novel derivative types built directly on blockchain protocols. These often address specific needs within DeFi, such as managing interest rate volatility in lending protocols or tokenizing yield streams.

**Goal:** To create new financial instruments that leverage DeFi's composability and transparency to manage risks or unlock value specific to on-chain activities.

**Key Characteristics:**
*   **On-Chain Native:** Designed and executed entirely via smart contracts.
*   **Composability:** Often integrate with other DeFi protocols (e.g., lending markets, DEXs).
*   **Permissionless:** Generally accessible to anyone without intermediaries (subject to protocol rules).
*   **Transparency:** Contract logic and state are publicly viewable on the blockchain.

## 1. Interest Rate Swaps (IRS)

*   **Concept:** Agreements where two parties exchange interest rate payments over a specified period. In DeFi, this typically involves swapping a *variable* interest rate (e.g., from lending/borrowing on Aave or Compound) for a *fixed* interest rate.
*   **Mechanism (Example Protocols: Voltz, IPOR):**
    *   **Liquidity Providers (LPs):** Provide liquidity to the swap market, effectively taking on both fixed and variable rate exposure, earning trading fees.
    *   **Fixed Takers (FTs):** Pay a fixed rate and receive the variable rate. They benefit if the variable rate averages *higher* than the fixed rate they paid. Use case: Hedging variable borrowing costs or speculating on rising rates.
    *   **Variable Takers (VTs):** Pay the variable rate and receive a fixed rate. They benefit if the variable rate averages *lower* than the fixed rate they received. Use case: Locking in a fixed return on lending or speculating on falling rates.
    *   **AMM Math (Conceptual - based on YieldSpace/Voltz):** These AMMs don't trade asset quantities like Uniswap, but rather future yield.
        *   They often adapt constant product or concentrated liquidity concepts to an interest rate context.
        *   A simplified invariant might relate the amount of virtual fixed-rate tokens (`x`) and virtual variable-rate tokens (`y`) in the pool, potentially incorporating time decay (`t`) and a term adjustment factor (`g(t)`):
            ` L = f(x, y, t) ` (where L is liquidity)
            (e.g., a variant of `x * y = k` or `(x^{1-t} + y^{1-t})^{1/(1-t)} = L` adapted for yield).
        *   Trades shift the balance of `x` and `y`, changing the marginal price, which represents the *implied fixed interest rate* at that point in the pool.
        *   FTs effectively add variable tokens and remove fixed tokens (pushing the implied fixed rate up).
        *   VTs effectively add fixed tokens and remove variable tokens (pushing the implied fixed rate down).
        *   LPs provide depth across a range of potential fixed rates.
        *   *Note: The actual math is significantly more complex, involving virtual reserves, time-weighted adjustments, and often custom curve designs.*
    *   **Process:** Traders select a term (e.g., 3 months) and a notional amount. They interact with an Automated Market Maker (AMM) specifically designed for interest rates. The AMM determines the current market-implied fixed rate based on supply and demand between FTs and VTs, balanced by LPs.
    *   **Settlement:** Can be periodic cash flows or a single settlement at maturity based on the difference between the fixed rate and the realized average variable rate over the term.
*   **Underlying Variable Rates:** Typically based on the borrow or supply rates from major lending protocols (e.g., Aave USDC supply rate, Compound ETH borrow rate), sourced via oracles or direct integration.
*   **Risks:** Smart contract risk, oracle risk (if applicable), liquidity risk (slippage on entry/exit), counterparty risk (mitigated by protocol design/collateralization), divergence between the reference variable rate and the actual rate experienced by the user.
*   **Use Cases:** Hedging interest rate risk for DeFi lenders/borrowers, speculating on future interest rate movements, creating fixed-rate DeFi products.

## 2. Yield Tokens / Principal Tokens (Yield Stripping)

*   **Concept:** Protocols that take a yield-bearing asset (e.g., stETH, cUSDC) and split it into two separate tokens: a Principal Token (PT) and a Yield Token (YT).
*   **Mechanism (Example Protocols: Pendle, Element Finance [deprecated], Sense Space):**
    *   **Splitting:** A user deposits a yield-bearing asset (e.g., 1 stETH) into the protocol for a specific maturity date.
    *   The protocol mints two new tokens:
        *   **Principal Token (PT):** Represents the right to claim back the underlying principal (1 ETH in this case, assuming stETH tracks ETH) at maturity. PTs trade at a discount to the underlying, similar to a zero-coupon bond. The discount reflects the implied yield for the period until maturity.
        *   **Yield Token (YT):** Represents the right to claim all the yield generated by the underlying asset (1 stETH) from the time of splitting until maturity. YT holders receive the staking rewards, lending interest, or other yield components.
    *   **Implied Yield Calculation:** The market prices of PT and YT reflect an implied yield.
        *   Since `Value(PT) + Value(YT) = Value(Underlying Yield-Bearing Asset)`, and PT is redeemable for 1 unit of the base asset at maturity, PT acts like a zero-coupon bond.
        *   Let `P_{PT}` be the current price of the Principal Token, `T` be the time to maturity (in years).
        *   The implied annualized fixed yield (`IY`) can be calculated from the PT price:
            ` P_{PT} = 1 / (1 + IY)^T ` (for annual compounding)
            ` P_{PT} = e^{-IY * T} ` (for continuous compounding)
        *   Solving for `IY` (continuous case):
            ` \ln(P_{PT}) = -IY * T `
            ` IY = -\frac{\ln(P_{PT})}{T} `
        *   Example: If PT-stETH with 6 months (T=0.5 years) maturity trades at 0.98 ETH, the implied continuous yield is:
            ` IY = -ln(0.98) / 0.5 ≈ -(-0.0202) / 0.5 ≈ 0.0404 = 4.04% `
        *   The price of the corresponding YT (`P_{YT}`) would then be `P_{YT} = P_{Underlying} - P_{PT}`. Traders compare the `IY` to their expectation of the actual variable yield over `T`.
    *   **Trading:** Both PTs and YTs can be traded on specialized AMMs.
*   **Payoffs:**
    *   **Buying PT:** Allows locking in a fixed yield. If you buy PT-stETH at a discount (e.g., 0.95 ETH) and hold to maturity, you redeem 1 ETH, achieving a fixed return regardless of stETH's variable yield during that time.
    *   **Buying YT:** Allows leveraged speculation on the yield. If you believe stETH yield will be higher than what's implied by the PT/YT market price, you can buy YT-stETH. You pay a premium upfront and receive all the variable yield. This is leveraged because you get the yield from the full principal amount while only paying the market price of the yield stream.
    *   **Selling YT (after depositing):** Allows getting upfront cash for future yield, effectively locking in a yield rate based on the sale price.
*   **Risks:** Smart contract risk, underlying yield-bearing asset risk (e.g., de-pegging of stETH), AMM liquidity risk, complexity in understanding implied yields and market dynamics.
*   **Use Cases:** Locking in fixed yields on DeFi assets, speculating on future yields, creating structured products based on yield streams, managing yield duration.

## 3. Decentralized Prediction Markets

*   **Concept:** Platforms allowing users to bet on the outcome of future events (e.g., election results, price targets, sports results) by trading outcome-specific tokens.
*   **Mechanism (Example Protocols: Augur, GnosisDAO/Omen, Polymarket):**
    *   **Market Creation:** A market is created for a specific event with mutually exclusive outcomes (e.g., "Will ETH price be above $4000 on Dec 31st?" - Outcomes: YES, NO).
    *   **Outcome Tokens:** For each outcome, a specific token is created (e.g., YES-TOKEN, NO-TOKEN). A complete set of outcome tokens (one for each possible outcome) always sums to a total value of $1 (or equivalent stable unit) upon settlement.
    *   **Trading:** Users buy and sell these outcome tokens on an AMM or order book. The price of an outcome token reflects the market's perceived probability of that outcome occurring. A YES-TOKEN trading at $0.70 implies a 70% market probability for the YES outcome.
    *   **Settlement:** After the event occurs, a designated oracle or decentralized resolution process determines the true outcome.
    *   Holders of the token corresponding to the *correct* outcome can redeem each token for $1.
    *   Holders of tokens corresponding to *incorrect* outcomes receive $0.
*   **As Derivatives:** Prediction markets are essentially binary options (or scalar options for range markets) where the payoff is fixed ($1 or $0), and the price reflects the probability (similar to Delta, but more direct).
*   **Risks:** Oracle/Resolution risk (disputes, incorrect outcomes), smart contract risk, regulatory risk (often viewed as gambling in some jurisdictions), liquidity risk, UI/UX complexity.
*   **Use Cases:** Information aggregation (wisdom of the crowd), hedging real-world risks, speculation, creating conditional outcomes (e.g., insurance-like products).

*(End of DeFi-Specific Derivatives Section)* 