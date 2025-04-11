'use client';

import { useState, useEffect } from 'react';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [product, setProduct] = useState<{ content: string; title: string } | null>(null);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [processedContent, setProcessedContent] = useState('');
  
  // Colors available for highlighting
  const highlightColors = [
    { name: 'Yellow', value: '#ffff00' },
    { name: 'Green', value: '#90ee90' },
    { name: 'Blue', value: '#add8e6' },
    { name: 'Pink', value: '#ffb6c1' },
  ];

  // Fetch content when component mounts
  useEffect(() => {
    async function loadContent() {
      try {
        // For now, just use a mock content
        const mockContent = {
          content: `# ${slug.replace(/_/g, ' ')}\n\nThis is a sample content for ${slug.replace(/_/g, ' ')}. Select some text to highlight it.`,
          title: slug.replace(/_/g, ' ')
        };
        setProduct(mockContent);
        setProcessedContent(mockContent.content);
      } catch (error) {
        console.error('Error loading content:', error);
      }
    }
    
    loadContent();
    
    // Load highlights from localStorage
    try {
      const savedHighlights = localStorage.getItem('highlights');
      if (savedHighlights) {
        const allHighlights = JSON.parse(savedHighlights);
        // Filter for current page
        const pageHighlights = allHighlights.filter(
          (h: any) => h.pageUrl === window.location.pathname || h.pageUrl === ''
        );
        setHighlights(pageHighlights);
      }
    } catch (error) {
      console.error('Error loading highlights:', error);
    }
  }, [slug]);

  // Apply highlights whenever they change
  useEffect(() => {
    if (!product || !highlights.length) {
      // If no highlights, use original content
      setProcessedContent(product?.content || '');
      return;
    }
    
    let highlightedContent = product.content;
    console.log('Applying highlights to content:', highlights.length);
    
    // Process the highlights
    highlights.forEach(highlight => {
      try {
        // Simple text replacement - in a real app, would need a more robust approach
        highlightedContent = highlightedContent.replace(
          highlight.text,
          `<mark style="background-color: ${highlight.color};">${highlight.text}</mark>`
        );
      } catch (error) {
        console.error('Error applying highlight:', error);
      }
    });
    
    setProcessedContent(highlightedContent);
  }, [product, highlights]);
  
  // Toggle highlight mode
  const toggleHighlightMode = () => {
    setIsHighlightMode(!isHighlightMode);
  };
  
  // Remove a highlight
  const removeHighlight = (id: string) => {
    const updated = highlights.filter(h => h.id !== id);
    setHighlights(updated);
    localStorage.setItem('highlights', JSON.stringify(updated));
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <article className="prose dark:prose-invert lg:prose-xl max-w-none p-6 lg:p-12">
      {/* Highlight Controls */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-2 mb-4 border-b">
        <button
          onClick={toggleHighlightMode}
          className={`px-3 py-1 rounded ${isHighlightMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {isHighlightMode ? 'Highlighting On' : 'Highlight Text'}
        </button>
        
        {isHighlightMode && (
          <div className="mt-2">
            <div className="text-sm mb-1">Select text and click a color to highlight:</div>
            <div className="flex gap-1">
              {highlightColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    // Apply highlight with this color to any selected text
                    const selection = window.getSelection();
                    if (!selection || selection.isCollapsed) return;
                    
                    const text = selection.toString().trim();
                    if (!text) return;
                    
                    // Create new highlight with this color
                    const newHighlight = {
                      id: Date.now().toString(),
                      text: text,
                      color: color.value,
                      pageUrl: window.location.pathname,
                    };
                    
                    // Add to highlights
                    const updatedHighlights = [...highlights, newHighlight];
                    setHighlights(updatedHighlights);
                    
                    // Save to localStorage
                    localStorage.setItem('highlights', JSON.stringify(updatedHighlights));
                    
                    // Clear selection
                    selection.removeAllRanges();
                  }}
                  className={`w-8 h-8 rounded-full border hover:ring-2 hover:ring-blue-500`}
                  style={{ backgroundColor: color.value }}
                  title={`Highlight with ${color.name}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="content-container">
        <MarkdownRenderer content={processedContent} />
      </div>
      
      {/* Highlights List */}
      {highlights.length > 0 && (
        <div className="mt-8 p-4 border rounded-md bg-gray-50">
          <h3 className="font-medium text-lg mb-2">Your Highlights</h3>
          <ul className="space-y-2">
            {highlights.map((highlight) => (
              <li 
                key={highlight.id} 
                className="flex items-start gap-2 p-2 rounded"
                style={{ backgroundColor: `${highlight.color}40` }}
              >
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
    </article>
  );
} 