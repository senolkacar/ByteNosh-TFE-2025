import crypto from 'crypto';

export function encryptData(data: any, encryptionKey: string) {
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

export function decryptData(encryptedData: string, encryptionKey: string) {
    try {
        // Decode the base64 key to get the raw 32-byte encryption key
        const decodedKey = Buffer.from(encryptionKey, 'base64');

        if (decodedKey.length !== 32) {
            throw new Error("Invalid key length: Key must be 32 bytes for AES-256-CBC.");
        }

        // Split the encrypted data into IV and encrypted content
        const [ivHex, encryptedHex] = encryptedData.split(':');

        // Convert hex strings back to buffers
        const iv = Buffer.from(ivHex, 'hex');
        const encryptedBuffer = Buffer.from(encryptedHex, 'hex');

        // Create decryption cipher
        const decipher = crypto.createDecipheriv('aes-256-cbc', decodedKey, iv);

        // Decrypt the data
        let decrypted = decipher.update(encryptedBuffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        // Parse the decrypted JSON string back to an object
        return JSON.parse(decrypted.toString('utf8'));
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt QR code data');
    }
}


