import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// API route to get product markdown content
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  // Get the content from the markdown file
  const productsDir = path.join(process.cwd(), '_content/products');
  const filePath = path.join(productsDir, `${slug}.md`);
  
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      // Extract title from the first line (H1)
      const title = content.split('\n')[0].replace('# ', '').trim();
      
      return NextResponse.json({ content, title });
    } else {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return NextResponse.json(
      { error: 'Failed to read product content' },
      { status: 500 }
    );
  }
} 