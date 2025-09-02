import { useTranslation } from '@/shared/client/contexts/translation-context';
import { Share2 } from '@/shared/client/icons';
import { useAlertContext } from '@/shared/client/providers/alert-provider';
import { Button } from '@/shared/client/ui/button';
import { safeSentry } from '@/shared/common/lib/sentry';
import type { AISummaryData } from '@/shared/common/types';

interface ShareButtonProps {
  summary: AISummaryData;
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

    if (summary.recommendations && summary.recommendations.length > 0) {
      parts.push(
        `\n🎯 ${t('aiAnalysis.recommendations')}:\n${summary.recommendations.map(rec => `• ${rec}`).join('\n')}`
      );
    }

    if (summary.triggers && summary.triggers.length > 0) {
      parts.push(
        `\n⚡ ${t('aiAnalysis.triggers')}:\n${summary.triggers.map(trigger => `• ${trigger}`).join('\n')}`
      );
    }

    if (summary.ideas && summary.ideas.length > 0) {
      parts.push(
        `\n💡 ${t('aiAnalysis.ideas')}:\n${summary.ideas.map(idea => `• ${idea}`).join('\n')}`
      );
    }

    parts.push(`\n${'─'.repeat(40)}`);
    parts.push(`🔗 ${t('aiAnalysis.poweredBy')}: ${t('app.title')}`);

    if (currentUrl) {
      parts.push(`🌐 ${t('aiAnalysis.tryItYourself')}: ${currentUrl}`);
    }

    return parts.join('\n');
  };

  const handleShare = async () => {
    return safeSentry.startSpanAsync(
      {
        op: 'ui.click',
        name: 'Share AI Summary',
      },
      async span => {
        try {
          span.setAttribute('component', 'ShareButton');
          span.setAttribute('action', 'shareSummary');
          span.setAttribute('summary.hasMainStory', !!summary.mainStory);
          span.setAttribute(
            'summary.keyEventsCount',
            summary.keyEvents?.length || 0
          );

          const text = formatSummaryForSharing();

          if (navigator.share) {
            await navigator.share({
              title: t('aiAnalysis.shareTitle'),
              text: text,
            });
            span.setAttribute('share.method', 'native');
          } else {
            await navigator.clipboard.writeText(text);
            showSuccess(t('aiAnalysis.copiedToClipboard'));
            span.setAttribute('share.method', 'clipboard');
          }

          span.setAttribute('success', true);
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            span.setAttribute('share.aborted', true);
            return;
          }

          safeSentry.captureException(error as Error, {
            tags: {
              component: 'ShareButton',
              action: 'shareSummary',
            },
            extra: {
              hasNativeShare: !!navigator.share,
              hasClipboard: !!navigator.clipboard,
            },
          });
          span.setAttribute('error', true);

          const { logger } = safeSentry;
          logger.error('Error sharing summary', {
            component: 'ShareButton',
            hasNativeShare: !!navigator.share,
            hasClipboard: !!navigator.clipboard,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          try {
            const text = formatSummaryForSharing();
            await navigator.clipboard.writeText(text);
            showSuccess(t('aiAnalysis.copiedToClipboard'));
            span.setAttribute('fallback.success', true);
          } catch {
            showError(t('aiAnalysis.shareError'));
            span.setAttribute('fallback.error', true);
          }
        }
      }
    );
  };

  return (
    <Button onClick={handleShare} size="sm" variant="gradient">
      <Share2 className="h-4 w-4 mr-2" />
      {t('aiAnalysis.share')}
    </Button>
  );
}
