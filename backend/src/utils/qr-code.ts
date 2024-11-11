import crypto from 'crypto';

export default function encryptData(data: any, encryptionKey: string) {
    // Decode the base64 key to get the raw 32-byte encryption key
    const decodedKey = Buffer.from(encryptionKey, 'base64');

    if (decodedKey.length !== 32) {
        throw new Error("Invalid key length: Key must be 32 bytes for AES-256-CBC.");
    }

    // Generate a random 16-byte initialization vector (IV)
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', decodedKey, iv);

    // Encrypt the data
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Combine the IV and encrypted data
    return iv.toString('hex') + ':' + encrypted;
}

