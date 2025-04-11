import React from 'react';
import OptionPayoffChart, { OptionStrategyType } from './OptionPayoffChart';

interface PayoffDiagramReplacerProps {
  children: string;
}

// Helper to parse parameters (simple example)
interface DiagramParams {
  strike?: number;
  strike2?: number;
  strike3?: number;
  strike4?: number;
}

function parseDiagramParameters(content: string): DiagramParams {
  const params: DiagramParams = {};
  
  // Find the STRATEGY line and split at the delimiter
  const strategyLineMatch = content.match(/^STRATEGY:(.*)::(.*)$/m);
  if (!strategyLineMatch || !strategyLineMatch[2]) {
    console.log("[PayoffDiagramReplacer] No params found after :: delimiter.");
    return params; // No strategy line or no params part found
  }
  
  const paramsPart = strategyLineMatch[2]; // Get the part after ::

  // Function to extract a specific parameter value from the params part
  const getParam = (key: string): number | undefined => {
    const regex = new RegExp(`${key}=(\d*\.?\d+)`, 'i'); 
    const match = paramsPart.match(regex);
    return match && match[1] ? parseFloat(match[1]) : undefined;
  };

  // Extract parameters
  params.strike = getParam('K');
  params.strike2 = getParam('K2');
  params.strike3 = getParam('K3');
  params.strike4 = getParam('K4');
  
  // Handle K1 specifically - if K exists but K1 doesn't, use K as K1.
  const k1 = getParam('K1');
  if (k1 !== undefined) {
    params.strike = k1;
  } else if (params.strike !== undefined) {
    // K was found, but not K1, so use K as the primary/K1 strike.
  } else {
    // Neither K nor K1 found, remove strike.
    delete params.strike;
  }

  // Extract other potential params (add more as needed)
  // params.premium = getParam('PREMIUM'); // Not directly used by chart logic yet
  // params.yield = getParam('YIELD'); // Needs chart logic update
  // params.part_rate = getParam('PART_RATE'); // Needs chart logic update
  // params.init_price = getParam('INIT_PRICE'); // Needs chart logic update

  console.log(`[PayoffDiagramReplacer] Parsed Params:`, params); // DEBUG LOG
  return params;
}

const PayoffDiagramReplacer: React.FC<PayoffDiagramReplacerProps> = ({ children }) => {

  // Detect diagram type based *primarily* on the STRATEGY: marker before ::
  const detectDiagramType = (content: string): OptionStrategyType | null => {
    // Regex matches 'STRATEGY:', captures the name part before ::
    const strategyMatch = content.match(/^STRATEGY:\s*(.*?)\s*::/m);
    
    if (strategyMatch && strategyMatch[1]) {
      const extractedStrategy = strategyMatch[1].trim();
      const strategyKey = extractedStrategy.toLowerCase();
      
      // Check structured product strategies first
      if (strategyKey === 'dual_currency') return 'dual_currency';
      if (strategyKey === 'principal_protected') return 'principal_protected';
      if (strategyKey === 'covered_call') return 'covered_call';
      if (strategyKey === 'cash_secured_put') return 'cash_secured_put';
      // Correct key for Iron Condor (allow space)
      if (strategyKey === 'iron condor') return 'iron_condor'; 

      // Check standard option strategies (use spaces to match options.md)
      if (strategyKey === 'long call') return 'long-call';
      if (strategyKey === 'long put') return 'long-put';
      if (strategyKey === 'short call') return 'short-call'; // Assuming short call/put might exist or be added
      if (strategyKey === 'short put') return 'short-put'; // Assuming short call/put might exist or be added
      if (strategyKey === 'long straddle') return 'long-straddle';
      if (strategyKey === 'bull call spread') return 'bull-call-spread';
      if (strategyKey === 'bear put spread') return 'bear-put-spread';

      console.warn(`[PayoffDiagramReplacer] Unknown strategy marker key: ${strategyKey}`);
      return null; // Unknown strategy marker
    }

    // Fallback if no STRATEGY marker (less reliable)
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('bull call spread')) return 'bull-call-spread'; // Example fallback

    return null; // Could not determine type
  };

  const diagramType = detectDiagramType(children);
  const diagramParams = parseDiagramParameters(children);

  if (diagramType) {
    // Use parsed params or defaults
    const strikePrice = diagramParams.strike || 100;
    const premium = 10; // Keep premium default for now
    
    return (
      <div className="my-6">
        <OptionPayoffChart 
          strategyType={diagramType} 
          // Pass parsed params to the chart component
          strikePrice={strikePrice}
          strikePrice2={diagramParams.strike2}
          strikePrice3={diagramParams.strike3}
          strikePrice4={diagramParams.strike4}
          premium={premium}
          height={300}
        />
      </div>
    );
  }

  // If type couldn't be determined, return original content as fallback
  return <pre className="bg-gray-800 text-white p-2 rounded text-xs font-mono overflow-x-auto">{children}</pre>; 
};

export default PayoffDiagramReplacer; 