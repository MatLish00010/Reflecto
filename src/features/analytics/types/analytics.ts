export interface Note {
  id: number;
  note: string | null;
  created_at: string;
  user_id: string | null;
}

export interface DailySummary {
  id: string;
  summary: string;
  created_at: string | null;
  user_id: string;
}

export interface WeeklySummary {
  id: string;
  summary: string;
  created_at: string | null;
  user_id: string | null;
  week_start_date: string;
  week_end_date: string;
}

export interface ActivityDataPoint {
  date: string;
  count: number;
}

export interface WeeklyActivityDataPoint {
  week: string;
  count: number;
}

export interface LengthDistributionItem {
  name: string;
  value: number;
  key: string;
}

export interface ContentAnalysisData {
  lengthDistribution: LengthDistributionItem[];
  weekdayActivity: number[];
}

export interface TimeAnalysisDataPoint {
  hour: string;
  count: number;
}

export interface SummaryStats {
  mostActiveDay: string;
  avgEntriesPerDay: string;
  totalCharacters: number;
}

export interface ProductivityStats {
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  longestNote: number;
}

export interface WeekdayProductivityItem {
  day: string;
  productivity: number;
  dayKey: string;
}

export interface EmotionalData {
  weekdayProductivity: WeekdayProductivityItem[];
}

export interface ComparativeStats {
  currentMonth: number;
  previousMonth: number;
  improvement: number;
}

export interface AnalyticsData {
  notes: Note[];
  dailySummaries: DailySummary[];
  weeklySummaries: WeeklySummary[];
  activityData: ActivityDataPoint[];
  weeklyActivityData: WeeklyActivityDataPoint[];
  contentAnalysisData: ContentAnalysisData;
  timeAnalysisData: TimeAnalysisDataPoint[];
  summaryStats: SummaryStats;
  productivityStats: ProductivityStats;
  emotionalData: EmotionalData;
  comparativeStats: ComparativeStats;
}
