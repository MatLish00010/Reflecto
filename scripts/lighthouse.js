#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://reflecto-virid.vercel.app'; // Update this to your actual domain
const PAGES = [
  { path: '/en', name: 'home' },
  { path: '/en/analytics', name: 'analytics' },
  { path: '/en/history', name: 'history' },
];

const DEVICES = [
  { name: 'mobile', preset: 'perf' },
  { name: 'desktop', preset: 'desktop' },
];

const OUTPUT_DIR = path.join(__dirname, '../lighthouse-reports');
const BASELINE_FILE = path.join(OUTPUT_DIR, 'baseline-metrics.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Function to run Lighthouse with Puppeteer
function runLighthouse(url, device, pageName) {
  const outputPath = path.join(OUTPUT_DIR, `${pageName}-${device.name}.json`);
  const htmlPath = path.join(OUTPUT_DIR, `${pageName}-${device.name}.html`);

  console.log(`\n🔍 Running Lighthouse for ${pageName} (${device.name})...`);

  try {
    // Run Lighthouse with JSON output
    const jsonCommand = `npx lighthouse "${url}" --output=json --output-path="${outputPath}" --preset=${device.preset} ${device.name === 'mobile' ? '--form-factor=mobile' : '--form-factor=desktop'} --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless --no-sandbox --disable-gpu --disable-dev-shm-usage --disable-web-security --disable-features=VizDisplayCompositor"`;
    execSync(jsonCommand, { stdio: 'inherit' });

    // Run Lighthouse with HTML output for visual inspection
    const htmlCommand = `npx lighthouse "${url}" --output=html --output-path="${htmlPath}" --preset=${device.preset} ${device.name === 'mobile' ? '--form-factor=mobile' : '--form-factor=desktop'} --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless --no-sandbox --disable-gpu --disable-dev-shm-usage --disable-web-security --disable-features=VizDisplayCompositor"`;
    execSync(htmlCommand, { stdio: 'inherit' });

    console.log(`✅ Generated reports for ${pageName} (${device.name})`);
    return outputPath;
  } catch (error) {
    console.error(
      `❌ Error running Lighthouse for ${pageName} (${device.name}):`,
      error.message
    );
    return null;
  }
}

// Function to extract key metrics from Lighthouse report
function extractMetrics(reportPath) {
  try {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    return {
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
      firstInputDelay: Math.round(
        report.audits['max-potential-fid'].numericValue
      ),
      cumulativeLayoutShift:
        report.audits['cumulative-layout-shift'].numericValue,
      totalBlockingTime: Math.round(
        report.audits['total-blocking-time'].numericValue
      ),
      speedIndex: Math.round(report.audits['speed-index'].numericValue),
      opportunities: report.audits['opportunities']
        ? Object.keys(report.audits['opportunities']).length
        : 0,
      diagnostics: report.audits['diagnostics']
        ? Object.keys(report.audits['diagnostics']).length
        : 0,
    };
  } catch (error) {
    console.error(
      `Error extracting metrics from ${reportPath}:`,
      error.message
    );
    return null;
  }
}

// Function to generate summary report
function generateSummaryReport(allMetrics) {
  const summary = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {},
    detailedMetrics: allMetrics,
  };

  // Calculate averages
  const allScores = allMetrics.flatMap(m => [
    m.performance,
    m.accessibility,
    m.bestPractices,
    m.seo,
  ]);
  summary.summary = {
    averagePerformance: Math.round(
      allScores.filter((_, i) => i % 4 === 0).reduce((a, b) => a + b, 0) /
        (allScores.length / 4)
    ),
    averageAccessibility: Math.round(
      allScores.filter((_, i) => i % 4 === 1).reduce((a, b) => a + b, 0) /
        (allScores.length / 4)
    ),
    averageBestPractices: Math.round(
      allScores.filter((_, i) => i % 4 === 2).reduce((a, b) => a + b, 0) /
        (allScores.length / 4)
    ),
    averageSEO: Math.round(
      allScores.filter((_, i) => i % 4 === 3).reduce((a, b) => a + b, 0) /
        (allScores.length / 4)
    ),
    totalPages: PAGES.length,
    totalDevices: DEVICES.length,
    totalReports: allMetrics.length,
  };

  return summary;
}

