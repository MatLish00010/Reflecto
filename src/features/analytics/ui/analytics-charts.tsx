'use client';

import * as Sentry from '@sentry/nextjs';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useFormatters } from '@/shared/hooks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

const COLORS = [
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

import type {
  ActivityDataPoint,
  ComparativeStats,
  ContentAnalysisData,
  EmotionalData,
  TimeAnalysisDataPoint,
  WeeklyActivityDataPoint,
} from '../types/analytics';

interface AnalyticsChartsProps {
  activityData: ActivityDataPoint[];
  weeklyActivityData: WeeklyActivityDataPoint[];
  contentAnalysisData: ContentAnalysisData;
  timeAnalysisData: TimeAnalysisDataPoint[];
  emotionalData: EmotionalData;
  comparativeStats: ComparativeStats;
}

export function AnalyticsCharts({
  activityData,
  weeklyActivityData,
  contentAnalysisData,
  timeAnalysisData,
  emotionalData,
  comparativeStats,
}: AnalyticsChartsProps) {
  const { t } = useTranslation();
  const { formatDate } = useFormatters();

  return Sentry.startSpan(
    {
      op: 'ui.component',
      name: 'Analytics Charts Render',
    },
    span => {
      span.setAttribute('activityDataPoints', activityData.length);
      span.setAttribute('weeklyDataPoints', weeklyActivityData.length);
      span.setAttribute('timeDataPoints', timeAnalysisData.length);
      span.setAttribute('hasContentAnalysis', !!contentAnalysisData);
      span.setAttribute('hasEmotionalData', !!emotionalData);

      const chartDateFormatter = (value: string) => formatDate(value, 'SHORT');
      const chartTooltipFormatter = (value: string) =>
        formatDate(value, 'LONG');

      return (
        <Tabs defaultValue="activity" className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="flex w-max min-w-full">
              <TabsTrigger value="activity">
                {t('analytics.activity')}
              </TabsTrigger>
              <TabsTrigger value="weekly">{t('analytics.weekly')}</TabsTrigger>
              <TabsTrigger value="content">
                {t('analytics.content')}
              </TabsTrigger>
              <TabsTrigger value="time">{t('analytics.time')}</TabsTrigger>
              <TabsTrigger value="productivity">
                {t('analytics.achievements')}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.dailyActivity')}</CardTitle>
                <CardDescription>
                  {t('analytics.dailyActivityDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={chartDateFormatter} />
                    <YAxis />
                    <Tooltip labelFormatter={chartTooltipFormatter} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#0088FE"
                      fill="#0088FE"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.weeklyActivity')}</CardTitle>
                <CardDescription>
                  {t('analytics.weeklyActivityDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={weeklyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#00C49F"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.activityHeatmap')}</CardTitle>
                <CardDescription>
                  {t('analytics.activityHeatmapDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {[
                    t('analytics.weekdays.mon'),
                    t('analytics.weekdays.tue'),
                    t('analytics.weekdays.wed'),
                    t('analytics.weekdays.thu'),
                    t('analytics.weekdays.fri'),
                    t('analytics.weekdays.sat'),
                    t('analytics.weekdays.sun'),
                  ].map(day => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium p-2"
                    >
                      {day}
                    </div>
                  ))}
                  {contentAnalysisData.weekdayActivity.map((count, index) => (
                    <div
                      key={`weekday-${index}`}
                      className="h-8 rounded flex items-center justify-center text-xs"
                      style={{
                        backgroundColor: `rgba(0, 136, 254, ${Math.min(count / 10, 1)})`,
                        color: count > 5 ? 'white' : 'inherit',
                      }}
                    >
                      {count}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.noteLengthsTitle')}</CardTitle>
                <CardDescription>
                  {t('analytics.noteLengthsDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={contentAnalysisData.lengthDistribution.filter(
                        entry => entry.value > 0
                      )}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent, x, y, cx, cy }) => {
                        const radius = 150;
                        const angle = Math.atan2(y - cy, x - cx);
                        const labelX = cx + radius * 0.7 * Math.cos(angle);
                        const labelY = cy + radius * 0.7 * Math.sin(angle);

                        return (
                          <text
                            x={labelX}
                            y={labelY}
                            fill="white"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={12}
                            fontWeight="bold"
                          >
                            {`${((percent || 0) * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {contentAnalysisData.lengthDistribution
                        .filter(entry => entry.value > 0)
                        .map((entry, index) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="time" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.timeOfDay')}</CardTitle>
                <CardDescription>
                  {t('analytics.timeOfDayDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="productivity" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.weekdayProductivity')}</CardTitle>
                  <CardDescription>
                    {t('analytics.weekdayProductivityDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={emotionalData.weekdayProductivity}>
                      <PolarGrid />
                      <PolarAngleAxis
                        dataKey="day"
                        type="category"
                        reversed={false}
                        scale="auto"
                      />
                      <PolarRadiusAxis />
                      <Radar
                        name={t('analytics.achievements')}
                        dataKey="productivity"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                        label={({
                          value,
                          x,
                          y,
                        }: {
                          value: number;
                          x: number;
                          y: number;
                        }) => (
                          <text
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={12}
                            fontWeight="bold"
                            fill="#8884d8"
                          >
                            {value}
                          </text>
                        )}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.comparison')}</CardTitle>
                  <CardDescription>
                    {t('analytics.comparisonDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {t('analytics.currentMonth')}
                      </span>
                      <span className="font-bold">
                        {comparativeStats.currentMonth}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {t('analytics.previousMonth')}
                      </span>
                      <span className="font-bold">
                        {comparativeStats.previousMonth}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {t('analytics.improvement')}
                      </span>
                      <span
                        className={`font-bold ${comparativeStats.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {comparativeStats.improvement > 0 ? '+' : ''}
                        {comparativeStats.improvement}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      );
    }
  );
}
