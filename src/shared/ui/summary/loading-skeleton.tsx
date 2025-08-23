'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/shared/contexts/translation-context';
import { Brain, Loader2 } from '@/shared/icons';

const PROGRESS_CONFIG = {
  emotions: { max: 100, increment: 25, color: 'purple' as const },
  patterns: { max: 100, increment: 20, color: 'blue' as const },
  insights: { max: 100, increment: 15, color: 'green' as const },
} as const;

const UPDATE_INTERVAL = 300;

const brainPulseAnimation = `
  @keyframes brainPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  .animate-brain-pulse {
    animation: brainPulse 2s ease-in-out infinite;
  }
`;

interface ProgressBarProps {
  label: string;
  color: 'purple' | 'blue' | 'green';
  progress: number;
}

interface ProgressState {
  emotions: number;
  patterns: number;
  insights: number;
}

const ProgressBar = ({ label, color, progress }: ProgressBarProps) => {
  const colorClass = useMemo(() => {
    const colorClasses = {
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
    };
    return colorClasses[color];
  }, [color]);

  return (
    <div className="flex items-center space-x-3 mb-4">
      <div
        className={`w-[10.5px] h-[10.5px] rounded-full ${colorClass} animate-brain-pulse`}
      />
      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">
        {label}
      </div>
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ease-out ${colorClass} animate-brain-pulse`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const LoadingHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center mb-8">
      <h2 className="text-gray-900 dark:text-gray-100 mb-2 text-sm font-normal">
        {t('aiAnalysis.analyzingYourEntries')}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-xs">
        {t('aiAnalysis.aiProcessingThoughts')}
      </p>
    </div>
  );
};

const LoadingIcons = () => (
  <>
    <div className="mb-6">
      <Brain className="w-12 h-12 text-purple-500 animate-brain-pulse" />
    </div>
    <div className="mb-8">
      <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
    </div>
  </>
);

export function AISummaryLoadingSkeleton() {
  const { t } = useTranslation();
  const [progress, setProgress] = useState<ProgressState>({
    emotions: 0,
    patterns: 0,
    insights: 0,
  });

  const updateProgress = useCallback(() => {
    setProgress(prev => {
      const newProgress = { ...prev };
      let hasChanges = false;

      Object.entries(PROGRESS_CONFIG).forEach(([key, config]) => {
        const currentProgress = newProgress[key as keyof ProgressState];
        if (currentProgress < config.max) {
          newProgress[key as keyof ProgressState] = Math.min(
            config.max,
            currentProgress + Math.random() * config.increment
          );
          hasChanges = true;
        }
      });

      return hasChanges ? newProgress : prev;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(updateProgress, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [updateProgress]);

  const progressBars = useMemo(
    () => [
      {
        label: t('aiAnalysis.emotionAnalysis'),
        color: PROGRESS_CONFIG.emotions.color,
        progress: progress.emotions,
      },
      {
        label: t('aiAnalysis.patternSearch'),
        color: PROGRESS_CONFIG.patterns.color,
        progress: progress.patterns,
      },
      {
        label: t('aiAnalysis.insightGeneration'),
        color: PROGRESS_CONFIG.insights.color,
        progress: progress.insights,
      },
    ],
    [t, progress]
  );

  return (
    <>
      <style>{brainPulseAnimation}</style>
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <LoadingIcons />
        <LoadingHeader />

        <div className="w-full max-w-md">
          {progressBars.map(bar => (
            <ProgressBar
              key={bar.color}
              label={bar.label}
              color={bar.color}
              progress={bar.progress}
            />
          ))}
        </div>
      </div>
    </>
  );
}
