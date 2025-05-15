import Hero from "@/components/Hero";
import ShopByPlant from "@/components/ShopByPlant";
import PlantCare from "@/components/PlantCare";
import BundlePromo from '@/components/BundlePromo';
import WhyTPS from '@/components/WhyTPS';
import Reviews from '@/components/Reviews';
import SectionDivider from '@/components/SectionDivider';
import WhoWeAre from '@/components/WhoWeAre';
import WhatWereDoing from '@/components/WhatWereDoing';
import EmailDiscount from '@/components/EmailDiscount';
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FDF6EF]">
      <Hero />
      <div className="w-full relative">
        <Image
          src="/assets/tps-torn.png" 
          alt="Decorative torn paper edge"
          width={1920}
          height={30}
          className="w-full h-auto object-contain mx-auto"
          priority
        />
      </div>
      <ShopByPlant />
      <WhoWeAre />
      <WhatWereDoing />
      <SectionDivider label="Plant Care Tips" />
      <PlantCare />
      <SectionDivider label="Exclusive Bundles" />
      <BundlePromo />
      <SectionDivider label="Why Choose TPS" />
      <WhyTPS />
      <SectionDivider label="Customer Reviews" />
      <Reviews />
      <EmailDiscount />
    </main>
  );
}
