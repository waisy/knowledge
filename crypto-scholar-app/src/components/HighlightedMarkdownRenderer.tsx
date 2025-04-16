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
    
    // Create a temporary DOM element to handle HTML parsing correctly
    const tempDiv = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (!tempDiv) return content; // Server-side rendering fallback
    
    // Set the markdown content as innerHTML
    tempDiv.innerHTML = content;
    
    // Function to find and highlight text within a node and its children
    const processNode = (node: Node, annotation: Annotation): boolean => {
      // Skip non-text nodes and empty text nodes
      if (node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE) {
        return false;
      }
      
      // For text nodes, check for the text to highlight
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const nodeText = node.textContent;
        
        // If context is available, use it for precise matching
        if (annotation.contextBefore || annotation.contextAfter) {
          // For text nodes, we'll use the simplified approach - just check if the text contains
          // our annotation without requiring the exact context
          if (nodeText.includes(annotation.text)) {
            // Check if the context somewhat matches
            const hasContextBefore = !annotation.contextBefore || 
              nodeText.includes(annotation.contextBefore + annotation.text);
            const hasContextAfter = !annotation.contextAfter || 
              nodeText.includes(annotation.text + annotation.contextAfter);
            
            // If context matches, replace the text
            if (hasContextBefore || hasContextAfter) {
              const span = document.createElement('span');
              span.className = 'highlighted-text';
              span.dataset.annotationId = annotation.id;
              span.title = 'Click to remove highlight';
              span.style.backgroundColor = '#ffff9d';
              span.style.padding = '2px 0';
              span.style.borderRadius = '2px';
              span.style.cursor = 'pointer';
              span.textContent = annotation.text;
              
              // Replace just this instance
              const startIndex = nodeText.indexOf(annotation.text);
              if (startIndex >= 0) {
                const beforeText = nodeText.substring(0, startIndex);
                const afterText = nodeText.substring(startIndex + annotation.text.length);
                
                const beforeTextNode = document.createTextNode(beforeText);
                const afterTextNode = document.createTextNode(afterText);
                
                node.parentNode?.insertBefore(beforeTextNode, node);
                node.parentNode?.insertBefore(span, node);
                node.parentNode?.insertBefore(afterTextNode, node);
                node.parentNode?.removeChild(node);
                
                return true; // Successfully highlighted
              }
            }
          }
        } else {
          // For older annotations without context, find the first occurrence
          const startIndex = nodeText.indexOf(annotation.text);
          if (startIndex >= 0) {
            const span = document.createElement('span');
            span.className = 'highlighted-text';
            span.dataset.annotationId = annotation.id;
            span.title = 'Click to remove highlight';
            span.style.backgroundColor = '#ffff9d';
            span.style.padding = '2px 0';
            span.style.borderRadius = '2px';
            span.style.cursor = 'pointer';
            span.textContent = annotation.text;
            
            const beforeText = nodeText.substring(0, startIndex);
            const afterText = nodeText.substring(startIndex + annotation.text.length);
            
            const beforeTextNode = document.createTextNode(beforeText);
            const afterTextNode = document.createTextNode(afterText);
            
            node.parentNode?.insertBefore(beforeTextNode, node);
            node.parentNode?.insertBefore(span, node);
            node.parentNode?.insertBefore(afterTextNode, node);
            node.parentNode?.removeChild(node);
            
            return true; // Successfully highlighted
          }
        }
      }
      
      // For element nodes, recursively process child nodes
      if (node.nodeType === Node.ELEMENT_NODE && node.childNodes) {
        // Process child nodes, but stop if we find a match
        for (let i = 0; i < node.childNodes.length; i++) {
          const childNode = node.childNodes[i];
          const found = processNode(childNode, annotation);
          if (found) return true; // Stop processing after first match
        }
      }
      
      return false; // No match found in this node or its children
    };
    
    // Process each annotation
    for (const annotation of sortedAnnotations) {
      try {
        // Check for cross-node text spans using both manual traversal
        // and a fallback regex approach for server-side rendering
        
        // 1. First try DOM-based approach for client
        let found = false;
        if (tempDiv.childNodes) {
          // We're in the client, so we can traverse the DOM
          const walker = document.createTreeWalker(
            tempDiv,
            NodeFilter.SHOW_TEXT,
            null
          );
          
          let node;
          while ((node = walker.nextNode())) {
            found = processNode(node, annotation);
            if (found) break; // Stop after the first match
          }
        }
        
        // 2. If we didn't find it with node-by-node processing, try handling cross-element text
        if (!found) {
          found = handleCrossElementHighlight(tempDiv, annotation);
        }
        
        // 3. Fallback regex approach if DOM traversal didn't work
        if (!found) {
          // Add special markers for tags we know might cause issues
          const contentStr = tempDiv.innerHTML;
          
          // Use regex to find the text, regardless of HTML tags
          // This is a simple approach and may have limitations
          const escapedText = escapeRegExp(annotation.text);
          
          // Create a regex that allows for tags in between parts of the text
          const regex = new RegExp(escapedText, '');
          if (contentStr.match(regex)) {
            // Replace with highlight span
            const replacement = `<span class="highlighted-text" data-annotation-id="${annotation.id}" style="background-color: #ffff9d; padding: 2px 0; border-radius: 2px; cursor: pointer;" title="Click to remove highlight">${annotation.text}</span>`;
            tempDiv.innerHTML = contentStr.replace(regex, replacement);
          }
        }
      } catch (error) {
        console.error(`Error processing annotation "${annotation.text}":`, error);
      }
    }
    
    // Function to handle highlighting text that spans across multiple elements
    function handleCrossElementHighlight(container: HTMLElement, annotation: Annotation): boolean {
      // Use the raw text content to search for the annotation
      const fullTextContent = container.textContent || '';
      if (!fullTextContent.includes(annotation.text)) {
        return false; // Text not found
      }
      
      // Get all text nodes in sequence
      const textNodes: Node[] = [];
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node);
      }
      
      // Reconstruct the full text content with node indices
      let fullText = '';
      const nodePositions: { node: Node; start: number; end: number }[] = [];
      
      textNodes.forEach(node => {
        const nodeText = node.textContent || '';
        const start = fullText.length;
        fullText += nodeText;
        const end = fullText.length;
        nodePositions.push({ node, start, end });
      });
      
      // Find the annotation in the full text
      const annotationStartIndex = fullText.indexOf(annotation.text);
      if (annotationStartIndex === -1) {
        return false; // Not found
      }
      
      const annotationEndIndex = annotationStartIndex + annotation.text.length;
      
      // Find which nodes contain parts of the annotation
      const relevantNodes = nodePositions.filter(
        pos => 
          // Node contains the start of the annotation
          (pos.start <= annotationStartIndex && pos.end > annotationStartIndex) ||
          // Node contains the end of the annotation
          (pos.start < annotationEndIndex && pos.end >= annotationEndIndex) ||
          // Node is completely within the annotation
          (pos.start >= annotationStartIndex && pos.end <= annotationEndIndex)
      );
      
      if (relevantNodes.length === 0) {
        return false; // No nodes contain the annotation
      }
      
      // If only one node contains the entire annotation, use the simpler approach
      if (relevantNodes.length === 1) {
        const nodeInfo = relevantNodes[0];
        const node = nodeInfo.node;
        const nodeText = node.textContent || '';
        const relativeStart = annotationStartIndex - nodeInfo.start;
        
        const beforeText = nodeText.substring(0, relativeStart);
        const highlightedText = nodeText.substring(relativeStart, relativeStart + annotation.text.length);
        const afterText = nodeText.substring(relativeStart + annotation.text.length);
        
        const beforeNode = document.createTextNode(beforeText);
        const highlightNode = document.createElement('span');
        highlightNode.className = 'highlighted-text';
        highlightNode.dataset.annotationId = annotation.id;
        highlightNode.title = 'Click to remove highlight';
        highlightNode.style.backgroundColor = '#ffff9d';
        highlightNode.style.padding = '2px 0';
        highlightNode.style.borderRadius = '2px';
        highlightNode.style.cursor = 'pointer';
        highlightNode.textContent = highlightedText;
        const afterNode = document.createTextNode(afterText);
        
        const parent = node.parentNode;
        if (parent) {
          parent.insertBefore(beforeNode, node);
          parent.insertBefore(highlightNode, node);
          parent.insertBefore(afterNode, node);
          parent.removeChild(node);
          return true;
        }
        
        return false;
      }
      
      // For multi-node highlighting, we need to use HTML replacement
      // because manipulating DOM directly across nodes is complex
      
      // Create a marker for the start and end
      const startMarker = `__HIGHLIGHT_START_${Date.now()}__`;
      const endMarker = `__HIGHLIGHT_END_${Date.now()}__`;
      
      // Insert markers in the HTML
      let html = container.innerHTML;
      
      // Insert the markers in the correct positions
      let currentIndex = 0;
      let markedHtml = '';
      
      textNodes.forEach((node, i) => {
        const nodeText = node.textContent || '';
        const nodeStartIndex = currentIndex;
        const nodeEndIndex = nodeStartIndex + nodeText.length;
        
        // Check if this node contains the start of the annotation
        if (nodeStartIndex <= annotationStartIndex && nodeEndIndex > annotationStartIndex) {
          const relativeStartPos = annotationStartIndex - nodeStartIndex;
          // Find the HTML for this text node
          const nodeHtml = html.substring(
            html.indexOf(nodeText.substring(0, 10)),
            html.indexOf(nodeText.substring(nodeText.length - 10)) + nodeText.substring(nodeText.length - 10).length
          );
          
          // Insert the start marker
          const markedNodeHtml = nodeHtml.substring(0, relativeStartPos) + 
                                startMarker + 
                                nodeHtml.substring(relativeStartPos);
          
          html = html.replace(nodeHtml, markedNodeHtml);
        }
        
        // Check if this node contains the end of the annotation
        if (nodeStartIndex < annotationEndIndex && nodeEndIndex >= annotationEndIndex) {
          const relativeEndPos = annotationEndIndex - nodeStartIndex;
          // Find the HTML for this text node
          const nodeHtml = html.substring(
            html.indexOf(nodeText.substring(0, 10)),
            html.indexOf(nodeText.substring(nodeText.length - 10)) + nodeText.substring(nodeText.length - 10).length
          );
          
          // Insert the end marker
          const markedNodeHtml = nodeHtml.substring(0, relativeEndPos) + 
                                endMarker + 
                                nodeHtml.substring(relativeEndPos);
          
          html = html.replace(nodeHtml, markedNodeHtml);
        }
        
        currentIndex = nodeEndIndex;
      });
      
      // Replace the marked content with the highlighted version
      const highlightHtml = `<span class="highlighted-text" data-annotation-id="${annotation.id}" style="background-color: #ffff9d; padding: 2px 0; border-radius: 2px; cursor: pointer;" title="Click to remove highlight">`;
      
      html = html.replace(startMarker, highlightHtml);
      html = html.replace(endMarker, '</span>');
      
      container.innerHTML = html;
      return true;
    }
    
    // Return the transformed content
    return tempDiv.innerHTML;
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