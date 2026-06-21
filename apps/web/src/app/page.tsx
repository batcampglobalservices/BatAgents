import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedAgents } from "@/components/home/FeaturedAgents";

export default function Home() {
  return (
    <main className="flex-grow flex flex-col justify-center">
      <Hero />
      <HowItWorks />
      <FeaturedAgents />
    </main>
  );
}
