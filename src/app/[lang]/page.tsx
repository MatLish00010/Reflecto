import { PageHeader } from '@/components/page-header';
import { TranslatedCards } from '@/components/translated-cards';

export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <PageHeader />
        <TranslatedCards />
      </div>
    </div>
  );
}
