import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class CryptoService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        
        console.log('🔑 Checking MASTER_KEY...');
        
        if (!process.env.MASTER_KEY) {
            throw new Error('MASTER_KEY environment variable is required. Please check your .env file');
        }
        
      
        
       
        const salt = 'nobrain_fixed_salt_2025';
        this.key = crypto.pbkdf2Sync(
            process.env.MASTER_KEY, 
            salt, 
            100000,
            32,     
            'sha256'
        );
        
        console.log('✅ Crypto service initialized successfully');
    }

    encrypt(text) {
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
            
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag();
            
            return {
                iv: iv.toString('hex'),
                encryptedData: encrypted,
                authTag: authTag.toString('hex')
            };
        } catch (error) {
            console.error('🔴 Encryption error:', error);
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    decrypt(encryptedObject) {
        try {
            const { iv, encryptedData, authTag } = encryptedObject;
            
            const decipher = crypto.createDecipheriv(
                this.algorithm, 
                this.key, 
                Buffer.from(iv, 'hex')
            );
            
            decipher.setAuthTag(Buffer.from(authTag, 'hex'));
            
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('🔴 Decryption error:', error);
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }

    // Encrypt API key for storage
    encryptAPIKey(apiKey) {
        try {
            const encrypted = this.encrypt(apiKey);
            return JSON.stringify(encrypted);
        } catch (error) {
            throw new Error(`API key encryption failed: ${error.message}`);
        }
    }

    // Decrypt API key for use
    decryptAPIKey(encryptedKeyString) {
        try {
            const encryptedObject = JSON.parse(encryptedKeyString);
            return this.decrypt(encryptedObject);
        } catch (error) {
            throw new Error(`API key decryption failed: ${error.message}`);
        }
    }
}

// Create and export instance
export const cryptoService = new CryptoService();