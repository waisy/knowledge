'use client';

import React, { useState, useRef, useCallback } from 'react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { addAnnotation, getAnnotationsForSlug, removeAnnotation, isHydrated } = useAnnotations();
  const currentAnnotations = getAnnotationsForSlug(slug);

  const handleHighlight = useCallback(() => {
    if (!selectedText || !isHydrated) return;
    console.log(`Saving highlight for slug '${slug}':`, selectedText);
    
    addAnnotation(slug, selectedText);

    setSelectedText('');
    window.getSelection()?.removeAllRanges();
  }, [selectedText, slug, addAnnotation, isHydrated]);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';
    console.log('[handleMouseUp] Detected text:', text || 'none');

    if (text && selection && containerRef.current && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (containerRef.current.contains(range.commonAncestorContainer)) {
            console.log('[handleMouseUp] Selection is inside container.');
            setSelectedText(text);
            // Check if already highlighted
            const isAlreadyHighlighted = currentAnnotations.some(ann => ann.text === text);
            setIsSelectedTextHighlighted(isAlreadyHighlighted);
            console.log('[handleMouseUp] isAlreadyHighlighted:', isAlreadyHighlighted);
            const rect = range.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            // Log the raw rectangles
            console.log('[handleMouseUp] Selection Rect:', JSON.stringify(rect));
            console.log('[handleMouseUp] Container Rect:', JSON.stringify(containerRect));
            const calculatedPosition = {
              top: rect.bottom - containerRect.top,
              left: rect.left - containerRect.left + rect.width / 2,
            };
            setPopoverPosition(calculatedPosition);
            console.log('[handleMouseUp] Setting position:', calculatedPosition); // Log calculated position

            // --- Temporarily log parent styles for debugging --- 
            let parent = containerRef.current.parentElement;
            console.log('[DEBUG] Checking parent styles...');
            for (let i = 0; i < 5 && parent; i++) { // Check up to 5 parents
              const computedStyle = window.getComputedStyle(parent);
              console.log(`[DEBUG] Parent ${i + 1}:`, {
                tagName: parent.tagName,
                id: parent.id,
                className: parent.className,
                overflow: computedStyle.overflow,
                position: computedStyle.position,
                display: computedStyle.display,
                zIndex: computedStyle.zIndex,
              });
              parent = parent.parentElement;
            }
            // --- End debug logging --- 

            setIsPopoverOpen(true); 
            console.log('[handleMouseUp] Setting isPopoverOpen: true');
            return;
        }
    }
    // If no valid selection or outside container
    console.log('[handleMouseUp] Clearing selection and closing popover.');
    setSelectedText('');
    setIsPopoverOpen(false); // Ensure popover closes if selection is invalid
    setIsSelectedTextHighlighted(false);

  }, [currentAnnotations]); // Add currentAnnotations dependency

  return (
    <div ref={containerRef} onMouseUp={handleMouseUp} className="relative">
      {isPopoverOpen && isHydrated && (
        <Popover
          isOpen={true}
          positions={['top', 'bottom']}
          padding={8}
          onClickOutside={() => {
            setIsPopoverOpen(false);
            setSelectedText('');
            setIsSelectedTextHighlighted(false);
          }}
          containerClassName="z-50"
          content={(
            <div className="p-2 bg-background border rounded shadow-lg">
              Test Popover
            </div>
          )}
        >
          <span
            style={{
              position: 'absolute',
              top: '0px',
              left: '0px',
              transform: 'none',
              width: '20px',
              height: '20px',
              backgroundColor: 'red',
              zIndex: 100,
            }}
          />
        </Popover>
      )}

      <MarkdownRenderer content={content} />

      {isHydrated && currentAnnotations.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold mb-2">Highlights:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {currentAnnotations.map(ann => (
              <li key={ann.id} className="text-sm italic flex justify-between items-center">
                <span>&quot;{ann.text}&quot;</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-red-500 hover:text-red-700 p-1 h-auto"
                  onClick={() => removeAnnotation(slug, ann.id)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 