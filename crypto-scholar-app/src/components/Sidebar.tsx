// Remove 'use client' - this is a Server Component now

import { getProductList } from '@/lib/products';
import { SidebarLinkList } from './SidebarLinkList'; // Import the new client component

// This is now an async Server Component
export default async function Sidebar() {
  // Fetch product list on the server
  const products = await getProductList();

  return (
    <aside className="w-64 border-r p-4 h-screen sticky top-0 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Topics</h2>
      {/* Render the Client Component, passing the fetched data */}
      <SidebarLinkList products={products} />
    </aside>
  );
} 