'use client';

import dynamic from 'next/dynamic';

// Dynamically import recharts components with optimized loading
// Priority 1: Core components (most used)
export const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse bg-gray-200 rounded-lg" />
    ),
  }
);

export const BarChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.BarChart })),
  { ssr: false }
);

export const Bar = dynamic(
  () => import('recharts').then(mod => ({ default: mod.Bar })),
  { ssr: false }
);

export const XAxis = dynamic(
  () => import('recharts').then(mod => ({ default: mod.XAxis })),
  { ssr: false }
);

export const YAxis = dynamic(
  () => import('recharts').then(mod => ({ default: mod.YAxis })),
  { ssr: false }
);

export const CartesianGrid = dynamic(
  () => import('recharts').then(mod => ({ default: mod.CartesianGrid })),
  { ssr: false }
);

export const Tooltip = dynamic(
  () => import('recharts').then(mod => ({ default: mod.Tooltip })),
  { ssr: false }
);

// Priority 2: Line chart components
export const LineChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.LineChart })),
  { ssr: false }
);

export const Line = dynamic(
  () => import('recharts').then(mod => ({ default: mod.Line })),
  { ssr: false }
);

// Priority 3: Area chart components
export const AreaChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.AreaChart })),
  { ssr: false }
);

export const Area = dynamic(
  () => import('recharts').then(mod => ({ default: mod.Area })),
  { ssr: false }
);

// Priority 4: Pie chart components (less used)
export const PieChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.PieChart })),
  { ssr: false }
);

export const Pie = dynamic(
  () => import('recharts').then(mod => ({ default: mod.Pie })),
  { ssr: false }
);

export const Cell = dynamic(
  () => import('recharts').then(mod => ({ default: mod.Cell })),
  { ssr: false }
);

// Priority 5: Radar chart components (least used)
export const RadarChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.RadarChart })),
  { ssr: false }
);

export const PolarGrid = dynamic(
  () => import('recharts').then(mod => ({ default: mod.PolarGrid })),
  { ssr: false }
);

export const PolarAngleAxis = dynamic(
  () => import('recharts').then(mod => ({ default: mod.PolarAngleAxis })),
  { ssr: false }
);

export const PolarRadiusAxis = dynamic(
  () => import('recharts').then(mod => ({ default: mod.PolarRadiusAxis })),
  { ssr: false }
);

export const Radar = dynamic(
  () => import('recharts').then(mod => ({ default: mod.Radar })),
  { ssr: false }
);
