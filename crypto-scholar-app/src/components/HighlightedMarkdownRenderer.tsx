'use client';

import { useMemo } from 'react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import type { Annotation } from '@/hooks/useAnnotations';

interface HighlightedMarkdownRendererProps {
  content: string;
  annotations: Annotation[];
  onRemoveAnnotation?: (annotationId: string) => void;
}

export default function HighlightedMarkdownRenderer({ 
  content, 
  annotations,
  onRemoveAnnotation 
}: HighlightedMarkdownRendererProps) {
  // Apply highlights to content
  const highlightedContent = useMemo(() => {
    if (!annotations || annotations.length === 0) {
      return content;
    }
    
    // Sort annotations by length (longest first) to prevent highlighting issues
    const sortedAnnotations = [...annotations].sort((a, b) => 
      b.text.length - a.text.length
    );
    
    // Simple escape function for regex special characters
    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };
    
    // Start with the original content
    let processedContent = content;
    
    // Apply each highlight
    sortedAnnotations.forEach(annotation => {
      try {
        // If we have context, use it for precise highlighting
        if (annotation.contextBefore || annotation.contextAfter) {
          console.log(`Processing annotation with context: "${annotation.text}"`);
          
          // Create search pattern with context
          const beforePattern = annotation.contextBefore ? escapeRegExp(annotation.contextBefore) : '';
          const textPattern = escapeRegExp(annotation.text);
          const afterPattern = annotation.contextAfter ? escapeRegExp(annotation.contextAfter) : '';
          
          // The full pattern to search for (includes context)
          const fullPattern = `${beforePattern}(${textPattern})${afterPattern}`;
          
          console.log(`Search pattern: ${fullPattern}`);
          
          // Create a regex that matches the text with its context
          // We use non-global regex to just get the first match
          const regex = new RegExp(fullPattern);
          const match = processedContent.match(regex);
          
          if (match) {
            console.log(`Found match with context: ${match[0]}`);
            
            // The captured group (index 1) is the text to highlight
            const capturedText = match[1];
            const fullMatch = match[0];
            
            // Create the highlighted version (only highlight the text part, not the context)
            const highlightedVersion = fullMatch.replace(
              capturedText,
              `<span class="highlighted-text" data-annotation-id="${annotation.id}" style="background-color: #ffff9d; padding: 2px 0; border-radius: 2px; cursor: pointer;" title="Click to remove highlight">${capturedText}</span>`
            );
            
            // Replace just this specific instance
            processedContent = processedContent.replace(fullMatch, highlightedVersion);
          } else {
            console.log(`No match found with context for: ${annotation.text}`);
          }
        } else {
          // For older annotations without context, just highlight the first instance
          const regex = new RegExp(escapeRegExp(annotation.text));
          processedContent = processedContent.replace(
            regex, 
            `<span class="highlighted-text" data-annotation-id="${annotation.id}" style="background-color: #ffff9d; padding: 2px 0; border-radius: 2px; cursor: pointer;" title="Click to remove highlight">${annotation.text}</span>`
          );
        }
      } catch (error) {
        console.error(`Error processing annotation "${annotation.text}":`, error);
      }
    });
    
    return processedContent;
  }, [content, annotations]);

  // Add click handler for highlighted text removal
  const handleHighlightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onRemoveAnnotation) return;
    
    // Check if the clicked element has the data-annotation-id attribute
    const target = e.target as HTMLElement;
    if (target.classList.contains('highlighted-text')) {
      const annotationId = target.getAttribute('data-annotation-id');
      if (annotationId) {
        console.log('Removing highlight with ID:', annotationId);
        onRemoveAnnotation(annotationId);
      }
    }
  };

  return (
    <div className="highlighted-markdown" onClick={handleHighlightClick}>
      <MarkdownRenderer content={highlightedContent} />
      
      <style jsx global>{`
        .highlighted-text {
          background-color: #ffff9d;
          padding: 2px 0;
          border-radius: 2px;
          display: inline;
          transition: background-color 0.2s;
        }
        
        .highlighted-text:hover {
          background-color: #ffd700;
        }
      `}</style>
    </div>
  );
} 