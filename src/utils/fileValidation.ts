/**
 * File Validation Utilities
 * Ensures files meet size and type requirements before upload
 */

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024,      // 10MB for images
  PDF: 25 * 1024 * 1024,         // 25MB for PDFs
  DOCUMENT: 10 * 1024 * 1024,    // 10MB for other documents
};

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  PDF: ['application/pdf'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  file?: File;
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSize: number): FileValidationResult {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSizeMB}MB (your file is ${fileSizeMB}MB)`,
    };
  }

  return { valid: true, file };
}

/**
 * Validate file type
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): FileValidationResult {
  if (!allowedTypes.includes(file.type)) {
    const fileExt = file.name.split('.').pop()?.toUpperCase() || 'Unknown';
    return {
      valid: false,
      error: `Invalid file type: .${fileExt}. Allowed types: ${allowedTypes
        .map(t => t.split('/')[1].toUpperCase())
        .join(', ')}`,
    };
  }

  return { valid: true, file };
}

/**
 * Validate image file
 */
export function validateImage(file: File): FileValidationResult {
  // Check type first
  const typeCheck = validateFileType(file, ALLOWED_FILE_TYPES.IMAGE);
  if (!typeCheck.valid) {
    return typeCheck;
  }

  // Check size
  return validateFileSize(file, FILE_SIZE_LIMITS.IMAGE);
}

/**
 * Validate PDF file
 */
export function validatePDF(file: File): FileValidationResult {
  // Check type first
  const typeCheck = validateFileType(file, ALLOWED_FILE_TYPES.PDF);
  if (!typeCheck.valid) {
    return typeCheck;
  }

  // Check size
  return validateFileSize(file, FILE_SIZE_LIMITS.PDF);
}

/**
 * Validate document file (PDF, Word, etc.)
 */
export function validateDocument(file: File): FileValidationResult {
  // Check type first
  const typeCheck = validateFileType(file, ALLOWED_FILE_TYPES.DOCUMENT);
  if (!typeCheck.valid) {
    return typeCheck;
  }

  // Check size based on type
  const maxSize = file.type === 'application/pdf' 
    ? FILE_SIZE_LIMITS.PDF 
    : FILE_SIZE_LIMITS.DOCUMENT;
    
  return validateFileSize(file, maxSize);
}

/**
 * Validate multiple files
 */
export function validateFiles(
  files: File[],
  validatorFn: (file: File) => FileValidationResult
): { valid: boolean; errors: string[]; validFiles: File[] } {
  const errors: string[] = [];
  const validFiles: File[] = [];

  files.forEach((file, index) => {
    const result = validatorFn(file);
    if (result.valid) {
      validFiles.push(file);
    } else {
      errors.push(`File ${index + 1} (${file.name}): ${result.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    validFiles,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file is an image
 */
export function isImage(file: File): boolean {
  return ALLOWED_FILE_TYPES.IMAGE.includes(file.type);
}

/**
 * Check if file is a PDF
 */
export function isPDF(file: File): boolean {
  return file.type === 'application/pdf';
}
