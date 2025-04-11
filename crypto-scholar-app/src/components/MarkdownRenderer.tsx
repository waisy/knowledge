import React, { HTMLAttributes, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import PayoffDiagramReplacer from './PayoffDiagramReplacer';
import type { Node } from 'unist';

interface MarkdownRendererProps {
  content: string;
}

// Define a more specific type for the code component props we use
interface CustomCodeProps {
  node?: Node;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
}

// Define custom components with Tailwind classes and proper types
const components = {
  h1: ({ ...props }: HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
  h2: ({ ...props }: HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-2xl font-semibold mt-5 mb-3 border-b pb-2" {...props} />,
  h3: ({ ...props }: HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
  p: ({ ...props }: HTMLAttributes<HTMLParagraphElement>) => <p className="mb-4 leading-relaxed" {...props} />,
  a: ({ ...props }: HTMLAttributes<HTMLAnchorElement>) => <a className="text-blue-600 hover:text-blue-800 hover:underline" {...props} />,
  ul: ({ ...props }: HTMLAttributes<HTMLUListElement>) => <ul className="list-disc ml-6 mb-4 space-y-1" {...props} />,
  ol: ({ ...props }: HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal ml-6 mb-4 space-y-1" {...props} />,
  li: ({ ...props }: HTMLAttributes<HTMLLIElement>) => <li className="mb-1" {...props} />,
  blockquote: ({ ...props }: HTMLAttributes<HTMLQuoteElement>) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4" {...props} />,
  strong: ({ ...props }: HTMLAttributes<HTMLElement>) => <strong className="font-semibold" {...props} />,
  em: ({ ...props }: HTMLAttributes<HTMLElement>) => <em className="italic" {...props} />,
  // Use the custom props type
  code: ({ inline, className, children, ...props }: CustomCodeProps) => {
    const match = /language-(\w+)/.exec(className || '');
    
    if (inline) {
      return <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded" {...props}>{children}</code>;
    }
    
    const codeContent = String(children).trim();
    
    console.log('[MarkdownRenderer] Code block content:', codeContent.substring(0, 100));
    const isStrategy = codeContent.match(/^STRATEGY:/i);
    const isAsciiLang = match && match[1] === 'ascii';
    const hasKeywords = (codeContent.includes('Profit/Loss') || codeContent.includes('Value at Expiry')) && codeContent.includes('^') && codeContent.includes('->');
    const shouldReplace = isStrategy || isAsciiLang || hasKeywords;
    console.log(`[MarkdownRenderer] Checks: isStrategy=${!!isStrategy}, isAsciiLang=${isAsciiLang}, hasKeywords=${hasKeywords}, shouldReplace=${shouldReplace}`);

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