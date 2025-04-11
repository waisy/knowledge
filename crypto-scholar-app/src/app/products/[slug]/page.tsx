import React from 'react';
import { notFound } from 'next/navigation';
import { getProductContent, getProductList } from '@/lib/products';
import InteractiveMarkdownArea from '@/components/InteractiveMarkdownArea';
import { ProgressButton } from '@/components/ProgressButton';

export async function generateStaticParams() {
  const products = await getProductList();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

// Define a proper interface for the page props
interface ProductPageProps {
  params: {
    slug: string;
  };
  // Optionally add searchParams if needed later
  // searchParams?: { [key: string]: string | string[] | undefined };
}

// Use the interface for the props
export default async function ProductPage({ params }: ProductPageProps) {
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