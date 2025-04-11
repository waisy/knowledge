'use client';

import { useEffect, useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface HighlightableMarkdownProps {
  content: string;
  highlights?: Array<{
    id: string;
    text: string;
    color: string;
  }>;
}

export default function HighlightableMarkdown({ 
  content, 
  highlights = [] 
}: HighlightableMarkdownProps) {
  const [processedContent, setProcessedContent] = useState(content);
  
  // Debug logging
  useEffect(() => {
    console.log('HighlightableMarkdown received highlights:', highlights);
  }, [highlights]);
  
  // Apply highlights to the content whenever highlights or content changes
  useEffect(() => {
    if (!highlights || highlights.length === 0) {
      setProcessedContent(content);
      return;
    }
    
    // Start with the original content
    let highlightedContent = content;
    console.log('Processing content with highlights:', highlights.length);
    
    // Sort highlights by length (longest first) to prevent nested highlighting issues
    const sortedHighlights = [...highlights].sort((a, b) => 
      b.text.length - a.text.length
    );
    
    // Replace each highlight text with HTML marked version
    sortedHighlights.forEach(highlight => {
      try {
        // Check if the text exists in the content
        if (!highlightedContent.includes(highlight.text)) {
          console.log('Text not found in content:', highlight.text);
          return;
        }
        
        console.log('Applying highlight:', highlight.text, highlight.color);
        
        // Create a regular expression that escapes special characters
        const regex = new RegExp(escapeRegExp(highlight.text), 'g');
        
        // Create the marked HTML
        const replacement = `<mark style="background-color: ${highlight.color}; padding: 2px 0; border-radius: 2px;" data-highlight-id="${highlight.id}">${highlight.text}</mark>`;
        
        // Replace all occurrences
        highlightedContent = highlightedContent.replace(regex, replacement);
      } catch (error) {
        console.error('Error applying highlight:', error);
      }
    });
    
    console.log('Content processed with highlights');
    setProcessedContent(highlightedContent);
  }, [content, highlights]);
  
  // Helper to escape special regex characters
  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Display a message if no content
  if (!content) {
    return <div>No content available</div>;
  }

  return (
    <div className="highlightable-markdown">
      <MarkdownRenderer content={processedContent} />
    </div>
  );
} 