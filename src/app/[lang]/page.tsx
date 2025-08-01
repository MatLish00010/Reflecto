import { HomeContent, HomeHeader } from '@/features/home-content';

export default function Home() {
  return (
    <div className="container mx-auto">
      <HomeHeader />
      <HomeContent />
    </div>
  );
}
