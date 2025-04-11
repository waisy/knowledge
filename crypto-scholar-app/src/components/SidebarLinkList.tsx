'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { useProgress } from '@/hooks/useProgress';
import { CheckCircle } from 'lucide-react';
import { ProductInfo, HeadingInfo } from '@/lib/products'; // Import HeadingInfo
import React, { useState, useEffect, useRef } from 'react'; // Import useState, useEffect, useRef
import throttle from 'lodash/throttle'; // Import throttle for performance

interface SidebarLinkListProps {
  products: ProductInfo[];
}

export function SidebarLinkList({ products }: SidebarLinkListProps) {
  const pathname = usePathname();
  const { isCompleted, isHydrated } = useProgress();
  const [activeHash, setActiveHash] = useState('');
  const headingElementsRef = useRef<HTMLElement[]>([]);
  const navRef = useRef<HTMLElement>(null); // Ref for the nav element

  // Effect to find heading elements once on mount/pathname change
  useEffect(() => {
    const contentElement = document.getElementById('markdown-content');
    if (contentElement) {
      headingElementsRef.current = Array.from(
        contentElement.querySelectorAll('h2[id], h3[id]')
      );
    } else {
      headingElementsRef.current = [];
    }
    // Trigger scroll handler once initially after finding headings
    handleScroll(); 

  }, [pathname]); // Re-run if the page changes

  // Effect to handle scroll and hash changes
  useEffect(() => {
    // Throttle the scroll handler for performance
    const throttledScrollHandler = throttle(handleScroll, 100);

    window.addEventListener('scroll', throttledScrollHandler);
    // Also listen for hashchange for direct clicks
    window.addEventListener('hashchange', handleHashChange);
    
    // Set initial hash correctly
    handleHashChange();

    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      window.removeEventListener('hashchange', handleHashChange);
      throttledScrollHandler.cancel(); // Clean up throttle
    };
  }, [pathname]); // Rerun if pathname changes

  function handleHashChange() {
    setActiveHash(window.location.hash);
  }

  function handleScroll() {
    const scrollY = window.scrollY;
    const offset = 100; // Offset from the top of the viewport
    let currentActiveHash = '';

    // Iterate from bottom to top
    for (let i = headingElementsRef.current.length - 1; i >= 0; i--) {
      const heading = headingElementsRef.current[i];
      if (heading.offsetTop <= scrollY + offset) {
        currentActiveHash = `#${heading.id}`;
        break; // Found the current active heading
      }
    }
    
    // Only update state if the hash has actually changed
    if (currentActiveHash !== activeHash) {
      setActiveHash(currentActiveHash);
    }
  }

  // Hydration placeholder
  if (!isHydrated) {
     return (
      <nav ref={navRef} className="flex flex-col space-y-1">
        {products.map((product) => (
          <span
            key={product.slug}
            className="flex items-center justify-between p-2 rounded-md text-sm text-muted-foreground opacity-50 animate-pulse"
          >
            {product.title}
          </span>
        ))}
      </nav>
    );
  }

  // Render actual links
  return (
    <nav ref={navRef} className="flex flex-col space-y-1">
      {products.map((product) => {
        const href = `/products/${product.slug}`;
        const isActiveBase = pathname === href;
        const completed = isCompleted(product.slug);

        return (
          <React.Fragment key={product.slug}>
            <Link
              href={href}
              className={cn(
                "flex items-center justify-between p-2 rounded-md text-sm hover:bg-accent",
                isActiveBase ? "bg-accent font-semibold text-accent-foreground" : "text-muted-foreground",
                completed ? "opacity-70" : "opacity-100"
              )}
            >
              <span>{product.title}</span>
              {completed && (
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              )}
            </Link>
            {isActiveBase && product.headings && product.headings.length > 0 && (
              <ul className="ml-4 mt-1 space-y-1 border-l border-muted pl-2">
                {product.headings.map((heading) => {
                  const headingHref = `${href}#${heading.id}`;
                  const isHeadingActive = activeHash === `#${heading.id}`;
                  
                  return (
                    <li key={heading.id}>
                      <Link
                        href={headingHref}
                        // Use scroll={false} if you want to prevent page jump on initial click before scroll listener updates hash
                        // scroll={false} 
                        className={cn(
                          "block p-1 rounded-md text-xs hover:bg-accent hover:text-accent-foreground",
                          isHeadingActive ? "bg-accent/80 font-medium text-accent-foreground" : "text-muted-foreground",
                        )}
                      >
                        {heading.text}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
} 