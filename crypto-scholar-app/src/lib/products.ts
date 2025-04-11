import fs from 'fs';
import path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import visit from 'unist-util-visit';
import { toString } from 'mdast-util-to-string'; // Helper to get text content
import type { Root, Heading } from 'mdast'; // Import types from @types/mdast
import type { Node } from 'unist'; // Import base Node type
import Slugger from 'github-slugger'; // Use default import as suggested by linter

// Define interface for heading information
export interface HeadingInfo {
  id: string;     // Slugified ID for linking
  text: string;   // Raw text of the heading
  level: number;  // Heading level (e.g., 2 for ##, 3 for ###)
}

export interface ProductInfo {
  slug: string;
  title: string;       // Main H1 title
  headings?: HeadingInfo[]; // Optional array of H2/H3 headings
}

export interface ProductContent extends ProductInfo {
  content: string;
}

// Define multiple content directories
const contentDirs = [
  path.join(process.cwd(), '_content/products'),
  path.join(process.cwd(), '_content/concepts'),
];

// Function to get the list of products including headings
export async function getProductList(): Promise<ProductInfo[]> {
  let allProducts: ProductInfo[] = [];
  const slugger = new Slugger(); // Instantiate slugger once per list generation

  for (const dir of contentDirs) {
    console.log('[getProductList] Reading directory:', dir);
    try {
      const filenames = await fs.promises.readdir(dir);
      const mdFiles = filenames.filter((filename) => path.extname(filename) === '.md');

      const products = await Promise.all(mdFiles.map(async (filename) => {
        const slug = path.basename(filename, '.md');
        const filePath = path.join(dir, filename);
        const content = await fs.promises.readFile(filePath, 'utf8');
        slugger.reset(); // Reset slugger for each file to avoid duplicate ID issues across files

        // --- Start: Parse content for headings ---
        const headings: HeadingInfo[] = [];
        const processor = unified()
          .use(remarkParse);

        const tree = processor.parse(content) as Root;

        // Use type assertion here: tree as Node
        // @ts-ignore - Suppressing persistent type mismatch error between unist/mdast types and visit function expectation
        visit(tree as Node, 'heading', (node: Heading) => {
          if (node.depth > 1 && node.depth <= 3) {
            const headingText = toString(node);
            const headingId = slugger.slug(headingText);

            if (headingText && headingId) {
              headings.push({
                id: headingId,
                text: headingText,
                level: node.depth,
              });
            }
          }
        });
        // --- End: Parse content for headings ---

        const titleMatch = content.match(/^#\s+(.*)$/m);
        const baseTitle = titleMatch ? titleMatch[1].trim() : slug.replace(/_/g, ' ');
        const title = dir.includes('concepts') ? `Concept: ${baseTitle}` : baseTitle;

        return { slug, title, headings };
      }));

      allProducts = allProducts.concat(products);
      console.log(`[getProductList] Found ${products.length} items in ${dir}, including headings.`);

    } catch (error) {
      // Log error but continue with other directories if one fails (e.g., directory doesn't exist yet)
      console.warn(`[getProductList] Warning reading directory ${dir}:`, error);
    }
  }

  console.log('[getProductList] Total items found:', allProducts.length);
  // Sort primarily by title, maybe secondary sort if needed?
  return allProducts.sort((a, b) => a.title.localeCompare(b.title));
}

// Function to get the full content of a single product/concept from any content directory
export async function getProductContent(slug: string): Promise<ProductContent | null> {
  for (const dir of contentDirs) {
    const filePath = path.join(dir, `${slug}.md`);
    console.log('[getProductContent] Trying file:', filePath);

    try {
      // Check if file exists in this directory
      await fs.promises.access(filePath);

      // File exists, read it
      const content = await fs.promises.readFile(filePath, 'utf8');
      const titleMatch = content.match(/^#\s+(.*)$/m);
      const baseTitle = titleMatch ? titleMatch[1].trim() : slug.replace(/_/g, ' ');
      const title = dir.includes('concepts') ? `Concept: ${baseTitle}` : baseTitle;
      console.log(`[getProductContent] Found title '${title}' for slug '${slug}' in ${dir}`);
      
      // We *could* re-parse headings here too, or rely on getProductList providing them
      // For simplicity, let's assume the component fetching content already has heading info
      // If not, the parsing logic from getProductList could be reused here.
      return { slug, title, content }; // Headings are not included here, assumed fetched separately

    } catch (error: unknown) { // Type error as unknown
      // Check if it's an error object with a code property
      if (error instanceof Error && (error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.warn(`[getProductContent] Warning accessing file ${filePath}:`, error);
      } else if (!(error instanceof Error) || (error as NodeJS.ErrnoException).code === 'ENOENT') {
        // Handle file not found or non-standard errors gracefully
         console.log(`[getProductContent] Slug '${slug}' not found in ${dir}`);
      } else {
        // Handle other unknown error types
        console.warn(`[getProductContent] Unknown error accessing file ${filePath}:`, error);
      }
    }
  }

  // If loop completes without finding the file
  console.log(`[getProductContent] Product/Concept not found for slug '${slug}' in any directory.`);
  return null;
} 