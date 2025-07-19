import { Share2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useAlertContext } from '@/shared/providers/alert-provider';

interface ShareButtonProps {
  summary: {
    mainStory: string;
    keyEvents?: string[];
    emotionalMoments?: string[];
    observations?: string[];
    recommendations?: string[];
    keyThemes?: string[];
  };
}

export function ShareButton({ summary }: ShareButtonProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useAlertContext();

  const formatSummaryForSharing = () => {
    const parts = [];

    const currentUrl =
      typeof window !== 'undefined' ? window.location.origin : null;

    parts.push(`📱 ${t('app.title')} - ${t('app.description')}`);
    parts.push('─'.repeat(40));

    if (summary.mainStory) {
      parts.push(`📖 ${t('aiAnalysis.mainStory')}:\n${summary.mainStory}`);
    }

    if (summary.keyEvents && summary.keyEvents.length > 0) {
      parts.push(
        `\n⏰ ${t('aiAnalysis.keyEvents')}:\n${summary.keyEvents.map(event => `• ${event}`).join('\n')}`
      );
    }

    if (summary.emotionalMoments && summary.emotionalMoments.length > 0) {
      parts.push(
        `\n💝 ${t('aiAnalysis.emotionalMoments')}:\n${summary.emotionalMoments.map(moment => `• ${moment}`).join('\n')}`
      );
    }

    if (summary.observations && summary.observations.length > 0) {
      parts.push(
        `\n💡 ${t('aiAnalysis.observations')}:\n${summary.observations.map(obs => `• ${obs}`).join('\n')}`
      );
    }

    if (summary.recommendations && summary.recommendations.length > 0) {
      parts.push(
        `\n🎯 ${t('aiAnalysis.recommendations')}:\n${summary.recommendations.map(rec => `• ${rec}`).join('\n')}`
      );
    }

    if (summary.keyThemes && summary.keyThemes.length > 0) {
      parts.push(
        `\n🏷️ ${t('aiAnalysis.keyThemes')}:\n${summary.keyThemes.join(', ')}`
      );
    }

    parts.push('\n' + '─'.repeat(40));
    parts.push(`🔗 ${t('aiAnalysis.poweredBy')}: ${t('app.title')}`);

    if (currentUrl) {
      parts.push(`🌐 ${t('aiAnalysis.tryItYourself')}: ${currentUrl}`);
    }

    return parts.join('\n');
  };

  const handleShare = async () => {
    const text = formatSummaryForSharing();

    try {
      if (navigator.share) {
        await navigator.share({
          title: t('aiAnalysis.shareTitle'),
          text: text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        showSuccess(t('aiAnalysis.copiedToClipboard'));
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(text);
        showSuccess(t('aiAnalysis.copiedToClipboard'));
      } catch {
        showError(t('aiAnalysis.shareError'));
      }
    }
  };

  return (
    <Button onClick={handleShare} size="sm" className="btn-gradient-scale">
      <Share2 className="h-4 w-4 mr-2" />
      {t('aiAnalysis.share')}
    </Button>
  );
}
