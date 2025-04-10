# Futures Contracts (Crypto)

## Overview

Futures contracts are standardized agreements to buy or sell a specific underlying asset (like Bitcoin or Ethereum) at a predetermined price on a specific date in the future (the expiry or settlement date). Unlike perpetual swaps, traditional futures contracts have a defined lifespan.

In the crypto space, futures contracts allow traders to:
*   **Speculate:** Bet on the future price direction of a cryptocurrency without holding the actual coins.
*   **Hedge:** Protect existing crypto holdings against adverse price movements.
*   **Arbitrage:** Exploit price discrepancies between the futures market and the spot market (basis trading).

**Key Characteristics:**
*   **Underlying Asset:** The specific cryptocurrency (e.g., BTC, ETH).
*   **Contract Size:** The amount of the underlying asset represented by one contract (e.g., 1 BTC, 0.1 BTC, $100 worth of BTC).
*   **Expiry Date:** The specific date when the contract expires and settlement occurs (e.g., quarterly, monthly).
*   **Settlement Price:** The price at which the contract is settled upon expiry, usually derived from an index price similar to perpetuals.
*   **Leverage:** Futures are typically traded with leverage, magnifying potential gains and losses.
*   **Mark Price:** Used for calculating unrealized PnL and triggering liquidations before expiry. Calculated similarly to perpetuals but may use slightly different basis calculations as there's no funding rate.

## Settlement Types

Crypto futures contracts are primarily **cash-settled**, although physically-delivered contracts exist but are less common for retail traders.

*   **Cash-Settled Futures:**
    *   Upon expiry, no actual cryptocurrency changes hands.
    *   Instead, the difference between the contract entry price and the settlement price is paid in cash (usually a stablecoin like USDT/USDC or sometimes the base currency like BTC).
    *   Example: If you bought a BTC quarterly future at $60,000 and it settles at $65,000, you receive $5,000 in cash per contract.
    *   This is the dominant type due to its simplicity and avoidance of physical delivery complexities.
*   **Physically-Delivered Futures:**
    *   Upon expiry, the seller must deliver the actual underlying cryptocurrency, and the buyer must take delivery and pay the agreed price.
    *   More common in institutional markets or for commodities.
    *   Requires participants to have wallets and manage the transfer of the actual coins, adding logistical overhead.

## Pricing Concepts: Contango, Backwardation, Basis

The price of a futures contract often differs from the current spot price of the underlying asset. This difference is known as the **basis**.

\[ \text{Basis} = \text{Futures Price} - \text{Spot Price} \]

The basis reflects the market's expectations and the cost of carry until expiry.

*   **Cost of Carry:** Includes factors like storage costs (less relevant for crypto), interest rates (cost of funding the position), and potential dividends (not applicable to most cryptos). For crypto futures, the dominant factor is often the interest rate or financing cost.

*   **Contango:**
    *   Occurs when `Futures Price > Spot Price` (Positive Basis).
    *   The market is in contango when later-dated futures contracts trade at progressively higher prices than earlier-dated contracts or the spot price.
    *   Typically indicates that the market expects the spot price to rise, or that the cost of carry (e.g., financing costs to hold spot and short futures) is positive.
    *   This is common in bull markets.

*   **Backwardation:**
    *   Occurs when `Futures Price < Spot Price` (Negative Basis).
    *   The market is in backwardation when later-dated futures contracts trade at progressively lower prices than earlier-dated contracts or the spot price.
    *   Typically indicates that the market expects the spot price to fall, or there is high demand for the underlying asset *now* (e.g., for staking or lending), potentially creating a negative cost of carry (convenience yield).
    *   Can occur in bear markets or periods of high immediate demand for the asset.

*   **Basis Trading:** Arbitrage strategy aiming to profit from the convergence of the futures price to the spot price as expiry approaches. A trader might buy spot and sell a contango future (positive carry) or sell spot and buy a backwardation future (negative carry), aiming to capture the basis.

**Theoretical Futures Price:**

In traditional finance, the theoretical price of a futures contract is often expressed as:
\[ F = S \times e^{(r-q)T} \]
Where:
*   `F` = Theoretical Futures Price
*   `S` = Spot Price
*   `e` = Base of natural logarithm (≈ 2.718)
*   `r` = Risk-Free Interest Rate (annualized)
*   `q` = Dividend Yield or Convenience Yield (annualized)
*   `T` = Time to expiry (in years)

For crypto:
*   `r` can represent the borrowing/lending rate of the quote currency (e.g., USD). Shorting futures implicitly means lending the quote currency.
*   `q` can represent the borrowing/lending/staking rate of the base cryptocurrency (e.g., BTC). Being long futures implicitly means *not* holding the base asset and thus foregoing any yield (`q`) it might generate, but also avoiding borrowing costs if one were shorting spot.
*   If `(r-q) > 0`, the market is theoretically in Contango.
*   If `(r-q) < 0`, the market is theoretically in Backwardation.

**Basis Trading Strategies (Detailed):**

*   **Cash-and-Carry Arbitrage (Contango):** Exploits `Futures Price > Theoretical Price`.
    1.  Borrow Quote Currency (e.g., USD) at rate `r`.
    2.  Buy Spot Asset (e.g., BTC) at price `S`.
    3.  Simultaneously Sell Futures Contract at price `F`.
    4.  Hold until expiry `T`.
    5.  At expiry, the futures contract settles. Deliver the spot asset (if physical) or settle in cash. The futures sale locks in the price `F`.
    6.  Repay the borrowed quote currency plus interest.
    *   **Profit ≈ `F - S*e^(rT)`** (Simplified, ignoring transaction costs, potential crypto yield `q`). If `F` is sufficiently above `S*e^(rT)`, this is a risk-free profit (in theory).
