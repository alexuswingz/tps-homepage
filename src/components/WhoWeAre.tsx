"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const WhoWeAre = () => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.2 }
    );

    const section = document.getElementById('who-we-are');
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <section id="who-we-are" className="w-full bg-[#FDF6EF] px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
        >
          {/* Left Side - Text Content */}
          <motion.div variants={itemVariants} className="order-2 lg:order-1">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#FF6B6B] mb-6">
              Who We Are
            </h2>
            <p className="text-xl sm:text-2xl text-gray-700 mb-6 leading-relaxed">
              We want to inspire people to feel like they can do this.
            </p>
            <h3 className="text-lg sm:text-xl font-semibold text-[#8B7355] mb-4 sm:mb-6">Plant Care Simplified</h3>
            <ul className="space-y-3 sm:space-y-4 mb-8">
              {[
                'Make plant care accessible to everyone',
                'Provide plant-specific solutions',
                'Build confidence for all growers'
              ].map((mission, index) => (
                <li key={index} className="flex items-center text-base sm:text-lg lg:text-xl font-medium text-gray-800">
                  <Image 
                    src="/assets/leaf.png"
                    alt="Leaf icon"
                    width={20}
                    height={20}
                    className="mr-3 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6"
                  />
                  {mission}
                </li>
              ))}
            </ul>
            
            <div className="mt-8">
              <a 
                href="/shop"
                className="bg-[#FF6B6B] text-white px-8 sm:px-10 lg:px-10 py-3.5 sm:py-4 rounded-full text-base sm:text-lg font-semibold inline-block hover:bg-[#ff5252] transition-all duration-300 uppercase tracking-wide shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Shop All
              </a>
            </div>
          </motion.div>
          
          {/* Right Side - Image */}
          <motion.div 
            variants={itemVariants} 
            className="order-1 lg:order-2 relative aspect-square rounded-[40px] overflow-hidden shadow-xl"
          >
            <Image
              src="/assets/woman-holding-plants.jpg"
              alt="Our Team"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-8">
              <div className="relative z-10">
                <h3 className="text-white text-2xl font-bold">Our Team</h3>
                <p className="text-white/90">Plant enthusiasts passionate about helping you succeed</p>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 opacity-50">
                  <Image
                    src="/assets/leaf.png"
                    alt="Decorative leaf"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhoWeAre; 