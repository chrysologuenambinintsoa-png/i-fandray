import { VideoReelAggregator } from '@/components/VideoReelAggregator';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

export default function VideoReelPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="flex pt-16">
        <Sidebar currentPage="actualite" />

        <main className="flex-1 lg:ml-64">
          <div className="container mx-auto px-4 py-8">
            <VideoReelAggregator />
          </div>
        </main>
      </div>
    </div>
  );
}