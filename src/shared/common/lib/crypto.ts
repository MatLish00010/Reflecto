import crypto from 'node:crypto';
import type { Span } from '@sentry/types';
import type { NextResponse } from 'next/server';
import { API_CONFIG, APP_CONSTANTS, ENV } from '@/shared/common/config';
import { createErrorResponse } from '@/shared/common/lib/api/utils/response-helpers';
import { safeSentry } from '@/shared/common/lib/sentry';

function getKey(): Buffer {
  const key = ENV.NOTE_SECRET_KEY;
  if (!key) {
    throw new Error('NOTE_SECRET_KEY is not set in environment variables');
  }
  const buf = Buffer.from(key, 'base64');
  if (buf.length !== APP_CONSTANTS.CRYPTO.KEY_LENGTH) {
    throw new Error('NOTE_SECRET_KEY must be 32 bytes (base64-encoded)');
  }
  return buf;
}

function encryptText(plainText: string): string {
  const iv = crypto.randomBytes(APP_CONSTANTS.CRYPTO.IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(APP_CONSTANTS.CRYPTO.ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  // Output: iv + authTag + encrypted
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

function decryptText(encryptedBase64: string): string {
  const data = Buffer.from(encryptedBase64, 'base64');
  const iv = data.slice(0, APP_CONSTANTS.CRYPTO.IV_LENGTH);
  const authTag = data.slice(
    APP_CONSTANTS.CRYPTO.IV_LENGTH,
    APP_CONSTANTS.CRYPTO.IV_LENGTH + 16
  );
  const encrypted = data.slice(APP_CONSTANTS.CRYPTO.IV_LENGTH + 16);
  const key = getKey();
  const decipher = crypto.createDecipheriv(
    APP_CONSTANTS.CRYPTO.ALGORITHM,
    key,
    iv
  );
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

interface SafeEncryptParams {
  plainText: string;
  span?: Span;
  operation?: string;
}

export function safeEncrypt({
  plainText,
  span,
  operation = 'encrypt_note',
}: SafeEncryptParams): {
  value?: string;
  error?: ReturnType<typeof NextResponse.json>;
} {
  try {
    return { value: encryptText(plainText) };
  } catch (e) {
    if (span) {
      span.setAttribute('error', true);
    }
    safeSentry.captureException(e as Error, { tags: { operation } });
    return {
      error: createErrorResponse(
        API_CONFIG.ERROR_MESSAGES.ENCRYPTION_FAILED,
        API_CONFIG.STATUS_CODES.INTERNAL_SERVER_ERROR,
        operation
      ),
    };
  }
}

interface SafeDecryptParams {
  encrypted: string;
  span?: Span;
  operation?: string;
}

export function safeDecrypt({
  encrypted,
  span,
  operation = 'decrypt_note',
}: SafeDecryptParams): {
  value?: string;
  error?: ReturnType<typeof NextResponse.json>;
} {
  try {
    return { value: decryptText(encrypted) };
  } catch (e) {
    if (span) {
      span.setAttribute('error', true);
    }
    safeSentry.captureException(e as Error, { tags: { operation } });
    return {
      error: createErrorResponse(
        API_CONFIG.ERROR_MESSAGES.DECRYPTION_FAILED,
        API_CONFIG.STATUS_CODES.INTERNAL_SERVER_ERROR,
        operation
      ),
    };
  }
}
