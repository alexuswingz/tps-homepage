"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const WhatWereDoing = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  const features = [
    {
      title: "Liquid Concentrate",
      description: "Our powerful liquid concentrates deliver maximum results with minimal product. Just a few drops for extraordinary results.",
      icon: "/assets/icons/concentrate.svg",
      color: "#FF6B6B",
      image: "/assets/product-concentrate.jpg"
    },
    {
      title: "Plant-Specific Formulas",
      description: "Specialized nutrients designed for specific plant types ensure optimal growth, vibrant colors, and peak health.",
      icon: "/assets/icons/plant.svg",
      color: "#00C9B0",
      image: "/assets/product-formulas.jpg"
    },
    {
      title: "Eco-Friendly Approach",
      description: "Sustainable formulations that reduce environmental impact while providing professional-grade plant care.",
      icon: "/assets/icons/eco.svg",
      color: "#4ECDC4",
      image: "/assets/product-eco.jpg"
    }
  ];

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section ref={ref} className="w-full bg-gradient-to-b from-[#F9F7F0] to-[#D8C9A7] px-4 py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-[#FF6B6B]"></div>
        <div className="absolute top-40 right-10 w-40 h-40 rounded-full bg-[#00C9B0]"></div>
        <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-[#4ECDC4]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="flex flex-col items-center mb-20"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-5xl md:text-6xl font-bold mb-6 text-[#FF6B6B] tracking-tight"
          >
            What We're Doing
          </motion.h2>
          
          <motion.div 
            variants={fadeInUp}
            className="text-2xl font-medium text-center max-w-2xl mb-4 text-gray-800"
          >
            Plant Care Simplified
          </motion.div>
          
          <motion.div variants={fadeInUp} className="w-24 h-1.5 bg-[#00C9B0] rounded-full mb-8"></motion.div>
          
          <motion.p 
            variants={fadeInUp}
            className="text-center max-w-2xl text-gray-600 text-lg"
          >
            Liquid concentrated nutrients - creating the new standard for plant care, accessible to all.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Product Image - 5 columns */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-5 aspect-square relative"
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-white rounded-[40px] shadow-2xl overflow-hidden transform -rotate-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full p-6"
                  >
                    <div className="w-full h-full rounded-[32px] overflow-hidden bg-gradient-to-br from-white to-gray-100 relative">
                      <Image
                        src="/assets/productwithleaf.png"
                        alt="TPS Product"
                        fill
                        className="object-contain p-8"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <p className="text-white text-sm font-medium uppercase tracking-wider">
                          Premium Plant Nutrients
                        </p>
                        <h3 className="text-white text-2xl font-bold">
                          {features[activeFeature].title}
                        </h3>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Product tag */}
              <div className="absolute -top-5 -right-5 bg-[#FF6B6B] text-white px-5 py-2 rounded-full shadow-lg transform rotate-12 font-bold z-10">
                New Formula
              </div>
            </div>
            
            {/* Indicator dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    activeFeature === index 
                      ? `bg-[${features[index].color}] scale-110 ring-2 ring-offset-2 ring-[${features[index].color}]/30` 
                      : "bg-gray-300"
                  }`}
                  aria-label={`View ${features[index].title}`}
                />
              ))}
            </div>
          </motion.div>

          {/* Features - 7 columns */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:col-span-7 space-y-6"
          >
            <h3 className="text-3xl font-bold text-gray-800 mb-8">Redefining Plant Care</h3>
            
            <div className="space-y-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  onClick={() => setActiveFeature(index)}
                  className={`relative p-6 rounded-2xl transition-all duration-300 cursor-pointer ${
                    activeFeature === index 
                      ? `bg-white shadow-xl border-l-[6px] border-[${feature.color}]` 
                      : "bg-white/70 hover:bg-white hover:shadow-md border-l-[6px] border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <div className={`p-3 rounded-xl ${
                      activeFeature === index ? `bg-[${feature.color}]/10 text-[${feature.color}]` : "bg-gray-100"
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className={`text-xl font-semibold ${
                        activeFeature === index ? `text-[${feature.color}]` : "text-gray-800"
                      }`}>
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 mt-2">
                        {feature.description}
                      </p>
                    </div>
                    {activeFeature === index && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#FF6B6B]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#FF6B6B] text-white font-bold rounded-full shadow-lg transition-all duration-300 hover:bg-[#ff5252] hover:shadow-xl hover:translate-y-[-2px] hover:scale-105 text-lg tracking-wide"
              >
                Shop All Products
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhatWereDoing; 