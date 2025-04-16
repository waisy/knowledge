'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import HighlightedMarkdownRenderer from '@/components/HighlightedMarkdownRenderer';
import { Button } from '@/components/ui/button';
import { useAnnotations } from '@/hooks/useAnnotations';
import { Popover } from 'react-tiny-popover';

interface InteractiveMarkdownAreaProps {
  content: string;
  slug: string;
}

export default function InteractiveMarkdownArea({ content, slug }: InteractiveMarkdownAreaProps) {
  const [selectedText, setSelectedText] = useState<string>('');
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isSelectedTextHighlighted, setIsSelectedTextHighlighted] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isNarrowMode, setIsNarrowMode] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addAnnotation, getAnnotationsForSlug, removeAnnotation, isHydrated } = useAnnotations();
  const currentAnnotations = getAnnotationsForSlug(slug);

  // Load reading mode preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('cryptoScholarReadingMode');
      if (savedMode === 'narrow') {
        setIsNarrowMode(true);
      }
    }
  }, []);

  const handleHighlight = useCallback(() => {
    if (!selectedText || !isHydrated) {
      console.log('Cannot highlight: selectedText empty or not hydrated', { selectedText, isHydrated });
      return;
    }
    
    console.log(`Saving highlight for slug '${slug}':`, selectedText);
    
    try {
      // Get current selection to extract context
      const selection = window.getSelection();
      let contextBefore = '';
      let contextAfter = '';
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Create temporary elements to get the context before and after
        // even when the selection spans multiple elements
        const fullContent = containerRef.current?.textContent || '';
        const selectionText = selection.toString().trim();
        
        // Find the selected text in the full content
        const selectionIndex = fullContent.indexOf(selectionText);
        if (selectionIndex >= 0) {
          // Get up to 20 chars of context
          const contextBeforeStart = Math.max(0, selectionIndex - 20);
          contextBefore = fullContent.substring(contextBeforeStart, selectionIndex);
          
          const selectionEnd = selectionIndex + selectionText.length;
          const contextAfterEnd = Math.min(fullContent.length, selectionEnd + 20);
          contextAfter = fullContent.substring(selectionEnd, contextAfterEnd);
          
          console.log('Context extracted from full content:');
          console.log('Before:', contextBefore);
          console.log('Selection:', selectionText);
          console.log('After:', contextAfter);
        } else {
          // Fallback to basic method if we can't find the text in full content
          try {
            // Get context before
            const beforeRange = range.cloneRange();
            beforeRange.collapse(true); // Collapse to start
            beforeRange.setStart(containerRef.current || document.body, 0);
            const beforeContext = beforeRange.toString();
            contextBefore = beforeContext.substring(Math.max(0, beforeContext.length - 20));
            
            // Get context after
            const afterRange = range.cloneRange();
            afterRange.collapse(false); // Collapse to end
            afterRange.setEndAfter(containerRef.current || document.body);
            const afterContext = afterRange.toString();
            contextAfter = afterContext.substring(0, Math.min(afterContext.length, 20));
          } catch (e) {
            console.error('Error getting context using range method:', e);
          }
        }
      }
      
      console.log('Context before:', contextBefore);
      console.log('Context after:', contextAfter);
      
      // Add the annotation with context
      addAnnotation(slug, selectedText, contextBefore, contextAfter);
      
      console.log('Successfully highlighted:', selectedText);
      console.log('Current annotations after adding:', getAnnotationsForSlug(slug));
      
      // Force UI update by toggling a state
      setIsSelectedTextHighlighted(true);
      
      // Small delay before closing popover for better UX
      setTimeout(() => {
        // Clear selection and close popover
        setSelectedText('');
        setIsPopoverOpen(false);
        window.getSelection()?.removeAllRanges();
      }, 500);
    } catch (error) {
      console.error('Error adding highlight:', error);
    }
  }, [selectedText, slug, addAnnotation, isHydrated, getAnnotationsForSlug]);

  // Calculate position that works better for scrolling
  const getPopoverPosition = useCallback((rect: DOMRect) => {
    return {
      // Position well above the top of the selection (100px)
      top: rect.top - 100,
      // Center horizontally on selection
      left: rect.left + rect.width / 2,
    };
  }, []);

  const handleMouseUp = useCallback(() => {
    // Use setTimeout to ensure selection is complete
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount || selection.isCollapsed) {
        console.log('[handleMouseUp] No valid selection');
        setSelectedText('');
        setIsPopoverOpen(false);
        return;
      }

      const range = selection.getRangeAt(0);
      
      // Check if selection is inside our container
      if (!containerRef.current || !containerRef.current.contains(range.commonAncestorContainer)) {
        console.log('[handleMouseUp] Selection outside container');
        setSelectedText('');
        setIsPopoverOpen(false);
        return;
      }
      
      // Extract the selected text, handling cross-element selection
      let selectedContent = '';
      
      // Handle complex selections that span multiple DOM nodes
      if (range.startContainer !== range.endContainer) {
        console.log('[handleMouseUp] Cross-element selection detected');
        
        // Create a temporary div to hold the selection
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(range.cloneContents());
        
        // Get the text content of the selection
        selectedContent = tempDiv.textContent || '';
      } else {
        // Simple selection within a single text node
        selectedContent = range.toString();
      }
      
      // Clean up and trim the selected text
      const text = selectedContent.trim();
      console.log('[handleMouseUp] Detected text:', text || 'none');

      if (text) {
        console.log('[handleMouseUp] Selection is inside container.');
        setSelectedText(text);
        
        // Check if already highlighted
        const isAlreadyHighlighted = currentAnnotations.some(ann => ann.text === text);
        setIsSelectedTextHighlighted(isAlreadyHighlighted);
        console.log('[handleMouseUp] isAlreadyHighlighted:', isAlreadyHighlighted);
        
        // Get position of selected text
        const rect = range.getBoundingClientRect();
        
        // Use the new positioning function
        const position = getPopoverPosition(rect);
        console.log('[handleMouseUp] Setting position:', position);
        setPopoverPosition(position);
        setIsPopoverOpen(true); 
        console.log('[handleMouseUp] Setting isPopoverOpen: true');
        return;
      }

      // If no valid selection or outside container
      console.log('[handleMouseUp] Clearing selection and closing popover.');
      setSelectedText('');
      setIsPopoverOpen(false); // Ensure popover closes if selection is invalid
      setIsSelectedTextHighlighted(false);
    }, 10); // Small timeout to ensure selection is complete
  }, [currentAnnotations, getPopoverPosition]);

  // Add click outside handler
  useEffect(() => {
    if (!isPopoverOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const popoverElement = document.querySelector('.highlight-popover');
      if (popoverElement && !popoverElement.contains(e.target as Node) && 
          containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
        setSelectedText('');
        setIsSelectedTextHighlighted(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopoverOpen]);

  // Close popover on scroll
  useEffect(() => {
    if (!isPopoverOpen) return;
    
    const handleScroll = () => {
      setIsPopoverOpen(false);
      setSelectedText('');
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isPopoverOpen]);

  // Add global key handler for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPopoverOpen(false);
        setSelectedText('');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Ensure UI updates when annotations change
  useEffect(() => {
    console.log('Current annotations for slug changed:', currentAnnotations);
  }, [currentAnnotations]);

  // Add function to clear all annotations for the current slug
  const handleClearAllAnnotations = useCallback(() => {
    if (!isHydrated || currentAnnotations.length === 0) return;
    
    // Ask for confirmation
    if (window.confirm('Are you sure you want to remove all highlights from this page?')) {
      // Remove each annotation one by one
      [...currentAnnotations].forEach(ann => {
        removeAnnotation(slug, ann.id);
      });
      console.log('Cleared all annotations for slug:', slug);
    }
  }, [currentAnnotations, removeAnnotation, slug, isHydrated]);

  // Toggle between wide and narrow reading modes
  const toggleReadingMode = useCallback(() => {
    setIsNarrowMode(prev => {
      const newMode = !prev;
      // Save preference to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cryptoScholarReadingMode', newMode ? 'narrow' : 'wide');
      }
      return newMode;
    });
  }, []);

  return (
    <div className="relative flex">
      {/* Main content area */}
      <div 
        ref={containerRef} 
        onMouseUp={handleMouseUp} 
        className={`relative flex-grow transition-all duration-300 ease-in-out ${isNarrowMode ? 'max-w-2xl mx-auto px-4' : ''}`}
      >
        {/* Reading mode toggle */}
        <div className="fixed top-4 left-6 z-40">
          <button 
            onClick={toggleReadingMode}
            className="flex items-center justify-center p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-full shadow-md transition-colors border border-gray-200"
            title={isNarrowMode ? "Switch to wide mode" : "Switch to narrow mode"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isNarrowMode ? "hidden" : ""}>
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <rect x="9" y="4" width="6" height="16" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isNarrowMode ? "" : "hidden"}>
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </button>
        </div>

        {isPopoverOpen && isHydrated && (
          <div 
            className="highlight-popover"
            style={{
              position: 'fixed',
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
              transform: 'translateX(-50%)',
              zIndex: 9999,
              backgroundColor: 'white',
              padding: '10px',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              border: '2px solid #FFD700', // Gold border
              minWidth: '200px',
              pointerEvents: 'auto',
            }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Highlight button clicked');
                handleHighlight();
              }} 
              disabled={isSelectedTextHighlighted}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 font-bold text-gray-900 bg-yellow-300 hover:bg-yellow-400 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xl">✨</span>
              <span>
                {isSelectedTextHighlighted ? 'Already Highlighted' : 'Highlight Selection'}
              </span>
            </button>
          </div>
        )}

        <div className={`${isNarrowMode ? 'prose prose-lg mx-auto' : ''}`}>
          <HighlightedMarkdownRenderer 
            content={content} 
            annotations={currentAnnotations}
            onRemoveAnnotation={(annotationId) => removeAnnotation(slug, annotationId)}
          />
        </div>

        {/* Highlights toggle button - visible only when there are highlights */}
        {isHydrated && currentAnnotations.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center justify-center p-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full shadow-lg transition-colors"
              title={sidebarOpen ? "Hide highlights" : "Show highlights"}
            >
              <span className="text-xl">✨</span>
              <span className="ml-2 mr-1">{currentAnnotations.length}</span>
            </button>
          </div>
        )}

        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px) translateX(-50%); }
            to { opacity: 1; transform: translateY(0) translateX(-50%); }
          }

          .highlight-popover {
            animation: fadeIn 0.3s ease-out forwards;
          }

          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }

          @keyframes slideOut {
            from { transform: translateX(0); }
            to { transform: translateX(100%); }
          }

          .sidebar-open {
            animation: slideIn 0.3s ease-out forwards;
          }

          .sidebar-closed {
            animation: slideOut 0.3s ease-out forwards;
          }
        `}</style>
      </div>

      {/* Highlights sidebar */}
      {isHydrated && currentAnnotations.length > 0 && sidebarOpen && (
        <div className={`fixed top-0 right-0 w-80 h-full bg-white border-l border-gray-200 shadow-xl z-40 overflow-y-auto sidebar-open p-4`}>
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h3 className="font-semibold text-lg">Your Highlights</h3>
            <div className="flex">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-500 hover:text-gray-700 mr-2"
                onClick={() => setSidebarOpen(false)}
              >
                Close
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs text-red-500 hover:text-red-700 border-red-300 hover:border-red-500"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClearAllAnnotations();
                }}
              >
                Clear All
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {currentAnnotations.map(ann => (
              <div 
                key={ann.id} 
                className="p-3 bg-yellow-50 border border-yellow-300 rounded-md flex justify-between items-center"
              >
                <p className="italic text-sm flex-1">&quot;{ann.text}&quot;</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-red-500 hover:text-red-700 p-1 h-auto ml-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Remove button clicked for highlight:', ann.id);
                    removeAnnotation(slug, ann.id);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 