import Link from 'next/link';
import fs from 'fs';
import path from 'path';

// Function to get product slugs
async function getProductSlugs() {
  const productsDir = path.join(process.cwd(), '_content/products');
  try {
    const filenames = fs.readdirSync(productsDir);
    return filenames
      .filter(filename => filename.endsWith('.md'))
      .map(filename => filename.replace('.md', ''));
  } catch (error) {
    console.error('Error reading products directory:', error);
    return [];
  }
}

export default async function Home() {
  const slugs = await getProductSlugs();

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-12 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-12">
         <h1 className="text-2xl lg:text-4xl font-bold">Crypto Scholar</h1>
      </div>

      <div className="w-full max-w-5xl">
        <h2 className="text-xl lg:text-2xl mb-6">Available Topics:</h2>
        <ul className="list-disc pl-5 space-y-2">
          {slugs.length > 0 ? (
            slugs.map(slug => (
              <li key={slug}>
                <Link href={`/products/${slug}`} className="text-blue-600 dark:text-blue-400 hover:underline capitalize">
                  {slug.replace(/_/g, ' ')} {/* Replace underscores for display */}
                </Link>
              </li>
            ))
          ) : (
            <li>No topics found. Make sure markdown files are in _content/products.</li>
          )}
        </ul>
      </div>
    </main>
  );
} 