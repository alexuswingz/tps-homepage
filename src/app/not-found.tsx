import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDF6EF]">
      <div className="text-center max-w-md p-8">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-lg mb-8 text-gray-600">
          The page you're looking for doesn't exist or might have been moved.
        </p>
        <Link 
          href="/"
          className="inline-block bg-[#4CAF50] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#43A047] transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 