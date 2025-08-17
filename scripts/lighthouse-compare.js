#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASELINE_FILE = path.join(
  __dirname,
  '../lighthouse-reports/baseline-metrics.json'
);
const COMPARISON_FILE = path.join(
  __dirname,
  '../lighthouse-reports/comparison-report.md'
);

function loadBaselineMetrics() {
  try {
    if (!fs.existsSync(BASELINE_FILE)) {
      console.error(
        '❌ Baseline metrics file not found. Run "pnpm lighthouse" first to generate baseline.'
      );
      process.exit(1);
    }
    return JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading baseline metrics:', error.message);
    process.exit(1);
  }
}

function loadCurrentMetrics() {
  const outputDir = path.join(__dirname, '../lighthouse-reports');
  const currentMetrics = [];

  if (!fs.existsSync(outputDir)) {
    console.error('❌ Lighthouse reports directory not found.');
    process.exit(1);
  }

  const files = fs
    .readdirSync(outputDir)
    .filter(file => file.endsWith('.json') && file !== 'baseline-metrics.json');

  for (const file of files) {
    try {
      const report = JSON.parse(
        fs.readFileSync(path.join(outputDir, file), 'utf8')
      );
      const pageName = file.split('-')[0];
      const deviceName = file.split('-')[1].replace('.json', '');

      const metrics = {
        page: pageName,
        device: deviceName,
        performance: Math.round(report.categories.performance.score * 100),
        accessibility: Math.round(report.categories.accessibility.score * 100),
        bestPractices: Math.round(
          report.categories['best-practices'].score * 100
        ),
        seo: Math.round(report.categories.seo.score * 100),
        firstContentfulPaint: Math.round(
          report.audits['first-contentful-paint'].numericValue
        ),
        largestContentfulPaint: Math.round(
          report.audits['largest-contentful-paint'].numericValue
        ),
        cumulativeLayoutShift:
          report.audits['cumulative-layout-shift'].numericValue,
        totalBlockingTime: Math.round(
          report.audits['total-blocking-time'].numericValue
        ),
        speedIndex: Math.round(report.audits['speed-index'].numericValue),
      };

      currentMetrics.push(metrics);
    } catch (error) {
      console.warn(`Warning: Could not parse ${file}:`, error.message);
    }
  }

  return currentMetrics;
}

function calculateImprovements(baseline, current) {
  const improvements = [];

  for (const currentMetric of current) {
    const baselineMetric = baseline.detailedMetrics.find(
      m => m.page === currentMetric.page && m.device === currentMetric.device
    );

    if (baselineMetric) {
      const improvement = {
        page: currentMetric.page,
        device: currentMetric.device,
        performance: {
          before: baselineMetric.performance,
          after: currentMetric.performance,
          change: currentMetric.performance - baselineMetric.performance,
          percentage: Math.round(
            ((currentMetric.performance - baselineMetric.performance) /
              baselineMetric.performance) *
              100
          ),
        },
        accessibility: {
          before: baselineMetric.accessibility,
          after: currentMetric.accessibility,
          change: currentMetric.accessibility - baselineMetric.accessibility,
          percentage: Math.round(
            ((currentMetric.accessibility - baselineMetric.accessibility) /
              baselineMetric.accessibility) *
              100
          ),
        },
        bestPractices: {
          before: baselineMetric.bestPractices,
          after: currentMetric.bestPractices,
          change: currentMetric.bestPractices - baselineMetric.bestPractices,
          percentage: Math.round(
            ((currentMetric.bestPractices - baselineMetric.bestPractices) /
              baselineMetric.bestPractices) *
              100
          ),
        },
        seo: {
          before: baselineMetric.seo,
          after: currentMetric.seo,
          change: currentMetric.seo - baselineMetric.seo,
          percentage: Math.round(
            ((currentMetric.seo - baselineMetric.seo) / baselineMetric.seo) *
              100
          ),
        },
        fcp: {
          before: baselineMetric.firstContentfulPaint,
          after: currentMetric.firstContentfulPaint,
          change:
            baselineMetric.firstContentfulPaint -
            currentMetric.firstContentfulPaint,
          percentage: Math.round(
            ((baselineMetric.firstContentfulPaint -
              currentMetric.firstContentfulPaint) /
              baselineMetric.firstContentfulPaint) *
              100
          ),
        },
        lcp: {
          before: baselineMetric.largestContentfulPaint,
          after: currentMetric.largestContentfulPaint,
          change:
            baselineMetric.largestContentfulPaint -
            currentMetric.largestContentfulPaint,
          percentage: Math.round(
            ((baselineMetric.largestContentfulPaint -
              currentMetric.largestContentfulPaint) /
              baselineMetric.largestContentfulPaint) *
              100
          ),
        },
        cls: {
          before: baselineMetric.cumulativeLayoutShift,
          after: currentMetric.cumulativeLayoutShift,
          change:
            baselineMetric.cumulativeLayoutShift -
            currentMetric.cumulativeLayoutShift,
          percentage: Math.round(
            ((baselineMetric.cumulativeLayoutShift -
              currentMetric.cumulativeLayoutShift) /
              baselineMetric.cumulativeLayoutShift) *
              100
          ),
        },
        tbt: {
          before: baselineMetric.totalBlockingTime,
          after: currentMetric.totalBlockingTime,
          change:
            baselineMetric.totalBlockingTime - currentMetric.totalBlockingTime,
          percentage: Math.round(
            ((baselineMetric.totalBlockingTime -
              currentMetric.totalBlockingTime) /
              baselineMetric.totalBlockingTime) *
              100
          ),
        },
      };

      improvements.push(improvement);
    }
  }

  return improvements;
}

