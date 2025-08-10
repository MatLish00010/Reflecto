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
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
