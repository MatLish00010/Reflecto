import { safeSentry } from '@/shared/lib/sentry';
import type { Span } from '@sentry/types';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  span?: Span;
  operation?: string;
}

export async function callOpenAI(
  messages: OpenAIMessage[],
  options: OpenAIRequestOptions = {}
): Promise<string> {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 4000,
    span,
    operation = 'openai_call',
  } = options;

  if (!process.env.OPENAI_API_KEY) {
    const error = new Error('OpenAI API key is not configured');
    safeSentry.captureException(error, {
      tags: { operation },
    });
    throw error;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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

function parseJSONResponse(content: string): Record<string, unknown> {
  try {
    const cleanedContent = content.replace(/```json\s*|\s*```/g, '').trim();
    return JSON.parse(cleanedContent);
  } catch {
    const parseError = new Error('Failed to parse OpenAI response as JSON');
    safeSentry.captureException(parseError, {
      extra: { content },
    });
    throw parseError;
  }
}

export function validateAISummaryStructure(
  summary: Record<string, unknown>,
  requiredFields: string[],
  arrayFields: string[]
): Record<string, unknown> {
  const missingFields = requiredFields.filter(field => !(field in summary));

  if (missingFields.length > 0) {
    const error = new Error(
      `Missing required fields: ${missingFields.join(', ')}`
    );
    safeSentry.captureException(error, {
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

export async function callOpenAIAndParseJSON(
  messages: OpenAIMessage[],
  options: OpenAIRequestOptions = {}
): Promise<Record<string, unknown>> {
  const content = await callOpenAI(messages, options);
  return parseJSONResponse(content);
}
