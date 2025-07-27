import { safeSentry } from '@/shared/lib/sentry';
import type { Span } from '@sentry/types';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIServiceOptions {
  span?: Span;
  operation?: string;
}

export interface CallOpenAIParams {
  messages: OpenAIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  options?: OpenAIServiceOptions;
}

export interface CallOpenAIAndParseJSONParams {
  messages: OpenAIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  options?: OpenAIServiceOptions;
}

export interface ValidateAISummaryStructureParams {
  summary: Record<string, unknown>;
  requiredFields: string[];
  arrayFields: string[];
  options?: OpenAIServiceOptions;
}

export class OpenAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }
  }

  async callOpenAI({
    messages,
    model = 'gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 4000,
    options = {},
  }: CallOpenAIParams): Promise<string> {
    const { span, operation = 'openai_call' } = options;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = new Error(`OpenAI API error: ${response.status}`);
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { status: response.status },
      });
      span?.setAttribute('error', true);
      throw error;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      const error = new Error('No content received from OpenAI');
      safeSentry.captureException(error, {
        tags: { operation },
      });
      span?.setAttribute('error', true);
      throw error;
    }

    span?.setAttribute('openai.success', true);
    return content;
  }

  private parseJSONResponse(
    content: string,
    operation: string = 'parse_json'
  ): Record<string, unknown> {
    try {
      const cleanedContent = content.replace(/```json\s*|\s*```/g, '').trim();
      return JSON.parse(cleanedContent);
    } catch {
      const parseError = new Error('Failed to parse OpenAI response as JSON');
      safeSentry.captureException(parseError, {
        tags: { operation },
        extra: { content },
      });
      throw parseError;
    }
  }

  validateAISummaryStructure({
    summary,
    requiredFields,
    arrayFields,
    options = {},
  }: ValidateAISummaryStructureParams): Record<string, unknown> {
    const { operation = 'validate_ai_summary' } = options;

    const missingFields = requiredFields.filter(field => !(field in summary));

    if (missingFields.length > 0) {
      const error = new Error(
        `Missing required fields: ${missingFields.join(', ')}`
      );
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { missingFields, summary },
      });
      throw error;
    }

    // Ensure array fields are arrays
    for (const field of arrayFields) {
      if (!Array.isArray(summary[field])) {
        summary[field] = [];
      }
    }

    // Ensure mainStory is a string
    if (typeof summary.mainStory !== 'string') {
      summary.mainStory = String(summary.mainStory || '');
    }

    return summary;
  }

  async callOpenAIAndParseJSON({
    messages,
    model,
    temperature,
    maxTokens,
    options = {},
  }: CallOpenAIAndParseJSONParams): Promise<Record<string, unknown>> {
    const { operation = 'openai_call_and_parse' } = options;

    const content = await this.callOpenAI({
      messages,
      model,
      temperature,
      maxTokens,
      options: { ...options, operation },
    });

    return this.parseJSONResponse(content, operation);
  }
}
