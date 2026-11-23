// Prints a new Ed25519 signing key for PARIDHI_SIGNING_KEY. Keep it secret and store it
// in your host's secret manager; anyone with it can sign records as Paridhi.
import crypto from 'node:crypto';

const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');

console.log('PARIDHI_SIGNING_KEY (private, keep secret):');
console.log(privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64'));
console.log('\nPublic key (safe to publish):');
console.log(publicKey.export({ type: 'spki', format: 'pem' }).toString().trim());
