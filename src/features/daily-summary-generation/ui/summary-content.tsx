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
import { ShareButton } from './share-button';
import { AISummaryData } from '@/shared/types';
import {
  ModernSummaryCard,
  HeroSummaryCard,
  CARD_COLOR_SCHEMES,
} from '@/shared/ui';

interface SummaryContentProps {
  summary: AISummaryData;
}

export function SummaryContent({ summary }: SummaryContentProps) {
  return (
    <div className="space-y-6">
      <HeroSummaryCard
        icon={Sparkles}
        titleKey="aiAnalysis.mainStory"
        content={summary.mainStory}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ModernSummaryCard
          icon={Clock}
          titleKey="aiAnalysis.keyEvents"
          content={summary.keyEvents || []}
          {...CARD_COLOR_SCHEMES.keyEvents}
        />

        <ModernSummaryCard
          icon={Heart}
          titleKey="aiAnalysis.emotionalMoments"
          content={summary.emotionalMoments || []}
          {...CARD_COLOR_SCHEMES.emotionalMoments}
        />
      </div>

      {summary.ideas && summary.ideas.length > 0 && (
        <ModernSummaryCard
          icon={LightbulbIcon}
          titleKey="aiAnalysis.ideas"
          content={summary.ideas}
          {...CARD_COLOR_SCHEMES.ideas}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ModernSummaryCard
          icon={Brain}
          titleKey="aiAnalysis.cognitivePatterns"
          content={summary.cognitivePatterns || []}
          {...CARD_COLOR_SCHEMES.cognitivePatterns}
        />

        <ModernSummaryCard
          icon={Activity}
          titleKey="aiAnalysis.behavioralPatterns"
          content={summary.behavioralPatterns || []}
          {...CARD_COLOR_SCHEMES.behavioralPatterns}
        />
      </div>

      {summary.triggers && summary.triggers.length > 0 && (
        <ModernSummaryCard
          icon={Zap}
          titleKey="aiAnalysis.triggers"
          content={summary.triggers}
          {...CARD_COLOR_SCHEMES.triggers}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ModernSummaryCard
          icon={Shield}
          titleKey="aiAnalysis.resources"
          content={summary.resources || []}
          {...CARD_COLOR_SCHEMES.resources}
        />

        <ModernSummaryCard
          icon={TrendingUp}
          titleKey="aiAnalysis.progress"
          content={summary.progress || []}
          {...CARD_COLOR_SCHEMES.progress}
        />
      </div>

      <ModernSummaryCard
        icon={Lightbulb}
        titleKey="aiAnalysis.observations"
        content={summary.observations || []}
        {...CARD_COLOR_SCHEMES.observations}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ModernSummaryCard
          icon={Target}
          titleKey="aiAnalysis.recommendations"
          content={summary.recommendations || []}
          {...CARD_COLOR_SCHEMES.recommendations}
        />

        <ModernSummaryCard
          icon={Star}
          titleKey="aiAnalysis.copingStrategies"
          content={summary.copingStrategies || []}
          {...CARD_COLOR_SCHEMES.copingStrategies}
        />
      </div>

      <div className="flex justify-center pt-6">
        <div className="transform hover:scale-105 transition-transform duration-200">
          <ShareButton summary={summary} />
        </div>
      </div>
    </div>
  );
}
