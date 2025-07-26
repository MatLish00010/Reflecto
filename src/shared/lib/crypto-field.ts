import { safeEncrypt, safeDecrypt } from './crypto';
import type { Span } from '@sentry/types';
import { NextResponse } from 'next/server';

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
  if (error) return { error };
  if (parse) {
    try {
      return { value: JSON.parse(value!) as T };
    } catch {
      return {
        error: NextResponse.json(
          { error: 'Failed to parse decrypted data' },
          { status: 500 }
        ),
      };
    }
  }
  return { value: value as T };
}
