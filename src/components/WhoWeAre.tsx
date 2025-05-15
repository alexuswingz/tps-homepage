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
    <section 
      id="who-we-are" 
      className="w-full relative min-h-[900px] sm:min-h-[1000px] md:min-h-[110vh] flex items-center"
      style={{
        backgroundImage: 'url(/assets/whoweare-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '7rem 1rem 12rem'
      }}
    >
      <div className="max-w-[1400px] mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-12 items-start lg:pt-[10%]"
        >
          {/* Text Content */}
          <motion.div 
            variants={itemVariants} 
            className="text-shadow-sm lg:col-span-5 xl:col-span-4 lg:col-start-2 xl:col-start-2 max-w-lg lg:max-w-md"
          >
            <h2 className="text-[2.25rem] sm:text-4xl lg:text-[2rem] font-bold text-white mb-3 sm:mb-4 lg:mb-3">
              Who We Are
            </h2>
            <p className="text-[1.125rem] sm:text-xl lg:text-[1.2rem] text-white mb-3 sm:mb-4 lg:mb-3 leading-relaxed font-medium">
              We want to inspire people to feel like they can do this.
            </p>
            <h3 className="text-base sm:text-lg lg:text-[1.05rem] font-semibold text-white mb-2 sm:mb-4 lg:mb-2">Plant Care Simplified</h3>
            <ul className="space-y-1.5 sm:space-y-3 lg:space-y-2 mb-4 sm:mb-6 lg:mb-4">
              {[
                'Make plant care accessible to everyone',
                'Provide plant-specific solutions',
                'Build confidence for all growers'
              ].map((mission, index) => (
                <li key={index} className="flex items-center text-[0.9rem] sm:text-base lg:text-[0.95rem] font-medium text-white">
                  <Image 
                    src="/assets/leaf.png"
                    alt="Leaf icon"
                    width={20}
                    height={20}
                    className="mr-2 sm:mr-3 lg:mr-2.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 lg:w-[1.1rem] lg:h-[1.1rem]"
                  />
                  {mission}
                </li>
              ))}
            </ul>
            
            <div className="mt-4 sm:mt-6 lg:mt-4">
              <a 
                href="/shop"
                className="bg-[#FF6B6B] text-white px-7 sm:px-8 lg:px-7 py-3 sm:py-3.5 lg:py-3 rounded-full text-[0.9rem] sm:text-base lg:text-[0.95rem] font-semibold inline-block hover:bg-[#ff5252] transition-all duration-300 uppercase tracking-wide shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Shop All
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhoWeAre; 