*   **Reverse Cash-and-Carry Arbitrage (Backwardation):** Exploits `Futures Price < Theoretical Price`.
    1.  Borrow Spot Asset (e.g., BTC) at rate `q` (if possible, otherwise implies a convenience yield scenario).
    2.  Sell Spot Asset at price `S`.
    3.  Simultaneously Buy Futures Contract at price `F`.
    4.  Invest proceeds from spot sale in quote currency risk-free asset earning rate `r`.
    5.  Hold until expiry `T`.
    6.  At expiry, take delivery via the futures contract at price `F`.
    7.  Return the borrowed spot asset plus interest.
    *   **Profit ≈ `S*e^(rT) - F`** (Simplified). If `F` is sufficiently below `S*e^(rT)`, this is profitable.
*   **Basis Convergence:** Basis (`F-S`) must converge to zero at expiry. Basis traders profit by capturing this convergence. If basis is positive (contango), shorting the basis (short future, long spot) profits as `F` falls towards `S`. If basis is negative (backwardation), longing the basis (long future, short spot) profits as `F` rises towards `S`.

**Futures Term Structure:**

The relationship between futures prices and their expiration dates is the term structure.
*   **Contango Curve:** Upward sloping. Longer-dated futures have higher prices than shorter-dated futures and spot.
*   **Backwardation Curve:** Downward sloping. Longer-dated futures have lower prices than shorter-dated futures and spot.
*   **Flat Curve:** Prices are similar across expiries.
*   **Implications:** The shape of the curve reflects market expectations about future spot prices and cost of carry dynamics.

## Contract Variations

Beyond standard quarterly/monthly expiries, crypto futures have specific variations:

*   **Inverse Contracts (Coin-Margined):**
    *   **Margin Currency:** The base cryptocurrency (e.g., BTC for a BTC/USD contract).
    *   **Contract Size:** Typically denominated in USD (e.g., 1 contract = $100).
    *   **PnL Calculation:** PnL is realized in the base cryptocurrency (BTC).
    *   **Non-Linear Payoff:** Because the margin and PnL are in the volatile base asset, the USD value of the PnL is non-linear with price changes. A $1 price move results in a different USD profit/loss depending on the current BTC/USD price.
        *   Profit for Long = `Contract Size / Entry Price - Contract Size / Exit Price` (in Base Currency)
    *   **Use Case:** Preferred by those holding the base asset and wanting to hedge or speculate using that asset as collateral directly.
*   **Linear Contracts (Stablecoin/USD-Margined):**
    *   **Margin Currency:** A stablecoin (USDT, USDC) or USD.
    *   **Contract Size:** Typically denominated in the base cryptocurrency (e.g., 1 contract = 1 BTC or 0.1 BTC).
    *   **PnL Calculation:** PnL is realized in the quote currency (stablecoin/USD).
    *   **Linear Payoff:** The USD value of the PnL is linear with price changes. A $1 price move results in a $1 profit/loss per unit of the base asset held via the contract.
        *   Profit for Long = `Contract Size * (Exit Price - Entry Price)` (in Quote Currency)
    *   **Use Case:** Simpler PnL calculation, easier to manage risk in stable unit terms, preferred by those using stablecoins as primary collateral.

## Mark Price Calculation (Futures)

Similar to perpetuals, a Mark Price is used for futures contracts to determine unrealized PnL and liquidation levels. It prevents manipulation based on the last traded price.

Since futures don't have a funding rate, the Mark Price calculation typically relies solely on the relevant Index Price (representing the fair spot value) and potentially incorporates a measure of the remaining basis, which decays towards zero as the contract approaches expiry.

A simplified conceptual formula might be:
\[ \text{Mark Price} \approx \text{Index Price} + \text{Basis} \times \left( \frac{\text{Time Until Expiry}}{\text{Time From Issuance To Expiry}} \right) \]

However, many exchanges simply use the **Index Price** itself as the Mark Price for futures, especially as expiry nears, because the futures price is expected to converge naturally to the spot (index) price at settlement.

*   **Key Difference from Perps:** No continuous funding basis component derived from a funding rate. The basis exists but isn't actively managed via payments between longs and shorts.

## Liquidation Mechanisms (Futures)

The liquidation mechanism for futures is conceptually identical to that for perpetual swaps:
1.  **Margin:** Positions require Initial Margin (IM) to open and Maintenance Margin (MM) to maintain.
2.  **Monitoring:** The exchange monitors the Mark Price against the position's MM level.
3.  **Trigger:** If `Position Margin < Maintenance Margin`, liquidation occurs.
4.  **Execution:** The Liquidation Engine takes over, attempts to close the position in the market.
5.  **Insurance Fund:** Used if the position closes at a loss greater than the deposited margin (below bankruptcy price).
6.  **ADL:** Invoked if the Insurance Fund is depleted.

The main difference is that the position *will* eventually expire and settle if not liquidated or closed beforehand. The liquidation risk exists only *before* the expiry date.

*(End of Futures Contracts Section)* 