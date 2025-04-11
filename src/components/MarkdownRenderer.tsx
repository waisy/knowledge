'use client'; // This component needs to be a Client Component

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Tables, footnotes, strikethrough, task lists, literal URLs
import remarkMath from 'remark-math'; // Support math texte
import rehypeKatex from 'rehype-katex'; // Render math using KaTeX
import rehypeRaw from 'rehype-raw'; // Render raw HTML (useful for embedded things, use with caution)
import rehypePrism from '@mapbox/rehype-prism'; // Syntax highlighting

// Import KaTeX CSS
import 'katex/dist/katex.min.css';
// Import PrismJS CSS (choose a theme)
// You might need to install prismjs if not already a sub-dependency
// and copy themes to your public folder or import differently.
// For now, let's assume a theme is globally available or handle later.
// import 'prismjs/themes/prism-okaidia.css'; 

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        rehypeRaw, // Place before KaTeX if you have HTML in math
        rehypeKatex,
        [rehypePrism, { ignoreMissing: true }], // Ignore errors for languages not supported
      ]}
      // Configure components to handle marks properly
      components={{
        // Make sure marks render with correct styles
        mark: ({ node, ...props }) => (
          <mark
            style={{ 
              backgroundColor: props.style?.backgroundColor || '#ffff00',
              padding: '2px 0',
              borderRadius: '2px' 
            }}
            data-highlight-id={props['data-highlight-id']}
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
} 