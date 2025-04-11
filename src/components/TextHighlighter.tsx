'use client';

import { useState, useEffect, useCallback, useRef, type ReactNode, Children, cloneElement, isValidElement } from 'react';
import HighlightableMarkdown from './HighlightableMarkdown';

interface TextHighlighterProps {
  children: ReactNode;
}

interface Highlight {
  id: string;
  text: string;
  color: string;
  pageUrl: string;
}

export default function TextHighlighter({ children }: TextHighlighterProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [activeColor, setActiveColor] = useState('#ffff00'); // Default yellow
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Colors available for highlighting
  const highlightColors = [
    { name: 'Yellow', value: '#ffff00' },
    { name: 'Green', value: '#90ee90' },
    { name: 'Blue', value: '#add8e6' },
    { name: 'Pink', value: '#ffb6c1' },
  ];

  // Load highlights from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedHighlights = localStorage.getItem('highlights');
      if (savedHighlights) {
        setHighlights(JSON.parse(savedHighlights));
      }
    } catch (error) {
      console.error('Error loading highlights:', error);
    }
  }, []);

  // Save highlights to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('highlights', JSON.stringify(highlights));
    } catch (error) {
      console.error('Error saving highlights:', error);
    }
  }, [highlights]);

  // Get current page URL for storing with highlights
  const getCurrentPageUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    return window.location.pathname;
  }, []);

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    if (!isHighlightMode || typeof window === 'undefined') return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    
    const selectedText = selection.toString().trim();
    if (!selectedText) return;
    
    console.log('Selection detected:', selectedText);
    
    // Create new highlight
    const newHighlight = {
      id: Date.now().toString(),
      text: selectedText,
      color: activeColor,
      pageUrl: getCurrentPageUrl(),
    };
    
    // Update highlights state
    setHighlights(prev => {
      const updated = [...prev, newHighlight];
      console.log('Updated highlights:', updated);
      // Save to localStorage immediately for debugging
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('highlights', JSON.stringify(updated));
        } catch (error) {
          console.error('Error saving highlights:', error);
        }
      }
      return updated;
    });
    
    // Clear selection
    selection.removeAllRanges();
  }, [isHighlightMode, activeColor, getCurrentPageUrl]);
  
  // Add mouseup event listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleMouseUp = (e: MouseEvent) => {
      // Only process if we're in highlight mode
      if (!isHighlightMode) return;
      
      // Add a delay to ensure selection is complete
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;
        
        const selectedText = selection.toString().trim();
        if (!selectedText) return;
        
        console.log('MouseUp selection detected:', selectedText);
        
        // Create new highlight
        const newHighlight = {
          id: Date.now().toString(),
          text: selectedText,
          color: activeColor,
          pageUrl: getCurrentPageUrl(),
        };
        
        // Update highlights state directly instead of using handleTextSelection
        setHighlights(prev => {
          const updated = [...prev, newHighlight];
          console.log('Updated highlights from mouseup:', updated);
          return updated;
        });
        
        // Clear selection
        selection.removeAllRanges();
      }, 50); // Increased timeout for better reliability
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isHighlightMode, activeColor, getCurrentPageUrl]);
  
  // Toggle highlight mode
  const toggleHighlightMode = () => {
    setIsHighlightMode(!isHighlightMode);
  };

  // Remove a highlight
  const removeHighlight = (id: string) => {
    setHighlights(highlights.filter(h => h.id !== id));
  };
  
  // Get current page highlights
  const currentPageHighlights = highlights.filter(
    h => h.pageUrl === getCurrentPageUrl() || h.pageUrl === ''
  );
  
  // Inject highlights into HighlightableMarkdown child if present
  const childrenWithHighlights = Children.map(children, child => {
    if (isValidElement(child)) {
      console.log('Child element type:', child.type.name || 'Unknown');
      
      // Check if it's any component that accepts highlights
      if (
        // By component name
        (child.type.name === 'HighlightableMarkdown') ||
        // Check if the child accepts a highlights prop
        (isValidElement(child) && 'highlights' in child.props)
      ) {
        console.log('Cloning HighlightableMarkdown with highlights:', currentPageHighlights.length);
        return cloneElement(child, {
          highlights: currentPageHighlights
        });
      }
    }
    return child;
  });

  return (
    <div className="relative">
      {/* Highlight Controls */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-2 mb-4 border-b border-gray-200 dark:border-gray-700 flex items-center flex-wrap gap-2">
        <button
          onClick={toggleHighlightMode}
          className={`px-3 py-1 rounded text-sm font-medium ${
            isHighlightMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          {isHighlightMode ? 'Highlighting On' : 'Highlight Text'}
        </button>
        
        {isHighlightMode && (
          <div className="flex gap-1">
            {highlightColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setActiveColor(color.value)}
                className={`w-6 h-6 rounded-full border ${
                  activeColor === color.value ? 'border-black dark:border-white ring-2 ring-blue-500' : 'border-gray-400'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="content-container" ref={contentRef}>
        {childrenWithHighlights}
      </div>

      {/* Highlights List */}
      {currentPageHighlights.length > 0 && (
        <div className="mt-8 p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
          <h3 className="font-medium text-lg mb-2">Your Highlights</h3>
          <ul className="space-y-2">
            {currentPageHighlights.map((highlight) => (
              <li 
                key={highlight.id} 
                className="flex items-start gap-2 p-2 rounded"
                style={{ backgroundColor: `${highlight.color}40` }}
              >
                <span 
                  className="inline-block w-3 h-3 rounded-full mt-1.5"
                  style={{ backgroundColor: highlight.color }}
                ></span>
                <p className="flex-1">{highlight.text}</p>
                <button 
                  onClick={() => removeHighlight(highlight.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 