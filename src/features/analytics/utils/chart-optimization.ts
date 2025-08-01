import { useMemo } from 'react';

export function useChartDataMemoization<T>(data: T[]): T[] {
  return useMemo(() => data, [data]);
}

export function useChartColorsMemoization(colors: string[]): string[] {
  return useMemo(() => colors, [colors]);
}

export const CHART_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
];
