import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';

// UI Types
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof import('@/shared/client/ui/badge').badgeVariants> {
  variant?:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'premium'
    | 'subscription';
}

// Formatter Types
export type DateFormatType =
  | 'SHORT'
  | 'LONG'
  | 'FULL'
  | 'TIME'
  | 'DATETIME'
  | 'WEEK'
  | 'MONTH'
  | 'YEAR'
  | 'DAY'
  | 'MONTH_SHORT';

export type NumberFormatType = 'DEFAULT' | 'CURRENCY' | 'PERCENT' | 'FILE_SIZE';

// Language Types
export type SupportedLocale = 'ru' | 'en';
export type SummaryLocale = 'ru' | 'en';

import type { AISummaryData } from './index';

// Summary Types
export interface SummaryLabels {
  day: string;
  mainStory: string;
  keyEvents: string;
  emotionalMoments: string;
  ideas: string;
  triggers: string;
  resources: string;
  progress: string;
  observations: string;
  recommendations: string;
}

export interface SummaryField {
  key: keyof AISummaryData;
  label: string;
  isArray: boolean;
}

// Error Types
export interface ErrorFilterConfig {
  message: string | RegExp;
  reason: string;
  tags?: Record<string, string>;
}

export interface ErrorCategory {
  name: string;
  description: string;
  filters: ErrorFilterConfig[];
}
