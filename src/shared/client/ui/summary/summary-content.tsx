import {
  Brain,
  Clock,
  Eye,
  Heart,
  LightbulbIcon,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { AISummaryData } from '@/shared/common/types';
import { CARD_COLOR_SCHEMES } from './color-schemes';
import { ShareButton } from './share-button';
import { SummaryCard } from './summary-card';

interface SummaryContentProps {
  summary: AISummaryData;
}

export function SummaryContent({ summary }: SummaryContentProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {summary.keyEvents && summary.keyEvents.length > 0 && (
          <SummaryCard
            icon={Clock}
            titleKey="aiAnalysis.keyEvents"
            content={summary.keyEvents}
            color={CARD_COLOR_SCHEMES.keyEvents.color}
          />
        )}
        {summary.conclusion && summary.conclusion.length > 0 && (
          <SummaryCard
            icon={Eye}
            titleKey="aiAnalysis.conclusion"
            content={summary.conclusion}
            color={CARD_COLOR_SCHEMES.conclusion.color}
          />
        )}
        {summary.triggers && summary.triggers.length > 0 && (
          <SummaryCard
            icon={Zap}
            titleKey="aiAnalysis.triggers"
            content={summary.triggers}
            color={CARD_COLOR_SCHEMES.triggers.color}
          />
        )}
        {summary.ideas && summary.ideas.length > 0 && (
          <SummaryCard
            icon={LightbulbIcon}
            titleKey="aiAnalysis.ideas"
            content={summary.ideas}
            color={CARD_COLOR_SCHEMES.ideas.color}
          />
        )}
        {summary.recommendations && summary.recommendations.length > 0 && (
          <SummaryCard
            icon={Brain}
            titleKey="aiAnalysis.recommendations"
            content={summary.recommendations}
            color={CARD_COLOR_SCHEMES.recommendations.color}
          />
        )}
        <SummaryCard
          icon={Sparkles}
          titleKey="aiAnalysis.mainStory"
          content={summary.mainStory}
          color={CARD_COLOR_SCHEMES.mainStory.color}
        />
        {summary.emotionalMoments && summary.emotionalMoments.length > 0 && (
          <SummaryCard
            icon={Heart}
            titleKey="aiAnalysis.emotionalMoments"
            content={summary.emotionalMoments}
            color={CARD_COLOR_SCHEMES.emotionalMoments.color}
          />
        )}
        {summary.observations && summary.observations.length > 0 && (
          <SummaryCard
            icon={Star}
            titleKey="aiAnalysis.observations"
            content={summary.observations}
            color={CARD_COLOR_SCHEMES.observations.color}
          />
        )}
        {summary.progress && summary.progress.length > 0 && (
          <SummaryCard
            icon={TrendingUp}
            titleKey="aiAnalysis.progress"
            content={summary.progress}
            color={CARD_COLOR_SCHEMES.progress.color}
          />
        )}
        {summary.resources && summary.resources.length > 0 && (
          <SummaryCard
            icon={Shield}
            titleKey="aiAnalysis.resources"
            content={summary.resources}
            color={CARD_COLOR_SCHEMES.resources.color}
          />
        )}
      </div>

      <div className="flex justify-center">
        <ShareButton summary={summary} />
      </div>
    </div>
  );
}
