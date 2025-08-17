# Lighthouse Performance Analysis

This set of scripts allows you to automatically analyze the performance of key website pages using Lighthouse and track improvements.

## Quick Start

### 1. Install Dependencies

```bash
pnpm install lighthouse --save-dev
```

> **Note:** The script uses Puppeteer (built into Lighthouse), so it doesn't require Chrome browser installation.

### Puppeteer Benefits

✅ **Automatic installation** - Chrome is downloaded automatically  
✅ **Isolated environment** - clean results without user settings  
✅ **Consistency** - same results across different machines  
✅ **CI/CD friendly** - works in containers without browser installation  
✅ **Accuracy** - results are 95-99% accurate compared to system Chrome

### 2. Configure URL

Edit `scripts/lighthouse-analysis.js` and change `BASE_URL` to your domain:

```javascript
const BASE_URL = 'https://reflecto-virid.vercel.app'; // Replace with your URL
```

### 3. Run Analysis

```bash
# Generate baseline metrics (first run)
pnpm lighthouse

# Analyze issues from generated reports
pnpm lighthouse:analyze

# Get overall project metrics
pnpm lighthouse:metrics

# Compare with baseline metrics (after optimizations)
pnpm lighthouse:compare
```

## Report Structure

After running, the following files will be created in the `lighthouse-reports/` folder:

- `baseline-metrics.json` - Baseline metrics for comparison
- `summary-report.md` - Summary report in Markdown format
- `{page}-{device}.json` - Detailed Lighthouse JSON reports
- `{page}-{device}.html` - Visual Lighthouse HTML reports
- `comparison-report.md` - Comparison report (after running compare)

## Analyzed Pages

The script automatically analyzes:

1. **Home page** (`/`)
2. **Analytics** (`/analytics`)
3. **History** (`/history`)

For each page, reports are generated for:

- **Mobile** (mobile devices) - uses `perf` preset
- **Desktop** (desktop devices) - uses `desktop` preset

## Metrics

### Main Indicators

- **Performance** - Overall performance (0-100)
- **Accessibility** - Accessibility (0-100)
- **Best Practices** - Best practices (0-100)
- **SEO** - Search engine optimization (0-100)

### Core Web Vitals

- **FCP** (First Contentful Paint) - First content display
- **LCP** (Largest Contentful Paint) - Largest element display
- **CLS** (Cumulative Layout Shift) - Cumulative layout shift
- **TBT** (Total Blocking Time) - Total blocking time
- **SI** (Speed Index) - Speed index

## Results Interpretation

### Performance Score

- **90-100**: Excellent
- **50-89**: Good
- **0-49**: Needs improvement

### Core Web Vitals

- **FCP**: < 1.8s (good), < 3s (improve)
- **LCP**: < 2.5s (good), < 4s (improve)
- **CLS**: < 0.1 (good), < 0.25 (improve)
- **TBT**: < 200ms (good), < 600ms (improve)

## Optimization Workflow

### 1. Baseline Measurement

```bash
pnpm lighthouse
```

### 2. Issue Analysis

```bash
# Analyze specific problems and issues
pnpm lighthouse:analyze

# Get overall project metrics
pnpm lighthouse:metrics
```

### 3. Report Analysis

- Review `summary-report.md` for general understanding
- Open HTML reports for detailed analysis
- Pay attention to "Opportunities" and "Diagnostics"

### 3. Implement Optimizations

- Optimize images
- Improve JavaScript bundles
- Optimize CSS
- Add caching
- Improve accessibility

### 4. Measure Improvements

```bash
pnpm lighthouse:compare
```

### 5. Repeat Cycle

Repeat steps 3-5 until desired results are achieved.

## Common Optimizations

### Performance

- Image compression (WebP, AVIF)
- Lazy loading of images
- Code splitting
- Tree shaking
- CSS/JS minification
- Font optimization

### Accessibility

- Adding ARIA attributes
- Improving color contrast
- Keyboard navigation support
- Semantic markup
- Alternative text for images

### Best Practices

- HTTPS
- Security headers
- No console errors
- Modern image formats
- Meta tag optimization

### SEO

- Meta tags
- Structured data
- Header optimization
- Sitemap
- Robots.txt

## Troubleshooting

### "Chrome not found" Error

The script uses Puppeteer and doesn't require Chrome installation. If an error occurs:

```bash
# Make sure Lighthouse is installed
pnpm install lighthouse --save-dev

# Check version
npx lighthouse --version
```

### "Permission denied" Error

```bash
chmod +x scripts/lighthouse-analysis.js
chmod +x scripts/lighthouse-compare.js
```

### Slow Report Generation

- Make sure the site is running locally
- Check internet connection stability
- Consider running in background mode

## Available Scripts

### `pnpm lighthouse`

Generates comprehensive Lighthouse reports for all configured pages (mobile and desktop).

### `pnpm lighthouse:analyze`

Analyzes generated reports and identifies specific issues, sorted by priority:

- Critical issues (score 0/100)
- Warnings (score 50-99)
- Hints (score 90-99)
- Core Web Vitals metrics

### `pnpm lighthouse:metrics`

Provides overall project statistics:

- Average scores across all pages
- Core Web Vitals averages
- Mobile vs Desktop comparison
- Performance trends

### `pnpm lighthouse:compare`

Compares current metrics with baseline and generates a detailed comparison report showing improvements or regressions.

## Additional Features

### Analyze Specific Page

```bash
npx lighthouse https://your-domain.com/specific-page --output=json --output-path=./custom-report.json
```

### Analysis with Additional Options

```bash
npx lighthouse https://your-domain.com --output=json --chrome-flags="--headless --no-sandbox --disable-gpu" --only-categories=performance
```

### CI/CD Integration

Add to your CI/CD pipeline:

```yaml
- name: Lighthouse Analysis
  run: |
    pnpm lighthouse
    pnpm lighthouse:compare
```

## Useful Links

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals](https://web.dev/vitals/)
- [Performance Best Practices](https://web.dev/performance/)
- [Accessibility Guidelines](https://web.dev/accessibility/)
