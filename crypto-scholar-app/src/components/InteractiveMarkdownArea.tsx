'use client';

import React, { useState, useRef, useCallback } from 'react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { useAnnotations } from '@/hooks/useAnnotations';

interface InteractiveMarkdownAreaProps {
  content: string;
  slug: string;
}

export default function InteractiveMarkdownArea({ content, slug }: InteractiveMarkdownAreaProps) {
  const [selectedText, setSelectedText] = useState<string>('');
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

    if (text && selection && containerRef.current && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (containerRef.current.contains(range.commonAncestorContainer)) {
            setSelectedText(text);
            return;
        }
    }
    setSelectedText('');

  }, []);

  return (
    <div ref={containerRef} onMouseUp={handleMouseUp}>
      {isHydrated && selectedText && (
        <div className="my-2 p-2 border rounded bg-secondary flex items-center justify-between sticky top-[var(--header-height)] z-10">
          <p className="text-sm text-secondary-foreground italic mr-2 truncate">Selected: &quot;{selectedText}&quot;</p>
          <Button size="sm" onClick={handleHighlight}>
            Highlight
          </Button>
        </div>
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