// Analytics Types
export interface AISummaryData {
  mainStory: string;
  keyEvents: string[];
  emotionalMoments: string[];
  ideas: string[];
  triggers: string[];
  resources: string[];
  progress: string[];
  observations: string[];
  recommendations: string[];
  conclusion: string[];
}

export interface AnalyticsNote {
  id: number;
  note: string | null;
  created_at: string;
  user_id: string | null;
}

export interface DailySummary {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  date: string;
}

export interface WeeklySummary extends AISummaryData {
  id: string;
  created_at: string;
  user_id: string;
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
  weekdayActivity: ActivityDataPoint[];
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
  notes: AnalyticsNote[];
  dailySummaries: DailySummary[];
  weeklySummaries: WeeklySummary[];
  summaryStats: SummaryStats;
  productivityStats: ProductivityStats;
  activityData: ActivityDataPoint[];
  weeklyActivityData: WeeklyActivityDataPoint[];
  contentAnalysisData: ContentAnalysisData;
  timeAnalysisData: TimeAnalysisDataPoint[];
  emotionalData: EmotionalData;
  comparativeStats: ComparativeStats;
}
