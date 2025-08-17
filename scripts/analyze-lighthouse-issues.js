import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.join(__dirname, '../lighthouse-reports');

function analyzeReport(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const fileName = path.basename(filePath, '.json');
    const [page, device] = fileName.split('-');

    const issues = [];

    // Analyze audits
    if (data.audits) {
      Object.entries(data.audits).forEach(([key, audit]) => {
        if (audit.score !== null && audit.score < 1) {
          issues.push({
            id: key,
            title: audit.title,
            score: audit.score,
            description: audit.description,
            details: audit.details,
          });
        }
      });
    }

    // Get core metrics
    const metrics = {
      performance: data.categories?.performance?.score || 0,
      accessibility: data.categories?.accessibility?.score || 0,
      bestPractices: data.categories?.['best-practices']?.score || 0,
      seo: data.categories?.seo?.score || 0,
      fcp: data.audits?.['first-contentful-paint']?.numericValue || 0,
      lcp: data.audits?.['largest-contentful-paint']?.numericValue || 0,
      cls: data.audits?.['cumulative-layout-shift']?.numericValue || 0,
      tbt: data.audits?.['total-blocking-time']?.numericValue || 0,
    };

    return {
      page,
      device,
      metrics,
      issues: issues.sort((a, b) => a.score - b.score), // Sort by worst score first
    };
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

function generateSummary() {
  const jsonFiles = fs
    .readdirSync(REPORTS_DIR)
    .filter(file => file.endsWith('.json') && !file.includes('baseline'))
    .map(file => path.join(REPORTS_DIR, file));

  const reports = jsonFiles.map(analyzeReport).filter(Boolean);

  console.log('🔍 Lighthouse Issues Analysis\n');
  console.log('='.repeat(60));

  reports.forEach(report => {
    console.log(`\n📄 ${report.page.toUpperCase()} (${report.device})`);
    console.log(
      `   Performance: ${Math.round(report.metrics.performance * 100)}/100`
    );
    console.log(
      `   FCP: ${Math.round(report.metrics.fcp)}ms, LCP: ${Math.round(report.metrics.lcp)}ms`
    );
    console.log(
      `   CLS: ${report.metrics.cls.toFixed(3)}, TBT: ${Math.round(report.metrics.tbt)}ms`
    );

    if (report.issues.length > 0) {
      console.log(`\n   🚨 Issues found (${report.issues.length}):`);
      report.issues.slice(0, 5).forEach(issue => {
        const score = Math.round(issue.score * 100);
        console.log(`   • ${issue.title} (${score}/100)`);
      });

      if (report.issues.length > 5) {
        console.log(`   ... and ${report.issues.length - 5} more issues`);
      }
    } else {
      console.log(`\n   ✅ No issues found!`);
    }
  });

  // Summary by issue type
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Issues Summary by Type:');

  const allIssues = reports.flatMap(r => r.issues);
  const issueTypes = {};

  allIssues.forEach(issue => {
    const type = issue.id.split('-')[0];
    if (!issueTypes[type]) issueTypes[type] = [];
    issueTypes[type].push(issue);
  });

  Object.entries(issueTypes)
    .sort(([, a], [, b]) => b.length - a.length)
    .forEach(([type, issues]) => {
      console.log(`   ${type}: ${issues.length} issues`);
      issues.slice(0, 3).forEach(issue => {
        console.log(`     • ${issue.title}`);
      });
    });

  // Performance recommendations
  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Top Performance Recommendations:');

  const performanceIssues = allIssues.filter(
    issue =>
      issue.id.includes('performance') ||
      issue.id.includes('speed') ||
      issue.id.includes('render') ||
      issue.id.includes('resource')
  );

  performanceIssues.slice(0, 5).forEach(issue => {
    console.log(
      `   • ${issue.title} - Score: ${Math.round(issue.score * 100)}/100`
    );
  });
}

if (require.main === module) {
  generateSummary();
}

module.exports = { analyzeReport, generateSummary };
