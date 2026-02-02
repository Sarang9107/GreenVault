#!/usr/bin/env node
/**
 * Generate secure secrets for .env.local
 * Run: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

// Generate SESSION_SECRET (32+ random characters)
const sessionSecret = crypto.randomBytes(32).toString('hex');

// Generate FIELD_ENCRYPTION_KEY_BASE64 (32-byte key, base64 encoded)
const encryptionKey = crypto.randomBytes(32).toString('base64');

console.log('\n🔐 Generated secrets for your .env.local file:\n');
console.log('SESSION_SECRET=' + sessionSecret);
console.log('FIELD_ENCRYPTION_KEY_BASE64=' + encryptionKey);
console.log('\n📋 Copy these values into your .env.local file\n');

