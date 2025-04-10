import React from 'react';
import OptionPayoffChart, { OptionStrategyType } from './OptionPayoffChart';

interface PayoffDiagramReplacerProps {
  children: string;
}

const PayoffDiagramReplacer: React.FC<PayoffDiagramReplacerProps> = ({ children }) => {
  // Ultra-simplified detection based on clearly labeled strategies
  const detectDiagramType = (content: string): OptionStrategyType => {
    // Check for the explicit "STRATEGY:" marker we added
    const strategyMatch = content.match(/STRATEGY:\s*([A-Z_\s]+)/i);
    
    if (strategyMatch && strategyMatch[1]) {
      const strategy = strategyMatch[1].trim().toLowerCase();
      
      // Option strategies
      if (strategy.includes('long straddle')) return 'long-straddle';
      if (strategy.includes('bull call spread')) return 'bull-call-spread';
      if (strategy.includes('bear put spread')) return 'bear-put-spread';
      if (strategy.includes('long put') && !strategy.includes('long call')) return 'long-put';
      if (strategy.includes('long call')) return 'long-call';
      
      // Structured product strategies
      if (strategy.includes('dual_currency')) return 'dual_currency';
      if (strategy.includes('principal_protected')) return 'principal_protected';
      if (strategy.includes('covered_call')) return 'covered_call';
      if (strategy.includes('cash_secured_put')) return 'cash_secured_put';
      if (strategy.includes('iron_condor')) return 'iron_condor';
    }
    
    // Fallback detection for content without the marker
    const lowerContent = content.toLowerCase();
    
    // Check for option strategies
    if (lowerContent.includes('long straddle')) return 'long-straddle';
    if (lowerContent.includes('bull call spread')) return 'bull-call-spread';
    if (lowerContent.includes('bear put spread')) return 'bear-put-spread';
    if (lowerContent.includes('long put') && !lowerContent.includes('long call')) return 'long-put';
    if (lowerContent.includes('long call')) return 'long-call';
    
    // Check for structured product terms
    if (lowerContent.includes('dual currency')) return 'dual_currency';
    if (lowerContent.includes('principal protected')) return 'principal_protected';
    if (lowerContent.includes('covered call')) return 'covered_call';
    if (lowerContent.includes('cash secured put') || lowerContent.includes('cash-secured put')) return 'cash_secured_put';
    if (lowerContent.includes('iron condor')) return 'iron_condor';
    
    // Default case
    return 'long-call';
  };

  // Check if this looks like a payoff diagram
  const isPayoffDiagram = (content: string): boolean => {
    // First check if it has our explicit strategy marker
    if (content.includes('STRATEGY:')) return true;
    
    // Fall back to basic keyword detection
    const lowerContent = content.toLowerCase();
    
    // Common option terms
    const hasOptionTerms = 
      (lowerContent.includes('profit') || lowerContent.includes('payoff') || lowerContent.includes('value at expiry')) &&
      (lowerContent.includes('call') || lowerContent.includes('put') || lowerContent.includes('spot price'));
    
    // Structured product specific terms
    const hasStructuredTerms =
      lowerContent.includes('dual currency') ||
      lowerContent.includes('principal protected') ||
      lowerContent.includes('yield enhancement') ||
      lowerContent.includes('iron condor');
    
    return hasOptionTerms || hasStructuredTerms;
  };

  if (isPayoffDiagram(children)) {
    const diagramType = detectDiagramType(children);
    
    // Use default values for strike and premium
    const strikePrice = 100;
    const premium = 10;
    
    return (
      <div className="my-6">
        <OptionPayoffChart 
          strategyType={diagramType} 
          strikePrice={strikePrice}
          premium={premium}
          height={300}
        />
      </div>
    );
  }

  // If not a payoff diagram, return the original content
  return <>{children}</>;
};

export default PayoffDiagramReplacer; 