function generateComparisonReport(baseline, improvements) {
  let markdown = `# Lighthouse Performance Comparison Report\n\n`;
  markdown += `**Baseline Generated:** ${new Date(baseline.timestamp).toLocaleString()}\n`;
  markdown += `**Comparison Generated:** ${new Date().toLocaleString()}\n`;
  markdown += `**Base URL:** ${baseline.baseUrl}\n\n`;

  // Overall summary
  const totalImprovements = improvements.length;
  const positiveImprovements = improvements.filter(
    imp =>
      imp.performance.change > 0 ||
      imp.accessibility.change > 0 ||
      imp.bestPractices.change > 0 ||
      imp.seo.change > 0
  ).length;

  markdown += `## Overall Summary\n\n`;
  markdown += `- **Total pages analyzed:** ${totalImprovements}\n`;
  markdown += `- **Pages with improvements:** ${positiveImprovements}\n`;
  markdown += `- **Improvement rate:** ${Math.round((positiveImprovements / totalImprovements) * 100)}%\n\n`;

  // Detailed improvements table
  markdown += `## Detailed Improvements\n\n`;
  markdown += `| Page | Device | Performance | Accessibility | Best Practices | SEO | FCP | LCP | CLS | TBT |\n`;
  markdown += `|------|--------|-------------|---------------|----------------|-----|-----|-----|-----|-----|\n`;

  improvements.forEach(imp => {
    const formatChange = (change, percentage) => {
      if (change > 0) return `+${change} (+${percentage}%)`;
      if (change < 0) return `${change} (${percentage}%)`;
      return `0 (0%)`;
    };

    const formatMetric = metric => {
      return `${metric.before} → ${metric.after} (${formatChange(metric.change, metric.percentage)})`;
    };

    const formatSpeedMetric = metric => {
      return `${metric.before}ms → ${metric.after}ms (${formatChange(metric.change, metric.percentage)})`;
    };

    const formatCLS = metric => {
      return `${metric.before.toFixed(3)} → ${metric.after.toFixed(3)} (${formatChange(metric.change, metric.percentage)})`;
    };

    markdown += `| ${imp.page} | ${imp.device} | ${formatMetric(imp.performance)} | ${formatMetric(imp.accessibility)} | ${formatMetric(imp.bestPractices)} | ${formatMetric(imp.seo)} | ${formatSpeedMetric(imp.fcp)} | ${formatSpeedMetric(imp.lcp)} | ${formatCLS(imp.cls)} | ${formatSpeedMetric(imp.tbt)} |\n`;
  });

  // Performance insights
  markdown += `\n## Performance Insights\n\n`;

  const avgPerformanceChange = Math.round(
    improvements.reduce((sum, imp) => sum + imp.performance.change, 0) /
      improvements.length
  );
  const avgAccessibilityChange = Math.round(
    improvements.reduce((sum, imp) => sum + imp.accessibility.change, 0) /
      improvements.length
  );
  const avgBestPracticesChange = Math.round(
    improvements.reduce((sum, imp) => sum + imp.bestPractices.change, 0) /
      improvements.length
  );
  const avgSEOChange = Math.round(
    improvements.reduce((sum, imp) => sum + imp.seo.change, 0) /
      improvements.length
  );

  markdown += `### Average Changes\n\n`;
  markdown += `- **Performance:** ${avgPerformanceChange > 0 ? '+' : ''}${avgPerformanceChange} points\n`;
  markdown += `- **Accessibility:** ${avgAccessibilityChange > 0 ? '+' : ''}${avgAccessibilityChange} points\n`;
  markdown += `- **Best Practices:** ${avgBestPracticesChange > 0 ? '+' : ''}${avgBestPracticesChange} points\n`;
  markdown += `- **SEO:** ${avgSEOChange > 0 ? '+' : ''}${avgSEOChange} points\n\n`;

  // Recommendations
  markdown += `## Recommendations\n\n`;

  if (avgPerformanceChange < 0) {
    markdown += `⚠️ **Performance decreased by ${Math.abs(avgPerformanceChange)} points on average.** Consider:\n`;
    markdown += `- Optimizing image sizes and formats\n`;
    markdown += `- Implementing code splitting\n`;
    markdown += `- Reducing JavaScript bundle size\n`;
    markdown += `- Optimizing critical rendering path\n\n`;
  } else if (avgPerformanceChange > 0) {
    markdown += `✅ **Performance improved by ${avgPerformanceChange} points on average.** Great work!\n\n`;
  }

  if (avgAccessibilityChange < 0) {
    markdown += `⚠️ **Accessibility decreased by ${Math.abs(avgAccessibilityChange)} points on average.** Consider:\n`;
    markdown += `- Adding proper ARIA labels\n`;
    markdown += `- Ensuring proper color contrast\n`;
    markdown += `- Adding keyboard navigation support\n`;
    markdown += `- Testing with screen readers\n\n`;
  } else if (avgAccessibilityChange > 0) {
    markdown += `✅ **Accessibility improved by ${avgAccessibilityChange} points on average.** Excellent!\n\n`;
  }

  markdown += `## Next Steps\n\n`;
  markdown += `1. Review specific page improvements in detail\n`;
  markdown += `2. Focus on pages with negative changes\n`;
  markdown += `3. Implement additional optimizations\n`;
  markdown += `4. Re-run comparison to measure further improvements\n`;

  return markdown;
}

