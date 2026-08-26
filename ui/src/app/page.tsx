'use client';
import dynamic from 'next/dynamic';

// dynamically import the map to avoid window not defined errors
const LocationMap = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-black">
      Loading map interface...
    </div>
  )
});

export default function Home() {
  return (
    <main className="h-screen w-full bg-gray-100">
      <LocationMap />
    </main>
  );
}