import React from 'react';
import { notFound } from 'next/navigation';
import { getProductContent, getProductList } from '@/lib/products';
import InteractiveMarkdownArea from '@/components/InteractiveMarkdownArea';
import { ProgressButton } from '@/components/ProgressButton';

// Explicitly type the return value
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const products = await getProductList();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

// Restore async and data fetching, but keep props type as 'any' for build workaround
export default async function ProductPage({ params }: any) {
  const slug = params.slug;
  const product = await getProductContent(slug);

  if (!product) {
    notFound();
  }

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
        <h1 className="mb-0 mr-auto">{product.title}</h1>
        <div className="flex-shrink-0">
           <ProgressButton slug={slug} />
        </div>
      </div>
      <div id="markdown-content">
        <InteractiveMarkdownArea content={product.content} slug={slug} />
      </div>
    </article>
  );
} 