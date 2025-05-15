"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

const WhatWereDoing = () => {
  const [activeTab, setActiveTab] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  const nutrients = [
    {
      title: "Concentrated Formula",
      description: "Our liquid concentrated nutrients deliver maximum results with minimum product, reducing waste and environmental impact.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      )
    },
    {
      title: "Plant-Specific",
      description: "Different plants have different needs. Our formulas are tailored to specific plant types for optimal growth and health.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      )
    },
    {
      title: "Creating the Norm",
      description: "We're redefining what plant owners should expect from their plant food. Premium quality shouldn't be a luxury.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      )
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section ref={ref} className="w-full bg-[#D8C9A7] px-4 sm:px-6 py-16 sm:py-24 text-gray-800 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 opacity-10 rotate-45">
        <Image
          src="/assets/leaf.png"
          alt="Decorative leaf"
          fill
          className="object-contain"
        />
      </div>
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10 -rotate-12">
        <Image
          src="/assets/leaf.png"
          alt="Decorative leaf"
          fill
          className="object-contain"
        />
      </div>
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          className="flex flex-col items-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl sm:text-5xl font-bold mb-6 text-center text-[#FF6B6B]"
          >
            What We're Doing
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl sm:text-2xl mb-4 text-center max-w-[800px] text-gray-700"
          >
            Liquid concentrated nutrients - creating the norm.
          </motion.p>
          <motion.p 
            variants={fadeInUp}
            className="text-xl sm:text-2xl mb-8 text-center max-w-[800px] text-[#FF6B6B] font-bold"
          >
            Plant Care for All
          </motion.p>
          <motion.div 
            variants={fadeInUp}
            className="w-20 h-1 bg-[#FF6B6B] rounded-full animate-pulse-width"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left side - Product showcase */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative aspect-square bg-[#00C9B0] rounded-[40px] overflow-hidden shadow-2xl border-2 border-[#CBBEA0]"
          >
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#00C9B0]/10 via-transparent to-black/30"></div>
            <Image
              src="/assets/productwithleaf.png"
              alt="TPS Liquid Concentrated Nutrients"
              fill
              className="object-contain p-8"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
              <h3 className="text-3xl font-bold mb-2 text-white">Premium Formulas</h3>
              <p className="text-white/90 mb-4">Scientifically crafted to maximize plant health</p>
              
              <div className="flex gap-2 mt-6">
                {[0, 1, 2].map((dot) => (
                  <button
                    key={dot}
                    onClick={() => setActiveTab(dot)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeTab === dot ? "bg-[#FF6B6B] scale-125" : "bg-white/70"
                    }`}
                    aria-label={`Show feature ${dot + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Right side - Tabs */}
          <div className="space-y-6">
            {nutrients.map((nutrient, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className={`rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                  activeTab === index 
                    ? "bg-white text-gray-800 shadow-xl" 
                    : "bg-[#CBBEA0] hover:bg-[#CBBEA0]/80 border border-[#FEF8E2]/20"
                }`}
                onClick={() => setActiveTab(index)}
              >
                <div className="flex items-start gap-5">
                  <div className={`p-4 rounded-full ${
                    activeTab === index ? "bg-[#FF6B6B] text-white" : "bg-white/20"
                  }`}>
                    {nutrient.icon}
                  </div>
                  <div>
                    <h3 className={`text-xl font-semibold mb-2 ${
                      activeTab === index ? "text-gray-800" : "text-gray-800"
                    }`}>
                      {nutrient.title}
                    </h3>
                    <p className={activeTab === index ? "text-gray-700" : "text-gray-700/90"}>
                      {nutrient.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10"
            >
              <Link href="/shop" className="bg-[#FF6B6B] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#ff5252] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 uppercase tracking-wide flex items-center gap-2">
                Shop All
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWereDoing; 