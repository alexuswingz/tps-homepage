import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FF7C7B] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Leaf icon */}
          <div className="flex items-start">
            <Image 
              src="/assets/whiteleaf.png"
              alt="TPS Leaf"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          {/* Navigation Links - First Column */}
          <div>
            <nav className="flex flex-col space-y-2 font-medium">
              <Link href="/shop" className="hover:underline">SHOP ALL</Link>
              <Link href="/bundles" className="hover:underline">BUILD A BUNDLE</Link>
              <Link href="/houseplants" className="hover:underline">HOUSEPLANTS</Link>
              <Link href="/garden-plants" className="hover:underline">LAWN AND GARDEN</Link>
              <Link href="/hydro-aquatic" className="hover:underline">HYDRO & AQUATIC</Link>
              <Link href="/supplements" className="hover:underline">SPECIALTY SUPPLEMENTS</Link>
            </nav>
          </div>

          {/* Navigation Links - Second Column */}
          <div>
            <nav className="flex flex-col space-y-2 font-medium">
              <Link href="/account" className="hover:underline">MY ACCOUNT</Link>
              <Link href="/ask" className="hover:underline">ASK A QUESTION</Link>
              <Link href="/blog" className="hover:underline">BLOG: THE POUR SPOUT</Link>
              <Link href="/shipping" className="hover:underline">SHIPPING & RETURNS</Link>
              <Link href="/wholesale" className="hover:underline">WHOLESALE</Link>
              <Link href="/affiliates" className="hover:underline">AFFILIATES</Link>
            </nav>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="font-bold text-2xl mb-3">Get with the program!</h3>
            <p className="mb-5">Stay afloat of all the latest plant care tips, deals, and savings.</p>
            
            <div className="relative">
              <input 
                type="email" 
                placeholder="ENTER YOUR EMAIL" 
                className="w-full bg-transparent border rounded-full border-white text-white px-4 py-2 pr-12 placeholder-white focus:outline-none"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white">
                <span className="flex items-center justify-center">&gt;</span>
              </button>
            </div>
          </div>
        </div>

        <hr className="border-t border-white/30 my-10" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <Image 
              src="/assets/footerlogo.png" 
              alt="TPS Plant Foods" 
              width={250} 
              height={60}
              className="object-contain mb-4"
            />
          </div>
          
          <div className="text-right">
            <p className="mb-2">Copyright TPS Nutrients, 2025</p>
            <div className="flex space-x-4 justify-end">
              <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 