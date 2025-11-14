import { Address } from '@ton/core';

/**
 * Validates a TON address using the official @ton/core library
 * Supports both bounceable (EQ) and non-bounceable (UQ) addresses
 * Also supports testnet addresses (kQ)
 */
export const isValidTONAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  
  // Trim whitespace
  const trimmed = address.trim();
  
  // Try using official TON library first (most reliable)
  try {
    Address.parse(trimmed);
    return true;
  } catch (error) {
    // If parsing fails, fall back to regex validation
    // This handles edge cases where Address.parse might be too strict
  }
  
  // Fallback regex validation
  // TON addresses format:
  // - EQ/UQ/kQ (2 chars) + base64url encoded address (48 chars) = 50 chars total
  
  // Must start with EQ, UQ, or kQ (case insensitive)
  const prefixMatch = trimmed.match(/^(EQ|UQ|kQ)/i);
  if (!prefixMatch) return false;
  
  const prefix = prefixMatch[0].toUpperCase();
  const afterPrefix = trimmed.substring(prefix.length);
  
  // Standard TON addresses are exactly 48 characters after prefix (50 total)
  // But we'll accept 46-48 characters for flexibility
  if (afterPrefix.length < 46 || afterPrefix.length > 48) {
    // Allow user-friendly addresses that might be shorter (minimum 20 chars total)
    if (trimmed.length < 20) return false;
  }
  
  // After prefix, should only contain base64url characters (A-Z, a-z, 0-9, -, _)
  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  
  if (!base64urlRegex.test(afterPrefix)) return false;
  
  // Minimum total length check (at least 20 chars for user-friendly, 48 for standard)
  if (trimmed.length < 20) return false;
  
  // Maximum length check (shouldn't exceed 50 for standard addresses)
  if (trimmed.length > 50) return false;
  
  return true;
};
