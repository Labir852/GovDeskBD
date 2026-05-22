import crypto from 'crypto';

// The encryption key must be 32 bytes (256 bits) for aes-256-gcm.
// In production, define this in your .env file as ENCRYPTION_KEY
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_32_bytes_long!'; // 32 chars
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Encrypts text using AES-256-GCM.
 * Returns a base64 encoded string combining the IV, Auth Tag, and Encrypted Data.
 */
export function encrypt(text: string): string {
  if (!text) return '';
  
  // Ensure the key is exactly 32 bytes
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  // Return format: iv:authTag:encryptedText (all base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypts text previously encrypted by the encrypt function.
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return '';
  
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted data format');
    
    const [ivStr, authTagStr, encryptedText] = parts;
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);
    
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(key),
      Buffer.from(ivStr, 'base64')
    );
    
    decipher.setAuthTag(Buffer.from(authTagStr, 'base64'));
    
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return 'Decryption failed';
  }
}
