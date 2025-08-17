import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.join(__dirname, '../lighthouse-reports');

function getReportMetrics(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const fileName = path.basename(filePath, '.json');
    const [page, device] = fileName.split('-');

    return {
      page,
      device,
      performance: data.categories?.performance?.score || 0,
      accessibility: data.categories?.accessibility?.score || 0,
      bestPractices: data.categories?.['best-practices']?.score || 0,
      seo: data.categories?.seo?.score || 0,
      fcp: data.audits?.['first-contentful-paint']?.numericValue || 0,
      lcp: data.audits?.['largest-contentful-paint']?.numericValue || 0,
      cls: data.audits?.['cumulative-layout-shift']?.numericValue || 0,
      tbt: data.audits?.['total-blocking-time']?.numericValue || 0,
      si: data.audits?.['speed-index']?.numericValue || 0,
      tti: data.audits?.['interactive']?.numericValue || 0,
    };
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function calculateAverages(metrics) {
  const totals = {
    performance: 0,
    accessibility: 0,
    bestPractices: 0,
    seo: 0,
    fcp: 0,
    lcp: 0,
    cls: 0,
    tbt: 0,
    si: 0,
    tti: 0,
  };

  metrics.forEach(metric => {
    totals.performance += metric.performance;
    totals.accessibility += metric.accessibility;
    totals.bestPractices += metric.bestPractices;
    totals.seo += metric.seo;
    totals.fcp += metric.fcp;
    totals.lcp += metric.lcp;
    totals.cls += metric.cls;
    totals.tbt += metric.tbt;
    totals.si += metric.si;
    totals.tti += metric.tti;
  });

  const count = metrics.length;
  return {
    performance: Math.round((totals.performance / count) * 100),
    accessibility: Math.round((totals.accessibility / count) * 100),
    bestPractices: Math.round((totals.bestPractices / count) * 100),
    seo: Math.round((totals.seo / count) * 100),
    fcp: Math.round(totals.fcp / count),
    lcp: Math.round(totals.lcp / count),
    cls: (totals.cls / count).toFixed(3),
    tbt: Math.round(totals.tbt / count),
    si: Math.round(totals.si / count),
    tti: Math.round(totals.tti / count),
  };
}

function generateMetricsSummary() {
  const jsonFiles = fs
    .readdirSync(REPORTS_DIR)
    .filter(file => file.endsWith('.json') && !file.includes('baseline'))
    .map(file => path.join(REPORTS_DIR, file));

  const allMetrics = jsonFiles.map(getReportMetrics).filter(Boolean);
  const mobileMetrics = allMetrics.filter(m => m.device === 'mobile');
  const desktopMetrics = allMetrics.filter(m => m.device === 'desktop');

  console.log('📊 Lighthouse Project Metrics Summary\n');
  console.log('='.repeat(80));

  // Overall averages
  const overall = calculateAverages(allMetrics);
  console.log('\n🎯 OVERALL PROJECT AVERAGES:');
  console.log(`   Performance:    ${overall.performance}/100`);
  console.log(`   Accessibility:  ${overall.accessibility}/100`);
  console.log(`   Best Practices: ${overall.bestPractices}/100`);
  console.log(`   SEO:           ${overall.seo}/100`);

  console.log('\n📈 CORE WEB VITALS (Average):');
  console.log(`   FCP: ${overall.fcp}ms (Target: < 1800ms)`);
  console.log(`   LCP: ${overall.lcp}ms (Target: < 2500ms)`);
  console.log(`   CLS: ${overall.cls} (Target: < 0.1)`);
  console.log(`   TBT: ${overall.tbt}ms (Target: < 200ms)`);
  console.log(`   SI:  ${overall.si}ms (Target: < 3400ms)`);
  console.log(`   TTI: ${overall.tti}ms (Target: < 3800ms)`);

  // Device-specific averages
  if (mobileMetrics.length > 0) {
    const mobile = calculateAverages(mobileMetrics);
    console.log('\n📱 MOBILE AVERAGES:');
    console.log(`   Performance:    ${mobile.performance}/100`);
    console.log(`   FCP: ${mobile.fcp}ms, LCP: ${mobile.lcp}ms`);
    console.log(`   CLS: ${mobile.cls}, TBT: ${mobile.tbt}ms`);
  }

  if (desktopMetrics.length > 0) {
    const desktop = calculateAverages(desktopMetrics);
    console.log('\n🖥️  DESKTOP AVERAGES:');
    console.log(`   Performance:    ${desktop.performance}/100`);
    console.log(`   FCP: ${desktop.fcp}ms, LCP: ${desktop.lcp}ms`);
    console.log(`   CLS: ${desktop.cls}, TBT: ${desktop.tbt}ms`);
  }

  // Page-specific breakdown
  console.log('\n' + '='.repeat(80));
  console.log('\n📄 PAGE-BY-PAGE BREAKDOWN:');

  const pages = ['home', 'analytics', 'history'];
  pages.forEach(page => {
    const pageMetrics = allMetrics.filter(m => m.page === page);
    if (pageMetrics.length > 0) {
      const pageAvg = calculateAverages(pageMetrics);
      console.log(`\n   ${page.toUpperCase()}:`);
      console.log(`     Performance: ${pageAvg.performance}/100`);
      console.log(`     FCP: ${pageAvg.fcp}ms, LCP: ${pageAvg.lcp}ms`);
      console.log(`     CLS: ${pageAvg.cls}, TBT: ${pageAvg.tbt}ms`);
    }
  });

  // Performance grades
  console.log('\n' + '='.repeat(80));
  console.log('\n🏆 PERFORMANCE GRADES:');

  const gradePerformance = score => {
    if (score >= 90) return '🟢 Excellent';
    if (score >= 80) return '🟡 Good';
    if (score >= 70) return '🟠 Needs Improvement';
    return '🔴 Poor';
  };

  console.log(
    `   Overall: ${gradePerformance(overall.performance)} (${overall.performance}/100)`
  );
  if (mobileMetrics.length > 0) {
    const mobile = calculateAverages(mobileMetrics);
    console.log(
      `   Mobile:  ${gradePerformance(mobile.performance)} (${mobile.performance}/100)`
    );
  }
  if (desktopMetrics.length > 0) {
    const desktop = calculateAverages(desktopMetrics);
    console.log(
      `   Desktop: ${gradePerformance(desktop.performance)} (${desktop.performance}/100)`
    );
  }

  // Core Web Vitals status
  console.log('\n🎯 CORE WEB VITALS STATUS:');
  const fcpStatus = overall.fcp < 1800 ? '🟢 Good' : '🔴 Poor';
  const lcpStatus = overall.lcp < 2500 ? '🟢 Good' : '🔴 Poor';
  const clsStatus = overall.cls < 0.1 ? '🟢 Good' : '🔴 Poor';
  const tbtStatus = overall.tbt < 200 ? '🟢 Good' : '🔴 Poor';

  console.log(`   FCP: ${fcpStatus} (${overall.fcp}ms)`);
  console.log(`   LCP: ${lcpStatus} (${overall.lcp}ms)`);
  console.log(`   CLS: ${clsStatus} (${overall.cls})`);
  console.log(`   TBT: ${tbtStatus} (${overall.tbt}ms)`);

  const passedVitals = [fcpStatus, lcpStatus, clsStatus, tbtStatus].filter(s =>
    s.includes('🟢')
  ).length;
  console.log(`\n   Overall: ${passedVitals}/4 Core Web Vitals passed`);
}

if (require.main === module) {
  generateMetricsSummary();
}

module.exports = {
  getReportMetrics,
  calculateAverages,
  generateMetricsSummary,
};
