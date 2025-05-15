import Hero from "@/components/Hero";
import ShopByPlant from "@/components/ShopByPlant";
import PlantCare from "@/components/PlantCare";
import BundlePromo from '@/components/BundlePromo';
import WhyTPS from '@/components/WhyTPS';
import Reviews from '@/components/Reviews';
import SectionDivider from '@/components/SectionDivider';
import WhoWeAre from '@/components/WhoWeAre';
import WhatWereDoing from '@/components/WhatWereDoing';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FDF6EF]">
      <Hero />
      <ShopByPlant />
      <SectionDivider label="Who We Are" />
      <WhoWeAre />
      <SectionDivider label="What We're Doing" />
      <WhatWereDoing />
      <SectionDivider label="Plant Care Tips" />
      <PlantCare />
      <SectionDivider label="Exclusive Bundles" />
      <BundlePromo />
      <SectionDivider label="Why Choose TPS" />
      <WhyTPS />
      <SectionDivider label="Customer Reviews" />
      <Reviews />
    </main>
  );
}
