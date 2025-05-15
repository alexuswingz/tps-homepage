"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const EmailDiscount: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, you would send the email to your backend/API
    setIsSubmitted(true);
  };

  return (
    <section className="bg-[#FDF6EF] py-20 relative overflow-hidden">
      {/* Animated gradient bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#FF7C7B] via-[#00C9B0] to-[#FF7C7B] animate-gradient-shift"></div>
      
      {/* Decorative elements */}
      <div className="absolute left-0 bottom-0 opacity-30 hidden md:block">
        <Image 
          src="/assets/whiteleaf.png" 
          alt="Decorative leaf" 
          width={200} 
          height={200} 
          className={`transform rotate-[-10deg] opacity-40 transition-all duration-1000 ${
            animationComplete ? 'translate-x-0' : '-translate-x-full'
          }`}
        />
      </div>
      
      <div className="absolute right-0 top-0 opacity-30 hidden md:block">
        <Image 
          src="/assets/whiteleaf.png" 
          alt="Decorative leaf" 
          width={150} 
          height={150} 
          className={`transform rotate-[160deg] opacity-40 transition-all duration-1000 ${
            animationComplete ? 'translate-x-0' : 'translate-x-full'
          }`}
        />
      </div>

      {/* Floating decorative circles */}
      <div className="absolute left-[10%] top-[20%] w-16 h-16 rounded-full bg-[#00C9B0] opacity-20 animate-float-dots"></div>
      <div className="absolute right-[20%] bottom-[30%] w-10 h-10 rounded-full bg-[#FF7C7B] opacity-20 animate-float-dots" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute left-[30%] bottom-[15%] w-8 h-8 rounded-full bg-[#00C9B0] opacity-10 animate-float-dots" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto transform transition-transform duration-700 ease-out">
          <div 
            className={`bg-[#FF7C7B] rounded-3xl py-12 px-8 md:px-12 text-white shadow-xl transition-all duration-700 ${
              animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-center mb-10">
              <div className="inline-block relative mb-2">
                <h2 className="text-3xl md:text-5xl font-bold relative z-10">
                  Get 20% Off Your First Order
                </h2>
                <div className="absolute -bottom-2 left-0 w-full h-3 bg-[#00C9B0] opacity-40 rounded-full transform -rotate-1"></div>
              </div>
              <p className="text-lg max-w-lg mx-auto mt-4">
                Subscribe to our newsletter for plant care tips, exclusive offers, and your 20% discount code.
              </p>
            </div>
            
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div 
                    className={`relative flex-grow group ${isFocused ? 'transform -translate-y-1' : ''} transition-all duration-300`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ENTER YOUR EMAIL"
                      required
                      className={`w-full px-5 py-4 rounded-full bg-transparent border-2 border-white text-white placeholder-white/70 focus:outline-none transition-all duration-300 ${
                        isFocused ? 'border-[#FDF6EF] pl-6' : ''
                      } ${isHovered && !isFocused ? 'border-white/80' : ''}`}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                    />
                    {isFocused && (
                      <div className="absolute top-0 left-0 w-full h-full bg-white/5 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <button 
                    type="submit"
                    className="relative bg-[#00C9B0] hover:bg-[#00b5a0] px-7 py-4 rounded-full font-medium uppercase tracking-wide transition-all duration-300 transform hover:-translate-y-1 shadow-md overflow-hidden group"
                  >
                    <span className="relative z-10">Get 20% Off</span>
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                    <span className="absolute -inset-y-full left-0 w-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[500%] transition-transform duration-1000"></span>
                  </button>
                </div>

                <div className="flex items-center justify-center mt-6 space-x-2">
                  <div className="flex space-x-2 items-center">
                    <span className="block w-2 h-2 rounded-full bg-[#00C9B0]"></span>
                    <span className="text-sm">Plant Care Tips</span>
                  </div>
                  <span className="block w-1 h-1 rounded-full bg-white/50"></span>
                  <div className="flex space-x-2 items-center">
                    <span className="block w-2 h-2 rounded-full bg-[#00C9B0]"></span>
                    <span className="text-sm">Exclusive Offers</span>
                  </div>
                  <span className="block w-1 h-1 rounded-full bg-white/50"></span>
                  <div className="flex space-x-2 items-center">
                    <span className="block w-2 h-2 rounded-full bg-[#00C9B0]"></span>
                    <span className="text-sm">20% Discount</span>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-white/20 py-8 px-6 rounded-xl text-center mx-auto max-w-lg border border-white/40 transform transition-all duration-500 ease-out animate-pulse-glow">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#00C9B0]/30 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">Thanks for subscribing!</h3>
                <p className="text-lg">
                  Your 20% discount code has been sent to your email inbox.
                </p>
              </div>
            )}
            
            <p className="mt-6 text-sm opacity-80 text-center">
              By subscribing, you agree to receive marketing emails from us. You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmailDiscount; 