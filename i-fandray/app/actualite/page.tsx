import { NewsAggregator } from '@/components/NewsAggregator';
import { NewsSync } from '@/components/NewsSync';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="flex pt-16">
        <Sidebar currentPage="actualite" />

        <main className="flex-1 lg:ml-64">
          <div className="container mx-auto px-4 py-8">
            <NewsSync />
            <NewsAggregator />
          </div>
        </main>
      </div>
    </div>
  );
}