# Futures Contracts (Crypto)

## Overview

Futures contracts are standardized agreements to buy or sell a specific underlying asset (like Bitcoin or Ethereum) at a predetermined price on a specific date in the future (the expiry or settlement date). Unlike perpetual swaps, traditional futures contracts have a defined lifespan.

In the crypto space, futures contracts allow traders to:
*   **Speculate:** Bet on the future price direction of a cryptocurrency without holding the actual coins.
*   **Hedge:** Protect existing crypto holdings against adverse price movements.
*   **Arbitrage:** Exploit price discrepancies between the futures market and the spot market (basis trading).

**Key Characteristics:**
*   **Underlying Asset:** The specific cryptocurrency (e.g., $BTC$, $ETH$).
*   **Contract Size:** The amount of the underlying asset represented by one contract (e.g., 1 $BTC$, 0.1 $BTC$, $100 worth of $BTC$).
*   **Expiry Date:** The specific date when the contract expires and settlement occurs (e.g., quarterly, monthly).
*   **Settlement Price:** The price at which the contract is settled upon expiry, usually derived from an **Index Price** representing the fair spot value. (See [Core Trading Mechanics > Index Price](../concepts/trading_mechanics.md#index-price-construction) for details).
*   **Leverage:** Futures are typically traded with leverage, magnifying potential gains and losses. (See [Core Trading Mechanics > Margin & Leverage](../concepts/trading_mechanics.md#margin-leverage)).
*   **Mark Price:** Used for calculating unrealized PnL and triggering liquidations before expiry. Derived from the Index Price.

## Settlement Types

Crypto futures contracts are primarily **cash-settled**, although physically-delivered contracts exist but are less common for retail traders.

*   **Cash-Settled Futures:**
    *   Upon expiry, no actual cryptocurrency changes hands.
    *   Instead, the difference between the contract entry price and the settlement price (based on the Index Price at expiry) is paid in cash (usually a stablecoin like $USDT$/$USDC$ or sometimes the base currency like $BTC$).
    *   Example: If you bought a $BTC$ quarterly future at \$60,000 and it settles at \$65,000, you receive \$5,000 in cash per contract.
    *   This is the dominant type due to its simplicity and avoidance of physical delivery complexities.
*   **Physically-Delivered Futures:**
    *   Upon expiry, the seller must deliver the actual underlying cryptocurrency, and the buyer must take delivery and pay the agreed price.
    *   More common in institutional markets or for commodities.
    *   Requires participants to have wallets and manage the transfer of the actual coins, adding logistical overhead.

## Pricing Concepts: Contango, Backwardation, Basis

The price of a futures contract often differs from the current spot price of the underlying asset. This difference is known as the **basis**.

$$
Basis = Futures Price - Spot Price
$$

The basis reflects the market's expectations and the cost of carry until expiry.

*   **Cost of Carry:** Includes factors like storage costs (less relevant for crypto), interest rates (cost of funding the position), and potential dividends (not applicable to most cryptos). For crypto futures, the dominant factor is often the interest rate or financing cost.

*   **Contango:**
    *   Occurs when $Futures Price > Spot Price$ (Positive Basis).
    *   The market is in contango when later-dated futures contracts trade at progressively higher prices than earlier-dated contracts or the spot price.
    *   Typically indicates that the market expects the spot price to rise, or that the cost of carry (e.g., financing costs to hold spot and short futures) is positive.
    *   This is common in bull markets.

*   **Backwardation:**
    *   Occurs when $Futures Price < Spot Price$ (Negative Basis).
    *   The market is in backwardation when later-dated futures contracts trade at progressively lower prices than earlier-dated contracts or the spot price.
    *   Typically indicates that the market expects the spot price to fall, or there is high demand for the underlying asset *now* (e.g., for staking or lending), potentially creating a negative cost of carry (convenience yield).
    *   Can occur in bear markets or periods of high immediate demand for the asset.

*   **Basis Trading:** Arbitrage strategy aiming to profit from the convergence of the futures price to the spot price as expiry approaches. A trader might buy spot and sell a contango future (positive carry) or sell spot and buy a backwardation future (negative carry), aiming to capture the basis.

**Theoretical Futures Price:**

In traditional finance, the theoretical price of a futures contract is often expressed as:
$$
F = S \cdot e^{(r-q)T}
$$

<details class="my-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
<summary class="list-item px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer font-semibold text-gray-800 dark:text-gray-200">
Details: Theoretical Price Inputs & Basis Trading Strategies
</summary>
<div class="p-4 border-t border-gray-200 dark:border-gray-700">

Where:
*   $F$ = Theoretical Futures Price
*   $S$ = Spot Price
*   $e$ = Base of natural logarithm ($\approx 2.718$)
*   $r$ = Risk-Free Interest Rate (annualized)
*   $q$ = Dividend Yield or Convenience Yield (annualized)
*   $T$ = Time to expiry (in years)

For crypto:
*   $r$ can represent the borrowing/lending rate of the quote currency (e.g., USD). Shorting futures implicitly means lending the quote currency.
*   $q$ can represent the borrowing/lending/staking rate of the base cryptocurrency (e.g., $BTC$). Being long futures implicitly means *not* holding the base asset and thus foregoing any yield ($q$) it might generate, but also avoiding borrowing costs if one were shorting spot.
*   If $(r-q) > 0$, the market is theoretically in Contango.
*   If $(r-q) < 0$, the market is theoretically in Backwardation.

**Basis Trading Strategies (Detailed):**

*   **Cash-and-Carry Arbitrage (Contango):** Exploits $Futures Price > \text{Theoretical Price}$.
    1.  Borrow Quote Currency (e.g., USD) at rate $r$.
    2.  Buy Spot Asset (e.g., $BTC$) at price $S$.
    3.  Simultaneously Sell Futures Contract at price $F$.
    4.  Hold until expiry $T$.
    5.  At expiry, the futures contract settles. Deliver the spot asset (if physical) or settle in cash. The futures sale locks in the price $F$.
    6.  Repay the borrowed quote currency plus interest.
    *   Profit $\approx F - S \cdot e^{rT}$ (Simplified, ignoring transaction costs, potential crypto yield $q$). If $F$ is sufficiently above $S \cdot e^{rT}$, this is a risk-free profit (in theory).
*   **Reverse Cash-and-Carry Arbitrage (Backwardation):** Exploits $Futures Price < \text{Theoretical Price}$.
    1.  Borrow Spot Asset (e.g., $BTC$) at rate $q$ (if possible, otherwise implies a convenience yield scenario).
    2.  Sell Spot Asset at price $S$.
    3.  Simultaneously Buy Futures Contract at price $F$.
    4.  Invest proceeds from spot sale in quote currency risk-free asset earning rate $r$.
    5.  Hold until expiry $T$.
    6.  At expiry, take delivery via the futures contract at price $F$.
    7.  Return the borrowed spot asset plus interest.
    *   Profit $\approx S \cdot e^{rT} - F$ (Simplified). If $F$ is sufficiently below $S \cdot e^{rT}$, this is profitable.
*   **Basis Convergence:** Basis ($F-S$) must converge to zero at expiry ($F-S \\to 0$). Basis traders profit by capturing this convergence. If basis is positive (contango), shorting the basis (short future, long spot) profits as $F$ falls towards $S$. If basis is negative (backwardation), longing the basis (long future, short spot) profits as $F$ rises towards $S$.

</div>
</details>

**Futures Term Structure:**
The relationship between futures prices and their expiration dates is the term structure.
*   **Contango Curve:** Upward sloping. Longer-dated futures have higher prices than shorter-dated futures and spot.
*   **Backwardation Curve:** Downward sloping. Longer-dated futures have lower prices than shorter-dated futures and spot.
*   **Flat Curve:** Prices are similar across expiries.
*   **Implications:** The shape of the curve reflects market expectations about future spot prices and cost of carry dynamics.

## Contract Variations

Beyond standard quarterly/monthly expiries, crypto futures have specific variations:

*   **Inverse Contracts (Coin-Margined):**
    *   **Margin Currency:** The base cryptocurrency (e.g., $BTC$ for a $BTC/USD$ contract).
    *   **Contract Size:** Typically denominated in USD (e.g., 1 contract = \$100).
    *   **PnL Calculation:** PnL is realized in the base cryptocurrency ($BTC$).
    *   **Non-Linear Payoff:** Because the margin and PnL are in the volatile base asset, the USD value of the PnL is non-linear with price changes. A \$1 price move results in a different USD profit/loss depending on the current $BTC/USD$ price.

        $$
        \text{Profit}_{\text{Long}} (\text{in Base}) = \text{Contract Size} \cdot \left( \frac{1}{Entry Price} - \frac{1}{Exit Price} \right)
        $$
        *(Correction: Original formula was slightly off for inverse contracts)*
    *   **Use Case:** Preferred by those holding the base asset and wanting to hedge or speculate using that asset as collateral directly.
*   **Linear Contracts (Stablecoin/USD-Margined):**
    *   **Margin Currency:** A stablecoin ($USDT$, $USDC$) or USD.
    *   **Contract Size:** Typically denominated in the base cryptocurrency (e.g., 1 contract = 1 $BTC$ or 0.1 $BTC$).
    *   **PnL Calculation:** PnL is realized in the quote currency ($stablecoin/USD$).
    *   **Linear Payoff:** The USD value of the PnL is linear with price changes. A \$1 price move results in a \$1 profit/loss per unit of the base asset held via the contract.
        $$
        \text{Profit}_{\text{Long}} (\text{in Quote}) = \text{Contract Size} \cdot (Exit Price - Entry Price)
        $$
    *   **Use Case:** Simpler PnL calculation, easier to manage risk in stable unit terms, preferred by those using stablecoins as primary collateral.

## Mark Price Calculation (Futures)

Similar to perpetuals, a **Mark Price** is used for futures contracts *before expiry* to determine unrealized PnL and check liquidation levels. It prevents manipulation based on the last traded price.

Since futures don't have a funding rate like perpetuals, the Mark Price calculation typically relies solely on the relevant **Index Price** (representing the fair spot value). (See [Core Trading Mechanics > Index Price](../concepts/trading_mechanics.md#index-price-construction)).

While the futures price will have a basis relative to the spot price (which decays towards zero as expiry approaches), many exchanges simply use the **Index Price** itself as the Mark Price for futures liquidations, especially as expiry nears, because the futures price is expected to converge naturally to the spot (index) price at settlement.

*   **Key Difference from Perps:** No continuous funding basis component in the Mark Price formula. The basis exists due to cost of carry but isn't actively managed via funding payments.

## Liquidation Mechanism (Futures)

Futures contracts traded with leverage are subject to liquidation *before their expiry date* if margin requirements are not met. The mechanism follows the same principles as for perpetual swaps:

1.  **Margin:** Positions require Initial Margin ($IM$) and Maintenance Margin ($MM$).
2.  **Monitoring:** The exchange monitors the Mark Price against the position's $MM$ level.
3.  **Trigger:** If $Position Equity < Maintenance Margin$, liquidation occurs.
4.  **Execution:** The Liquidation Engine attempts to close the position.
5.  **Waterfall:** Uses Trader's Margin -> Insurance Fund -> ADL to cover losses if needed.

For a detailed explanation of these components, please refer to the [Core Trading Mechanics](../concepts/trading_mechanics.md) document:
*   [Margin & Leverage](../concepts/trading_mechanics.md#margin-leverage)
*   [Liquidation Mechanism](../concepts/trading_mechanics.md#liquidation-mechanism)
*   [Insurance Fund](../concepts/trading_mechanics.md#insurance-fund)
*   [Auto-Deleveraging (ADL)](../concepts/trading_mechanics.md#auto-deleveraging-adl)

The key difference for futures is that this liquidation risk only exists *before* the expiry date. If a position is not liquidated, it will proceed to settlement at expiry based on the final Settlement Price (derived from the Index Price).

*(End of Futures Contracts Section)* 