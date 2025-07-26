import {
  Clock,
  Heart,
  Lightbulb,
  Sparkles,
  Target,
  Brain,
  Activity,
  Zap,
  TrendingUp,
  Shield,
  Star,
  LightbulbIcon,
} from 'lucide-react';
import { SummaryCard } from './summary-card';
import { ShareButton } from './share-button';
import { AISummaryData } from '@/shared/types';

interface SummaryContentProps {
  summary: AISummaryData;
}

export function SummaryContent({ summary }: SummaryContentProps) {
  return (
    <div className="space-y-2">
      <div className="space-y-4">
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

          {summary.ideas && summary.ideas.length > 0 && (
            <SummaryCard
              icon={LightbulbIcon}
              title="aiAnalysis.ideas"
              content={summary.ideas}
              bulletColor="bg-cyan-500"
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <SummaryCard
              icon={Brain}
              title="aiAnalysis.cognitivePatterns"
              content={summary.cognitivePatterns || []}
              bulletColor="bg-purple-500"
            />

            <SummaryCard
              icon={Activity}
              title="aiAnalysis.behavioralPatterns"
              content={summary.behavioralPatterns || []}
              bulletColor="bg-indigo-500"
            />
          </div>

          {summary.triggers && summary.triggers.length > 0 && (
            <SummaryCard
              icon={Zap}
              title="aiAnalysis.triggers"
              content={summary.triggers}
              bulletColor="bg-red-500"
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <SummaryCard
              icon={Shield}
              title="aiAnalysis.resources"
              content={summary.resources || []}
              bulletColor="bg-emerald-500"
            />

            <SummaryCard
              icon={TrendingUp}
              title="aiAnalysis.progress"
              content={summary.progress || []}
              bulletColor="bg-teal-500"
            />
          </div>

          <SummaryCard
            icon={Lightbulb}
            title="aiAnalysis.observations"
            content={summary.observations || []}
            bulletColor="bg-yellow-500"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <SummaryCard
              icon={Target}
              title="aiAnalysis.recommendations"
              content={summary.recommendations || []}
              bulletColor="bg-green-500"
            />

            <SummaryCard
              icon={Star}
              title="aiAnalysis.copingStrategies"
              content={summary.copingStrategies || []}
              bulletColor="bg-amber-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <ShareButton summary={summary} />
      </div>
    </div>
  );
}
