import { Suspense } from 'react';
import { HomeContent, HomeHeader } from '@/features/home-content';
import { HomeContentSkeleton } from '@/features/home-content/ui/home-content-skeleton';

export default function Home() {
  return (
    <div className="container mx-auto">
      <HomeHeader />
      <Suspense fallback={<HomeContentSkeleton />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
