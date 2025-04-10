## Project Context: Crypto Knowledge Base

**Goal:** Create a comprehensive and highly detailed knowledge base about crypto products using markdown files. The target audience is experienced users, requiring in-depth explanations, mathematical formulas, specific examples, and discussion of nuances. Each file should eventually contain significantly more than 10-15 minutes worth of content, focusing on depth.

**Current Status:**
*   A `README.md` file outlines the project structure.
*   A `products/` directory contains markdown files for key crypto derivative/product types.
*   An initial population of each file was completed, covering core concepts.
*   A second pass enhanced each file with more details, including:
    *   `perpetuals.md`: Added Mark Price variations (Impact Price), detailed Funding Rate components (Interest Rate, Premium Index w/ TWAP, Clamping), precise Liquidation Price formulas, tiered margin examples, detailed Insurance Fund dynamics, and ADL ranking math.
    *   `futures.md`: Added theoretical pricing formula (e^(r-q)T), detailed basis trading strategies (cash-and-carry), term structure discussion, and comparison of inverse vs. linear contracts with PnL formulas.
    *   `options.md`: Added BSM formulas, Greek calculation formulas (Delta, Gamma, Vega, Theta, Rho), mention of second-order Greeks, and conceptual payoff diagrams.
    *   `leveraged_tokens.md`: Added numerical examples of volatility drag (choppy vs. trending) and a more precise NAV calculation derivation including funding/fees.
    *   `structured_products.md`: Added payoff formulas and conceptual diagrams for Dual Currency, PPNs, Covered Calls/Put Selling, and Range (Iron Condor) products.
    *   `synthetic_assets.md`: Added detailed C-Ratio definition, mathematical example of dynamic debt pool share changes, and more detailed liquidation trigger/process explanation.
    *   `defi_derivatives.md`: Added conceptual discussion of IRS AMM math (YieldSpace-like) and formulas/example for calculating implied yield from Principal Tokens in yield stripping.

**Files Created:**
*   `README.md`
*   `products/perpetuals.md`
*   `products/futures.md`
*   `products/options.md`
*   `products/leveraged_tokens.md`
*   `products/structured_products.md`
*   `products/synthetic_assets.md`
*   `products/defi_derivatives.md`
*   `PROJECT_CONTEXT.md` (This file)

**Next Steps / Areas for Further Detail:**
*   **Even Deeper Math:** Derive formulas previously stated (e.g., Greeks from BSM), add proofs where relevant, explore more complex variations (e.g., different option pricing models like Binomial, specific IRS AMM curves).
*   **Protocol Specifics:** Discuss how specific exchanges (e.g., Binance, Deribit, dYdX) or DeFi protocols (e.g., Synthetix V2/V3, Pendle specific AMMs) implement these concepts, highlighting differences.
*   **Advanced Risk Analysis:** Deeper dive into specific risks (e.g., Gamma scalping risks, advanced liquidation scenarios, oracle manipulation vectors, smart contract vulnerabilities in specific protocols).
*   **More Examples:** Add multi-step numerical examples for complex processes (e.g., full liquidation cascade including fees, detailed basis trade PnL accounting).
*   **New Topics:** Add files for other relevant concepts (e.g., Cross vs. Isolated Margin in detail, Portfolio Margin systems, specific DeFi Option Vault strategies, Basis Swaps, Volatility Swaps/Futures if applicable in crypto).
*   **Refinement:** Review existing content for clarity, accuracy, and consistency. Improve diagrams.

**User Request:** Continue enhancing the detail across all files, potentially focusing on [User specifies next focus area, e.g., "Protocol Specifics for Perpetuals" or "Advanced Option Strategies"]. 