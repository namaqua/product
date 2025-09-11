// Polyfill for crypto in Node.js 18
if (typeof globalThis.crypto === 'undefined') {
  const crypto = require('crypto');
  globalThis.crypto = crypto.webcrypto || crypto;
}
