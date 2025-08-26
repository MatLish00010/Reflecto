import crypto from 'node:crypto';
import type { Span } from '@sentry/types';
import type { NextResponse } from 'next/server';
import { createErrorResponse } from '@/shared/common/lib/api/utils/response-helpers';
import { safeSentry } from '@/shared/common/lib/sentry';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Recommended for GCM
const KEY_LENGTH = 32; // 256 bits

function getKey(): Buffer {
  const key = process.env.NOTE_SECRET_KEY;
  if (!key) {
    throw new Error('NOTE_SECRET_KEY is not set in environment variables');
  }
  const buf = Buffer.from(key, 'base64');
  if (buf.length !== KEY_LENGTH) {
    throw new Error('NOTE_SECRET_KEY must be 32 bytes (base64-encoded)');
  }
  return buf;
}

function encryptText(plainText: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
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
  const iv = data.slice(0, IV_LENGTH);
  const authTag = data.slice(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = data.slice(IV_LENGTH + 16);
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
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
      error: createErrorResponse('Failed to encrypt data', 500, operation),
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
      error: createErrorResponse('Failed to decrypt data', 500, operation),
    };
  }
}