// Main execution
async function main() {
  console.log('🚀 Starting Lighthouse Analysis (CLI Mode)...');
  console.log(
    `📊 Analyzing ${PAGES.length} pages on ${DEVICES.length} devices`
  );
  console.log(`📁 Reports will be saved to: ${OUTPUT_DIR}`);

  const allMetrics = [];

  for (const page of PAGES) {
    for (const device of DEVICES) {
      const url = `${BASE_URL}${page.path}`;
      const reportPath = runLighthouse(url, device, page.name);

      if (reportPath) {
        const metrics = extractMetrics(reportPath);
        if (metrics) {
          metrics.page = page.name;
          metrics.device = device.name;
          metrics.url = url;
          allMetrics.push(metrics);
        }
      }
    }
  }

  // Generate and save baseline metrics
  const baselineReport = generateSummaryReport(allMetrics);
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(baselineReport, null, 2));

  // Generate human-readable summary
  const summaryPath = path.join(OUTPUT_DIR, 'summary-report.md');
  const summaryMarkdown = generateMarkdownSummary(baselineReport);
  fs.writeFileSync(summaryPath, summaryMarkdown);

  console.log('\n📈 Analysis Complete!');
  console.log(`📄 Baseline metrics saved to: ${BASELINE_FILE}`);
  console.log(`📋 Summary report saved to: ${summaryPath}`);
  console.log('\n📊 Current Performance Summary:');
  console.log(
    `   Performance: ${baselineReport.summary.averagePerformance}/100`
  );
  console.log(
    `   Accessibility: ${baselineReport.summary.averageAccessibility}/100`
  );
  console.log(
    `   Best Practices: ${baselineReport.summary.averageBestPractices}/100`
  );
  console.log(`   SEO: ${baselineReport.summary.averageSEO}/100`);
}

// Function to generate markdown summary
function generateMarkdownSummary(report) {
  let markdown = `# Lighthouse Analysis Report\n\n`;
  markdown += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n`;
  markdown += `**Base URL:** ${report.baseUrl}\n\n`;

  markdown += `## Summary\n\n`;
  markdown += `| Metric | Score |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| Performance | ${report.summary.averagePerformance}/100 |\n`;
  markdown += `| Accessibility | ${report.summary.averageAccessibility}/100 |\n`;
  markdown += `| Best Practices | ${report.summary.averageBestPractices}/100 |\n`;
  markdown += `| SEO | ${report.summary.averageSEO}/100 |\n\n`;

  markdown += `## Detailed Metrics\n\n`;
  markdown += `| Page | Device | Performance | Accessibility | Best Practices | SEO | FCP | LCP | CLS | TBT |\n`;
  markdown += `|------|--------|-------------|---------------|----------------|-----|-----|-----|-----|-----|\n`;

  report.detailedMetrics.forEach(metric => {
    markdown += `| ${metric.page} | ${metric.device} | ${metric.performance} | ${metric.accessibility} | ${metric.bestPractices} | ${metric.seo} | ${metric.firstContentfulPaint}ms | ${metric.largestContentfulPaint}ms | ${metric.cumulativeLayoutShift.toFixed(3)} | ${metric.totalBlockingTime}ms |\n`;
  });

  markdown += `\n## Files Generated\n\n`;
  markdown += `- \`baseline-metrics.json\` - Raw metrics data for comparison\n`;
  markdown += `- \`summary-report.md\` - This summary report\n`;
  markdown += `- \`{page}-{device}.json\` - Detailed Lighthouse reports\n`;
  markdown += `- \`{page}-{device}.html\` - Visual Lighthouse reports\n\n`;

  markdown += `## Next Steps\n\n`;
  markdown += `1. Review the detailed reports for optimization opportunities\n`;
  markdown += `2. Implement performance improvements\n`;
  markdown += `3. Re-run analysis to measure improvements\n`;
  markdown += `4. Compare with baseline metrics\n`;

  return markdown;
}

// Run the analysis
main().catch(console.error);