function main() {
  console.log('🔍 Loading baseline metrics...');
  const baseline = loadBaselineMetrics();

  console.log('📊 Loading current metrics...');
  const current = loadCurrentMetrics();

  if (current.length === 0) {
    console.error(
      '❌ No current metrics found. Run "pnpm lighthouse" to generate new reports.'
    );
    process.exit(1);
  }

  console.log('📈 Calculating improvements...');
  const improvements = calculateImprovements(baseline, current);

  console.log('📝 Generating comparison report...');
  const report = generateComparisonReport(baseline, improvements);

  fs.writeFileSync(COMPARISON_FILE, report);

  console.log('✅ Comparison complete!');
  console.log(`📄 Report saved to: ${COMPARISON_FILE}`);

  // Print summary
  const avgPerformanceChange = Math.round(
    improvements.reduce((sum, imp) => sum + imp.performance.change, 0) /
      improvements.length
  );
  const avgAccessibilityChange = Math.round(
    improvements.reduce((sum, imp) => sum + imp.accessibility.change, 0) /
      improvements.length
  );

  console.log('\n📊 Quick Summary:');
  console.log(
    `   Performance: ${avgPerformanceChange > 0 ? '+' : ''}${avgPerformanceChange} points`
  );
  console.log(
    `   Accessibility: ${avgAccessibilityChange > 0 ? '+' : ''}${avgAccessibilityChange} points`
  );
  console.log(`   Pages analyzed: ${improvements.length}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}
