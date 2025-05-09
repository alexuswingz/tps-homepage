"use client";

import Image from 'next/image';
import { useState } from 'react';
import React from 'react';

type Competitor = 'miraclegro' | 'espoma' | 'osmocote';

const WhyTPS = () => {
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor>('miraclegro');

  const features = [
    { label: 'Micro-', boldLabel: 'Nutrients', checks: [true, false, false, true] },
    { label: 'Enriched with', boldLabel: 'Seaweed', checks: [true, false, true, false] },
    { label: 'Plant-Specific', boldLabel: 'Instructions', checks: [true, false, false, false] }
  ];

  const competitors: Record<Competitor, { name: string; logo: string }> = {
    miraclegro: { name: 'Miracle-Gro', logo: '/assets/logo/miraclegro.png' },
    espoma: { name: 'Espoma', logo: '/assets/logo/espoma.png' },
    osmocote: { name: 'Osmocote', logo: '/assets/logo/osmocote.png' }
  };

  const getCompetitorCheck = (featureIndex: number, competitor: Competitor) => {
    const competitorIndex = ['miraclegro', 'espoma', 'osmocote'].indexOf(competitor);
    return features[featureIndex].checks[competitorIndex + 1];
  };

  return (
    <section className="w-full bg-[#FDF6EF] px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold text-center text-[#FF6B6B] mb-12">
          Why TPS?
        </h2>

        {/* Desktop Table (hidden on mobile) */}
        <div className="hidden md:block">
          <div className="grid grid-cols-5 rounded-[40px] overflow-hidden relative">
            {/* TPS column background - covers entire column 2 */}
            <div className="absolute top-0 bottom-0 z-0 mx-1 ml-0.5 mr-5" 
                 style={{ left: 'calc(20% + .3px)', width: 'calc(20% - 5px)' }}>
              <video
                src="/assets/watering.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover brightness-75 rounded-t-[40px]"
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-opacity-20 rounded-t-[40px]"></div>
            </div>

            {/* Header Row */}
            <div className="col-span-1 bg-transparent flex items-center justify-center border-b-2 border-r-2 border-[#FEF8E2]">
              {/* First column is intentionally blank */}
            </div>

            {/* TPS Logo */}
            <div className="col-span-1 flex items-center justify-center p-6 relative z-10 mx-1 ml-0.5 mr-5">
              <div className="relative z-10">
                <Image
                  src="/assets/logo/TPS_Plant Food_White_Horiz_Label_Logo.png"
                  alt="TPS Plant Food"
                  width={200}
                  height={60}
                  className="h-12 w-auto"
                  priority
                />
              </div>
            </div>

            {/* Competitor Logos */}
            <div className="col-span-1 bg-transparent p-6 flex items-center justify-center border-b-2 border-r-2 border-[#FEF8E2]">
              <Image
                src="/assets/logo/miraclegro.png"
                alt="Miracle-Gro"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <div className="col-span-1 bg-transparent p-6 flex items-center justify-center border-b-2 border-r-2 border-[#FEF8E2]">
              <Image
                src="/assets/logo/espoma.png"
                alt="Espoma"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <div className="col-span-1 bg-transparent p-6 flex items-center justify-center border-b-2 border-[#FEF8E2]">
              <Image
                src="/assets/logo/osmocote.png"
                alt="Osmocote"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>

            {/* Features Grid */}
            {[
              { label: 'Micro-', boldLabel: 'Nutrients', checks: [true, false, false, true] },
              { label: 'Enriched with', boldLabel: 'Seaweed', checks: [true, false, true, false] },
              { label: 'Plant-Specific', boldLabel: 'Instructions', checks: [true, false, false, false] }
            ].map((feature, index) => (
              <React.Fragment key={`feature-row-${index}`}>
                {/* Feature Label */}
                <div className="col-span-1">
                  <div className={`px-6 py-10 text-center bg-[#D8C9A7] text-gray-800 ${
                    index === 0 ? 'rounded-tl-lg' : ''
                  } ${index === 2 ? 'rounded-bl-lg' : ''} border-r-2 ${
                    index !== 0 ? 'border-t-2 border-[#CBBEA0]' : ''
                  } border-[#FEF8E2]`}>
                    <span>{feature.label}</span><br />
                    <span className="font-bold text-xl">{feature.boldLabel}</span>
                  </div>
                </div>

                {/* TPS Check */}
                <div className="col-span-1 relative z-10 mx-1 ml-0.5 mr-5">
                  <div className="relative h-full flex items-center justify-center py-10">
                    <div className="bg-[#27AE60] text-white rounded-full p-2 transition-transform duration-300 hover:scale-110">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Competitor Checks */}
                {feature.checks.slice(1).map((isCheck, idx) => (
                  <div key={`check-${index}-${idx}`} 
                       className={`col-span-1 bg-[#D8C9A7] text-gray-800 flex items-center justify-center ${
                         index !== 0 ? 'border-t-2' : ''
                       } ${idx !== 2 ? 'border-r-2' : ''} border-[#FEF8E2] py-10`}>
                    <div className={`${
                      isCheck ? 'bg-[#27AE60]' : 'bg-red-500'
                    } text-white rounded-full p-2 transition-transform duration-300 hover:scale-110`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2.5" 
                          d={isCheck ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} 
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Mobile Table */}
        <div className="block md:hidden">
          {/* Competitor Selector Tabs */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-full border-2 border-[#FF6B6B] bg-white overflow-hidden">
              {Object.entries(competitors).map(([key, value]) => (
                <button 
                  key={key}
                  onClick={() => setSelectedCompetitor(key as Competitor)}
                  className={`px-4 py-1.5 rounded-full font-medium text-sm transition-all ${
                    selectedCompetitor === key as Competitor ? 'bg-[#FF6B6B] text-white' : 'text-[#FF6B6B] bg-white'
                  }`}
                >
                  {value.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile comparison grid */}
          <div className="grid grid-cols-3 rounded-[40px] overflow-hidden relative">
            {/* TPS column background - covers middle column */}
            <div className="absolute top-0 bottom-0 z-0" style={{ left: 'calc(33.33% + 1px)', width: 'calc(33.33% - 2px)' }}>
              <video
                src="/assets/watering.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover brightness-75 rounded-t-[40px]"
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-opacity-20 rounded-t-[40px]"></div>
            </div>

            {/* Header Row */}
            <div className="col-span-1 bg-transparent flex items-center justify-center border-b-2 border-r-2 border-[#FEF8E2] p-4">
              {/* First column is intentionally blank */}
            </div>

            {/* TPS Logo */}
            <div className="col-span-1 flex items-center justify-center p-4 relative z-10">
              <div className="relative z-10">
                <Image
                  src="/assets/logo/TPS_Plant Food_White_Horiz_Label_Logo.png"
                  alt="TPS Plant Food"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              </div>
            </div>

            {/* Selected Competitor Logo */}
            <div className="col-span-1 bg-transparent p-4 flex items-center justify-center border-b-2 border-l-2 border-[#FEF8E2]">
              <Image
                src={competitors[selectedCompetitor].logo}
                alt={competitors[selectedCompetitor].name}
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>

            {/* Features Grid */}
            {features.map((feature, index) => (
              <React.Fragment key={`mobile-feature-${index}`}>
                {/* Feature Label */}
                <div className="col-span-1">
                  <div className={`px-4 py-8 text-center bg-[#D8C9A7] text-gray-800 ${
                    index === features.length - 1 ? 'rounded-bl-[40px]' : ''
                  } border-r-2 ${index !== 0 ? 'border-t-2 border-[#CBBEA0]' : ''} border-[#FEF8E2]`}>
                    <span>{feature.label}</span><br />
                    <span className="font-bold text-lg">{feature.boldLabel}</span>
                  </div>
                </div>

                {/* TPS Check */}
                <div className="col-span-1 relative z-10">
                  <div className="relative h-full flex items-center justify-center py-8 bg-transparent">
                    <div className="bg-[#27AE60] text-white rounded-full p-2 transition-transform duration-300 hover:scale-110">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Selected Competitor Check */}
                <div className={`col-span-1 bg-[#D8C9A7] text-gray-800 flex items-center justify-center ${
                  index !== 0 ? 'border-t-2' : ''
                } border-l-2 border-[#FEF8E2] py-8 ${
                  index === features.length - 1 ? 'rounded-br-[40px]' : ''
                }`}>
                  <div className={`${
                    getCompetitorCheck(index, selectedCompetitor) ? 'bg-[#27AE60]' : 'bg-red-500'
                  } text-white rounded-full p-2 transition-transform duration-300 hover:scale-110`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2.5" 
                        d={getCompetitorCheck(index, selectedCompetitor) ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} 
                      />
                    </svg>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">Based on independent lab testing and product analysis. Results may vary.</p>
        </div>
      </div>
    </section>
  );
};

export default WhyTPS; 