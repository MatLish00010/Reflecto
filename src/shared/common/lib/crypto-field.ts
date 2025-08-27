import type { Span } from '@sentry/types';
import type { NextResponse } from 'next/server';
import { API_CONFIG } from '@/shared/common/config';
import { createErrorResponse } from '@/shared/common/lib/api/utils/response-helpers';
import { safeDecrypt, safeEncrypt } from './crypto';

interface EncryptFieldParams {
  data: unknown;
  span?: Span;
  operation?: string;
}

export function encryptField({
  data,
  span,
  operation = 'encrypt_note',
}: EncryptFieldParams): {
  value?: string;
  error?: ReturnType<typeof NextResponse.json>;
} {
  return safeEncrypt({
    plainText: typeof data === 'string' ? data : JSON.stringify(data),
    span,
    operation,
  });
}

interface DecryptFieldParams {
  encrypted: string;
  span?: Span;
  operation?: string;
  parse?: boolean;
}

export function decryptField<T = string>({
  encrypted,
  span,
  operation = 'decrypt_note',
  parse = false,
}: DecryptFieldParams): {
  value?: T;
  error?: ReturnType<typeof NextResponse.json>;
} {
  const { value, error } = safeDecrypt({ encrypted, span, operation });
  if (error) {
    return { error };
  }
  if (parse) {
    try {
      if (!value) {
        return {
          error: createErrorResponse(
            API_CONFIG.ERROR_MESSAGES.DECRYPTION_FAILED,
            API_CONFIG.STATUS_CODES.INTERNAL_SERVER_ERROR,
            operation
          ),
        };
      }
      return { value: JSON.parse(value) as T };
    } catch {
      return {
        error: createErrorResponse(
          API_CONFIG.ERROR_MESSAGES.DECRYPTION_FAILED,
          API_CONFIG.STATUS_CODES.INTERNAL_SERVER_ERROR,
          operation
        ),
      };
    }
  }
  return { value: value as T };
}
