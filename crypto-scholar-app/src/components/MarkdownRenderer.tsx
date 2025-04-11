import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import PayoffDiagramReplacer from './PayoffDiagramReplacer';

interface MarkdownRendererProps {
  content: string;
}

// Define custom components with Tailwind classes
const components = {
  h1: ({ node, ...props }: any) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-2xl font-semibold mt-5 mb-3 border-b pb-2" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
  p: ({ node, ...props }: any) => <p className="mb-4 leading-relaxed" {...props} />,
  a: ({ node, ...props }: any) => <a className="text-blue-600 hover:text-blue-800 hover:underline" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc ml-6 mb-4 space-y-1" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal ml-6 mb-4 space-y-1" {...props} />,
  li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
  blockquote: ({ node, ...props }: any) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4" {...props} />,
  strong: ({ node, ...props }: any) => <strong className="font-semibold" {...props} />,
  em: ({ node, ...props }: any) => <em className="italic" {...props} />,
  // Add code component back with checking for payoff diagrams
  code: ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    
    // For inline code, just apply minimal styling
    if (inline) {
      return <code className="font-mono text-sm" {...props}>{children}</code>;
    }
    
    // Convert children to string (they're usually in array form)
    const codeContent = Array.isArray(children) ? children.join('') : String(children).trim();
    
    // -- DEBUG LOGGING START --
    console.log('[MarkdownRenderer] Code block content:', codeContent.substring(0, 100)); // Log first 100 chars
    const isStrategy = codeContent.match(/^STRATEGY:/i);
    const isAsciiLang = match && match[1] === 'ascii';
    const hasKeywords = (codeContent.includes('Profit/Loss') || codeContent.includes('Value at Expiry')) && codeContent.includes('^') && codeContent.includes('->');
    const shouldReplace = isStrategy || isAsciiLang || hasKeywords;
    console.log(`[MarkdownRenderer] Checks: isStrategy=${!!isStrategy}, isAsciiLang=${isAsciiLang}, hasKeywords=${hasKeywords}, shouldReplace=${shouldReplace}`);
    // -- DEBUG LOGGING END --

    if (shouldReplace) {
      console.log('[MarkdownRenderer] Replacing with PayoffDiagramReplacer');
      return <PayoffDiagramReplacer>{codeContent}</PayoffDiagramReplacer>;
    }
    
    // Otherwise, regular code block styling
    return (
      <pre className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto my-4">
        <code className={cn("font-mono", className)} {...props}>{children}</code>
      </pre>
    );
  },
};

// The simplified main component
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex, rehypeRaw, rehypeSlug]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;