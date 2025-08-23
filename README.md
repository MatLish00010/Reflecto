# Reflecto

AI-powered personal diary application with analytics and insights.

## Features

- 📝 **Smart Diary Entries** - Write or voice-record your thoughts
- 🧠 **AI Analysis** - Get daily and weekly summaries powered by AI
- 📊 **Analytics Dashboard** - Track your writing patterns and insights
- 🌍 **Multi-language Support** - Available in multiple languages
- 🔒 **Privacy First** - Your data is encrypted and secure
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL, Auth)
- **AI**: OpenAI API
- **Monitoring**: Sentry
- **Testing**: Jest
- **Code Quality**: Biome (linting & formatting)
- **Cache**: Redis (production)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- OpenAI API key
- Redis (for production)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Reflecto
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Configure your environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Note: SUPABASE_SERVICE_ROLE_KEY is only used in Edge Functions (server-side)

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Redis (production only)
REDIS_URL=your_redis_url
```

5. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Supabase Edge Functions

This project uses Supabase Edge Functions for secure server-side operations, particularly for handling Stripe webhook events and subscription management.

### Available Functions

- **`create-subscription`** - Creates a new subscription in the database
- **`get-subscription-by-customer`** - Retrieves subscription by Stripe customer ID
- **`delete-subscription`** - Deletes a subscription from the database

### Development

1. Install Supabase CLI:

```bash
# macOS
brew install supabase/tap/supabase

# or via npm (not recommended for global install)
npm install -g supabase
```

2. Login to Supabase:

```bash
supabase login
```

3. Link to your project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

4. Create a new function:

```bash
supabase functions new function-name
```

5. Deploy functions:

```bash
supabase functions deploy function-name
```

### Security Benefits

- **No service role key on client** - `SUPABASE_SERVICE_ROLE_KEY` is only used in Edge Functions
- **Isolated execution** - Functions run in secure Deno environment
- **Server-side operations** - Database operations happen on Supabase servers
- **CORS protection** - Proper CORS headers for secure cross-origin requests

### Local Development

For local function development, you need Docker Desktop installed:

```bash
# Start local Supabase (requires Docker)
supabase start

# Serve functions locally
supabase functions serve function-name --debug
```

## Documentation

- [Formatters Documentation](./docs/formatters.md) - Guide for using the `useFormatters` hook
- [Rate Limiting](./docs/rate-limiting.md) - API rate limiting implementation

## Testing

### Stripe Test Cards

For testing payment flows in development and Sentry:

- **Payment succeeds**: `4242 4242 4242 4242`
- **Payment requires authentication**: `4000 0025 0000 3155`
- **Payment is declined**: `4000 0000 0000 9995`

### Sentry Webhooks

For local testing of Sentry webhooks:

1. Install [Sentry CLI](https://docs.sentry.io/product/cli/installation/):

   ```bash
   # macOS
   brew install getsentry/tools/sentry-cli

   # or via npm
   npm install -g @sentry/cli
   ```

2. Configure Sentry CLI:

   ```bash
   sentry-cli login
   ```

3. Start local webhook server:

   ```bash
   sentry-cli webhook serve --url-prefix /api/sentry/webhook
   ```

4. Configure webhook URL in Sentry Dashboard to `http://localhost:3000/api/sentry/webhook`

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── entities/           # Domain entities (notes, users, etc.)
├── features/           # Feature modules (analytics, auth, etc.)
├── shared/            # Shared components, hooks, utilities
└── widgets/           # Reusable UI widgets
```

## Development

### Code Quality

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

```bash
# Check code quality
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check

# Type checking
pnpm type-check

# Full check (lint + type-check)
pnpm check
```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage
- `pnpm test:integration` - Run integration tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm check` to ensure code quality
5. Add tests if applicable
6. Submit a pull request

## License

This project is licensed under the MIT License.
