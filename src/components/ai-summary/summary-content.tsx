import { Clock, Heart, Lightbulb, Sparkles, Target } from 'lucide-react';
import { SummaryCard } from './summary-card';
import { ThemesTags } from './themes-tags';
import { ShareButton } from './share-button';

interface SummaryContentProps {
  summary: {
    mainStory: string;
    keyEvents?: string[];
    emotionalMoments?: string[];
    observations?: string[];
    recommendations?: string[];
    keyThemes?: string[];
  };
}

export function SummaryContent({ summary }: SummaryContentProps) {
  return (
    <div className="space-y-2">
      <SummaryCard
        icon={Sparkles}
        title="aiAnalysis.mainStory"
        content={summary.mainStory}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SummaryCard
          icon={Clock}
          title="aiAnalysis.keyEvents"
          content={summary.keyEvents || []}
          bulletColor="bg-blue-500"
        />

        <SummaryCard
          icon={Heart}
          title="aiAnalysis.emotionalMoments"
          content={summary.emotionalMoments || []}
          bulletColor="bg-pink-500"
        />
      </div>

      <SummaryCard
        icon={Lightbulb}
        title="aiAnalysis.observations"
        content={summary.observations || []}
        bulletColor="bg-yellow-500"
      />

      <SummaryCard
        icon={Target}
        title="aiAnalysis.recommendations"
        content={summary.recommendations || []}
        bulletColor="bg-green-500"
      />

      <ThemesTags themes={summary.keyThemes || []} />

      <div className="flex justify-center pt-4">
        <ShareButton summary={summary} />
      </div>
    </div>
  );
}
