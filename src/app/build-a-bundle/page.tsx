import BuildBundle from "@/components/BuildBundle";

export default function BuildABundlePage() {
  return (
    <main className="min-h-screen bg-[#FDF6EF]">
      <div className="container mx-auto pt-4 pb-16 px-4 sm:px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#4A3520]">Build Your Bundle</h1>
        <p className="text-center mb-8 max-w-2xl mx-auto text-[#83735A] text-lg">
          Mix and match any 3 bottles of our plant food and save $10! Perfect for caring for your whole plant collection.
        </p>
        <div className="relative">
          <BuildBundle />
        </div>
      </div>
    </main>
  );
} 