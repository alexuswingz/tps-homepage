import Hero from "@/components/Hero";
import ShopByPlant from "@/components/ShopByPlant";
import PlantCare from "@/components/PlantCare";
import BundlePromo from '@/components/BundlePromo';
import WhyTPS from '@/components/WhyTPS';
import Reviews from '@/components/Reviews';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FDF6EF]">
      <Hero />
      <ShopByPlant />
      <PlantCare />
      <BundlePromo />
      <WhyTPS />
      <Reviews />
    </main>
  );
}
