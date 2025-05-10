import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  handle: string;
}

interface SearchSuggestionsProps {
  products: Product[];
  isVisible: boolean;
  onClose: () => void;
  searchQuery: string;
}

const SearchSuggestions = ({ products, isVisible, onClose, searchQuery }: SearchSuggestionsProps) => {
  const router = useRouter();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible || products.length === 0) return null;

  return (
    <div
      ref={suggestionsRef}
      className="absolute top-1 left-0 right-0 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[400px] overflow-y-auto z-[60]"
      style={{ marginTop: '0.5rem' }}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-900">
            {products.length} result{products.length !== 1 ? 's' : ''} for "{searchQuery}"
          </h3>
          <Link
            href={`/search?q=${encodeURIComponent(searchQuery)}`}
            className="text-sm text-[#FF6B6B] hover:underline"
            onClick={onClose}
          >
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {products.slice(0, 5).map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.handle}`}
              className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-150"
              onClick={onClose}
            >
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                <p className="text-sm text-gray-500 truncate">{product.description}</p>
                <p className="text-sm font-medium text-[#FF6B6B]">${product.price.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchSuggestions; 