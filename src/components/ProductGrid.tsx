import Image from 'next/image';
import Link from 'next/link';
import type { Product, ProductVariant } from '@/types/shopify';

interface ProductGridProps {
  products: Product[];
  onAddToCart?: (product: Product, variant: ProductVariant) => void;
}

const ProductGrid = ({ products, onAddToCart }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
        >
          <Link href={`/product/${product.handle}`}>
            <div className="relative aspect-square">
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText || product.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
                priority={index < 4}
                loading={index < 8 ? 'eager' : 'lazy'}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXIDTjwAAAABJRU5ErkJggg=="
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {product.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#4CAF50]">
                  ${parseFloat(product.variants.edges[0]?.node.price.amount).toFixed(2)}
                </span>
              </div>
            </div>
          </Link>
          {onAddToCart && product.variants.edges[0]?.node && (
            <div className="px-6 pb-6">
              <button
                onClick={() => onAddToCart(product, product.variants.edges[0].node)}
                className="w-full px-4 py-2 bg-[#4CAF50] text-white rounded-xl hover:bg-[#43A047] transition-colors duration-200"
              >
                Add to Cart
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductGrid; 