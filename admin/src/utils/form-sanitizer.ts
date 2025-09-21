/**
 * Utility to sanitize form data to prevent JSON parsing errors
 * Escapes special characters and removes problematic content
 */

export const sanitizeFormData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Remove any non-printable characters except newlines and tabs
      let cleanValue = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      
      // Normalize newlines
      cleanValue = cleanValue.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      
      // Trim excessive whitespace
      cleanValue = cleanValue.replace(/\n{3,}/g, '\n\n'); // Max 2 newlines
      cleanValue = cleanValue.replace(/[ \t]+/g, ' '); // Single spaces
      cleanValue = cleanValue.trim();
      
      sanitized[key] = cleanValue;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeFormData({ temp: item }).temp : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeFormData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Validates that a string is safe for JSON serialization
 */
export const isJsonSafe = (str: string): boolean => {
  try {
    JSON.parse(JSON.stringify(str));
    return true;
  } catch {
    return false;
  }
};

/**
 * Debug helper to log what might be causing JSON issues
 */
export const debugJsonIssues = (data: any): void => {
  console.group('JSON Debug');
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Check for problematic characters
      const hasNewlines = value.includes('\n') || value.includes('\r');
      const hasQuotes = value.includes('"');
      const hasBackslash = value.includes('\\');
      const hasControlChars = /[\x00-\x1F\x7F]/.test(value);
      
      if (hasNewlines || hasQuotes || hasBackslash || hasControlChars) {
        console.warn(`Field "${key}" contains potentially problematic characters:`, {
          hasNewlines,
          hasQuotes,
          hasBackslash,
          hasControlChars,
          value: value.substring(0, 100) + (value.length > 100 ? '...' : ''),
          length: value.length
        });
      }
      
      // Test JSON safety
      if (!isJsonSafe(value)) {
        console.error(`Field "${key}" is NOT JSON safe!`, value);
      }
    }
  }
  
  // Try to stringify the whole object
  try {
    const jsonString = JSON.stringify(data);
    console.log('✅ Data is JSON serializable');
    console.log('Serialized length:', jsonString.length);
  } catch (error) {
    console.error('❌ Data is NOT JSON serializable:', error);
  }
  
  console.groupEnd();
};
