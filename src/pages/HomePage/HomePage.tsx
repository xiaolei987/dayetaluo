import HeroSection from '@/pages/HomePage/HeroSection';
import SpreadGridSection from '@/pages/HomePage/SpreadGridSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="space-y-0">
        <HeroSection />
        <SpreadGridSection />
      </main>
    </div>
  );
}
