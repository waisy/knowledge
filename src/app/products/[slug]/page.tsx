import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import MarkdownRenderer from '@/components/MarkdownRenderer'; // We will create this component

// This function tells Next.js which slugs are possible
export async function generateStaticParams() {
  const productsDir = path.join(process.cwd(), '_content/products');
  try {
    const filenames = fs.readdirSync(productsDir);
    return filenames
      .filter(filename => filename.endsWith('.md'))
      .map(filename => ({
        slug: filename.replace('.md', ''),
      }));
  } catch (error) {
    console.error('Error reading products directory:', error);
    return [];
  }
}

// Function to get markdown content for a given slug
function getProductContent(slug: string) {
  const productsDir = path.join(process.cwd(), '_content/products');
  const filePath = path.join(productsDir, `${slug}.md`);

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      // Extract title from the first line (H1)
      const title = content.split('\n')[0].replace('# ', '').trim();
      return { content, title };
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
  return null;
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const product = getProductContent(slug);

  if (!product) {
    notFound(); // Show 404 if markdown file doesn't exist
  }

  return (
    <article className="prose dark:prose-invert lg:prose-xl max-w-none p-6 lg:p-12">
      {/* We might add title rendering here later */}
      {/* Using prose class for basic markdown styling via Tailwind Typography */}
      <MarkdownRenderer content={product.content} />
    </article>
  );
} 