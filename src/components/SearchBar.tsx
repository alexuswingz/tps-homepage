import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';

interface SearchBarProps {
  initialQuery?: string;
}

const SearchBar = ({ initialQuery = '' }: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Client-side navigation to search page
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 text-gray-800 text-lg transition-all duration-200"
      />
      <button
        type="submit"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-[#4CAF50] transition-colors duration-200"
      >
        <FiSearch className="text-2xl" />
      </button>
    </form>
  );
};

export default SearchBar; 