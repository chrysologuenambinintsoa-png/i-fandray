import { newsService } from '@/lib/newsService';

async function syncNews() {
  console.log('Starting news synchronization...');

  try {
    // Sync news for different categories
    const categories = ['business', 'technology', 'sports', 'entertainment', 'science'];

    for (const category of categories) {
      console.log(`Syncing ${category} news...`);
      await newsService.syncNewsToDatabase(category);
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Also sync general news
    console.log('Syncing general news...');
    await newsService.syncNewsToDatabase();

    console.log('News synchronization completed successfully!');
  } catch (error) {
    console.error('Error during news synchronization:', error);
    process.exit(1);
  }
}

// Run the sync if this script is called directly
if (require.main === module) {
  syncNews();
}

export { syncNews };