'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/shopify';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to fetch search results');
        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        setError('Failed to load search results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-4">
        {query ? `Search Results for "${query}"` : 'Search Results'}
      </h1>

      {loading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-4">{error}</div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No products found{query ? ` for "${query}"` : ''}.</p>
          <Link href="/shop" className="text-[#FF6B6B] hover:underline mt-2 inline-block">
            Browse all products
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.handle}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-200 hover:shadow-md">
              <div className="relative aspect-square">
                <Image
                  src={product.featuredImage.url}
                  alt={product.featuredImage.altText}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">{product.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                <p className="text-[#FF6B6B] font-medium mt-2">
                  ${parseFloat(product.variants.edges[0].node.price.amount).toFixed(2)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 