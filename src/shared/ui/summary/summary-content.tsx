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
import { SummaryCard } from './summary-card';
import { HeroSummaryCard } from './hero-summary-card';
import { CARD_COLOR_SCHEMES } from './color-schemes';

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
        {summary.keyEvents && summary.keyEvents.length > 0 && (
          <SummaryCard
            icon={Clock}
            titleKey="aiAnalysis.keyEvents"
            content={summary.keyEvents}
            {...CARD_COLOR_SCHEMES.keyEvents}
          />
        )}
        {summary.emotionalMoments && summary.emotionalMoments.length > 0 && (
          <SummaryCard
            icon={Heart}
            titleKey="aiAnalysis.emotionalMoments"
            content={summary.emotionalMoments}
            {...CARD_COLOR_SCHEMES.emotionalMoments}
          />
        )}
        {summary.cognitivePatterns && summary.cognitivePatterns.length > 0 && (
          <SummaryCard
            icon={Target}
            titleKey="aiAnalysis.cognitivePatterns"
            content={summary.cognitivePatterns}
            {...CARD_COLOR_SCHEMES.cognitivePatterns}
          />
        )}
        {summary.behavioralPatterns &&
          summary.behavioralPatterns.length > 0 && (
            <SummaryCard
              icon={Activity}
              titleKey="aiAnalysis.behavioralPatterns"
              content={summary.behavioralPatterns}
              {...CARD_COLOR_SCHEMES.behavioralPatterns}
            />
          )}
        {summary.triggers && summary.triggers.length > 0 && (
          <SummaryCard
            icon={Zap}
            titleKey="aiAnalysis.triggers"
            content={summary.triggers}
            {...CARD_COLOR_SCHEMES.triggers}
          />
        )}
        {summary.resources && summary.resources.length > 0 && (
          <SummaryCard
            icon={Shield}
            titleKey="aiAnalysis.resources"
            content={summary.resources}
            {...CARD_COLOR_SCHEMES.resources}
          />
        )}
        {summary.progress && summary.progress.length > 0 && (
          <SummaryCard
            icon={TrendingUp}
            titleKey="aiAnalysis.progress"
            content={summary.progress}
            {...CARD_COLOR_SCHEMES.progress}
          />
        )}
        {summary.observations && summary.observations.length > 0 && (
          <SummaryCard
            icon={Star}
            titleKey="aiAnalysis.observations"
            content={summary.observations}
            {...CARD_COLOR_SCHEMES.observations}
          />
        )}
      </div>
      {summary.ideas && summary.ideas.length > 0 && (
        <SummaryCard
          icon={LightbulbIcon}
          titleKey="aiAnalysis.ideas"
          content={summary.ideas}
          {...CARD_COLOR_SCHEMES.ideas}
        />
      )}
      {summary.recommendations && summary.recommendations.length > 0 && (
        <SummaryCard
          icon={Brain}
          titleKey="aiAnalysis.recommendations"
          content={summary.recommendations}
          {...CARD_COLOR_SCHEMES.recommendations}
        />
      )}
      {summary.copingStrategies && summary.copingStrategies.length > 0 && (
        <SummaryCard
          icon={Lightbulb}
          titleKey="aiAnalysis.copingStrategies"
          content={summary.copingStrategies}
          {...CARD_COLOR_SCHEMES.copingStrategies}
        />
      )}
      <div className="flex justify-center">
        <ShareButton summary={summary} />
      </div>
    </div>
  );
}
