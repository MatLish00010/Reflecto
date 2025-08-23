import type { Span } from '@sentry/types';
import OpenAI from 'openai';
import { safeSentry } from '@/shared/lib/sentry';

// Extended types for GPT-5 API
interface GPT5TextConfig {
  format: {
    type: 'json_object';
  };
  verbosity: 'low' | 'medium' | 'high';
}

interface GPT5ReasoningConfig {
  effort: 'low' | 'medium' | 'high';
  summary: 'auto' | 'none';
}

interface GPT5ResponseCreateParams {
  model: string;
  input: Array<{
    role: string;
    content:
      | string
      | Array<{
          type: string;
          text: string;
        }>;
  }>;
  text: GPT5TextConfig;
  reasoning: GPT5ReasoningConfig;
  tools: unknown[];
  store: boolean;
}

interface GPT5Response {
  output_text: string;
}

// Type assertion for GPT-5 API
type OpenAIClientWithGPT5 = OpenAI & {
  responses: {
    create(params: GPT5ResponseCreateParams): Promise<GPT5Response>;
  };
};

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIServiceOptions {
  span?: Span;
  operation?: string;
}

export interface CallOpenAIParams {
  messages: string;
  prompt: string;
  options?: OpenAIServiceOptions;
}

export interface CallOpenAIAndParseJSONParams {
  messages: string;
  prompt: string;
  options?: OpenAIServiceOptions;
}

export interface ValidateAISummaryStructureParams {
  summary: Record<string, unknown>;
  requiredFields: string[];
  arrayFields: string[];
  options?: OpenAIServiceOptions;
}

export class OpenAIService {
  private openai: OpenAIClientWithGPT5;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    this.openai = new OpenAI({
      apiKey,
    }) as OpenAIClientWithGPT5;
  }

  async callOpenAI({
    messages,
    options = {},
    prompt,
  }: CallOpenAIParams): Promise<string> {
    const { span, operation = 'openai_call' } = options;

    try {
      const response = await this.openai.responses.create({
        model: 'gpt-5-nano',
        input: [
          {
            role: 'developer',
            content: prompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: messages,
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_object',
          },
          verbosity: 'medium',
        },
        reasoning: {
          effort: 'medium',
          summary: 'auto',
        },
        tools: [],
        store: true,
      });

      const content = response.output_text;

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
    } catch (error) {
      const apiError =
        error instanceof Error ? error : new Error('OpenAI API error');
      safeSentry.captureException(apiError, {
        tags: { operation },
        extra: { error },
      });
      span?.setAttribute('error', true);
      throw apiError;
    }
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

    for (const field of arrayFields) {
      if (!Array.isArray(summary[field])) {
        summary[field] = [];
      }
    }

    return summary;
  }

  async callOpenAIAndParseJSON({
    messages,
    prompt,
    options = {},
  }: CallOpenAIAndParseJSONParams): Promise<Record<string, unknown>> {
    const { operation = 'openai_call_and_parse' } = options;

    const content = await this.callOpenAI({
      messages,
      prompt,
      options: { ...options, operation },
    });

    return this.parseJSONResponse(content, operation);
  }
}
