# useFormatters Hook

Centralized hook for formatting dates and numbers with localization support.

## Usage

```tsx
import { useFormatters } from '@/shared/hooks';

function MyComponent() {
  const { formatDate, formatNumber } = useFormatters();

  // Date formatting
  const shortDate = formatDate(new Date(), 'SHORT'); // "15.12"
  const longDate = formatDate(new Date(), 'LONG'); // "15 декабря 2024"

  // Number formatting
  const currency = formatNumber(1234.56, 'CURRENCY'); // "$1,234.56"
  const percent = formatNumber(85.5, 'PERCENT'); // "85.5%"

  // For charts - create adapters
  const chartDateFormatter = (value: string) => formatDate(value, 'SHORT');
  const chartTooltipFormatter = (value: string) => formatDate(value, 'LONG');
}
```

## API

### formatDate(date, formatType)

Formats a date in the specified format.

**Parameters:**

- `date: Date | string` - date to format
- `formatType: DateFormatType` - format type (default: 'SHORT')

**Available date formats:**

- `'SHORT'` - "15.12"
- `'LONG'` - "15 декабря 2024"
- `'FULL'` - "воскресенье, 15 декабря 2024 г."
- `'TIME'` - "14:30"
- `'DATETIME'` - "15.12 14:30"
- `'WEEK'` - "дек 15"
- `'MONTH'` - "декабрь 2024"
- `'YEAR'` - "2024"
- `'DAY'` - "15"
- `'MONTH_SHORT'` - "дек"

### formatNumber(value, formatType, options)

Formats a number in the specified format.

**Parameters:**

- `value: number` - number to format
- `formatType: NumberFormatType` - format type (default: 'DEFAULT')
- `options?: { currency?: string }` - additional options

**Available number formats:**

- `'DEFAULT'` - regular number with separators
- `'CURRENCY'` - currency (default USD)
- `'PERCENT'` - percentages
- `'FILE_SIZE'` - file size (B, KB, MB, GB)

### Usage with Charts

For charts, create adapters:

```tsx
const { formatDate } = useFormatters();

// Adapters for chart API compatibility
const chartDateFormatter = (value: string) => formatDate(value, 'SHORT');
const chartTooltipFormatter = (value: string) => formatDate(value, 'LONG');

// Usage in charts
<XAxis dataKey="date" tickFormatter={chartDateFormatter} />
<Tooltip labelFormatter={chartTooltipFormatter} />
```

## Benefits

1. **Centralization** - all formats defined in one place
2. **Type Safety** - TypeScript validates available formats
3. **Localization** - automatically uses correct locale
4. **Memoization** - formatters are optimized for performance
5. **Consistency** - unified API for all formats

## Adding New Formats

To add a new date format:

1. Add the type to `DateFormatType`
2. Add configuration to `DATE_FORMAT_CONFIG`

```tsx
export type DateFormatType = 'SHORT' | 'LONG' | 'CUSTOM'; // new format

const DATE_FORMAT_CONFIG: Record<DateFormatType, string> = {
  SHORT: 'dd.MM',
  LONG: 'dd MMMM yyyy',
  CUSTOM: 'dd/MM/yyyy', // new format
};
```

## Type Definitions

```tsx
// Date format types
export type DateFormatType =
  | 'SHORT'
  | 'LONG'
  | 'FULL'
  | 'TIME'
  | 'DATETIME'
  | 'WEEK'
  | 'MONTH'
  | 'YEAR'
  | 'DAY'
  | 'MONTH_SHORT';

// Number format types
export type NumberFormatType = 'DEFAULT' | 'CURRENCY' | 'PERCENT' | 'FILE_SIZE';
```

## Examples

### Date Formatting

```tsx
const { formatDate } = useFormatters();

// Different date formats
formatDate(new Date(), 'SHORT'); // "15.12"
formatDate(new Date(), 'LONG'); // "15 декабря 2024"
formatDate(new Date(), 'FULL'); // "воскресенье, 15 декабря 2024 г."
formatDate(new Date(), 'TIME'); // "14:30"
formatDate(new Date(), 'DATETIME'); // "15.12 14:30"
```

### Number Formatting

```tsx
const { formatNumber } = useFormatters();

// Different number formats
formatNumber(1234567); // "1,234,567" (en) or "1 234 567" (ru)
formatNumber(1234.56, 'CURRENCY'); // "$1,234.56" (en) or "1 234,56 ₽" (ru)
formatNumber(85.5, 'PERCENT'); // "85.5%" (en) or "85,5%" (ru)
formatNumber(1024 * 1024, 'FILE_SIZE'); // "1.0 MB"
```

### Chart Integration

```tsx
const { formatDate } = useFormatters();

// Create chart formatters
const chartDateFormatter = (value: string) => formatDate(value, 'SHORT');
const chartTooltipFormatter = (value: string) => formatDate(value, 'LONG');

// Use in Recharts components
<AreaChart data={data}>
  <XAxis dataKey="date" tickFormatter={chartDateFormatter} />
  <Tooltip labelFormatter={chartTooltipFormatter} />
</AreaChart>;
```
