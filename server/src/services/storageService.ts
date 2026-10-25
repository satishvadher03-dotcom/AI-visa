import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import config from '../config.js';

// Ensure storage directory exists
if (!fs.existsSync(config.storagePath)) {
  fs.mkdirSync(config.storagePath, { recursive: true });
}

// Configured allowed types
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
];

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

// Configure Multer storage to private storage directory
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.storagePath);
  },
  filename: (_req, file, cb) => {
    // Generate unguessable random UUID filename, strictly preserve sanitized extension
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.includes(ext) ? ext : '.bin';
    const uniqueName = `${uuidv4()}${safeExt}`;
    cb(null, uniqueName);
  },
});

export const uploadMiddleware = multer({
  storage: diskStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Allowed: JPG, PNG, PDF'));
    }
    cb(null, true);
  },
});

/**
 * Computes SHA256 checksum of saved file for integrity verification
 */
export function calculateFileChecksum(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => reject(err));
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

/**
 * Validates magic numbers / file signatures
 */
export async function validateFileSignature(filePath: string, reportedMime: string): Promise<boolean> {
  try {
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    // PDF signature: %PDF (25 50 44 46)
    if (reportedMime === 'application/pdf') {
      return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
    }
    // JPEG signature: FF D8 FF
    if (reportedMime === 'image/jpeg') {
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    if (reportedMime === 'image/png') {
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Safely resolves a stored filename against storage directory, preventing path traversal
 */
export function getSafeFilePath(storedFilename: string): string | null {
  // Strip any directory traversal characters
  const sanitized = path.basename(storedFilename);
  const fullPath = path.join(config.storagePath, sanitized);

  // Guard against symlinks or traversal outside config.storagePath
  const resolvedPath = path.resolve(fullPath);
  const resolvedRoot = path.resolve(config.storagePath);

  if (!resolvedPath.startsWith(resolvedRoot) || !fs.existsSync(resolvedPath)) {
    return null;
  }
  return resolvedPath;
}

/**
 * Deletes file from private storage
 */
export function deleteStoredFile(storedFilename: string): boolean {
  const filePath = getSafeFilePath(storedFilename);
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
